import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useOrgStore } from '../store/useOrgStore';
import { axiosInstance } from '../lib/axios';
import { Plus, Video, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CalendarPage = () => {
    const { currentOrg } = useOrgStore();
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        if (currentOrg) {
            fetchEvents();
        }
    }, [currentOrg]);

    const fetchEvents = async () => {
        try {
            const res = await axiosInstance.get(`/calendar/${currentOrg._id}/events`);
            // Parse dates
            const parsedEvents = res.data.map(e => ({
                ...e,
                start: new Date(e.start),
                end: e.end ? new Date(e.end) : new Date(e.start), // Default to start if no end (Tasks)
            }));
            setEvents(parsedEvents);
        } catch (error) {
            console.error("Failed to fetch events", error);
            // toast.error("Failed to load schedule");
        }
    };

    const handleSelectSlot = ({ start, end }) => {
        const title = window.prompt('New Event Name');
        if (title) {
            // Check if meeting or task (simple prompt for now)
            const type = window.confirm("Is this a meeting with a link?") ? "meeting" : "task";
            if (type === "meeting") {
                createMeeting(title, start, end);
            } else {
                // Task creation logic (omitted for brevity, assume meeting for demo)
                createMeeting(title, start, end);
            }
        }
    };

    const createMeeting = async (title, start, end) => {
        try {
            await axiosInstance.post(`/calendar/${currentOrg._id}/meetings`, {
                title,
                startTime: start,
                endTime: end,
                description: "Scheduled via Calendar",
                type: "online"
            });
            toast.success("Meeting Scheduled!");
            fetchEvents();
        } catch (error) {
            toast.error("Failed to schedule meeting");
        }
    };

    return (
        <div className="h-full w-full bg-[#0b0b0b] text-white flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-[#222] flex items-center justify-between px-6 bg-[#111]">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="size-5 text-green-500" />
                    <h1 className="text-xl font-bold">Schedule</h1>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Plus className="size-4" /> Schedule Meeting
                </button>
            </div>

            {/* Calendar Container */}
            <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full bg-[#1a1a1a] rounded-xl border border-[#333] p-1 shadow-2xl">
                    <style>{`
                        .rbc-calendar { color: #ccc; }
                        .rbc-toolbar button { color: #fff; border: 1px solid #444; }
                        .rbc-toolbar button:hover { bg: #333; }
                        .rbc-toolbar button.rbc-active { background: #333; box-shadow: none; border-color: #666; }
                        .rbc-header { border-bottom: 1px solid #333; }
                        .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid #333; border-radius: 8px; }
                        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #333; }
                        .rbc-off-range-bg { background: #111; }
                        .rbc-event { background-color: #10b981; border-radius: 4px; }
                     `}</style>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView="month"
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
