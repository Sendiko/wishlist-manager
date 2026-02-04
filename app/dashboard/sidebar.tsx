'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { useState } from 'react'

export default function Sidebar() {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const isActive = (path: string) => pathname === path

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-surface shadow-sm sticky top-0 z-30 border-b border-outline-variant">
                <Link href="/dashboard" className="text-xl font-bold text-on-surface tracking-tight font-display">
                    ulala
                </Link>
                <button
                    onClick={toggleMobileMenu}
                    className="text-on-surface p-2 rounded-md hover:bg-surface-container-high focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-outline-variant transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:block
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="h-16 flex items-center px-6 border-b border-outline-variant">
                        <Link href="/dashboard" className="text-2xl font-bold text-primary tracking-tight font-display">
                            ulala
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <div className="mb-2 px-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                            Menu
                        </div>

                        <Link
                            href="/dashboard"
                            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors ${isActive('/dashboard')
                                ? 'bg-primary-container text-on-primary-container'
                                : 'text-on-surface hover:bg-surface-container-high'
                                }`}
                        >
                            <span className="mr-3 text-lg">🏠</span>
                            Dashboard
                        </Link>

                        <Link
                            href="/dashboard/compare-categories"
                            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors ${isActive('/dashboard/compare-categories')
                                ? 'bg-primary-container text-on-primary-container'
                                : 'text-on-surface hover:bg-surface-container-high'
                                }`}
                        >
                            <span className="mr-3 text-lg">📊</span>
                            Kategori
                        </Link>

                        <Link
                            href="/dashboard/compare"
                            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors ${isActive('/dashboard/compare')
                                ? 'bg-primary-container text-on-primary-container'
                                : 'text-on-surface hover:bg-surface-container-high'
                                }`}
                        >
                            <span className="mr-3 text-lg">⚖️</span>
                            Bandingkan
                        </Link>
                    </nav>

                    {/* Footer / Account */}
                    <div className="p-4 border-t border-outline-variant">
                        <form action={logout}>
                            <button
                                type="submit"
                                className="w-full flex items-center px-2 py-2 text-sm font-medium text-error hover:bg-error/10 hover:text-on-error rounded-md transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </aside>
        </>
    )
}
