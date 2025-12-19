import React from "react";
import { DetailRowProps } from "../../utils/Types/components";

export const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex flex-col py-1">
    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
    <div className="text-sm font-semibold text-gray-800">{value}</div>
  </div>
);
