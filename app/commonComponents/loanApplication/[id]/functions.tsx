import { useState } from "react";

// Success Modal State
const [successModalOpen, setSuccessModalOpen] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

// Show Success Message
const showSuccess = (message: string) => {
  setSuccessMessage(message);
  setSuccessModalOpen(true);
  // Automatically close after 5 seconds
  setTimeout(() => setSuccessModalOpen(false), 5000);
};

// Error Modal State
const [errorModalOpen, setErrorModalOpen] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

// Show Error Message
const showError = (message: string) => {
  setErrorMessage(message);
  setErrorModalOpen(true);
  // Automatically close after 3 seconds
  setTimeout(() => setErrorModalOpen(false), 3000);
};


