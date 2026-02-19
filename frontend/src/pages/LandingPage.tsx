import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import {
    Clock,
    ArrowRight,
    Shield,
    Zap,
    Moon,
    Play,
    Pause,
    Cloud
} from 'lucide-react'




export function LandingPage() {
    const { isSignedIn } = useAuth()

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">

            {/* ─── Blur Gradients ─── */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* ─── Hero Section ─── */}
            <header className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center z-10">

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                    The Operating System<br />
                    <span className="text-white">for OPT Students.</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Turn your chaotic timeline into audit-ready documentation.
                    Log hours, generate AI summaries, and export reports in seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                    {isSignedIn ? (
                        <Link
                            to="/"
                            className="px-8 py-3.5 bg-white text-black hover:bg-gray-200 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <Link
                            to="/sign-in"
                            className="px-8 py-3.5 bg-white text-black hover:bg-gray-200 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            Start Logging
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                    <Link
                        to="/docs"
                        className="px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
                    >
                        View Documentation
                    </Link>
                </div>


                {/* ─── 3D Hero Visual / Chaos Slider ─── */}
                <div className="relative max-w-5xl mx-auto h-[600px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#0A0A0A] group">
                    <ComparisonSlider />
                </div>
            </header>

            {/* ─── Trusted By / Stats ─── */}
            <div className="border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto py-12 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <Stat label="Infrastructure" value="Cloudflare R2" />
                    <Stat label="Version Control" value="Full History" />
                    <Stat label="AI Intelligence" value="Claude 3.5 Sonnet" />
                    <Stat label="Sync Engine" value="Real-time" />
                </div>
            </div>

            {/* ─── Bento Grid Features ─── */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Power-User Features. <br /><span className="text-gray-500">Zero Complexity.</span></h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Main Interactive Timer Card (Large) */}
                    <div className="md:col-span-2 row-span-2 bg-[#0F0F11] border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-indigo-500/30 transition-colors group">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-600/10 rounded-full blur-[80px] group-hover:bg-indigo-600/20 transition-all"></div>

                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Clock className="text-indigo-400" />
                            One-Click Tracking
                        </h3>
                        <p className="text-gray-400 mb-8 max-w-md">
                            Start a session and forget about it. Our intelligent auto-stop ensures you never accidental log 24 hours.
                        </p>

                        <div className="absolute bottom-8 left-8 right-8">
                            <MiniTimer />
                        </div>
                    </div>

                    {/* AI Summary Card (Tall) */}
                    <div className="md:row-span-2 bg-[#0F0F11] border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-violet-500/30 transition-colors">
                        <div className="absolute bottom-0 left-0 p-32 bg-violet-600/10 rounded-full blur-[80px]"></div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Zap className="text-violet-400" />
                            AI Powered
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">Claude 3.5 Sonnet turns your scattered bullet points into professional daily summaries.</p>

                        <div className="space-y-3">
                            <div className="bg-white/5 p-3 rounded-lg text-xs font-mono text-gray-300">
                                &gt; Fixed auth bug<br />
                                &gt; Updated docs
                            </div>
                            <div className="flex justify-center">
                                <ArrowRight className="rotate-90 text-gray-600" />
                            </div>
                            <div className="bg-gradient-to-br from-violet-900/50 to-indigo-900/50 p-4 rounded-xl border border-white/10 text-xs text-indigo-100 leading-relaxed shadow-lg">
                                <span className="text-violet-300 font-bold block mb-1">AI Summary:</span>
                                "Resolved authentication middleware issues and updated API documentation to reflect new endpoints."
                            </div>
                        </div>
                    </div>

                    {/* Audit Ready (Small) */}
                    <div className="bg-[#0F0F11] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
                        <Shield className="w-8 h-8 text-emerald-500 mb-4" />
                        <div>
                            <h3 className="text-lg font-bold">Audit Ready</h3>
                            <p className="text-gray-400 text-sm mt-1">Version-controlled logs.</p>
                        </div>
                    </div>

                    {/* Dark Mode (Small) */}
                    <div className="bg-[#0F0F11] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                        <Moon className="w-8 h-8 text-blue-500 mb-4" />
                        <div>
                            <h3 className="text-lg font-bold">Dark Mode</h3>
                            <p className="text-gray-400 text-sm mt-1">Easy on the eyes.</p>
                        </div>
                    </div>

                    {/* Cloud Sync (Small) */}
                    <div className="bg-[#0F0F11] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
                        <Cloud className="w-8 h-8 text-cyan-500 mb-4" />
                        <div>
                            <h3 className="text-lg font-bold">Cloud Sync</h3>
                            <p className="text-gray-400 text-sm mt-1">Cross-device support.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-white/10 py-12 bg-[#020202]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
                    <p>© 2026 LogBook. Built by Sunil Gundala.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
                        <a href="https://github.com/sunillucky143/LogBook" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

// ─── Subcomponents ───

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
        </div>
    )
}

function ComparisonSlider() {
    const [sliderValue, setSliderValue] = useState(50)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100))
        setSliderValue(percent)
    }

    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current) handleMove(e.clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        if (isDragging.current) handleMove(e.touches[0].clientX)
    }

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 select-none cursor-col-resize"
            onMouseDown={() => isDragging.current = true}
            onMouseUp={() => isDragging.current = false}
            onMouseLeave={() => isDragging.current = false}
            onMouseMove={onMouseMove}
            onTouchStart={() => isDragging.current = true}
            onTouchEnd={() => isDragging.current = false}
            onTouchMove={onTouchMove}
        >
            {/* Right Side (After/Order) - LogBook UI */}
            <div className="absolute inset-0 bg-[#0F0F11] flex items-center justify-center">
                <div className="w-full h-full p-8 flex flex-col">
                    <div className="h-8 border-b border-white/10 flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                        <span className="ml-4 text-xs text-gray-500">LogBook Dashboard</span>
                    </div>
                    <div className="flex-1 grid grid-cols-[200px_1fr] gap-6">
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-white/5 rounded w-full"></div>)}
                        </div>
                        <div className="space-y-4">
                            <div className="h-32 bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4">
                                <span className="text-indigo-400 text-sm font-bold">Active Session</span>
                                <div className="text-4xl text-white font-mono mt-2">04:23:12</div>
                            </div>
                            <div className="h-64 bg-white/5 rounded-xl border border-white/5"></div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-6 right-6 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm font-bold">
                    Audit Ready
                </div>
            </div>

            {/* Left Side (Before/Chaos) - Overlaid */}
            <div
                className="absolute inset-0 bg-gray-100 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
            >
                <div className="absolute inset-0 p-8">
                    <div className="font-hand text-gray-800 text-3xl mb-8 -rotate-2">Where did I put that file??</div>
                    <div className="absolute top-20 left-20 bg-yellow-200 p-4 shadow-xl rotate-3 w-48 text-black font-hand">
                        TODO: Find hours for Oct 12-15... ??
                    </div>
                    <div className="absolute bottom-40 right-20 bg-white p-6 shadow-xl -rotate-3 border border-gray-300 w-64">
                        <h4 className="font-bold text-red-600 mb-2">URGENT: ADVISOR EMAIL</h4>
                        <p className="text-xs text-gray-600">Please submit your detailed log by EOD or status risk...</p>
                    </div>
                    <div className="absolute top-1/2 left-1/3 bg-blue-100 p-4 shadow-lg rotate-6">
                        xlsx_final_v2_REAL_FINAL.csv
                    </div>
                </div>
                <div className="absolute bottom-6 left-6 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-full text-sm font-bold">
                    The Panic Zone
                </div>
            </div>

            {/* Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-50 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                style={{ left: `${sliderValue}%` }}
            >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-gray-400" />
                        <div className="w-0.5 h-3 bg-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function MiniTimer() {
    const [elapsed, setElapsed] = useState(0)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        let interval: any
        if (isActive) {
            interval = setInterval(() => {
                setElapsed(e => e + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isActive])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="text-gray-400 text-sm font-medium">Session Timer</span>
                </div>
                <div className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Interactive Demo</div>
            </div>

            <div className="text-5xl font-mono text-white mb-8 tracking-wider tabular-nums">
                {formatTime(elapsed)}
            </div>

            <div className="flex gap-4">
                {!isActive ? (
                    <button
                        onClick={() => setIsActive(true)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Start
                    </button>
                ) : (
                    <button
                        onClick={() => setIsActive(false)}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Pause className="w-4 h-4 fill-current" />
                        Stop
                    </button>
                )}
            </div>
        </div>
    )
}
