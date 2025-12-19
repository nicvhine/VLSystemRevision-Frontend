"use client";

import { useState, useEffect } from "react";
import MapComponent from "../../MapComponent"; 
import { BasicInformationProps } from "@/app/commonComponents/utils/Types/components";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Basic information form section component
 * Handles personal details including name, contact, marital status, and address with map integration
 * @param language - Current language setting (English or Cebuano)
 * @param appName - Applicant's name
 * @param setAppName - Function to set applicant's name
 * @param appDob - Applicant's date of birth
 * @param setAppDob - Function to set date of birth
 * @param appContact - Applicant's contact number
 * @param setAppContact - Function to set contact number
 * @param appEmail - Applicant's email address
 * @param setAppEmail - Function to set email address
 * @param appMarital - Applicant's marital status
 * @param setAppMarital - Function to set marital status
 * @param appChildren - Number of children
 * @param setAppChildren - Function to set number of children
 * @param appSpouseName - Spouse's name
 * @param setAppSpouseName - Function to set spouse's name
 * @param appSpouseOccupation - Spouse's occupation
 * @param setAppSpouseOccupation - Function to set spouse's occupation
 * @param appAddress - Applicant's address
 * @param setAppAddress - Function to set address
 * @param missingFields - Array of missing field names for validation
 * @returns JSX element containing the basic information form section
 */

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
  borrowersId = "",
  isPrefilled = false,
}: BasicInformationProps) {
  const [error, setError] = useState("");
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [nameError, setNameError] = useState("");
  const [phoneConflictError, setPhoneConflictError] = useState("");
  const [emailConflictError, setEmailConflictError] = useState("");
  const [spouseNameError, setSpouseNameError] = useState("");

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppAddress(e.target.value);
  };

  // Check for contact/email conflicts (same contact/email with different name)
  useEffect(() => {
    const checkContactConflict = async () => {
      if (!appName || !appContact || !appEmail || appContact.length < 11) {
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
  
        if (data.hasConflict) {
          // Set phone conflict error
          if (data.phoneConflict) {
            const phoneError = language === "en"
              ? "This phone number is already registered."
              : "Kining numero sa telepono naka-rehistro na.";
            setPhoneConflictError(phoneError);
          } else {
            setPhoneConflictError("");
          }
          
          // Set email conflict error
          if (data.emailConflict) {
            const emailError = language === "en"
              ? "This email is already registered."
              : "Kining email naka-rehistro na.";
            setEmailConflictError(emailError);
          } else {
            setEmailConflictError("");
          }
        } else {
          setPhoneConflictError("");
          setEmailConflictError("");
        }
        
      } catch (err) {
        console.error("Error checking contact conflict:", err);
      }
    };
  
    const timeout = setTimeout(checkContactConflict, 800);
    return () => clearTimeout(timeout);
  }, [appName, appContact, appEmail, language, BASE_URL]);

  return (
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
            onChange={(e) => setAppDob(e.target.value)}
            readOnly={isPrefilled}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              .toISOString()
              .split("T")[0]}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields.includes('Date of Birth')) ? 'border-red-500' : 'border-gray-200'} ${isPrefilled ? 'bg-gray-50' : ''}`}
          />
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
                className={`w-full border p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && (missingFields.includes('Email Address') || emailConflictError)) ? 'border-red-500' : 'border-gray-200'}`}
              placeholder={language === "en" ? "Enter email" : "Isulod ang email"}
            />
            <span className="px-4 py-3 border border-l-0 border-gray-200 rounded-r-lg bg-gray-100 text-gray-700 select-none">
              @gmail.com
            </span>
          </div>
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
            value={appChildren}
            onChange={(e) => setAppChildren(parseInt(e.target.value))}
            min={0}
          />
        </div>
      </div>

      {/* Spouse Fields */}
      {appMarital === "Married" && (
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
                // Only allow letters, spaces, periods, and hyphens
                if (/^[A-Za-zñÑ.\-\s]*$/.test(value)) {
                  setAppSpouseName(value);
                  
                  // Validate spouse name
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
  );
}