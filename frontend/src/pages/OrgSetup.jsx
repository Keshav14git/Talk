import React, { useState } from 'react';
import { useOrgStore } from '../store/useOrgStore';
import { useAuthStore } from '../store/useAuthStore';
import { Building2, Users, ArrowRight, Plus, LogIn } from 'lucide-react';

const OrgSetup = () => {
    const { createOrg, joinOrg, isCreatingOrg, isJoiningOrg } = useOrgStore();
    const { authUser, checkAuth } = useAuthStore();
    const [mode, setMode] = useState('selection'); // selection, create, join
    const [orgName, setOrgName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [searchName, setSearchName] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        const success = await createOrg(orgName);
        if (success) {
            await checkAuth(); // Refresh user to get lastActiveOrgId
            window.location.reload(); // Force reload to trigger main app load or use navigate
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        const success = await joinOrg({ joinCode, orgName: searchName });
        if (success) {
            await checkAuth();
            window.location.reload();
        }
    };

    if (mode === 'selection') {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
                    {/* Create Card */}
                    <div
                        onClick={() => setMode('create')}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-primary"
                    >
                        <div className="card-body items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Building2 className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="card-title text-2xl font-bold">Create New Organization</h2>
                            <p className="text-base-content/60">Set up a new workspace for your company or team. You'll be the admin.</p>
                            <button className="btn btn-primary mt-6">Get Started <ArrowRight className="w-4 h-4 ml-2" /></button>
                        </div>
                    </div>

                    {/* Join Card */}
                    <div
                        onClick={() => setMode('join')}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-secondary"
                    >
                        <div className="card-body items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-12 h-12 text-secondary" />
                            </div>
                            <h2 className="card-title text-2xl font-bold">Join Existing Organization</h2>
                            <p className="text-base-content/60">Enter an invite code or search for your company's workspace.</p>
                            <button className="btn btn-secondary mt-6">Find Workspace <LogIn className="w-4 h-4 ml-2" /></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-md relative">
                <button
                    onClick={() => setMode('selection')}
                    className="absolute top-4 left-4 btn btn-ghost btn-sm"
                >
                    ← Back
                </button>
                <div className="card-body">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        {mode === 'create' ? 'Create Workspace' : 'Join Workspace'}
                    </h2>

                    {mode === 'create' ? (
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Organization Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Corp"
                                    className="input input-bordered w-full"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={isCreatingOrg}
                            >
                                {isCreatingOrg ? <span className="loading loading-spinner" /> : 'Create Workspace'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleJoin} className="space-y-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Organization Name (Search)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Corp"
                                    className="input input-bordered w-full"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                />
                            </div>
                            <div className="divider">OR</div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Join Code</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. XYZ123"
                                    className="input input-bordered w-full"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-secondary w-full"
                                disabled={isJoiningOrg}
                            >
                                {isJoiningOrg ? <span className="loading loading-spinner" /> : 'Join Workspace'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrgSetup;
