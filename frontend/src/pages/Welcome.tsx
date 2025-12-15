import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ORGANIZATION } from '../graphql/mutations';
import { useOrganization } from '../context/OrganizationContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowRight, ArrowLeft } from 'lucide-react';

const Welcome: React.FC = () => {
    const [mode, setMode] = useState<'landing' | 'create' | 'login'>('landing');
    const [createOrg, { loading: createLoading }] = useMutation(CREATE_ORGANIZATION);
    const { setOrganization } = useOrganization();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', email: '', slug: '' });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await createOrg({ variables: { name: formData.name, email: formData.email } });
            const org = data.createOrganization.organization;
            setOrganization(org);
            navigate('/');
        } catch (err: any) {
            alert("Error creating organization: " + err.message);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const org = { name: formData.slug, slug: formData.slug, id: 'temp-id' };
        setOrganization(org as any);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center items-center p-4">
            <AnimatePresence mode="wait">
                {mode === 'landing' && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-center max-w-2xl"
                    >
                        <div className="mb-8 flex justify-center">
                            <div className="p-3 bg-black dark:bg-white rounded-lg inline-block shadow-sm">
                                <Building2 className="w-8 h-8 text-white dark:text-black" />
                            </div>
                        </div>

                        <h1 className="text-4xl font-extrabold text-black dark:text-white mb-6 tracking-tight">
                            Build faster with <span className="text-gray-500">TaskFlow.</span>
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto">
                            The minimalist platform for high-performance teams. Deploy your organization in seconds.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setMode('create')}
                                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 border border-black dark:border-white"
                            >
                                Start Building <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setMode('login')}
                                className="px-8 py-3 bg-white dark:bg-black text-black dark:text-white rounded-md font-medium border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                Login
                            </button>
                        </div>
                    </motion.div>
                )}

                {mode === 'create' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-black p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
                            <button onClick={() => setMode('landing')} className="text-sm text-gray-500 hover:text-black dark:hover:text-white mb-6 flex items-center gap-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Create Workspace</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Deploy a new organization environment.</p>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                                        placeholder="acme"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                                        placeholder="admin@acme.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:opacity-90 transition-opacity border border-transparent"
                                >
                                    {createLoading ? 'Deploying...' : 'Deploy'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {mode === 'login' && (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-black p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
                            <button onClick={() => setMode('landing')} className="text-sm text-gray-500 hover:text-black dark:hover:text-white mb-6 flex items-center gap-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Login</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your organization slug.</p>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Slug</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                                        placeholder="e.g. acme-corp"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:opacity-90 transition-opacity border border-transparent"
                                >
                                    Continue
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Welcome;
