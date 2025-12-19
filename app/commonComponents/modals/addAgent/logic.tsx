import { useState, useEffect } from "react";
import { AddAgentResult, FieldErrors } from "../../utils/Types/agent";

export const useAddAgentLogic = (onAddAgent: () => Promise<AddAgentResult>, show: boolean, loading: boolean) => {
  const [showConfirm, setShowConfirm] = useState(false); 
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [genericError, setGenericError] = useState(""); 
  const [isVisible, setIsVisible] = useState(false); 
  const [isAnimating, setIsAnimating] = useState(false); 

  // Show/hide animation
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 150);
    }
  }, [show]);

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && show && !loading) setIsVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, loading]);

  // Confirm add agent
  const handleConfirm = async () => {
    setShowConfirm(false);
    setGenericError("");
    const result = await onAddAgent();
    if (!result.success) {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.message) setGenericError(result.message);
    }
  };

  return {
    showConfirm,
    setShowConfirm,
    fieldErrors,
    genericError,
    isVisible,
    isAnimating,
    handleConfirm,
  };
};
