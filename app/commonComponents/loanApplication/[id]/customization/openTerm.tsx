'use client';
import React from 'react';
import { capitalizeWords, formatCurrency } from '@/app/commonComponents/utils/formatters';
import { ApplicationCardProps } from '@/app/commonComponents/utils/Types/application';

interface OpenTermProps extends ApplicationCardProps {
  isEditing?: boolean;
  collateralData?: any;
  setCollateralData?: any;
}

export default function OpenTerm({ application, isEditing, collateralData, setCollateralData }: OpenTermProps) {

  const handleCollateralChange = (field: string, value: string) => {
    if (setCollateralData) {
      setCollateralData({ ...collateralData, [field]: value });
    }
  };

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-500">Collateral Type</p>
          {isEditing ? (
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 mt-1"
              value={collateralData?.collateralType || ""}
              onChange={(e) => handleCollateralChange("collateralType", e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Equipment">Equipment</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Electronics">Electronics</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p className="text-base text-gray-800 mt-1">{capitalizeWords(application?.collateralType || '—')}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Collateral Description</p>
          {isEditing ? (
            <textarea
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 mt-1"
              value={collateralData?.collateralDescription || ""}
              onChange={(e) => handleCollateralChange("collateralDescription", e.target.value)}
              rows={2}
            />
          ) : (
            <p className="text-base text-gray-800 mt-1">{capitalizeWords(application?.collateralDescription || '—')}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Ownership Status</p>
          {isEditing ? (
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 mt-1"
              value={collateralData?.ownershipStatus || ""}
              onChange={(e) => handleCollateralChange("ownershipStatus", e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="Owned">Owned</option>
              <option value="Co-Owned">Co-Owned</option>
              <option value="Mortgaged">Mortgaged</option>
            </select>
          ) : (
            <p className="text-base text-gray-800 mt-1">{capitalizeWords(application?.ownershipStatus || '—')}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Collateral Value</p>
          {isEditing ? (
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 mt-1"
              value={collateralData?.collateralValue || ""}
              onChange={(e) => handleCollateralChange("collateralValue", e.target.value)}
            />
          ) : (
            <p className="text-base text-gray-800 mt-1">{formatCurrency(application?.collateralValue || 0)}</p>
          )}
        </div>
      </div>
    </section>
  );
}
