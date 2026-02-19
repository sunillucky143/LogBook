import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <p>© 2026 LogBook. Built by Sunil Gundala.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link to="/docs" className="hover:text-gray-900 dark:hover:text-white transition-colors">Documentation</Link>
                    <a href="https://github.com/sunillucky143/LogBook" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors">GitHub</a>
                    <a href="https://github.com/sunillucky143/LogBook/issues" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors">Report Bug</a>
                </div>
            </div>
        </footer>
    )
}
