import { useEffect, useState } from 'react'
import {
    BarChart,
    Users,
    FileText,
    Clock,
    MessageSquare,
    Activity,
    DollarSign,
} from 'lucide-react'
import { useApi, endpoints } from '../services/api'
import { AdminStats, UserStats, AIUsageStats, UserAIUsage, FeedbackItem } from '../types/admin'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export function AdminDashboard() {
    const api = useApi()
    const { user, isLoading: isAuthLoading } = useAuthStore()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'ai' | 'feedback'>('overview')
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<UserStats[]>([])
    const [aiStats, setAiStats] = useState<AIUsageStats[]>([])
    const [feedback, setFeedback] = useState<FeedbackItem[]>([])
    const [userAIUsage, setUserAIUsage] = useState<UserAIUsage[]>([])
    const [aiSubTab, setAiSubTab] = useState<'daily' | 'per-user'>('daily')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthLoading && user && user.role !== 'admin') {
            navigate('/')
        }
    }, [user, isAuthLoading, navigate])

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                if (activeTab === 'overview') {
                    const data = await api.get<AdminStats>(endpoints.admin.stats)
                    setStats(data)
                } else if (activeTab === 'users') {
                    const data = await api.get<UserStats[]>(endpoints.admin.users)
                    setUsers(data)
                } else if (activeTab === 'ai') {
                    const [dailyData, userData] = await Promise.all([
                        api.get<AIUsageStats[]>(endpoints.admin.aiUsage),
                        api.get<UserAIUsage[]>(endpoints.admin.aiUsageUsers),
                    ])
                    setAiStats(dailyData || [])
                    setUserAIUsage(userData || [])
                } else if (activeTab === 'feedback') {
                    const data = await api.get<FeedbackItem[]>(endpoints.admin.feedback)
                    setFeedback(data || [])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (user?.role === 'admin') {
            fetchData()
        }
    }, [activeTab, user]) // eslint-disable-line react-hooks/exhaustive-deps

    if (isAuthLoading || (loading && !stats && !users.length && !aiStats.length && !feedback.length)) {
        return <div className="p-8 text-center">Loading admin data...</div>
    }

    if (user?.role !== 'admin') {
        return null // Redirect handled in useEffect
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                </h1>
                <div className="flex space-x-2">
                    <TabButton
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                        label="Overview"
                        icon={BarChart}
                    />
                    <TabButton
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                        label="Users"
                        icon={Users}
                    />
                    <TabButton
                        active={activeTab === 'ai'}
                        onClick={() => setActiveTab('ai')}
                        label="AI Usage"
                        icon={Activity}
                    />
                    <TabButton
                        active={activeTab === 'feedback'}
                        onClick={() => setActiveTab('feedback')}
                        label="Feedback"
                        icon={MessageSquare}
                    />
                </div>
            </div>

            {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        icon={Users}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Total Documents"
                        value={stats.total_docs}
                        icon={FileText}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Active Sessions"
                        value={stats.total_sessions}
                        icon={Clock}
                        color="bg-yellow-500"
                    />
                    <StatCard
                        title="Feedback Items"
                        value={stats.total_feedback}
                        icon={MessageSquare}
                        color="bg-purple-500"
                    />
                    <StatCard
                        title="AI Requests"
                        value={stats.ai_usage.total_requests}
                        icon={Activity}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        title="Input Tokens"
                        value={stats.ai_usage.total_input_tokens.toLocaleString()}
                        icon={FileText}
                        color="bg-gray-500"
                    />
                    <StatCard
                        title="Output Tokens"
                        value={stats.ai_usage.total_output_tokens.toLocaleString()}
                        icon={FileText}
                        color="bg-gray-500"
                    />
                    <StatCard
                        title="Est. Cost (Sonnet 3.5)"
                        value={`$${((stats.ai_usage.total_input_tokens * 3 / 1000000) + (stats.ai_usage.total_output_tokens * 15 / 1000000)).toFixed(4)}`}
                        icon={DollarSign}
                        color="bg-red-500"
                    />
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Docs
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Sessions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    AI Requests
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {u.name || 'Unnamed'}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {u.documents_count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {u.sessions_count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {u.ai_request_count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="space-y-4">
                    {/* Sub-tab toggle */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setAiSubTab('daily')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                aiSubTab === 'daily'
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                        >
                            Daily Breakdown
                        </button>
                        <button
                            onClick={() => setAiSubTab('per-user')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                aiSubTab === 'per-user'
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                        >
                            Per User
                        </button>
                    </div>

                    {aiSubTab === 'daily' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requests</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input Tokens</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output Tokens</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Tokens</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(aiStats || []).map((s) => (
                                        <tr key={s.date}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{s.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.request_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.input_tokens.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.output_tokens.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{(s.input_tokens + s.output_tokens).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {aiSubTab === 'per-user' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Requests</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input Tokens</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output Tokens</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Est. Cost</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">This Month</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(userAIUsage || []).map((u) => (
                                        <tr key={u.user_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{u.name || 'Unnamed'}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.total_requests}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.total_input_tokens.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.total_output_tokens.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                ${((u.total_input_tokens * 3 / 1000000) + (u.total_output_tokens * 15 / 1000000)).toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full max-w-[80px]">
                                                        <div
                                                            className={`h-2 rounded-full ${u.monthly_requests >= 3 ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.min(100, (u.monthly_requests / 3) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{u.monthly_requests}/3</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {feedback.map((f) => (
                                <tr key={f.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {f.user?.name || 'Unknown'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {f.user?.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${f.type === 'bug' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {f.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
                                        {f.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(f.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center">
            <div className={`p-4 rounded-full ${color} text-white mr-4`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    )
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${active
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }
      `}
        >
            <Icon className="h-4 w-4 mr-2" />
            {label}
        </button>
    )
}
