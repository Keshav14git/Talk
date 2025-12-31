import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useHomeStore } from "../store/useHomeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import startOfDay from "date-fns/startOfDay";
import endOfDay from "date-fns/endOfDay";
import isWithinInterval from "date-fns/isWithinInterval";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CheckCircle2, Clock, Calendar as CalendarIcon, ListTodo, AlertCircle, Info, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import CreateMeetingModal from "./CreateMeetingModal";

// Setup Calendar Localizer
const locales = {
    "en-US": enUS,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const HomeDashboard = () => {
    const { userTasks, userEvents, fetchUserDashboardData, isLoading } = useHomeStore();
    const { socket } = useAuthStore();
    const [view, setView] = useState("month");
    const [date, setDate] = useState(new Date());

    // Modal & Selection State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Calculate initial range based on view/date
    const [range, setRange] = useState({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });

    useEffect(() => {
        fetchUserDashboardData();
    }, [fetchUserDashboardData]);

    // Real-time Updates via Socket
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            fetchUserDashboardData();
        };

        const handleTaskAssigned = (task) => {
            toast.success(`New task assigned: ${task.title}`);
            fetchUserDashboardData();
        };

        const handleMeetingScheduled = (meeting) => {
            fetchUserDashboardData();
        }

        socket.on("newTaskAssigned", handleTaskAssigned);
        socket.on("taskUpdated", handleUpdate);
        socket.on("newMeetingScheduled", handleMeetingScheduled);

        return () => {
            socket.off("newTaskAssigned", handleTaskAssigned);
            socket.off("taskUpdated", handleUpdate);
            socket.off("newMeetingScheduled", handleMeetingScheduled);
        };
    }, [socket, fetchUserDashboardData]);

    // Handle Drilldown (Clicking a date in Month/Week view)
    const handleDrillDown = useCallback((drillDate) => {
        setDate(drillDate);
        setView("day");
        // Range update will be handled by the effect below
    }, []);

    // Handle Slot Selection (Dragging to create event)
    const handleSelectSlot = useCallback(({ start, end, action }) => {
        // In month view, clicks might be navigation.
        // We only really want "drag to create" in Time views (Week/Day)
        // OR explicit clicks.

        setSelectedSlot({ start, end });
        setIsCreateModalOpen(true);
    }, []);

    // Also update range when view/date manually changes if needed
    useEffect(() => {
        let start, end;
        if (view === 'month') {
            start = startOfMonth(date);
            end = endOfMonth(date);
        } else if (view === 'week') {
            start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday start to match en-US
            const endDate = new Date(start);
            endDate.setDate(start.getDate() + 6);
            end = endOfDay(endDate);
        } else if (view === 'day') {
            start = startOfDay(date);
            end = endOfDay(date);
        }
        setRange({ start, end });
    }, [date, view]);

    const filteredTasks = useMemo(() => {
        return userTasks.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return isWithinInterval(dueDate, { start: range.start, end: range.end });
        });
    }, [userTasks, range]);

    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === "completed").length;
    const inProgressTasks = filteredTasks.filter(t => t.status === "in-progress").length;

    const navigate = useNavigate();

    // ... (rest of code)

    const handleSelectEvent = (event) => {
        // Handle Tasks
        if (event.type === 'task') {
            toast.success(`Task: ${event.title}`);
            return;
        }

        // Handle Meetings
        if (event.type === 'meeting') {
            if (event.meetingType === 'online') {
                if (event.platform === 'external' && event.link) {
                    window.open(event.link, '_blank');
                } else if (event.platform === 'internal' && event.joinId) {
                    // Navigate to internal meeting room
                    // Assuming route structure /meeting/:id exists or will exist
                    // Since we are inside the workspace layout usually, we might want to stay in context 
                    // or pop out. For now, let's navigate to a dedicated meeting page.
                    // Checking existing routes... usually /meeting/:id
                    navigate(`/meeting/${event.joinId}`);
                } else {
                    toast.error("Invalid meeting link or ID");
                }
            } else if (event.meetingType === 'offline') {
                toast(`Location: ${event.location || 'No location specified'}`, {
                    icon: '📍'
                });
            }
        }
    };

    const EventComponent = ({ event }) => (
        <div className="flex items-center gap-1.5 px-2 py-0.5 h-full w-full overflow-hidden transition-all hover:brightness-110">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${event.type === 'meeting' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span className="text-[11px] font-medium truncate leading-tight text-white/90">{event.title}</span>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#050505] text-white p-6 gap-6 overflow-hidden">
            <style>{`
                /* Dark Theme Calendar Overrides */
                .rbc-calendar { font-family: inherit; color: #a1a1aa; }
                .rbc-header { border-bottom: 1px solid #27272a; padding: 12px 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                
                /* Container Scroll Fixes */
                .rbc-month-view, .rbc-time-view, .rbc-agenda-view { 
                    border: 1px solid #27272a; 
                    background: #09090b; 
                    border-radius: 12px; 
                    /* overflow: hidden; Removed to allow internal scroll logic to work better if needed, usually RBC handles it */
                }

                .rbc-month-row + .rbc-month-row { border-top: 1px solid #27272a; }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #27272a; }
                .rbc-off-range-bg { background: #18181b; }
                .rbc-today { background: rgba(99, 102, 241, 0.08) !important; }
                .rbc-event { background: transparent !important; padding: 0 !important; border-radius: 4px; }
                .rbc-time-content { border-top: 1px solid #27272a; }
                .rbc-time-header-content { border-left: 1px solid #27272a; }
                .rbc-timeslot-group { border-bottom: 1px solid #27272a; }
                .rbc-day-slot .rbc-time-slot { border-top: 1px solid #27272a; opacity: 0.5; }
                .rbc-time-gutter .rbc-timeslot-group { border-bottom: 1px solid #27272a; }
                .rbc-label { color: #71717a; font-size: 0.7rem; font-weight: 500; }
                
                /* Current Time */
                .rbc-current-time-indicator { background-color: #6366f1; height: 2px; }
                
                /* Selection Highlight */
                .rbc-slot-selection { background-color: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.5); color: white; border-radius: 4px; }

                /* Scrollbar polish */
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: #52525b; }
            `}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                        {view === 'month' && format(date, "MMMM yyyy")}
                        {view === 'week' && "Weekly Overview"}
                        {view === 'day' && format(date, "EEEE, MMM do")}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                        <CalendarIcon className="size-4" />
                        <span>
                            {view === 'day' ? "Focusing on today's agenda" : "Manage your schedule efficiently"}
                        </span>
                    </p>
                </div>

                {/* Stats Row - Animated */}
                <div className="flex gap-3">
                    <AnimatePresence mode="wait">
                        <StatBadge key={`total-${totalTasks}`} icon={ListTodo} value={totalTasks} label="Total" color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
                        <StatBadge key={`active-${inProgressTasks}`} icon={Clock} value={inProgressTasks} label="Active" color="bg-amber-500/10 text-amber-400 border-amber-500/20" />
                        <StatBadge key={`done-${completedTasks}`} icon={CheckCircle2} value={completedTasks} label="Done" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                {/* Left: Task List */}
                <div className="lg:w-1/3 flex flex-col bg-[#09090b] rounded-2xl border border-[#27272a] overflow-hidden shrink-0 h-[400px] lg:h-auto">
                    <div className="p-4 border-b border-[#27272a] flex items-center justify-between bg-[#0c0c0e]">
                        <h2 className="font-semibold text-gray-200 text-sm">
                            {view === 'day' ? "Tasks for Today" : "Tasks for this View"}
                        </h2>
                        <div className="tooltip" title={`Tasks filtered by: ${view}`}>
                            <Info className="size-3.5 text-gray-500" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                <div className="p-8 text-center text-gray-600 text-xs animate-pulse">Syncing...</div>
                            ) : filteredTasks.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2">
                                    <ListTodo className="size-8 opacity-20" />
                                    <p className="text-xs">No tasks found</p>
                                </motion.div>
                            ) : (
                                filteredTasks.map((task) => (
                                    <motion.div
                                        key={task._id} layout
                                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="p-3 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] rounded-lg cursor-pointer group transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <h3 className="text-sm font-medium text-gray-300 group-hover:text-white line-clamp-1">{task.title}</h3>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize bg-[#27272a] text-gray-400`}>
                                                {task.status?.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                            {task.priority === 'high' && <span className="text-red-400 font-medium">High Priority</span>}
                                            <span className="ml-auto">{format(new Date(task.dueDate), "MMM d, h:mm a")}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Calendar */}
                <div className="lg:w-2/3 flex flex-col bg-[#09090b] rounded-2xl border border-[#27272a] overflow-hidden shadow-2xl relative">
                    <div className="flex-1 p-1 h-full overflow-hidden">
                        <Calendar
                            localizer={localizer}
                            events={userEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: "100%" }}
                            views={["month", "week", "day"]}
                            view={view}
                            date={date}
                            onView={setView}
                            onNavigate={setDate}
                            onSelectEvent={handleSelectEvent}
                            onDrillDown={handleDrillDown} // Enable click-to-day
                            onSelectSlot={handleSelectSlot}
                            selectable
                            scrollToTime={new Date(1970, 1, 1, 8, 0, 0)} // Scroll to 8 AM default
                            step={30} // 30 min steps for real feel
                            timeslots={2}
                            components={{
                                event: EventComponent,
                                toolbar: CustomToolbar
                            }}
                            eventPropGetter={(event) => ({
                                className: `${event.type === 'meeting' ? 'bg-emerald-500/10 border-l-emerald-500' : 'bg-blue-500/10 border-l-blue-500'} border-l-[3px] !bg-opacity-10 hover:!bg-opacity-20 transition-all cursor-pointer rounded-sm my-0.5`
                            })}
                            dayPropGetter={(d) => {
                                const isToday = new Date().toDateString() === d.toDateString();
                                return {
                                    className: isToday ? 'rbc-today' : ''
                                };
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Create Meeting Modal */}
            <CreateMeetingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                selectedSlot={selectedSlot}
                onSuccess={fetchUserDashboardData}
            />
        </div>
    );
};

// Sub-components

const StatBadge = ({ icon: Icon, value, label, color }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}
    >
        <Icon className="size-3.5" />
        <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold leading-none">{value}</span>
            <span className="text-[10px] opacity-80 uppercase tracking-wide font-medium">{label}</span>
        </div>
    </motion.div>
);

