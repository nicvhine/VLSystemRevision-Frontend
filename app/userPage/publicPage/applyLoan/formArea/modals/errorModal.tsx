"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    message: string;
    onClose: () => void;
}

export function ErrorModal({ message, onClose }: ModalProps) {
    const [animateIn, setAnimateIn] = useState(false);
    const [mounted, setMounted] = useState(false); // NEW

    useEffect(() => {
        setMounted(true); // Only render portal on client
        setAnimateIn(true);
        return () => setAnimateIn(false);
    }, []);

    const handleClose = () => {
        setAnimateIn(false);
        setTimeout(() => onClose(), 150);
    };

    let header = "Error";
    if (message.toLowerCase().includes("agent") || message.toLowerCase().includes("does not exist")) {
        header = "Agent Selection Error";
    } else if (message.toLowerCase().includes("missing") || message.toLowerCase().includes("required field")) {
        header = "Missing Fields Error";
    } else if (message.toLowerCase().includes("upload")) {
        header = "Document Upload Error";
    }

    if (!mounted) return null; // ✅ wait for client

    return createPortal(
        <div
            className={`fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center px-4 transition-opacity duration-150 ${
                animateIn ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
            role="alertdialog"
            aria-modal="true"
        >
            <ModalContent animateIn={animateIn} header={header} message={message} handleClose={handleClose} />
        </div>,
        document.body
    );
}

function ModalContent({ animateIn, header, message, handleClose }: any) {
    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, []);

    return (
        <div
            className={`w-full max-w-sm rounded-lg bg-white p-6 text-black shadow-2xl transition-all duration-150 ${
                animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{header}</h3>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <div className="flex justify-end">
                <button onClick={handleClose} className="px-4 py-2 bg-red-600 text-white rounded-md">Close</button>
            </div>
        </div>
    );
}

export function DocumentUploadErrorModal({ message, onClose }: ModalProps) {
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        setAnimateIn(true);
        return () => setAnimateIn(false);
    }, []);

    const handleClose = () => {
        setAnimateIn(false);
        setTimeout(() => onClose(), 150);
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center px-4 transition-opacity duration-150 ${
                animateIn ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
            role="alertdialog"
            aria-modal="true"
        >
            <ModalContent animateIn={animateIn} header={'Document Upload Issue'} message={message} handleClose={handleClose} />
        </div>,
        document.body
    );
}
