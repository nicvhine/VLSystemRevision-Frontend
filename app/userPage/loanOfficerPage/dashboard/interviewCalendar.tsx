'use client';

import { useEffect, useState } from "react";
// @ts-ignore - react-big-calendar may not have bundled types in this project
import { Calendar as RBC, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import InterviewModal from "@/app/commonComponents/modals/calendarModal";
import { LoadingSpinner } from "@/app/commonComponents/utils/loading";
import translations from "@/app/commonComponents/translation";
import SuccessModal from "@/app/commonComponents/modals/successModal";
import ErrorModal from "@/app/commonComponents/modals/errorModal";
import { Application, InterviewEvent } from "@/app/commonComponents/utils/Types/application";
import { InterviewCalendarProps } from "@/app/commonComponents/utils/Types/components";
import emailjs from "emailjs-com";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Calendar localization setup
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

function formatTimeTo12Hour(time: string) {
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr || "0", 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

export default function InterviewCalendar({ onModalToggle }: InterviewCalendarProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [language, setLanguage] = useState<'en' | 'ceb'>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("loanOfficerLanguage") as 'en' | 'ceb') || 'en';
    }
    return 'en';
  });
  const [events, setEvents] = useState<InterviewEvent[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month");
  const [date, setDate] = useState(new Date());
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Map loan_applications to calendar events
  const mapApplicationsToEvents = (apps: Application[]): InterviewEvent[] =>
  apps
    .filter(app => app.interviewDate && app.interviewTime)
    .map(app => {
      const interviewDate = app.interviewDate!;
      const interviewTime = app.interviewTime!;

      const [hourStr = "0", minuteStr = "0"] = interviewTime.split(":");
      const [yearStr, monthStr, dayStr] = interviewDate.split("-");

      const start = new Date(
        Number(yearStr),
        Number(monthStr) - 1,
        Number(dayStr),
        Number(hourStr),
        Number(minuteStr)
      );

      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      return {
        title: app.appName || "Unnamed Applicant",
        start,
        end,
        applicationId: app.applicationId,
      };
    });

  // Handle language change
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail.userType === 'loanOfficer') {
        setLanguage(event.detail.language);
      }
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  const t = translations.calendarTranslation[language];

  useEffect(() => {
    async function fetchApplications() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/loan-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch applications:", res.statusText);
          return;
        }

        const data: Application[] = await res.json();
        setApplications(data);
        setEvents(mapApplicationsToEvents(data));
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // Event clicked → open interview modal
  const handleSelectEvent = (event: InterviewEvent) => {
    const app = applications.find(a => a.applicationId === event.applicationId);
    if (!app) return;
    setSelectedApp(app);
    setShowModal(true);
    onModalToggle?.(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onModalToggle?.(false);
  };

  // Save updated schedule
  const handleSaveChanges = async (date: string, time: string) => {
    if (!selectedApp) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/loan-applications/${selectedApp.applicationId}/schedule-interview`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ interviewDate: date, interviewTime: time }),
      });

      if (res.ok) {
        setModalMsg("Schedule updated!");
        setShowSuccessModal(true);
        const updatedApplications = applications.map(app =>
          app.applicationId === selectedApp.applicationId
            ? { ...app, interviewDate: date, interviewTime: time }
            : app
        );
        setApplications(updatedApplications);

        if (selectedApp.appEmail) {
          try {
            const formattedTime = formatTimeTo12Hour(time);
            await emailjs.send(
              "service_qped1bc", 
              "template_1thbsnw",
              {
                email: selectedApp.appEmail,
                to_name: selectedApp.appName,
                address: selectedApp.appAddress,
                interviewDate: date, 
                interviewTime: formattedTime,
              },
              "tJf8gH3v0pbZ9Cvbk" 
            );
          } catch (err) {
            console.error("EmailJS error:", err);
          }
        }

        setEvents(mapApplicationsToEvents(updatedApplications));
        setSelectedApp(prev => (prev ? { ...prev, interviewDate: date, interviewTime: time } : prev));
        handleCloseModal();
      } else {
        // Try to extract a specific error message from server
        let serverMessage = "Failed to update schedule";
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json();
            serverMessage = data?.error || data?.message || serverMessage;
          } else {
            const text = await res.text();
            if (text) serverMessage = text;
          }
        } catch {
          // ignore parse errors and keep fallback
        }
        // Status-aware friendly messages
        if (res.status === 404) {
          // Often returns an HTML "Cannot PUT ..." page when the route isn't mounted
          serverMessage = "Interview scheduling endpoint not found. Please ensure the backend is running and up to date.";
        } else if (res.status === 401) {
          serverMessage = "You are not authenticated. Please sign in again.";
        } else if (res.status === 403) {
          serverMessage = "You don't have permission to reschedule interviews.";
        }
        setModalMsg(serverMessage);
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Error saving changes:", err);
      setModalMsg((err as Error)?.message || "Network error while updating schedule");
      setShowErrorModal(true);
    }
  };

  // Navigate to application details page
  const handleViewApplication = (applicationId: string) => {
    window.location.href = `/commonComponents/loanApplication/${applicationId}`;
  };

  return (
    <div className="p-2 sm:p-4">
      {isLoading ? (
        <div className="py-10 flex justify-center">
          <LoadingSpinner size={6} />
        </div>
      ) : (
        <>
          {showSuccessModal && (
            <SuccessModal isOpen={showSuccessModal} message={modalMsg} onClose={() => setShowSuccessModal(false)} />
          )}
          {showErrorModal && (
            <ErrorModal isOpen={showErrorModal} message={modalMsg} onClose={() => setShowErrorModal(false)} />
          )}

          <div className="bg-white p-3 sm:p-4 rounded shadow text-black">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">{t.c1}</h2>
            {/* @ts-ignore: react-big-calendar type issue */}
            <RBC
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              views={['month', 'week', 'day', 'agenda']}
              view={view}
              onView={(newView: View) => {
                if (["month", "week", "day", "agenda"].includes(newView)) {
                  setView(newView as "month" | "week" | "day" | "agenda");
                }
              }}
              date={date}
              onNavigate={(newDate: Date) => setDate(newDate)}
              popup
              style={{ height: "70vh", minHeight: "500px" }}
              onSelectEvent={handleSelectEvent}
              messages={{
                today: t.c2,
                previous: t.c3,
                next: t.c4,
                month: t.c5,
                week: t.c6,
                day: t.c7,
                agenda: t.c8,
                date: t.c9,
                time: t.c10,
                event: t.c11,
                noEventsInRange: t.c12,
                showMore: (total: number) => `+${total} more`,
              }}
              eventPropGetter={(event: InterviewEvent) => {
                const app = applications.find(a => a.applicationId === event.applicationId);
                const isPending = app?.status?.trim().toLowerCase() === "pending";
              
                const background = isPending ? "#dc2626" : "#9ca3af";
                const textDecoration = isPending ? "none" : "line-through";
                const color = isPending ? "white" : "#e5e7eb";
              
                return {
                  style: {
                    background,
                    color,
                    textDecoration,
                    padding: "4px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 500,
                  },
                };
              }}
              
              components={{
                event: ({ event }: { event: InterviewEvent }) => {
                  const display = event.title.length > 12 ? event.title.slice(0, 12) + "..." : event.title;
                  return (
                    <span
                      title={event.title}
                      style={{
                        display: "inline-block",
                        width: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {display}
                    </span>
                  );
                },
              }}
            />
          </div>

          <InterviewModal
            show={showModal}
            onClose={handleCloseModal}
            applicationId={selectedApp?.applicationId || ""}
            currentDate={selectedApp?.interviewDate}
            currentTime={selectedApp?.interviewTime}
            onSave={handleSaveChanges}
            onView={handleViewApplication}
            appliedDate={selectedApp?.dateApplied}
            status={selectedApp?.status} 
          />
        </>
      )}
    </div>
  );
}
