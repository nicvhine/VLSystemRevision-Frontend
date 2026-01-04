"use client";
import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { ProfileCardProps } from "@/app/commonComponents/utils/Types/components";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ProfileCard({ 
  application, 
  isEditing, 
  profileData, 
  setProfileData 
}: ProfileCardProps & {
  isEditing?: boolean;
  profileData?: any;
  setProfileData?: any;
}) {
  const [nameError, setNameError] = useState("");
  const [contactError, setContactError] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleChange = (field: string, value: string) => {
    if (setProfileData) {
      setProfileData({ ...profileData, [field]: value });
    }
  };

  const handleEmailChange = (value: string) => {
    handleChange("appEmail", value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleNameChange = (value: string) => {
    if (/^[A-Za-zñÑ.\-\s]*$/.test(value)) {
      handleChange("appName", value);
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        setNameError("Please enter at least first and last name.");
      } else {
        setNameError("");
      }
    }
  };

  const handleContactChange = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 11) {
      handleChange("appContact", value);
      setContactError("");
    }
  };

  const handleContactBlur = () => {
    if (profileData?.appContact && !/^09\d{9}$/.test(profileData.appContact)) {
      setContactError("Contact must start with 09 and be exactly 11 digits.");
    } else {
      setContactError("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 flex-shrink-0">
      <div className="p-6 text-center">
        {/* Profile Image */}
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 mb-4 border-4 border-white shadow-lg">
          {application?.profilePic &&
          typeof application.profilePic === "object" &&
          (application.profilePic as any).filePath ? (
            <img
              src={
                (application.profilePic as any).filePath.startsWith("http")
                  ? (application.profilePic as any).filePath
                  : `${BASE_URL}/${
                      (application.profilePic as any).filePath
                    }`
              }
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-profile.png";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiUser className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Name and Contact */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                className={`w-full border rounded px-3 py-2 text-center text-lg font-bold text-gray-900 ${
                  nameError ? "border-red-500" : "border-gray-300"
                }`}
                value={profileData?.appName || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Name"
              />
              {nameError && <p className="text-red-500 text-xs mt-1 text-center">{nameError}</p>}
            </div>
            <div>
              <input
                type="tel"
                className={`w-full border rounded px-3 py-2 text-center text-red-600 font-medium ${
                  contactError ? "border-red-500" : "border-gray-300"
                }`}
                value={profileData?.appContact || ""}
                onChange={(e) => handleContactChange(e.target.value)}
                onBlur={handleContactBlur}
                placeholder="Contact Number"
              />
              {contactError && <p className="text-red-500 text-xs mt-1 text-center">{contactError}</p>}
            </div>
            <div>
              <input
                type="email"
                className={`w-full border rounded px-3 py-2 text-center text-gray-600 text-sm ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                value={profileData?.appEmail || ""}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Email address"
              />
              {emailError && <p className="text-red-500 text-xs mt-1 text-center">{emailError}</p>}
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {application?.appName || "—"}
            </h2>
            <p className="text-red-600 font-medium mb-1">
              {application?.appContact || "—"}
            </p>
            <p className="text-gray-600 text-sm">{application?.appEmail || "—"}</p>
          </>
        )}
      </div>
    </div>
  );
}
