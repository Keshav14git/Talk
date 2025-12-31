import { useEffect, useState } from "react";
import { useHomeStore } from "../store/useHomeStore";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CheckCircle2, Clock, Calendar as CalendarIcon, ListTodo } from "lucide-react";

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
    const [view, setView] = useState("month");

    useEffect(() => {
        fetchUserDashboardData();
    }, [fetchUserDashboardData]);

    // Derived Stats
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === "done").length;
    const inProgressTasks = userTasks.filter(t => t.status === "in_progress").length;
    const todoTasks = userTasks.filter(t => t.status === "todo").length;

    // Progress Calculation
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Custom Event Component
    const EventComponent = ({ event }) => (
        <div className="text-xs p-0.5 truncate" title={event.title}>
            {event.type === 'meeting' && <span className="mr-1">📹</span>}
            {event.type === 'task' && <span className="mr-1">📋</span>}
            {event.title}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#111] overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-sm text-gray-400">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Assigned Tasks"
                    value={totalTasks}
                    icon={ListTodo}
                    color="text-indigo-400"
                    bg="bg-indigo-500/10"
                />
                <StatCard
                    label="In Progress"
                    value={inProgressTasks}
                    icon={Clock}
                    color="text-amber-400"
                    bg="bg-amber-500/10"
                />
                <StatCard
                    label="Completed"
                    value={completedTasks}
                    icon={CheckCircle2}
                    color="text-green-400"
                    bg="bg-green-500/10"
                />

                {/* Progress Circle Card */}
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex items-center justify-between relative overflow-hidden">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-semibold">Overall Progress</p>
                        <h2 className="text-2xl font-bold text-white mt-1">{progressPercentage}%</h2>
                    </div>
                    <div className="size-16 relative flex items-center justify-center">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-indigo-500 transition-all duration-1000 ease-out" strokeDasharray={`${progressPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* Left Col: Task List */}
                <div className="lg:col-span-1 bg-[#1a1a1a] rounded-xl border border-[#333] flex flex-col h-[500px] lg:h-auto">
                    <div className="p-4 border-b border-[#333] flex items-center gap-2">
                        <ListTodo className="size-4 text-indigo-400" />
                        <h2 className="font-bold text-white">Your Tasks</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Loading tasks...</div>
                        ) : userTasks.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm italic">No tasks assigned</div>
                        ) : (
                            userTasks.map(task => (
                                <div key={task._id} className="p-3 bg-[#222] hover:bg-[#2a2a2a] rounded-lg border border-[#333] group transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-1">{task.title}</h3>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>{task.projectId?.name || "Unknown Project"}</span>
                                        <span className={`${isOverdue(task.dueDate) ? 'text-red-400 font-bold' : ''}`}>
                                            {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No date"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Col: Big Calendar */}
                <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-[#333] p-4 flex flex-col min-h-[500px]">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-emerald-400" />
                            <h2 className="font-bold text-white">Schedule</h2>
                        </div>
                    </div>
                    <div className="flex-1 calendar-dark-theme text-xs">
                        <Calendar
                            localizer={localizer}
                            events={userEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: "100%", minHeight: 400 }}
                            views={["month", "week", "day"]}
                            view={view}
                            onView={setView}
                            components={{
                                event: EventComponent
                            }}
                            eventPropGetter={(event) => ({
                                style: {
                                    backgroundColor: event.color + "20", // 20% opacity
                                    borderLeft: `3px solid ${event.color}`,
                                    color: "white",
                                    borderRadius: "4px",
                                    border: "none",
                                    borderLeftWidth: "3px",
                                    fontSize: "11px"
                                }
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components & Functions

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bg}`}>
            <Icon className={`size-6 ${color}`} />
        </div>
        <div>
            <p className="text-gray-400 text-xs uppercase font-semibold">{label}</p>
            <h2 className="text-2xl font-bold text-white">{value}</h2>
        </div>
    </div>
);

const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date() && new Date(date).getDate() !== new Date().getDate();
};

export default HomeDashboard;
