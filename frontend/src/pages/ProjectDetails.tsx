import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TASKS } from '../graphql/queries';
import { CREATE_TASK, UPDATE_TASK_STATUS } from '../graphql/mutations';
import { Plus, ArrowLeft, Calendar, User } from 'lucide-react';
import Modal from '../components/Modal';

const ProjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { loading, error, data } = useQuery(GET_TASKS, {
        variables: { projectId: id },
        skip: !id,
    });

    const [createTask] = useMutation(CREATE_TASK, {
        refetchQueries: [{ query: GET_TASKS, variables: { projectId: id } }],
    });

    const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO', assigneeEmail: '', dueDate: '' });

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTask({ variables: { projectId: id, ...newTask } });
            setNewTask({ title: '', description: '', status: 'TODO', assigneeEmail: '', dueDate: '' });
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error creating task", err);
        }
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDrop = async (e: React.DragEvent, status: string) => {
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            try {
                await updateTaskStatus({ variables: { taskId, status } });
            } catch (err) {
                console.error("Error updating status", err);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="h-6 w-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (error) return <div className="text-red-500 p-4 border border-red-200 rounded-md text-sm">Error: {error.message}</div>;

    const tasks = data?.tasks || [];
    const columns = [
        { id: 'TODO', title: 'To Do' },
        { id: 'IN_PROGRESS', title: 'In Progress' },
        { id: 'DONE', title: 'Done' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-black dark:text-white">Project Tasks</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage project workflow.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium text-sm hover:opacity-80 transition-opacity"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(col => (
                    <div
                        key={col.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4 min-h-[500px]"
                        onDrop={(e) => handleDrop(e, col.id)}
                        onDragOver={handleDragOver}
                    >
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4 flex justify-between items-center uppercase tracking-wider">
                            {col.title}
                            <span className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full">
                                {tasks.filter((t: any) => t.status === col.id).length}
                            </span>
                        </h3>

                        <div className="space-y-3">
                            {tasks.filter((t: any) => t.status === col.id).map((task: any) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className="bg-white dark:bg-black p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-800 cursor-move hover:border-black dark:hover:border-white transition-colors"
                                >
                                    <h4 className="font-medium text-sm text-black dark:text-white mb-1.5">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-900 mt-2">
                                        {task.assigneeEmail ? (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <User className="w-3 h-3 mr-1" />
                                                <span className="truncate max-w-[80px]">{task.assigneeEmail.split('@')[0]}</span>
                                            </div>
                                        ) : <span></span>}

                                        {task.dueDate && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                            value={newTask.title}
                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                            rows={3}
                            value={newTask.description}
                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                            value={newTask.assigneeEmail}
                            onChange={e => setNewTask({ ...newTask, assigneeEmail: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all sm:text-sm"
                            value={newTask.dueDate}
                            onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity">
                            Create Task
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProjectDetails;
