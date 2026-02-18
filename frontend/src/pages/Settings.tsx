import { useUser } from '@clerk/clerk-react'
import { User, Bell, Moon, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import { useUIStore } from '../stores/uiStore'

export function Settings() {
  const { user } = useUser()
  const { isDarkMode, toggleDarkMode } = useUIStore()

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.imageUrl}
              alt={user?.fullName || 'Profile'}
              className="h-16 w-16 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user?.fullName || 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" size="sm">
              Edit Profile in Clerk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Dark Mode
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark theme
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                border-2 border-transparent transition-colors duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}
              `}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full
                  bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Session Reminders
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified when scheduled sessions end
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              defaultChecked
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Daily Summary
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive a daily summary of your hours
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Manage your security settings through Clerk's secure portal.
          </p>
          <Button variant="secondary" size="sm">
            Manage Security Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
