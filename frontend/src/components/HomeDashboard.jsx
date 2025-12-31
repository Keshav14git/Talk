import { useEffect, useState, useMemo, useCallback } from "react";
import { useHomeStore } from "../store/useHomeStore";
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
import { CheckCircle2, Clock, Calendar as CalendarIcon, ListTodo, AlertCircle, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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
    const [date, setDate] = useState(new Date());

    // Calculate initial range based on view/date
    const [range, setRange] = useState({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });

    useEffect(() => {
        fetchUserDashboardData();
    }, [fetchUserDashboardData]);

    // Handle Range Changes (Navigation or View Switch)
    const onRangeChange = useCallback((rangeOrDates, view) => {
        if (Array.isArray(rangeOrDates)) {
            // Day/Week view returns array of dates (or potentially just one for day?)
            // if it's an array of length 1 (Day), or 7 (Week)
            if (rangeOrDates.length === 1) {
                setRange({ start: startOfDay(rangeOrDates[0]), end: endOfDay(rangeOrDates[0]) });
            } else {
                setRange({ start: startOfDay(rangeOrDates[0]), end: endOfDay(rangeOrDates[rangeOrDates.length - 1]) });
            }
        } else {
            // Month view returns { start, end }
            setRange({ start: rangeOrDates.start, end: rangeOrDates.end });
        }
    }, []);

    // Also update range when view/date manually changes if needed, but onRangeChange usually handles it.
    // However, react-big-calendar's onRangeChange is sometimes tricky.
    // A robust way is to calc range from `date` and `view` manually if onRangeChange isn't firing as expected for view changes.
    useEffect(() => {
        // Recalculate range whenever date or view changes ensuring sync
        let start, end;
        if (view === 'month') {
            start = startOfMonth(date);
            end = endOfMonth(date);
        } else if (view === 'week') {
            start = startOfWeek(date);
            const endDate = new Date(start);
            endDate.setDate(start.getDate() + 6);
            end = endOfDay(endDate);
        } else if (view === 'day') {
            start = startOfDay(date);
            end = endOfDay(date);
        }
        setRange({ start, end });
    }, [date, view]);


    // Filter Data based on Range
    const filteredTasks = useMemo(() => {
        return userTasks.filter(task => {
            if (!task.dueDate) return false; // Tasks without due date don't show in calendar timeline
            const dueDate = new Date(task.dueDate);
            return isWithinInterval(dueDate, { start: range.start, end: range.end });
        });
    }, [userTasks, range]);

    // Derived Stats (Synchronized)
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === "completed").length;
    const inProgressTasks = filteredTasks.filter(t => t.status === "in-progress").length;

    // Progress Calculation
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const handleSelectEvent = (event) => {
        toast.success(`Selected: ${event.title}`);
        // Logic to open modal can go here
    };

    // Custom Event Component
    const EventComponent = ({ event }) => (
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 h-full overflow-hidden transition-opacity hover:opacity-80">
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
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <CalendarIcon className="size-3.5" />
                        {view === 'month' && format(date, "MMMM yyyy")}
                        {view === 'week' && `Week of ${format(range.start, "MMM do")}`}
                        {view === 'day' && format(date, "EEEE, MMMM do")}
                    </p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Tasks This Period"
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
                    key={progressPercentage} // Re-animate on change
                    transition={{ delay: 0.1 }}
                    className="bg-[#111] p-4 rounded-xl border border-[#222] flex items-center justify-between relative overflow-hidden group hover:border-[#444] transition-all"
                >
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">Period Progress</p>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{progressPercentage}%</h2>
                    </div>
                    <div className="size-16 relative flex items-center justify-center">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <motion.path
                                initial={{ strokeDasharray: "0, 100" }}
                                animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                                transition={{ duration: 1, ease: "easeOut" }}
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

                {/* Left Col: Task List (Synchronized) */}
                <motion.div
                    layout
                    className="lg:col-span-1 bg-[#111] rounded-2xl border border-[#222] flex flex-col h-[500px] lg:h-auto overflow-hidden shadow-2xl shadow-black/50"
                >
                    <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#151515]/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <ListTodo className="size-4 text-indigo-400" />
                            <h2 className="font-semibold text-gray-200">Timeline Tasks</h2>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{totalTasks}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                <div className="p-8 text-center text-gray-600 text-sm animate-pulse">Loading...</div>
                            ) : filteredTasks.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3"
                                >
                                    <div className="p-3 bg-[#1a1a1a] rounded-full">
                                        <ListTodo className="size-6 text-gray-600" />
                                    </div>
                                    <p className="text-gray-500 text-sm">No tasks for this period.</p>
                                </motion.div>
                            ) : (
                                filteredTasks.map((task) => (
                                    <motion.div
                                        key={task._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
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
                                                    {task.status?.replace('-', ' ')}
                                                </span>
                                            </div>

                                            <span className={`${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-400 font-medium flex items-center gap-1' : ''}`}>
                                                {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "-"}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Right Col: Big Calendar */}
                <motion.div
                    layout
                    className="lg:col-span-2 bg-[#111] rounded-2xl border border-[#222] p-6 flex flex-col min-h-[500px] shadow-2xl shadow-black/50 overflow-hidden"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <CalendarIcon className="size-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg">Schedule</h2>
                                <p className="text-xs text-gray-500">Interactive Timeline</p>
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
                            date={date}
                            onView={setView}
                            onNavigate={setDate}
                            onSelectEvent={handleSelectEvent}
                            onRangeChange={onRangeChange}
                            components={{
                                event: EventComponent,
                                toolbar: CustomToolbar
                            }}
                            eventPropGetter={(event) => ({
                                className: `${event.type === 'meeting' ? 'bg-emerald-500/20 border-l-emerald-500' : 'bg-blue-500/20 border-l-blue-500'} border-l-[3px] rounded text-white border-0 !bg-opacity-20 hover:!bg-opacity-30 transition-all cursor-pointer`
                            })}
                            dayPropGetter={(d) => {
                                const isToday = new Date().toDateString() === d.toDateString();
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
        key={`${label}-${value}`} // Re-animate on value change
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
