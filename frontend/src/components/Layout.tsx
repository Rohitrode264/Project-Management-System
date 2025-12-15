import React, { useEffect, useState } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { LayoutDashboard, CheckSquare, Sun, Moon, LogOut, ChevronRight, Menu } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { organization } = useOrganization();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDarkMode(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('organizationSlug');
        localStorage.removeItem('currentOrganization');
        navigate('/welcome');
        window.location.reload(); 
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    ];

    return (
        <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-200 overflow-hidden font-sans">
            <button
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <Menu className="w-5 h-5" />
            </button>

            <AnimatePresence mode='wait'>
                <motion.aside
                    className={`fixed inset-y-0 left-0 z-40 w-64 lg:relative lg:translate-x-0 transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    initial={false}
                >
                    <div className="h-full flex flex-col">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-1.5 bg-black dark:bg-white rounded-md">
                                    <LayoutDashboard className="w-4 h-4 text-white dark:text-black" />
                                </div>
                                <h1 className="text-lg font-bold tracking-tight">TaskFlow</h1>
                            </div>

                            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mb-2">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Organization</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm truncate">{organization?.name || 'Select Org'}</span>
                                    <Link to="/welcome" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">Switch</Link>
                                </div>
                            </div>
                        </div>

                        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-black dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-black dark:text-white' : 'text-gray-400'}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-3 m-3 border-t border-gray-200 dark:border-gray-800">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-900 transition-colors mb-1"
                            >
                                {isDarkMode ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </motion.aside>
            </AnimatePresence>

            <main className="flex-1 overflow-auto relative z-10 bg-white dark:bg-black">
                <div className="max-w-6xl mx-auto p-6 md:p-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