const CustomToolbar = (toolbar) => {
    return (
        <div className="flex items-center justify-between p-3 border-b border-[#27272a] mb-0 bg-[#0c0c0e]">
            <div className="flex items-center gap-1 bg-[#18181b] p-0.5 rounded-lg border border-[#27272a]">
                <button onClick={() => toolbar.onNavigate('PREV')} className="p-1.5 hover:bg-[#27272a] rounded-md text-gray-400 hover:text-white transition-colors">
                    <ArrowUpRight className="size-4 -rotate-90" />
                </button>
                <button onClick={() => toolbar.onNavigate('TODAY')} className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                    Today
                </button>
                <button onClick={() => toolbar.onNavigate('NEXT')} className="p-1.5 hover:bg-[#27272a] rounded-md text-gray-400 hover:text-white transition-colors">
                    <ArrowUpRight className="size-4 rotate-0" />
                </button>
            </div>

            <div className="flex bg-[#18181b] rounded-lg p-0.5 border border-[#27272a]">
                {['month', 'week', 'day'].map(view => (
                    <button
                        key={view}
                        onClick={() => toolbar.onView(view)}
                        className={`text-xs px-3 py-1.5 rounded-md capitalize transition-all ${toolbar.view === view ? 'bg-[#27272a] text-white font-medium shadow-sm border border-[#3f3f46]/50' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {view}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default HomeDashboard;
