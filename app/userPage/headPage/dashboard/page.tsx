'use client';

import { useState, useEffect } from "react";
import { FiDownload } from 'react-icons/fi';
import { exportDashboardToPDF } from '@/lib/pdfExport';
import translations from '@/app/commonComponents/translation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer
} from "recharts";

type DashboardStats = {
  totalBorrowers: number;
  activeBorrowers: number;
  collectables: number;
  totalDisbursed: number;
  totalCollected: number;
  totalLoans: number;
  closedLoans: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  deniedApplications: number;
};

type TopBorrower = {
  borrowerName: string;
  percentagePaid: number;
  totalPaid: number;
  totalBalance: number;
};

type TopAgent = {
  agentId: string;
  name: string;
  totalProcessedLoans: number;
};


export default function HeadDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [borrowersOverTime, setBorrowersOverTime] = useState([]);
  const [loanDisbursementOverTime, setLoanDisbursementOverTime] = useState([]);
  const [topCollectorsData, setTopCollectorsData] = useState([]);
  const [applicationsByType, setApplicationsByType] = useState([]);
  const [topBorrowersData, setTopBorrowersData] = useState<TopBorrower[]>([]);
  const [topAgentsData, setTopAgentsData] = useState<TopAgent[]>([]);
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');

  const pieColors = ["#374151", "#6b7280", "#1f2937", "#9ca3af"];

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('headLanguage') : null;
    if (saved === 'en' || saved === 'ceb') setLanguage(saved);
    const onLang = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        if (ev.detail?.userType === 'head') {
          const lang = ev.detail?.language;
          if (lang === 'en' || lang === 'ceb') setLanguage(lang);
        }
      } catch {}
    };
    const onStorage = () => {
      const l = localStorage.getItem('headLanguage');
      if (l === 'en' || l === 'ceb') setLanguage(l);
    };
    window.addEventListener('languageChange', onLang as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('languageChange', onLang as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const t = translations.statisticTranslation[language];

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/stat/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setStats({
          totalBorrowers: data.totalBorrowers,
          activeBorrowers: data.activeBorrowers,
          collectables: data.collectables,
          totalDisbursed: data.totalDisbursed,
          totalCollected: data.totalCollected,
          totalLoans: data.totalLoans,
          closedLoans: data.closedLoans,
          totalApplications: data.totalApplications,
          pendingApplications: data.pendingApplications,
          approvedApplications: data.approvedApplications,
          deniedApplications: data.deniedApplications,
        });

        setBorrowersOverTime(data.borrowersOverTime || []);
        setLoanDisbursementOverTime(data.loanDisbursementOverTime || []);
        setTopCollectorsData(data.topCollectors || []);
        setApplicationsByType(data.applicationsByType || []);
        setTopBorrowersData(data.topBorrowers || []);

        const resAgents = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/stat/top-agents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataAgents = await resAgents.json();
        setTopAgentsData(dataAgents || []);

      } catch (error) {
        console.error("Failed to load stats", error);
      }
    }
    loadStats();
  }, []);

  const formatCurrency = (value: number) =>
    `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleExportPDF = async () => {
    setIsGenerating(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      await exportDashboardToPDF({
        stats,
        borrowersOverTime,
        loanDisbursementOverTime,
        topCollectorsData,
        applicationsByType,
        topBorrowersData,
        topAgentsData,
      }, {
        title: 'Analytics Dashboard Report - Head',
        subtitle: `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        filename: `head-dashboard-report-${timestamp}.pdf`,
        orientation: 'portrait',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header with Export Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{t.d1}</h1>
          <button
            onClick={handleExportPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="w-4 h-4" />
            {isGenerating ? t.d2 : t.d3}
          </button>
        </div>

        {/* Quick Stats */}
        <Section title={t.d4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title={t.d5} value={stats?.totalBorrowers ?? 0} />
            <StatCard title={t.d6} value={formatCurrency(stats?.totalDisbursed ?? 0)} />
            <StatCard title={t.d7} value={formatCurrency(stats?.totalCollected ?? 0)} />
          </div>
        </Section>

        {/* Borrowers Overview */}
        <Section title={t.d8}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Total & Active Borrowers */}
            <div className="flex flex-col justify-between h-full gap-6">
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center items-center text-center flex-1">
                <span className="text-2xl font-bold text-gray-900">{stats?.totalBorrowers ?? 0}</span>
                <span className="text-gray-500 text-sm mt-1">{t.d5}</span>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center items-center text-center flex-1">
                <span className="text-2xl font-bold text-gray-900">{stats?.activeBorrowers ?? 0}</span>
                <span className="text-gray-500 text-sm mt-1">{t.d9}</span>
              </div>
            </div>

            {/* Center: Top Borrowers */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col">
              <h3 className="text-sm font-semibold mb-2 text-gray-600">{t.d10}</h3>
              {topBorrowersData.length === 0 ? (
                <p className="text-gray-500">{t.d11}</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {topBorrowersData.map((borrower, index) => (
                    <li key={index} className="py-2 flex justify-between items-center">
                      <span>{borrower.borrowerName}</span>
                      <span className="text-gray-500">{(borrower.percentagePaid ?? 0).toFixed(2)}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: Borrowers Over Time Chart */}
            <ChartWrapper title={t.d12} height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={borrowersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="new" stroke="#374151" name={t.d13} />
                  <Line type="monotone" dataKey="active" stroke="#6b7280" name={t.d14} />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>

          </div>
        </Section>

       {/* Loan Overview */}
<Section title={t.d15}>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    {/* Left: Total & Closed Loans */}
    <div className="flex flex-col justify-between h-full gap-6">
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center items-center text-center flex-1">
        <span className="text-2xl font-bold text-gray-900">{stats?.totalLoans ?? 0}</span>
        <span className="text-gray-500 text-sm mt-1">{t.d16}</span>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center items-center text-center flex-1">
        <span className="text-2xl font-bold text-gray-900">{stats?.closedLoans ?? 0}</span>
        <span className="text-gray-500 text-sm mt-1">{t.d17}</span>
      </div>
    </div>

    {/* Center: Top Agents */}
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
      <h3 className="text-sm font-semibold mb-2 text-gray-600">{t.d18}</h3>
      {topAgentsData.length === 0 ? (
        <p className="text-gray-500">{t.d19}</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {topAgentsData.map((agent: any) => (
            <li key={agent.agentId} className="py-2 flex justify-between items-center">
              <span>{agent.name}</span>
              <span className="text-gray-500 font-semibold">{formatCurrency(agent.totalProcessedLoans)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Right: Loan Disbursement Chart */}
    <ChartWrapper title={t.d20} height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={loanDisbursementOverTime}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="disbursed" fill="#374151" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>

  </div>
</Section>


        {/* Collection Overview */}
        <Section title={t.d21}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center items-center text-center h-full">
              <span className="text-2xl font-bold mt-2 text-gray-900">{formatCurrency(stats?.totalCollected ?? 0)}</span>
              <span className="text-gray-500 text-sm mt-1">{t.d7}</span>
            </div>

            {/* Top Collectors */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 w-full">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-600">
              {t.d23}
            </div>
            {topCollectorsData.length === 0 ? (
              <p className="text-gray-500">{t.d24}</p>
            ) : (
              <div className="space-y-4">
                {topCollectorsData
                  .filter((c: any) => Number(c.totalAssigned) > 0) // Only show collectors with assignments
                  .map((c: any) => {
                    const paid = Number(c.paidCollections) || 0;
                    const total = Number(c.totalAssigned);
                    const progressPercent = Math.min((paid / total) * 100, 100);

                    return (
                      <div key={c.collectorId}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">{c.name}</span>
                          <span className="text-sm font-semibold">
                            {paid} / {total} ({progressPercent.toFixed(2)}%)
                          </span>
                        </div>
                        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                {topCollectorsData.filter((c: any) => Number(c.totalAssigned) > 0).length === 0 && (
                  <p className="text-gray-500 text-sm italic">No collectors with active assignments</p>
                )}
              </div>
            )}
          </div>

          </div>
        </Section>

        {/* Loan Applications Overview */}
        <Section title={t.d25}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="grid grid-cols-2 gap-4">
              <StatCard title={t.d26} value={stats?.totalApplications ?? 0} />
              <StatCard title={t.d27} value={stats?.pendingApplications ?? 0} />
              <StatCard title={t.d28} value={stats?.approvedApplications ?? 0} />
              <StatCard title={t.d29} value={stats?.deniedApplications ?? 0} />
            </div>

            <ChartWrapper title={t.d30} height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={applicationsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ value }) => value?.toString()}
                >
                    {applicationsByType.map((entry, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>

          </div>
        </Section>

      </div>
    </div>
  );
}

// -----------------------------
// Reusable Components
// -----------------------------
const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center items-center text-center">
    <span className="text-2xl font-bold mt-2 text-gray-900">{value}</span>
    <span className="text-gray-500 text-sm mt-1">{title}</span>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-12">
    <h2 className="text-lg font-semibold mb-4 text-red-700">{title}</h2>
    {children}
  </div>
);

const ChartWrapper = ({ title, children, height }: { title: string; children: React.ReactNode; height: number }) => (
  <div className="bg-white rounded-2xl shadow p-4">
    <h3 className="text-sm font-semibold mb-2 text-gray-600">{title}</h3>
    <div style={{ height }}>{children}</div>
  </div>
);
