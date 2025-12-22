"use client";

import React from "react";
import { CollateralProps } from "@/app/commonComponents/utils/Types/components";

/**
 * Collateral information form section component
 * Handles collateral details including type, value, description, and ownership status
 * @param language - Current language setting (English or Cebuano)
 * @param collateralType - Selected collateral type
 * @param setCollateralType - Function to set collateral type
 * @param collateralValue - Collateral value amount
 * @param setCollateralValue - Function to set collateral value
 * @param collateralDescription - Description of collateral
 * @param setCollateralDescription - Function to set collateral description
 * @param ownershipStatus - Ownership status of collateral
 * @param setOwnershipStatus - Function to set ownership status
 * @param collateralTypeOptions - Available collateral type options
 * @param missingFields - Array of missing field names for validation
 * @returns JSX element containing the collateral information form section
 */

export default function CollateralInformation({
  language,
  collateralType,
  setCollateralType,
  collateralValue,
  setCollateralValue,
  collateralDescription,
  setCollateralDescription,
  ownershipStatus,
  setOwnershipStatus,
  collateralTypeOptions,
  missingFields = [],
  showFieldErrors = false,
}: CollateralProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
        {language === "en" ? "Collateral Information" : "Impormasyon sa Kolateral"}
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* Collateral Type */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            {language === "en" ? "Collateral Type:" : "Klase sa Kolateral:"}
          </label>
          <select
            value={collateralType}
            onChange={(e) => setCollateralType(e.target.value)}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields.includes('Collateral Type')) ? 'border-red-500' : 'border-gray-200'}`}
          >
            {collateralTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            <option value="Other">{language === "en" ? "Other" : "Uban pa"}</option>
          </select>
        </div>

        {/* Estimated Value */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            {language === "en" ? "Estimated Value:" : "Gibanabanang Kantidad:"}
          </label>
          <input
            type="number"
            value={collateralValue}
            onChange={(e) => setCollateralValue(parseFloat(e.target.value))}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields.includes('Collateral Value')) ? 'border-red-500' : 'border-gray-200'}`}
            placeholder={
              language === "en"
                ? "Enter estimated value"
                : "Isulod ang gibanabanang kantidad"
            }
          />
        </div>

        {/* Collateral Description */}
        <div className="col-span-2">
          <label className="block font-medium mb-2 text-gray-700">
            {language === "en"
              ? "Collateral Description:"
              : "Deskripsyon sa Kolateral:"}
          </label>
          <textarea
            value={collateralDescription}
            onChange={(e) => setCollateralDescription(e.target.value)}
            className={`w-full border p-3 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields.includes('Collateral Description')) ? 'border-red-500' : 'border-gray-200'}`}
            placeholder={
              language === "en"
                ? "Provide detailed description of your collateral"
                : "Isulat ang detalyadong deskripsyon sa imong kolateral"
            }
          ></textarea>
        </div>

        {/* Ownership Status */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            {language === "en"
              ? "Ownership Status:"
              : "Kahimtang sa Pagpanag-iya:"}
          </label>
          <select
            value={ownershipStatus}
            onChange={(e) => setOwnershipStatus(e.target.value)}
            className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${(showFieldErrors && missingFields.includes('Ownership Status')) ? 'border-red-500' : 'border-gray-200'}`}
          >
            <option value="">
              {language === "en"
                ? "Select ownership status"
                : "Pilia ang kahimtang sa pagpanag-iya"}
            </option>
            <option value="Owned">
              {language === "en" ? "Owned" : "Gipanag-iya"}
            </option>
            <option value="Mortgaged">
              {language === "en" ? "Mortgaged" : "Naipang-utang"}
            </option>
            <option value="Other">
              {language === "en" ? "Other" : "Uban pa"}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
