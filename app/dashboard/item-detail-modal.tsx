'use client'

import { useEffect } from 'react'
import { Item, Category } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import DeleteButton from './delete-button'

type ItemWithCategory = Item & { category: Category | null }

interface ItemDetailModalProps {
    item: ItemWithCategory | null
    isOpen: boolean
    onClose: () => void
    formatCurrency: (amount: bigint | number) => string
}

export default function ItemDetailModal({ item, isOpen, onClose, formatCurrency }: ItemDetailModalProps) {
    // Close on ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            // Prevent body scroll
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen || !item) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <div className="sticky top-0 z-10 flex justify-end p-4 bg-gradient-to-b from-surface to-transparent">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Image Section */}
                <div className="relative w-full h-64 sm:h-80 bg-surface-container-low -mt-16">
                    {item.photoUrl ? (
                        <Image
                            unoptimized={true}
                            src={item.photoUrl}
                            alt={item.name}
                            fill
                            className="object-contain p-4"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-on-surface-variant/50">
                            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Purchase Status Badge */}
                    {item.isPurchased && (
                        <div className="absolute top-4 right-4">
                            <span className="bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                                ✓ Purchased
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface font-display">{item.name}</h2>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {item.category && (
                                <span className="bg-primary-container text-on-primary-container text-sm font-semibold px-3 py-1 rounded-full">
                                    {item.category.name}
                                </span>
                            )}
                            <span className="text-2xl font-bold text-primary">
                                {formatCurrency(item.price)}
                            </span>
                        </div>
                    </div>

                    {/* Reasoning */}
                    {item.reasoning && (
                        <div className="bg-surface-container-low rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                                Alasan
                            </h3>
                            <p className="text-on-surface leading-relaxed">{item.reasoning}</p>
                        </div>
                    )}

                    {/* Ratings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-secondary-container rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-on-secondary-container">Seberapa Butuh</span>
                                <span className="text-2xl font-bold text-on-secondary-container">{item.neccessary_rate}</span>
                            </div>
                            <div className="w-full bg-secondary-container/50 rounded-full h-2">
                                <div
                                    className="bg-secondary h-2 rounded-full transition-all"
                                    style={{ width: `${(item.neccessary_rate / 10) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-tertiary-container rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-on-tertiary-container">Seberapa Ingin</span>
                                <span className="text-2xl font-bold text-on-tertiary-container">{item.wish_rate}</span>
                            </div>
                            <div className="w-full bg-tertiary-container/50 rounded-full h-2">
                                <div
                                    className="bg-tertiary h-2 rounded-full transition-all"
                                    style={{ width: `${(item.wish_rate / 10) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-primary-container rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-on-primary-container">Seberapa Tertarik</span>
                                <span className="text-2xl font-bold text-on-primary-container">{item.interest_rate}</span>
                            </div>
                            <div className="w-full bg-primary-container/50 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${(item.interest_rate / 10) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant">

                        <Link
                            href={`/dashboard/edit/${item.id}`}
                            className="flex-1 py-3 px-4 rounded-lg font-medium bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors text-center border border-outline"
                        >
                            ✏️ Edit
                        </Link>

                        {item.link && (
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 px-4 rounded-lg font-medium bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors text-center"
                            >
                                🔗 Buka Link
                            </a>
                        )}

                        <div className="sm:flex-none">
                            <DeleteButton itemId={item.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
