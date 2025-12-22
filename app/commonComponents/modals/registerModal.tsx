'use client';

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorModal from '@/app/commonComponents/modals/errorModal';
import SuccessModal from '@/app/commonComponents/modals/successModal';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'ceb';
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function RegisterModal({ isOpen, onClose, language = 'en' }: RegisterModalProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal alerts
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Translation
  const t = {
    en: {
      titleRegister: 'Create Your Account',
      titleLogin: 'Login to Your Account',
      subtitleRegister: 'Register to apply for loan',
      subtitleLogin: 'Enter your credentials to login',
      fullName: 'Full Name',
      email: 'Email Address',
      username: 'Username',
      phoneNumber: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      register: 'Register',
      registering: 'Registering...',
      login: 'Login',
      loggingIn: 'Logging in...',
      alreadyHaveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      switchToLogin: 'Login',
      switchToRegister: 'Register',
      nameRequired: 'Enter first and last name',
      invalidEmail: 'Invalid email',
      usernameRequired: 'Username min 4 characters',
      invalidPhone: 'Phone must start with 09 and be 11 digits',
      passwordWeak: 'Password must include uppercase, lowercase, number & symbol',
      passwordMismatch: 'Passwords do not match',
      registrationSuccess: 'Registration successful! Redirecting...',
      loginSuccess: 'Login successful! Redirecting...',
    },
    ceb: {
      titleRegister: 'Paghimo og Account',
      titleLogin: 'Login sa Imong Account',
      subtitleRegister: 'Magparehistro aron maka-apply og loan',
      subtitleLogin: 'Ibutang ang imong credentials aron maka-login',
      fullName: 'Tibuok nga Ngalan',
      email: 'Email Address',
      username: 'Username',
      phoneNumber: 'Numero sa Telepono',
      password: 'Password',
      confirmPassword: 'Kumpirma ang Password',
      register: 'Magparehistro',
      registering: 'Nagparehistro...',
      login: 'Login',
      loggingIn: 'Nag-login...',
      alreadyHaveAccount: 'Naay account na?',
      noAccount: "Wala pa kay account?",
      switchToLogin: 'Login',
      switchToRegister: 'Magparehistro',
      nameRequired: 'Ang tibuok nga ngalan kinahanglan naa ngalan ug apelyido',
      invalidEmail: 'Sayop ang porma sa email',
      usernameRequired: 'Ang username kinahanglan labing menos 4 ka letra',
      invalidPhone: 'Ang numero kinahanglan magsugod sa 09 ug 11 ka numero',
      passwordWeak: 'Ang password kinahanglan labing menos 8 ka letra nga adunay uppercase, lowercase, numero, ug special character',
      passwordMismatch: 'Dili parehas ang mga password',
      registrationSuccess: 'Malampuson ang pagparehistro! Nag-redirect...',
      loginSuccess: 'Malampuson ang login! Nag-redirect...',
    }
  }[language];

  useEffect(() => {
    if (isOpen) setShowModal(true);
    else setTimeout(() => setShowModal(false), 300);
  }, [isOpen]);

  const handleChange = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    if (mode === 'register') {
      if (form.fullName.trim().split(' ').length < 2) { newErrors.fullName = t.nameRequired; valid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { newErrors.email = t.invalidEmail; valid = false; }
      if (form.username.length < 4) { newErrors.username = t.usernameRequired; valid = false; }
      if (!/^09\d{9}$/.test(form.phoneNumber)) { newErrors.phoneNumber = t.invalidPhone; valid = false; }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(form.password)) { newErrors.password = t.passwordWeak; valid = false; }
      if (form.confirmPassword !== form.password) { newErrors.confirmPassword = t.passwordMismatch; valid = false; }
    } else {
      if (!form.username) { newErrors.username = t.usernameRequired; valid = false; }
      if (!form.password) { newErrors.password = t.passwordWeak; valid = false; }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
  
    setIsSubmitting(true);
    try {
      const endpoint = mode === 'register' ? '/borrowers/register' : '/borrowers/login';
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
  
      setShowSuccessModal(true);
      setTimeout(() => { 
        setShowSuccessModal(false);
        onClose();
  
        if (mode === 'login') {
          // Use userId from response to redirect
          const userId = data.userId || data.borrower?.userId;
          if (userId) {
            router.push(`/userPage/borrowerPage/dashboard`);
          } else {
            router.push('/userPage/borrowerPage/dashboard');
          }
        }
      }, 2000);
  
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const registerFields = ['fullName','username','email','phoneNumber','password','confirmPassword'];
  const loginFields = ['username','password'];
  const fieldsToRender = mode === 'register' ? registerFields : loginFields;

  if (!showModal) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left */}
              <div className="hidden md:flex items-center justify-center bg-red-600 rounded-l-3xl p-6">
                <img src="/images/loan-illustration.svg" alt="Loan Illustration" className="w-3/4 h-auto" />
              </div>

              {/* Right Form */}
              <div className="p-8 md:p-10 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-3xl font-bold mb-2">{mode === 'register' ? t.titleRegister : t.titleLogin}</h2>
                <p className="mb-6 text-gray-600">{mode === 'register' ? t.subtitleRegister : t.subtitleLogin}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {fieldsToRender.map((field) => (
                    <div key={field} className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t[field as keyof typeof t]}</label>
                      <input
                        type={(field === 'password' || field === 'confirmPassword') ? 
                          (field === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')) 
                          : 'text'}
                        value={form[field as keyof typeof form]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          errors[field as keyof typeof errors] ? 'border-red-500' : 'border-gray-200'
                        }`}
                        disabled={isSubmitting}
                      />
                      {(field === 'password' || field === 'confirmPassword') && (
                        <button
                          type="button"
                          onClick={() => field === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                          disabled={isSubmitting}
                        >
                          {field === 'password' ? (showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) 
                          : (showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                        </button>
                      )}
                      {errors[field as keyof typeof errors] && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" /> {errors[field as keyof typeof errors]}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (mode === 'register' ? t.registering : t.loggingIn) : (mode === 'register' ? t.register : t.login)}
                  </button>
                </form>

                <p className="text-sm text-center text-gray-600 mt-4">
                  {mode === 'register' ? t.alreadyHaveAccount : t.noAccount}{' '}
                  <button
                    onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                    className="text-red-600 hover:underline font-medium"
                    disabled={isSubmitting}
                  >
                    {mode === 'register' ? t.switchToLogin : t.switchToRegister}
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ErrorModal isOpen={showErrorModal} message={errorMsg} onClose={() => setShowErrorModal(false)} />
      <SuccessModal isOpen={showSuccessModal} message={mode === 'register' ? t.registrationSuccess : t.loginSuccess} onClose={() => setShowSuccessModal(false)} />
    </>
  );
}
