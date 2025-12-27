"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const LoadingSpinner = () => (
	<div className="flex items-center justify-center py-20">
		<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
	</div>
);

export default function UpcomingBillsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const loanId = searchParams?.get("loanId");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loan, setLoan] = useState<any | null>(null);
	const [collections, setCollections] = useState<any[]>([]);

	useEffect(() => {
		if (!loanId) return;

		const fetchLoan = async () => {
			setLoading(true);
			setError(null);
			try {
				const token = localStorage.getItem("token");
				if (!token) throw new Error("Not authenticated");

				const res = await fetch(`${BASE_URL}/collections/${loanId}`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (!res.ok) {
					const d = await res.json().catch(() => ({}));
					throw new Error(d?.error || `Failed to load loan ${loanId}`);
				}

				const data = await res.json();
				// endpoint returns loan object with `collections` array
				setLoan(data);
				setCollections(Array.isArray(data.collections) ? data.collections : []);
			} catch (err: any) {
				console.error(err);
				setError(err?.message || "Failed to load upcoming bills");
			} finally {
				setLoading(false);
			}
		};

		fetchLoan();
	}, [loanId]);

	if (!loanId) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="max-w-xl w-full p-6 bg-white rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-2">Loan ID required</h2>
					<p className="text-sm text-gray-600 mb-4">Pass a `loanId` query parameter (e.g. ?loanId=L001)</p>
					<button onClick={() => router.push('/userPage/borrowerPage/dashboard')} className="px-4 py-2 bg-red-600 text-white rounded">Back</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-4xl mx-auto px-4">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Upcoming Bills</h1>
						<p className="text-sm text-gray-600">Loan: <span className="font-mono">{loanId}</span></p>
					</div>
					<div>
						<button onClick={() => router.push('/userPage/borrowerPage/dashboard')} className="px-3 py-2 border rounded text-sm">Back to Dashboard</button>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					{loading ? (
						<LoadingSpinner />
					) : error ? (
						<div className="text-red-600">{error}</div>
					) : (
						<>
							<div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="col-span-2">
									<div className="text-sm text-gray-500">Balance</div>
									<div className="text-xl font-semibold">₱{Number(loan?.balance ?? 0).toLocaleString()}</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-500">Disbursed</div>
									<div className="text-sm font-medium">{loan?.dateDisbursed ? new Date(loan.dateDisbursed).toLocaleDateString() : '—'}</div>
								</div>
							</div>

							<h3 className="text-sm font-semibold mb-3">Payment Schedule</h3>
							{collections.length === 0 ? (
								<div className="p-4 text-sm text-gray-500">No scheduled collections found.</div>
							) : (
								<ul className="space-y-3">
									{collections.map((c) => (
										<li key={c.referenceNumber || c.collectionNumber} className="flex items-center justify-between p-3 border rounded">
											<div>
												<div className="text-sm font-medium">{c.collectionNumber ? `Installment ${c.collectionNumber}` : c.referenceNumber}</div>
												<div className="text-xs text-gray-500">Due: {new Date(c.dueDate).toLocaleDateString()}</div>
											</div>
											<div className="text-right">
												<div className="text-sm font-semibold">₱{Number(c.periodAmount ?? c.periodBalance ?? 0).toLocaleString()}</div>
												<div className={`text-xs mt-1 ${c.status === 'Paid' ? 'text-green-600' : c.status === 'Partial' ? 'text-amber-600' : 'text-red-600'}`}>{c.status}</div>
												<div className="mt-2">
													<button onClick={() => router.push(`/userPage/borrowerPage/pay/${loanId}`)} className="px-3 py-1 text-sm bg-red-600 text-white rounded">Pay</button>
												</div>
											</div>
										</li>
									))}
								</ul>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

