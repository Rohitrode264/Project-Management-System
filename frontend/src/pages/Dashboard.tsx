import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS } from '../graphql/queries';
import { CREATE_PROJECT } from '../graphql/mutations';
import { Plus, Folder, Calendar, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { loading, error, data } = useQuery(GET_PROJECTS);
    const [createProject] = useMutation(CREATE_PROJECT, {
        refetchQueries: [{ query: GET_PROJECTS }],
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', dueDate: '' });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProject({ variables: { ...newProject } });
            setNewProject({ name: '', description: '', dueDate: '' });
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error creating project", err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="h-6 w-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error) return <div className="text-red-500 p-4 border border-red-200 rounded-md text-sm">Error: {error.message}</div>;

    const stats = [
        { label: 'Active Projects', value: data.projects.filter((p: any) => p.status === 'ACTIVE').length },
        { label: 'Completed', value: data.projects.filter((p: any) => p.status === 'COMPLETED').length },
        { label: 'Task Throughput', value: `${Math.round(data.projects.reduce((acc: number, p: any) => acc + (p.completionPercentage || 0), 0) / (data.projects.length || 1))}%` },
    ];

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">Dashboard</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your organization.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium text-sm hover:opacity-80 transition-opacity"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold text-black dark:text-white mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Recent Projects</h3>

                {data.projects.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                        <Folder className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-700" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects</h3>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Get started by creating a new project.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.projects.map((project: any) => (
                            <Link to={`/projects/${project.id}`} key={project.id} className="group block h-full">
                                <div className="h-full bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-5 hover:border-black dark:hover:border-white transition-colors duration-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <Folder className="w-4 h-4 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                            <span className={`px-2 py-0.5 text-[10px] font-medium border rounded-full ${project.status === 'COMPLETED' ? 'border-green-200 text-green-700 dark:border-green-900 dark:text-green-500' :
                                                    project.status === 'ACTIVE' ? 'border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-500' :
                                                        'border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-400'
                                                }`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-semibold text-black dark:text-white mb-2 group-hover:underline decoration-1 underline-offset-4">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-4">
                                        {project.description || 'No description provided.'}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-900">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                            {project.completedTaskCount}/{project.taskCount}
                                        </div>
                                        {project.dueDate && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                                {new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                            value={newProject.name}
                            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                            rows={3}
                            value={newProject.description}
                            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                            value={newProject.dueDate}
                            onChange={e => setNewProject({ ...newProject, dueDate: e.target.value })}
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity">
                            Create Project
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
