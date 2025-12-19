'use client';
import { useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface UseProfilePicUploadParams {
  currentProfilePic: string;
  username: string;
}

export function useProfilePicUpload({ currentProfilePic, username }: UseProfilePicUploadParams) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewPic, setPreviewPic] = useState<string | null>(currentProfilePic || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setValidationError('Only JPEG or PNG allowed for profile picture.');
        e.target.value = '';
        return;
      }

      // Check file size (max 7MB)
      if (file.size > 7 * 1024 * 1024) {
        setValidationError('Profile picture must be less than 7MB.');
        e.target.value = '';
        return;
      }

      // Validate that image is square (2x2 format)
      try {
        const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ width: img.width, height: img.height });
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
          };
          img.src = objectUrl;
        });

        if (dims.width !== dims.height) {
          setValidationError('Profile picture must be square (2x2 format - equal width and height).');
          e.target.value = '';
          return;
        }
      } catch (error) {
        setValidationError('Failed to validate image. Please try again.');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setPreviewPic(URL.createObjectURL(file));
      setIsUploading(true);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewPic(currentProfilePic);
    setIsUploading(false);
    // Reset file input to allow selecting the same file again
    const fileInput = document.getElementById('profileUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSaveProfilePic = async () => {
    if (!selectedFile) return { ok: false, error: 'No file selected' } as const;

    const userId = localStorage.getItem('userId');
    const borrowersId = localStorage.getItem('borrowersId');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if ((!userId && !borrowersId) || !token) return { ok: false, error: 'User not authenticated' } as const;

    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    // Use different endpoints for borrowers vs staff
    const endpoint = role === 'borrower' 
      ? `${BASE_URL}/borrowers/${borrowersId}/upload-profile`
      : `${BASE_URL}/users/${userId}/upload-profile`;

    try {
      setIsWorking(true);
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

  // Normalize to absolute URL so other components (navbar) can render immediately
  const filePath = data.profilePic.filePath;
  const fullUrl = filePath && filePath.startsWith('http') ? filePath : `${window.location.origin}${filePath}`;
  setPreviewPic(fullUrl);
  localStorage.setItem('profilePic', fullUrl);
  window.dispatchEvent(new CustomEvent('profilePicUpdated', { detail: { profilePic: fullUrl } }));

      setSelectedFile(null);
      setIsUploading(false);
      setIsWorking(false);
      // Reset file input to allow selecting files again
      const fileInput = document.getElementById('profileUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      return { ok: true, url: data.profilePic.filePath } as const;
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsWorking(false);
      return { ok: false, error: err.message || 'Upload failed' } as const;
    }
  };

  const handleRemoveProfilePic = async () => {
    const userId = localStorage.getItem('userId');
    const borrowersId = localStorage.getItem('borrowersId');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if ((!userId && !borrowersId) || !token) return { ok: false, error: 'User not authenticated' } as const;

    // Use different endpoints for borrowers vs staff
    const endpoint = role === 'borrower' 
      ? `${BASE_URL}/borrowers/${borrowersId}/remove-profile`
      : `${BASE_URL}/users/${userId}/remove-profile`;

    try {
      setIsWorking(true);
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Remove failed');

  // Clear profilePic so listeners treat this as 'no image' and render initials
  setPreviewPic(null);
  localStorage.removeItem('profilePic');
  window.dispatchEvent(new CustomEvent('profilePicUpdated', { detail: { profilePic: null } }));

      setSelectedFile(null);
      setIsUploading(false);
      setIsWorking(false);
      // Reset file input to allow selecting files again
      const fileInput = document.getElementById('profileUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      return { ok: true } as const;
    } catch (err: any) {
      console.error('Remove error:', err);
      setIsWorking(false);
      return { ok: false, error: err.message || 'Remove failed' } as const;
    }
  };

  const clearValidationError = () => setValidationError(null);

  return {
    previewPic,
    isUploading,
    isWorking,
    validationError,
    clearValidationError,
    handleFileChange,
    handleCancelUpload,
    handleSaveProfilePic,
    handleRemoveProfilePic,
  };
}
