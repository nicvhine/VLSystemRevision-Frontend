import emailjs from 'emailjs-com';

interface LoginParams {
  username: string;
  password: string;
  onClose: () => void;
  router: any;
  setShowErrorModal?: (show: boolean) => void;
  setErrorMsg?: (msg: string) => void;
  setShowSMSModal?: (show: boolean) => void;
  setOtpRole?: (role: 'borrower' | 'staff') => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Role-based dashboard routing
const staffDashboardRoutes: Record<string, string> = {
  head: '/userPage/headPage/dashboard',
  manager: '/userPage/managerPage/dashboard',
  'loan officer': '/userPage/loanOfficerPage/dashboard',
  collector: '/commonComponents/collection',
  sysad: '/userPage/sysadPage/dashboard',
};

export async function loginHandler({
  username,
  password,
  onClose,
  router,
  setShowErrorModal,
  setErrorMsg,
  setShowSMSModal,
  setOtpRole,
}: LoginParams): Promise<boolean> {
  if (!username || !password) {
    setErrorMsg?.("Please enter both username and password.");
    setShowErrorModal?.(true);
    return false;
  }

  try {
    // --- Borrower login ---
    const borrowerRes = await fetch(`${BASE_URL}/borrowers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (borrowerRes.ok) {
      const data = await borrowerRes.json();
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("fullName", data.fullName || data.name || username);
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);
      localStorage.setItem("phoneNumber", data.phoneNumber);
      localStorage.setItem("role", "borrower");
      data.borrowersId && localStorage.setItem("borrowersId", data.borrowersId);
      data.profilePic && localStorage.setItem("profilePic", data.profilePic);
      data.phoneNumber && localStorage.setItem("phoneNumber", data.phoneNumber);
    
      // // Send OTP via API
      // if (data.borrowersId) {
      //   await fetch(`${BASE_URL}/borrowers/send-login-otp`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ borrowersId: data.borrowersId }),
      //   });
      // }

      // setOtpRole?.('borrower');
      // setShowSMSModal?.(true);
      router.push(`/userPage/borrowerPage/dashboard`);
      return true;
    }

    // --- Staff login ---
    const staffRes = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const staffData = await staffRes.json();

    if (staffRes.ok) {
      const user = staffData.user;
      
      console.log("👤 Staff login successful, user data:", user);
      console.log("🆔 User ID:", user.userId);
      console.log("📧 Email:", user.email);
      console.log("👔 Role:", user.role);
      
      // Store user info directly (OTP temporarily disabled)
      localStorage.setItem("token", staffData.token || "");
      localStorage.setItem("userId", user.userId || "");
      localStorage.setItem("fullName", user.name || user.username || user.email || "");
      localStorage.setItem("phoneNumber", user.phoneNumber || "");
      localStorage.setItem("email", user.email || "");
      localStorage.setItem("username", user.username || "");
      localStorage.setItem("role", (user.role || "").toLowerCase());
      
      if (user.profilePic) {
        localStorage.setItem("profilePic", user.profilePic);
      }
      
      if (user.isFirstLogin) {
        localStorage.setItem("forcePasswordChange", "true");
      }
      
      // // OTP flow temporarily disabled for staff
      // // Store ALL user info with "pending" prefix (will be confirmed after OTP)
      // localStorage.setItem("pendingToken", staffData.token || "");
      // localStorage.setItem("pendingUserId", user.userId || "");
      // localStorage.setItem("pendingFullName", user.name || user.username || user.email || "");
      // localStorage.setItem("pendingPhoneNumber", user.phoneNumber || "");
      // localStorage.setItem("pendingEmail", user.email || "");
      // localStorage.setItem("pendingUsername", user.username || "");
      // localStorage.setItem("pendingRole", (user.role || "").toLowerCase());
      // 
      // if (user.profilePic) {
      //   localStorage.setItem("pendingProfilePic", user.profilePic);
      // }
      // 
      // if (user.isFirstLogin) {
      //   localStorage.setItem("pendingForcePasswordChange", "true");
      // }
      
      // Debug: Verify data was stored
      console.log("✅ Stored staff data:", {
        userId: localStorage.getItem("userId"),
        email: localStorage.getItem("email"),
        role: localStorage.getItem("role"),
        fullName: localStorage.getItem("fullName"),
        username: localStorage.getItem("username"),
        hasToken: !!localStorage.getItem("token")
      });
    
      // // OTP generation temporarily disabled
      // const otpRes = await fetch(`${BASE_URL}/users/generate-login-otp`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userId: user.userId }),
      // });
      // 
      // const otpData = await otpRes.json();
      // console.log("🔐 OTP generation response:", { success: otpRes.ok });
      // 
      // if (!otpRes.ok) {
      //   throw new Error("Failed to generate OTP");
      // }
      // 
      // // Send OTP via EmailJS
      // const templateParams = {
      //   to_email: user.email,
      //   passcode: otpData.otp,
      //   time: new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString(),
      // };
      // 
      // await emailjs.send(
      //   process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_SERVICE_ID!,
      //   process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID!,
      //   templateParams,
      //   process.env.NEXT_PUBLIC_EMAILJS_VLSYSTEM_PUBLIC_KEY!
      // );
      // 
      // console.log("📧 OTP sent to:", user.email);
      // 
      // setOtpRole?.('staff');
      // setShowSMSModal?.(true);
      
      // Redirect to role-based dashboard
      const userRole = (user.role || "").toLowerCase();
      const dashboardRoute = staffDashboardRoutes[userRole] || '/userPage/staffPage/dashboard';
      console.log(`📍 Redirecting ${userRole} to:`, dashboardRoute);
      router.push(dashboardRoute);
      return true;
    }

    // --- If both fail ---
    setErrorMsg?.(staffData.error || "Invalid credentials or user not found.");
    setShowErrorModal?.(true);
    return false;
  } catch (err) {
    console.error("Login error:", err);
    setErrorMsg?.("Error connecting to the server.");
    setShowErrorModal?.(true);
    return false;
  }
}