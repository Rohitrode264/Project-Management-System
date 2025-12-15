import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TASKS } from '../graphql/queries';
import { UPDATE_TASK_STATUS, ADD_TASK_COMMENT } from '../graphql/mutations';
import { CheckCircle2, Clock, Filter, Calendar, User, MessageSquare, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';

const Tasks: React.FC = () => {
    const [filter, setFilter] = useState('ALL');
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const { loading, error, data } = useQuery(GET_TASKS, {
        variables: { projectId: null },
    });

    const [updateStatus] = useMutation(UPDATE_TASK_STATUS);
    const [addComment] = useMutation(ADD_TASK_COMMENT, {
        refetchQueries: [{ query: GET_TASKS, variables: { projectId: null } }],
    });

    const [newComment, setNewComment] = useState('');

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask || !newComment.trim()) return;

        try {
            const { data } = await addComment({
                variables: {
                    taskId: selectedTask.id,
                    content: newComment,
                    authorEmail: 'user@example.com'
                }
            });

            setNewComment('');

            if (data?.addTaskComment?.comment) {
                const newCommentObj = data.addTaskComment.comment;
                setSelectedTask((prev: any) => ({
                    ...prev,
                    comments: [...(prev.comments || []), newCommentObj]
                }));
            }
        } catch (err) {
            console.error("Error adding comment", err);
        }
    };

    const activeTask = selectedTask;


    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="h-6 w-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (error) return <div className="text-red-500 p-8 text-center border border-red-200 rounded-lg">Error loading tasks: {error.message}</div>;

    const tasks = data?.tasks || [];
    const filteredTasks = filter === 'ALL' ? tasks : tasks.filter((t: any) => t.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900';
            case 'IN_PROGRESS': return 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900';
            default: return 'border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800';
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">My Tasks</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track assignments across all projects.</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                            : 'bg-white dark:bg-black text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                            }`}
                    >
                        {f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg"
                        >
                            <CheckCircle2 className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-700 mb-2" />
                            <h3 className="text-sm font-medium text-black dark:text-white">No tasks found</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-500">No tasks match the current filter.</p>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task: any) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className="group bg-white dark:bg-black rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white cursor-pointer transition-colors duration-200"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 p-1 rounded-full ${task.status === 'DONE' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 bg-gray-50 dark:bg-gray-900'}`}>
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-black dark:text-white group-hover:underline decoration-1 underline-offset-4">
                                                {task.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                                                    {task.project.name}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {task.comments && task.comments.length > 0 && (
                                                    <span className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                                        <MessageSquare className="w-3 h-3 mr-1" />
                                                        {task.comments.length}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded border ${getStatusColor(task.status)} uppercase tracking-wider`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-black w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-900 flex justify-between items-start bg-gray-50/50 dark:bg-gray-900/50">
                                <div>
                                    <h2 className="text-xl font-bold text-black dark:text-white">{activeTask.title}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusColor(activeTask.status)} uppercase tracking-wider`}>
                                            {activeTask.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-500">in {activeTask.project.name}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTask(null)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTask.description && (
                                    <div className="mb-8">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                                        <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                            {activeTask.description}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> Comments
                                    </h3>

                                    <div className="space-y-4 mb-6">
                                        {activeTask.comments && activeTask.comments.length > 0 ? (
                                            activeTask.comments.map((comment: any) => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
                                                        {comment.authorEmail?.[0].toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg rounded-tl-none p-3 border border-gray-100 dark:border-gray-800">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-bold text-black dark:text-white">{comment.authorEmail}</span>
                                                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No comments yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-black">
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="flex-1 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tasks;
