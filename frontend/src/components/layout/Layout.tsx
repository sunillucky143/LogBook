import { type ReactNode, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'
import { useUIStore } from '../../stores/uiStore'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isDarkMode } = useUIStore()

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="mx-auto max-w-7xl w-full flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
