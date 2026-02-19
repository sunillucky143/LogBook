import { UserButton, useAuth } from '@clerk/clerk-react'
import { Moon, Sun, Menu, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useUIStore } from '../../stores/uiStore'

export function Header() {
  const { isDarkMode, toggleDarkMode, toggleSidebar } = useUIStore()
  const { isSignedIn } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to={isSignedIn ? '/' : '/'}>
            <div className="flex items-center gap-2">
              <img
                src={isDarkMode ? '/logo-dark.png' : '/logo-light.png'}
                alt="LogBook"
                className="h-10 w-auto"
              />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/docs"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-8 w-8',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
