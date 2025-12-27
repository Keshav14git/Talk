import React, { useEffect } from 'react';
import { useOrgStore } from '../store/useOrgStore';
import { Plus, Settings } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

const OrgSidebar = () => {
    const { orgs, currentOrg, setCurrentOrg, createOrg } = useOrgStore();
    const navigate = useNavigate();

    const handleOrgClick = (org) => {
        setCurrentOrg(org);
        navigate(`/workspace/${org._id}/chat`);
    };

    const handleCreateOrg = () => {
        const name = prompt("Enter Workspace Name (e.g. Acme Corp):");
        if (name) createOrg(name);
    }

    return (
        <div className="w-[70px] bg-[#0b0b0b] border-r border-[#222] flex flex-col items-center py-4 gap-4 z-50 flex-shrink-0">
            {/* Orgs List */}
            {orgs.map((org) => (
                <button
                    key={org._id}
                    onClick={() => handleOrgClick(org)}
                    className={`size-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative
                        ${currentOrg?._id === org._id
                            ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            : "bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                        }`}
                    title={org.name}
                >
                    {/* Active Pip */}
                    {currentOrg?._id === org._id && (
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full" />
                    )}

                    {org.branding?.logo ? (
                        <img src={org.branding.logo} alt={org.name} className="size-full object-cover rounded-xl" />
                    ) : (
                        <span className="font-bold text-lg">{org.name.substring(0, 2).toUpperCase()}</span>
                    )}
                </button>
            ))}

            {/* Add Org */}
            <button
                onClick={handleCreateOrg}
                className="size-12 rounded-xl bg-[#1a1a1a] text-gray-400 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all dashed-border hover:border-transparent"
                title="Create Workspace"
            >
                <Plus className="size-6" />
            </button>

            <div className="mt-auto flex flex-col gap-3">
                {/* Settings / Profile could go here if not in main sidebar */}
            </div>
        </div>
    );
};

export default OrgSidebar;
