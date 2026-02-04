'use client'

import { useState } from 'react'
import { Item } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

export default function ComparisonClient({ items }: { items: Item[] }) {
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const [showComparison, setShowComparison] = useState(false)

    const toggleSelection = (itemId: string) => {
        setSelectedItemIds((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        )
    }

    const startComparison = () => {
        if (selectedItemIds.length < 2) {
            alert('Pilih minimal 2 barang untuk dibandingkan.') // Simple validation
            return
        }
        setShowComparison(true)
    }

    const resetSelection = () => {
        setShowComparison(false)
        setSelectedItemIds([])
    }

    // Filter items based on selection
    const selectedItems = items.filter((item) => selectedItemIds.includes(item.id))

    // Calculate scores and find winner
    // Score = wish_rate + neccessary_rate + interest_rate
    // You can adjust weighting here if needed
    const itemsWithScore = selectedItems.map(item => ({
        ...item,
        totalScore: item.wish_rate + item.neccessary_rate + item.interest_rate
    }))

    const maxScore = Math.max(...itemsWithScore.map(i => i.totalScore), 0)
    const winnerIds = itemsWithScore.filter(i => i.totalScore === maxScore).map(i => i.id)

    // Formatting currency
    const formatCurrency = (amount: bigint | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount))
    }

    if (showComparison) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Hasil Perbandingan</h2>
                    <button
                        onClick={() => setShowComparison(false)}
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                        &larr; Kembali ke Pemilihan
                    </button>
                </div>

                <div className="overflow-x-auto p-8">
                    <div className="flex gap-6 min-w-max">
                        {itemsWithScore.map((item) => {
                            const isWinner = winnerIds.includes(item.id)
                            return (
                                <div
                                    key={item.id}
                                    className={`w-80 flex-shrink-0 bg-white rounded-xl shadow-md border-2 overflow-hidden flex flex-col relative transition-all duration-300 ${isWinner ? 'border-yellow-400 shadow-xl scale-105 z-10' : 'border-gray-200 opacity-90'}`}
                                >
                                    {isWinner && (
                                        <div className="absolute top-0 inset-x-0 bg-yellow-400 text-yellow-900 text-center py-1 text-xs font-bold uppercase tracking-wider z-20">
                                            Recommended Choice 🏆
                                        </div>
                                    )}

                                    <div className="relative h-48 w-full bg-gray-100 mt-6"> {/* Added margin top for banner */}
                                        {item.photoUrl ? (
                                            <Image
                                                src={item.photoUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">{item.name}</h3>
                                            <p className="text-xl text-orange-600 font-bold mt-1">{formatCurrency(item.price)}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-500">Total Score</span>
                                                    <span className={`font-bold ${isWinner ? 'text-green-600' : 'text-gray-700'}`}>{item.totalScore}/30</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div className={`h-2.5 rounded-full ${isWinner ? 'bg-green-500' : 'bg-gray-400'}`} style={{ width: `${(item.totalScore / 30) * 100}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <div className="font-semibold text-gray-700">{item.neccessary_rate}</div>
                                                    <div className="text-gray-500 text-[10px] uppercase">Butuh</div>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <div className="font-semibold text-gray-700">{item.wish_rate}</div>
                                                    <div className="text-gray-500 text-[10px] uppercase">Ingin</div>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <div className="font-semibold text-gray-700">{item.interest_rate}</div>
                                                    <div className="text-gray-500 text-[10px] uppercase">Minat</div>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 p-3 rounded text-sm text-gray-600 italic line-clamp-3">
                                                "{item.reasoning}"
                                            </div>
                                        </div>

                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors mt-auto font-medium">
                                                Visit Link
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pilih Barang untuk Dibandingkan</h1>
                    <p className="text-gray-500">Pilih minimal 2 barang untuk melihat perbandingan skornya.</p>
                </div>
                <div className="flex gap-3">
                    {selectedItemIds.length > 0 && (
                        <button
                            onClick={resetSelection}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                        >
                            Reset ({selectedItemIds.length})
                        </button>
                    )}
                    <button
                        onClick={startComparison}
                        disabled={selectedItemIds.length < 2}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Bandingkan {selectedItemIds.length > 0 ? `(${selectedItemIds.length})` : ''}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id)
                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleSelection(item.id)}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200 hover:shadow-md relative ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-sm z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <div className="relative h-32 w-full bg-gray-100">
                                {item.photoUrl ? (
                                    <Image
                                        src={item.photoUrl}
                                        alt={item.name}
                                        fill
                                        className={`object-cover ${isSelected ? 'opacity-90' : ''}`}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold text-gray-900 truncate text-sm">{item.name}</h3>
                                <p className="text-gray-600 text-xs mt-1">{formatCurrency(item.price)}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
