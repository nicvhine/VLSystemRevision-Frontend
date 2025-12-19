'use client';

import { useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_URL; 

// Manage profile picture preview and upload lifecycle
export default function useProfilePic() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [previewPic, setPreviewPic] = useState<string | null>(null);
  const [originalPic, setOriginalPic] = useState<string | null>(null);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  // Preview selected image and set uploading state
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreviewPic(previewURL);
    setIsUploadingPic(true);
  };

  // Upload selected image to backend and persist URL
  const handleSaveProfilePic = async () => {
    if (!previewPic) return;
  
    const fileInput = document.getElementById('profileUpload') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('profilePic', file);
  
    const userId = localStorage.getItem('userId');
    try {
      const res = await fetch(`${BASE_URL}/users/${userId}/upload-profile`, {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      if (data.profilePic) {
        const fullUrl = `${BASE_URL}${data.profilePic}`;
        setProfilePic(fullUrl);
        setOriginalPic(fullUrl);
        localStorage.setItem('profilePic', fullUrl);
        setIsUploadingPic(false);
        setPreviewPic(null);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  // Revert preview and exit uploading state
  const handleCancelUpload = () => {
    setPreviewPic(null);
    setIsUploadingPic(false);
  };

  return {
    profilePic,
    setProfilePic,
    previewPic,
    setPreviewPic,
    originalPic,
    setOriginalPic,
    isUploadingPic,
    setIsUploadingPic,
    handleFileChange,
    handleSaveProfilePic,
    handleCancelUpload,
  };
}