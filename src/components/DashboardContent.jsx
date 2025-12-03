import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import StatCard from './StatCard';

export default function DashboardContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        // Get current user session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error signing out:', error);
            setSigningOut(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-400">Please log in to access the dashboard.</p>
                <a
                    href="/login"
                    className="mt-4 inline-block px-6 py-2 bg-white text-zinc-950 rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
                >
                    Go to Login
                </a>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Welcome Header */}
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white lexend-font">
                    Welcome back!
                </h1>
                <p className="text-lg text-zinc-400">
                    {user.email}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Views"
                    value={12847}
                    icon="📊"
                    trend="up"
                    trendValue="12.5%"
                />
                <StatCard
                    title="Active Sessions"
                    value={342}
                    icon="👥"
                    trend="up"
                    trendValue="8.2%"
                />
                <StatCard
                    title="Storage Used"
                    value="2.4 GB"
                    icon="💾"
                    trend="down"
                    trendValue="3.1%"
                />
                <StatCard
                    title="Success Rate"
                    value="99.8%"
                    icon="✅"
                    trend="up"
                    trendValue="0.3%"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2 p-6 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 lexend-font">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { icon: '📝', label: 'New Post', color: 'from-blue-500/20 to-blue-600/20' },
                            { icon: '👤', label: 'Users', color: 'from-purple-500/20 to-purple-600/20' },
                            { icon: '⚙️', label: 'Settings', color: 'from-zinc-500/20 to-zinc-600/20' },
                            { icon: '📈', label: 'Analytics', color: 'from-green-500/20 to-green-600/20' },
                            { icon: '🔔', label: 'Notifications', color: 'from-yellow-500/20 to-yellow-600/20' },
                            { icon: '📁', label: 'Files', color: 'from-red-500/20 to-red-600/20' },
                        ].map((action, index) => (
                            <button
                                key={index}
                                className={`group relative p-6 bg-gradient-to-br ${action.color} backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105`}
                            >
                                <div className="text-3xl mb-2">{action.icon}</div>
                                <div className="text-sm font-medium text-white">{action.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="p-6 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 lexend-font">
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {[
                            { action: 'New user registered', time: '2 min ago', icon: '👤' },
                            { action: 'Post published', time: '15 min ago', icon: '📝' },
                            { action: 'Settings updated', time: '1 hour ago', icon: '⚙️' },
                            { action: 'File uploaded', time: '2 hours ago', icon: '📁' },
                            { action: 'Analytics viewed', time: '3 hours ago', icon: '📊' },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <span className="text-xl">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{item.action}</p>
                                    <p className="text-xs text-zinc-500">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sign Out Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="px-8 py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg font-semibold hover:bg-red-600/30 hover:border-red-600/50 focus:outline-none focus:ring-2 focus:ring-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
            </div>
        </div>
    );
}
