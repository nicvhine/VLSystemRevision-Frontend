"use client";
import { useState } from "react";
import { BasicInfoCardProps } from "@/app/commonComponents/utils/Types/components";

export default function BasicInfoCard({
  application,
  l,
  isEditing,
  basicInfoData,
  setBasicInfoData,
}: BasicInfoCardProps & {
  isEditing: boolean;
  basicInfoData: any;
  setBasicInfoData: any;
}) {
  const [spouseNameError, setSpouseNameError] = useState("");

  const handleChange = (field: string, value: string) => {
    setBasicInfoData({ ...basicInfoData, [field]: value });
  };

  const handleSpouseNameChange = (value: string) => {
    if (/^[A-Za-zñÑ.\-\s]*$/.test(value)) {
      handleChange("appSpouseName", value);
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (value && words.length < 2) {
        setSpouseNameError("Please enter at least first and last name.");
      } else {
        setSpouseNameError("");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-grow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{l.t1}</h3>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{l.t5}</p>
          {isEditing ? (
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
              value={basicInfoData.appDob}
              onChange={(e) => handleChange("appDob", e.target.value)}
            />
          ) : (
            <p className="text-gray-900">{application?.appDob || "—"}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">{l.t6}</p>
          {isEditing ? (
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
              value={basicInfoData.appAddress}
              onChange={(e) => handleChange("appAddress", e.target.value)}
            />
          ) : (
            <p className="text-gray-900">{application?.appAddress || "—"}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">{l.t7}</p>
          {isEditing ? (
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
              value={basicInfoData.appMarital || ""}
              onChange={(e) => handleChange("appMarital", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          ) : (
            <p className="text-gray-900">{application?.appMarital || "—"}</p>
          )}
        </div>

        {(isEditing ? basicInfoData.appMarital : application?.appMarital) === "Married" && (
          <>
            <div>
              <p className="text-sm font-medium text-gray-500">{l.t8}</p>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    className={`w-full border rounded px-2 py-1 text-gray-900 ${
                      spouseNameError ? "border-red-500" : "border-gray-300"
                    }`}
                    value={basicInfoData.appSpouseName}
                    onChange={(e) => handleSpouseNameChange(e.target.value)}
                  />
                  {spouseNameError && <p className="text-red-500 text-xs mt-1">{spouseNameError}</p>}
                </div>
              ) : (
                <p className="text-gray-900">{application?.appSpouseName || "—"}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{l.t9}</p>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                  value={basicInfoData.appSpouseOccupation}
                  onChange={(e) => handleChange("appSpouseOccupation", e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{application?.appSpouseOccupation || "—"}</p>
              )}
            </div>
          </>
        )}

        <div>
          <p className="text-sm font-medium text-gray-500">{l.t10}</p>
          {isEditing ? (
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
              value={basicInfoData.appChildren}
              onChange={(e) => handleChange("appChildren", e.target.value)}
            />
          ) : (
            <p className="text-gray-900">{application?.appChildren || "—"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
