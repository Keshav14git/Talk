import { useEffect, useState } from "react";
import { useHomeStore } from "../store/useHomeStore";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CheckCircle2, Clock, Calendar as CalendarIcon, ListTodo, AlertCircle, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

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

    // Derived Stats - FIXED LOGIC (matches backend enums)
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === "completed").length;
    const inProgressTasks = userTasks.filter(t => t.status === "in-progress").length;

    // Progress Calculation
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Custom Event Component
    const EventComponent = ({ event }) => (
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 h-full overflow-hidden">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${event.type === 'meeting' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span className="text-[11px] font-medium truncate leading-tight">{event.title}</span>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] overflow-y-auto custom-scrollbar p-6 space-y-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <CalendarIcon className="size-3.5" />
                        {format(new Date(), "EEEE, MMMM do, yyyy")}
                    </p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Assigned Tasks"
                    value={totalTasks}
                    icon={ListTodo}
                    color="text-indigo-400"
                    gradient="from-indigo-500/20 to-purple-500/5"
                    borderColor="border-indigo-500/20"
                />
                <StatCard
                    label="In Progress"
                    value={inProgressTasks}
                    icon={Clock}
                    color="text-amber-400"
                    gradient="from-amber-500/20 to-orange-500/5"
                    borderColor="border-amber-500/20"
                />
                <StatCard
                    label="Completed"
                    value={completedTasks}
                    icon={CheckCircle2}
                    color="text-emerald-400"
                    gradient="from-emerald-500/20 to-teal-500/5"
                    borderColor="border-emerald-500/20"
                />

                {/* Progress Circle Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#111] p-4 rounded-xl border border-[#222] flex items-center justify-between relative overflow-hidden group hover:border-[#444] transition-all"
                >
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">Overall Progress</p>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{progressPercentage}%</h2>
                    </div>
                    <div className="size-16 relative flex items-center justify-center">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <motion.path
                                initial={{ strokeDasharray: "0, 100" }}
                                animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">

                {/* Left Col: Task List */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-1 bg-[#111] rounded-2xl border border-[#222] flex flex-col h-[500px] lg:h-auto overflow-hidden shadow-2xl shadow-black/50"
                >
                    <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#151515]/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <ListTodo className="size-4 text-indigo-400" />
                            <h2 className="font-semibold text-gray-200">Your Tasks</h2>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{totalTasks} Total</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-600 text-sm animate-pulse">Loading tasks...</div>
                        ) : userTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                                <div className="p-3 bg-[#1a1a1a] rounded-full">
                                    <ListTodo className="size-6 text-gray-600" />
                                </div>
                                <p className="text-gray-500 text-sm">You're all caught up!</p>
                            </div>
                        ) : (
                            userTasks.map((task, idx) => (
                                <motion.div
                                    key={task._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="p-3.5 bg-[#181818] hover:bg-[#202020] rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] group transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-1 pr-2">{task.title}</h3>
                                        {task.priority === 'high' && <AlertCircle className="size-3.5 text-red-400 shrink-0" />}
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded capitalize ${task.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                    task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-gray-700/50 text-gray-400'
                                                }`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                            <span className="truncate max-w-[80px] hover:text-gray-300 transition-colors" title={task.projectId?.name}>
                                                {task.projectId?.name}
                                            </span>
                                        </div>

                                        <span className={`${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-400 font-medium flex items-center gap-1' : ''}`}>
                                            {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "-"}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Right Col: Big Calendar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-[#111] rounded-2xl border border-[#222] p-6 flex flex-col min-h-[500px] shadow-2xl shadow-black/50 overflow-hidden"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <CalendarIcon className="size-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg">Schedule</h2>
                                <p className="text-xs text-gray-500">Manage your timeline</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 calendar-dark-theme">
                        <Calendar
                            localizer={localizer}
                            events={userEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: "100%", minHeight: 450 }}
                            views={["month", "week", "day"]}
                            view={view}
                            onView={setView}
                            components={{
                                event: EventComponent,
                                toolbar: CustomToolbar
                            }}
                            eventPropGetter={(event) => ({
                                className: `${event.type === 'meeting' ? 'bg-emerald-500/20 border-l-emerald-500' : 'bg-blue-500/20 border-l-blue-500'} border-l-[3px] rounded text-white border-0 !bg-opacity-20 hover:!bg-opacity-30 transition-all`
                            })}
                            dayPropGetter={(date) => {
                                const isToday = new Date().toDateString() === date.toDateString();
                                return {
                                    className: isToday ? 'bg-indigo-500/5' : ''
                                };
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Helper Components & Functions

const StatCard = ({ label, value, icon: Icon, color, gradient, borderColor }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`bg-[#111] p-4 rounded-xl border border-[#222] hover:${borderColor} relative group overflow-hidden transition-all`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <div className="relative z-10 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-[#1a1a1a] group-hover:bg-[#0a0a0a] border border-[#333] group-hover:border-[#444] transition-all`}>
                <Icon className={`size-6 ${color}`} />
            </div>
            <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">{label}</p>
                <h2 className="text-2xl font-bold text-white tracking-tight">{value}</h2>
            </div>
        </div>
    </motion.div>
);

const CustomToolbar = (toolbar) => {
    return (
        <div className="calendar-toolbar flex items-center justify-between mb-4">
            <div className="flex gap-2">
                <button type="button" onClick={() => toolbar.onNavigate('PREV')} className="p-1.5 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors">{'<'}</button>
                <div className="text-sm font-semibold text-white px-2 py-1.5">{toolbar.label}</div>
                <button type="button" onClick={() => toolbar.onNavigate('NEXT')} className="p-1.5 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors">{'>'}</button>
            </div>

            <div className="flex bg-[#1a1a1a] rounded-lg p-0.5 border border-[#333]">
                {['month', 'week', 'day'].map(view => (
                    <button
                        key={view}
                        onClick={() => toolbar.onView(view)}
                        className={`text-xs px-3 py-1 rounded-md capitalize transition-all ${toolbar.view === view ? 'bg-[#333] text-white font-medium shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {view}
                    </button>
                ))}
            </div>
        </div>
    );
}

const isOverdue = (date) => {
    if (!date) return false;
    // Check if yesterday or bef
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    return d < today;
};

export default HomeDashboard;
