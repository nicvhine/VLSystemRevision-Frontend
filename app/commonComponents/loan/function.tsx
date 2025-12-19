import { LoanDetails } from "../utils/Types/loan";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchLoans = async (token: string | null): Promise<LoanDetails[]> => {
  if (!token) return [];
  
  try {
    const res = await fetch(`${BASE_URL}/loans`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`Error: ${res.status} - ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.loans)) return data.loans;
    return [];
  } catch (err) {
    console.error("Failed to fetch loans:", err);
    return [];
  }
};
