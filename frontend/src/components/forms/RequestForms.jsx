import { useState } from "react";
import { useApprovalStore } from "../../store/useApprovalStore";
import { CalendarDays, Laptop, Briefcase, FileText } from "lucide-react";

const RequestForms = ({ orgId, onSuccess }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { submitRequest, isLoading } = useApprovalStore();

    const [formData, setFormData] = useState({ isHalfDay: false });

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setFormData({ isHalfDay: false });
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payloadData = { ...formData };
        if (payloadData.isHalfDay) {
            payloadData.endDate = payloadData.startDate; // Force end date = start date
        }

        const requestData = {
            category: selectedCategory.id,
            type: formData.type || "GENERAL",
            formPayload: payloadData
        };
        
        // Remove duplicate type field from payload if present
        if (requestData.formPayload.type) {
            delete requestData.formPayload.type;
        }

        const success = await submitRequest(orgId, requestData);
        if (success) {
            onSuccess();
        }
    };

    const categories = [
        { id: "HR_LEAVE", title: "Time Off / Leave", icon: <CalendarDays className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />, desc: "Request sick leave, vacation, or unpaid time off." },
        { id: "IT_SUPPORT", title: "IT & Equipment", icon: <Laptop className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />, desc: "Request software licenses, hardware, or support." },
        { id: "SYSTEM_PERMISSION", title: "System Access", icon: <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />, desc: "Request admin rights, project creation, or channel access." },
        { id: "FINANCE_EXPENSE", title: "Expense Claim", icon: <FileText className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />, desc: "Submit receipts for business expense reimbursement." },
    ];

    if (!selectedCategory) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat)}
                        className="bg-[#171717] hover:bg-[#1f1f1f] border border-[#2f2f2f] hover:border-gray-500 rounded-xl p-6 text-left transition-all group flex flex-col h-full"
                    >
                        <div className="bg-[#2a2a2a] p-2.5 rounded-lg inline-block mb-5">
                            {cat.icon}
                        </div>
                        <h3 className="text-[15px] font-semibold text-gray-200 mb-2">{cat.title}</h3>
                        <p className="text-[13px] text-gray-400 leading-relaxed flex-1">{cat.desc}</p>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] border border-[#2f2f2f] rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center gap-4 px-6 py-5 border-b border-[#2f2f2f] bg-[#1a1a1a]">
                <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-400 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
                >
                    &larr; Back
                </button>
                <div className="h-4 w-px bg-gray-700 mx-2"></div>
                <div className="flex items-center gap-2">
                    {selectedCategory.icon}
                    <h3 className="text-[15px] font-semibold text-gray-200">{selectedCategory.title}</h3>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-3xl">
                {/* Dynamic Fields based on Category */}
                
                {selectedCategory.id === "HR_LEAVE" && (
                    <>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Leave Type</label>
                            <select name="type" onChange={handleInputChange} required className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20">
                                <option value="">Select type...</option>
                                <option value="SICK_LEAVE">Sick Leave</option>
                                <option value="VACATION">Vacation / PTO</option>
                                <option value="UNPAID">Unpaid Leave</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-400 mb-2">Start Date</label>
                                <input type="date" name="startDate" onChange={handleInputChange} required className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-400 mb-2">End Date</label>
                                <input type="date" name="endDate" onChange={handleInputChange} required={!formData.isHalfDay} disabled={formData.isHalfDay} className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed" title={formData.isHalfDay ? "End date is same as start date for half days" : ""} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 mb-4">
                            <input 
                                type="checkbox" 
                                id="isHalfDay" 
                                name="isHalfDay" 
                                checked={formData.isHalfDay || false}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-gray-600 bg-[#0d0d0d] text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-[#171717]"
                            />
                            <label htmlFor="isHalfDay" className="text-[13px] text-gray-400 cursor-pointer">This is a Half Day request</label>
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Reason (Optional)</label>
                            <textarea name="reason" onChange={handleInputChange} rows={4} className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" placeholder="Any additional details..."></textarea>
                        </div>
                    </>
                )}

                {selectedCategory.id === "IT_SUPPORT" && (
                    <>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Request Type</label>
                            <select name="type" onChange={handleInputChange} required className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20">
                                <option value="">Select type...</option>
                                <option value="SOFTWARE_LICENSE">Software License</option>
                                <option value="HARDWARE">Hardware Request</option>
                                <option value="SUPPORT">Technical Support</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Description</label>
                            <textarea name="description" onChange={handleInputChange} required rows={5} className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" placeholder="E.g., I need a Figma Pro license for the new project..."></textarea>
                        </div>
                    </>
                )}

                {selectedCategory.id === "SYSTEM_PERMISSION" && (
                    <>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Permission Needed</label>
                            <select name="type" onChange={handleInputChange} required className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20">
                                <option value="">Select type...</option>
                                <option value="CREATE_PROJECT">Create a Project</option>
                                <option value="MANAGE_USERS">Manage Users (Admin Role)</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Justification</label>
                            <textarea name="justification" onChange={handleInputChange} required rows={5} className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" placeholder="Why do you need this access?"></textarea>
                        </div>
                    </>
                )}

                {selectedCategory.id === "FINANCE_EXPENSE" && (
                    <>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Expense Type</label>
                            <input type="text" name="type" onChange={handleInputChange} required className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" placeholder="E.g., Client Dinner, Flight ticket" />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Amount ($)</label>
                            <input type="number" step="0.01" name="amount" onChange={handleInputChange} required className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-400 mb-2">Notes</label>
                            <textarea name="notes" onChange={handleInputChange} rows={3} className="w-full bg-[#0d0d0d] border border-[#2f2f2f] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"></textarea>
                        </div>
                    </>
                )}

                <div className="pt-6 mt-6 border-t border-[#2f2f2f] flex justify-end">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequestForms;
