'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function BorrowerLoanApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Borrower info
  const [borrowersId, setBorrowersId] = useState<string>('');

  // Pre-filled personal information
  const [formData, setFormData] = useState({
    appName: '',
    appEmail: '',
    appContact: '',
    appAddress: '',
    appDob: '',
    appMarital: '',
    appChildren: '',
    appSpouseName: '',
    appSpouseOccupation: '',
    
    // Loan information
    sourceOfIncome: 'business',
    appLoanPurpose: '',
    appLoanAmount: '',
    appLoanTerms: '',
    
    // Business info
    appTypeBusiness: '',
    appBusinessName: '',
    appDateStarted: '',
    appBusinessLoc: '',
    appMonthlyIncome: '',
    
    // Employment info (if employed)
    appOccupation: '',
    appEmploymentStatus: '',
    appCompanyName: '',
  });

  const [references, setReferences] = useState([
    { name: '', contact: '', relation: '' },
    { name: '', contact: '', relation: '' },
    { name: '', contact: '', relation: '' },
  ]);

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  // Fetch borrower data for pre-filling
  useEffect(() => {
    const fetchBorrowerData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedBorrowersId = localStorage.getItem('borrowersId');
        
        if (!storedBorrowersId) {
          setError('Borrower ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        setBorrowersId(storedBorrowersId);

        // Fetch pre-fill data
        const response = await fetch(
          `${BASE_URL}/loan-applications/borrower-prefill/${storedBorrowersId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch borrower data');
        }

        const data = await response.json();

        // Pre-fill form data
        setFormData((prev) => ({
          ...prev,
          appName: data.name || '',
          appEmail: data.email || '',
          appContact: data.phoneNumber || '',
          appAddress: data.address || '',
          appDob: data.dob || '',
          appMarital: data.maritalStatus || '',
          appChildren: data.children || '',
          appSpouseName: data.spouseName || '',
          appSpouseOccupation: data.spouseOccupation || '',
        }));

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching borrower data:', err);
        setError(err.message || 'Failed to load borrower information');
        setLoading(false);
      }
    };

    fetchBorrowerData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    const newReferences = [...references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    setReferences(newReferences);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files) {
      if (name === 'profilePic') {
        setProfilePic(files[0]);
      } else if (name === 'documents') {
        setDocuments(Array.from(files));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, loanType: 'with' | 'without' | 'open-term') => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      
      // Add borrowersId
      formDataToSend.append('borrowersId', borrowersId);
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Add references as JSON string
      formDataToSend.append('appReferences', JSON.stringify(references));
      
      // Add agent (default to "no agent" for borrower portal)
      formDataToSend.append('appAgent', 'no agent');
      
      // Add files
      if (profilePic) {
        formDataToSend.append('profilePic', profilePic);
      }
      documents.forEach((doc) => {
        formDataToSend.append('documents', doc);
      });

      const response = await fetch(`${BASE_URL}/loan-applications/apply/${loanType}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const result = await response.json();
      
      // Success - redirect to dashboard or confirmation page
      alert(`Application submitted successfully! Application ID: ${result.application.applicationId}`);
      router.push('/borrower/dashboard');
      
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/borrower/dashboard')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Application</h1>
          <p className="text-gray-600 mb-6">Your information has been pre-filled. Please review and complete the form.</p>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Personal Information Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-4 pb-2 border-b border-red-100">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="appName"
                    value={formData.appName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="appEmail"
                    value={formData.appEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="appContact"
                    value={formData.appContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="appDob"
                    value={formData.appDob}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    readOnly
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="appAddress"
                    value={formData.appAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    readOnly
                  />
                </div>
              </div>
            </section>

            {/* Loan Information Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-4 pb-2 border-b border-red-100">
                Loan Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="appLoanPurpose"
                    value={formData.appLoanPurpose}
                    onChange={handleInputChange}
                    placeholder="e.g., Business expansion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="appLoanAmount"
                    value={formData.appLoanAmount}
                    onChange={handleInputChange}
                    placeholder="20000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Character References Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-4 pb-2 border-b border-red-100">
                Character References
              </h2>
              
              {references.map((ref, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-3">Reference {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={ref.name}
                      onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Contact Number"
                      value={ref.contact}
                      onChange={(e) => handleReferenceChange(index, 'contact', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={ref.relation}
                      onChange={(e) => handleReferenceChange(index, 'relation', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* Documents Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-red-600 mb-4 pb-2 border-b border-red-100">
                Required Documents
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture (2x2) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="profilePic"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Documents (4-6 files) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="documents"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload valid IDs, proof of income, and other supporting documents
                  </p>
                </div>
              </div>
            </section>

            {/* Submit Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={(e) => handleSubmit(e, 'without')}
                disabled={submitting}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Apply for Regular Loan (Without Collateral)'}
              </button>
              
              <button
                onClick={(e) => handleSubmit(e, 'with')}
                disabled={submitting}
                className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Apply for Regular Loan (With Collateral)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}