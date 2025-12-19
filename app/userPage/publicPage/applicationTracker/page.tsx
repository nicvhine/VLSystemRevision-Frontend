"use client";

import { useState } from "react";
import TrackModal from "./trackModal";

export default function ApplicationTrackerPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <TrackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        language="en"
      />
    </div>
  );
}
