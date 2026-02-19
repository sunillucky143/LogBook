import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import { ArrowLeft } from 'lucide-react'

export function SignUpPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            {/* Header */}
            <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <img src="/logo-dark.png" alt="LogBook" className="h-8 w-auto hidden dark:block" />
                        <img src="/logo-light.png" alt="LogBook" className="h-8 w-auto block dark:hidden" />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <SignUp 
                    signInUrl="/sign-in" 
                     appearance={{
                        elements: {
                            rootBox: "w-full max-w-lg mx-auto",
                            card: "bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-xl",
                            headerTitle: "text-gray-900 dark:text-gray-100",
                            headerSubtitle: "text-gray-600 dark:text-gray-400",
                            socialButtonsBlockButton: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                            formFieldLabel: "text-gray-700 dark:text-gray-300",
                            formFieldInput: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100",
                            footerActionLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        }
                    }}
                />
            </main>

            <Footer />
        </div>
    )
}
