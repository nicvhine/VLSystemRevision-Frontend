const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function submitCIChecklist(
  ciData: {
    applicationId: string;
    loanOfficerName: string;
    checklist: Record<string, boolean>;
    notes: string;
    proofPhotos: File[];
  },
  authFetch: any,
  showSuccess: (msg: string) => void,
  showError: (msg: string) => void
) {
  try {
    // Step 1: Upload photos to Cloudinary
    const photoUrls: string[] = [];

    for (const file of ciData.proofPhotos) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `VLSystem/CI/${ciData.applicationId}`);

      const uploadResponse = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo');
      }

      const uploadedFile = await uploadResponse.json();
      photoUrls.push(uploadedFile.filePath);
    }

    // Step 2: Submit CI checklist with photo URLs
    const response = await authFetch(`${BASE_URL}/loan-applications/${ciData.applicationId}/ci-checklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loanOfficerName: ciData.loanOfficerName,
        checklist: ciData.checklist,
        notes: ciData.notes,
        proofPhotos: photoUrls,
        status: 'Cleared',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit CI checklist');
    }

    showSuccess('CI checklist submitted successfully to manager for approval!');
    return await response.json();
  } catch (error: any) {
    console.error('Error submitting CI checklist:', error);
    showError(error.message || 'Failed to submit CI checklist');
    throw error;
  }
}
