'use client';

import LoanStatistics from "@/app/commonComponents/statistics/LO_loanStatistics";
import { useState } from "react";
import InterviewCalendar from "./interviewCalendar";

export default function LoanOfficerDashboard() {
  const [isNavbarBlurred, setIsNavbarBlurred] = useState(false);

  return (
      <div className="min-h-screen bg-white relative z-10">
        <div className="bg-white px-4 sm:px-6">
        </div>

        {/* Responsive layout: Stack on mobile, side-by-side on desktop */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Statistics sidebar - full width on mobile, fixed width on desktop */}
            <div className="w-full lg:w-72 lg:flex-shrink-0">
              <div className="flex flex-col gap-4 mt-5">
                <LoanStatistics />
              </div>
            </div>
            
            {/* Calendar - scrollable on mobile, flex on desktop */}
            <div className="flex-1 min-w-0">
              <InterviewCalendar onModalToggle={setIsNavbarBlurred} />
            </div>
          </div>
        </div>
      </div>
  );
}
