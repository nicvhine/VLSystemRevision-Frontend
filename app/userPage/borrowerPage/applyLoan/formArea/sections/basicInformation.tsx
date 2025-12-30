"use client";

import { useState, useEffect } from "react";
import MapComponent from "../../MapComponent"; 
import { BasicInformationProps } from "@/app/commonComponents/utils/Types/components";
import DuplicateApplicationModal from "../modals/duplicate";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function BasicInformation({
  language,
  appName,
  setAppName,
  appDob,
  setAppDob,
  appContact,
  setAppContact,
  appEmail,
  setAppEmail,
  appMarital,
  setAppMarital,
  appChildren,
  setAppChildren,
  appSpouseName,
  setAppSpouseName,
  appSpouseOccupation,
  setAppSpouseOccupation,
  appAddress,
  setAppAddress,
  appReferences = [],
  missingFields = [],
  showFieldErrors = false,
  resetForm,
}: BasicInformationProps) {
  const [error, setError] = useState("");
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [nameError, setNameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [phoneConflictError, setPhoneConflictError] = useState("");
  const [emailConflictError, setEmailConflictError] = useState("");
  const [spouseNameError, setSpouseNameError] = useState("");

  // ✅ Only modal message needed
  const [modalMessage, setModalMessage] = useState("");

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppAddress(e.target.value);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAppDob(value);

    if (value) {
      const age = calculateAge(value);
      if (age < 18) {
        setDobError(
          language === "en"
            ? "You must be at least 18 years old to apply."
            : "Kinahanglan ka labing menos 18 anyos aron maka-apply."
        );
      } else {
        setDobError("");
      }
    } else {
      setDobError("");
    }
  };

  // Check for duplicate applications
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!appName || !appDob || !appEmail) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/loan-applications/check-duplicate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ appName, appDob, appEmail }),
        });

        const data = await res.json();

        if (data.isDuplicate) {
          if (["Pending", "Applied", "Cleared", "Approved", "Disbursed"].includes(data.status)) {
            setModalMessage(
              language === "en"
                ? "Oops! It looks like you have a pending application with us. Please track your application status. If you think there's a mistake, kindly contact our office."
                : "Naay pending nga aplikasyon sa among opisina. Palihug i-track ang imong aplikasyon. Kung naay sayop, palihug kontaka ang opisina."
            );
          } else if (data.status === "Active") {
            setModalMessage(
              language === "en"
                ? "Oops! It looks like you have an existing active account with us. If you're a borrower, you may apply for a re-loan through the borrower portal. If you think there's a mistake, kindly contact our office."
                : "Aduna kay existing nga active account sa among sistema. Kung ikaw borrower, mahimo ka mag-reloan sa borrower portal. Kung naay sayop, palihug kontaka ang opisina."
            );
          }
        } else {
          setModalMessage("");
          setDuplicateError("");
        }
      } catch (err) {
        console.error("Error checking duplicate application:", err);
      }
    };

    const timeout = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timeout);
  }, [appName, appDob, appEmail, language]);

  // Check for contact/email conflicts
  useEffect(() => {
    const checkContactConflict = async () => {
      if (!appName || (!appContact && !appEmail)) {
        setPhoneConflictError("");
        setEmailConflictError("");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/loan-applications/check-contact-conflict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ appName, appContact, appEmail }),
        });

        const data = await res.json();

        if (!data.hasConflict) {
          setPhoneConflictError("");
          setEmailConflictError("");
          return;
        }

        if (data.field === "contact") {
          setPhoneConflictError(data.message);
          setEmailConflictError("");
        }

        if (data.field === "email") {
          setEmailConflictError(data.message);
          setPhoneConflictError("");
        }
      } catch (err) {
        console.error("Error checking contact conflict:", err);
      }
    };

    const timeout = setTimeout(checkContactConflict, 600);
    return () => clearTimeout(timeout);
  }, [appName, appContact, appEmail]);

  return (
    <>
      {/* Duplicate Application Modal */}
      {modalMessage && (
        <DuplicateApplicationModal
          language={language}
          message={modalMessage}
          onClose={() => {
            // Close modal
            setModalMessage("");

            // Clear all fields
            setAppName("");
            setAppDob("");
            setAppContact("");
            setAppEmail("");
            setAppMarital("");
            setAppChildren(0);
            setAppSpouseName("");
            setAppSpouseOccupation("");
            setAppAddress("");
            
            // Reset errors
            setNameError("");
            setDobError("");
            setDuplicateError("");
            setPhoneConflictError("");
            setEmailConflictError("");
            setSpouseNameError("");
            setError("");
            
            // Reset map marker
            setMarkerPosition(null);

            // Optional: reset form if resetForm prop exists
            if (resetForm) resetForm();
          }}
        />
      )}


      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
          {language === "en" ? "Basic Information" : "Pangunang Impormasyon"}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              {language === "en" ? "Name:" : "Ngalan:"}
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[A-Za-zñÑ.\-\s]*$/.test(value)) {
                  setAppName(value);
                  const words = value.trim().split(/\s+/).filter(Boolean);
                  if (words.length < 2) {
                    setNameError(
                      language === "en"
                        ? "Please enter at least first and last name."
                        : "Palihug isulod ang labing menos ngalan ug apelyido."
                    );
                  } else {
                    setNameError("");
                  }
                }
              }}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                (showFieldErrors && (missingFields.includes("Name") || nameError)) ? "border-red-500" : "border-gray-200"
              }`}
              placeholder={language === "en" ? "Enter your full name" : "Isulod ang imong tibuok ngalan"}
            />
            {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
          </div>

          {/* DOB */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              {language === "en" ? "Date of Birth:" : "Petsa sa Pagkatawo:"}
            </label>
            <input
              type="date"
              value={appDob}
              onChange={handleDobChange}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                (showFieldErrors && missingFields.includes('Date of Birth')) || dobError ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {dobError && <p className="text-red-500 text-sm mt-1">{dobError}</p>}
          </div>

          {/* Contact */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              {language === "en" ? "Contact Number:" : "Numero sa Kontak:"}
            </label>
            <input
              type="text"
              value={appContact}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  if (value.length <= 11) {
                    setAppContact(value);
                    setError("");
                  }
                }
              }}
              onBlur={() => {
                if (!/^09\d{9}$/.test(appContact)) {
                  setError(
                    language === "en"
                      ? "Invalid phone number format"
                      : "Sayop nga porma sa numero sa telepono."
                  );
                } else {
                  setError("");
                }
              }}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && (missingFields.includes('Contact Number') || error || phoneConflictError)) ? 'border-red-500' : 'border-gray-200'}`}
              placeholder={language === "en" ? "Enter contact number" : "Isulod ang numero sa kontak"}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {phoneConflictError && <p className="text-red-500 text-sm mt-1">{phoneConflictError}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              {language === "en" ? "Email Address:" : "Email Address:"}
            </label>
            <div className="flex">
              <input
                type="text"
                value={appEmail.replace("@gmail.com", "")}
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.replace(/@.*/, "");
                  setAppEmail(value + "@gmail.com");
                }}
                className={`w-full border p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  (showFieldErrors && (missingFields.includes("Email Address") || emailConflictError)) ? "border-red-500" : "border-gray-200"
                }`}
                placeholder={language === "en" ? "Enter email" : "Isulod ang email"}
              />
              <span className="px-4 py-3 border border-l-0 border-gray-200 rounded-r-lg bg-gray-100 text-gray-700 select-none">
                @gmail.com
              </span>
            </div>
            {duplicateError && <p className="text-red-500 text-sm mt-1">{duplicateError}</p>}
            {emailConflictError && <p className="text-red-500 text-sm mt-1">{emailConflictError}</p>}
          </div>
        </div>

        {/* Marital Status + Children */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              {language === "en" ? "Marital Status:" : "Sibil nga Kahimtang:"}
            </label>
            <select
              value={appMarital}
              onChange={(e) => setAppMarital(e.target.value)}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields.includes('Marital Status')) ? 'border-red-500' : 'border-gray-200'}`}
            >
              <option value="">{language === "en" ? "Select Status" : "Pilia ang Kahimtang"}</option>
              <option value="Single">{language === "en" ? "Single" : "Walay Bana/Asawa"}</option>
              <option value="Married">{language === "en" ? "Married" : "Minyo"}</option>
              <option value="Widowed">{language === "en" ? "Widowed" : "Balo"}</option>
              <option value="Divorced">{language === "en" ? "Divorced" : "Hiwalay"}</option>
              <option value="Separated">{language === "en" ? "Separated" : "Nagkahiwalay"}</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              {language === "en" ? "Number of Children:" : "Ilang Anak:"}
            </label>
            <input
              type="number"
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder={language === "en" ? "Enter number of children" : "Isulod ang ihap sa anak"}
              value={appChildren || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setAppChildren(0);
                } else {
                  const numValue = parseInt(value);
                  setAppChildren(isNaN(numValue) ? 0 : numValue);
                }
              }}
              min={0}
            />
          </div>
        </div>

        {/* Spouse Fields */}
        {appMarital !== "Single" && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                {language === "en" ? "Spouse Name:" : "Ngalan sa Bana/Asawa:"}
              </label>
              <input
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && (missingFields.includes('Spouse Name') || spouseNameError)) ? 'border-red-500' : 'border-gray-200'}`}
                placeholder={language === "en" ? "Enter spouse name" : "Isulod ang ngalan sa bana/asawa"}
                value={appSpouseName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[A-Za-zñÑ.\-\s]*$/.test(value)) {
                    setAppSpouseName(value);
                    
                    const trimmedValue = value.trim();
                    const words = trimmedValue.split(/\s+/).filter(Boolean);
                    
                    if (trimmedValue && words.length < 2) {
                      setSpouseNameError(
                        language === "en"
                          ? "Please enter at least first and last name."
                          : "Palihug isulod ang labing menos ngalan ug apelyido."
                      );
                    } else if (trimmedValue && appName && trimmedValue.toLowerCase() === appName.toLowerCase()) {
                      setSpouseNameError(
                        language === "en"
                          ? "Spouse name cannot be the same as applicant name."
                          : "Ang ngalan sa bana/asawa dili mahimong pareho sa applicant."
                      );
                    } else if (trimmedValue && appReferences.some(ref => ref.name.trim().toLowerCase() === trimmedValue.toLowerCase())) {
                      setSpouseNameError(
                        language === "en"
                          ? "Spouse name cannot be the same as any reference name."
                          : "Ang ngalan sa bana/asawa dili mahimong pareho sa reperensya."
                      );
                    } else {
                      setSpouseNameError("");
                    }
                  }
                }}
              />
              {spouseNameError && <p className="text-red-500 text-sm mt-1">{spouseNameError}</p>}
            </div>
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                {language === "en" ? "Spouse Occupation:" : "Trabaho sa Bana/Asawa:"}
              </label>
              <input
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields.includes('Spouse Occupation')) ? 'border-red-500' : 'border-gray-200'}`}
                placeholder={language === "en" ? "Enter spouse occupation" : "Isulod ang trabaho sa bana/asawa"}
                value={appSpouseOccupation}
                onChange={(e) => setAppSpouseOccupation(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Address */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-gray-700">
            {language === "en" ? "Home Address:" : "Address sa Panimalay:"}
          </label>
          <input
            type="text"
            value={appAddress}
            onChange={handleAddressChange}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields.includes('Home Address')) ? 'border-red-500' : 'border-gray-200'}`}
            placeholder={language === "en" ? "Click on the map or type here" : "I-klik ang mapa o isulat dinhi"}
          />
        </div>

        {/* Map */}
        <div
          className="rounded-lg overflow-hidden shadow-sm border border-gray-200 relative"
          style={{ height: 300 }}
        >
          <MapComponent
            address={appAddress}
            setAddress={setAppAddress}
            markerPosition={markerPosition}
            setMarkerPosition={setMarkerPosition}
          />
        </div>
      </div>
    </>
  );
}
