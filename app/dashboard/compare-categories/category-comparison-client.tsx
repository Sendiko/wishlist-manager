'use client'

import { useState } from 'react'
import { Category, Item } from '@prisma/client'
import Link from 'next/link'

type CategoryWithItems = Category & {
    items: Item[]
}

export default function CategoryComparisonClient({ categories }: { categories: CategoryWithItems[] }) {
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const [showComparison, setShowComparison] = useState(false)

    // Toggle single item
    const toggleItem = (itemId: string) => {
        setSelectedItemIds((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        )
    }

    // Toggle all items in a category
    const toggleCategory = (category: CategoryWithItems) => {
        const itemIds = category.items.map(i => i.id)
        const allSelected = itemIds.every(id => selectedItemIds.includes(id))

        if (allSelected) {
            // Deselect all
            setSelectedItemIds(prev => prev.filter(id => !itemIds.includes(id)))
        } else {
            // Select all
            const newIds = [...selectedItemIds]
            itemIds.forEach(id => {
                if (!newIds.includes(id)) newIds.push(id)
            })
            setSelectedItemIds(newIds)
        }
    }

    const startComparison = () => {
        // Collect categories that have at least one selected item
        const activeCategories = categories.filter(c =>
            c.items.some(i => selectedItemIds.includes(i.id))
        )

        if (activeCategories.length < 2) {
            alert('Pilih item dari minimal 2 kategori berbeda untuk dibandingkan.')
            return
        }
        setShowComparison(true)
    }

    const resetSelection = () => {
        setShowComparison(false)
        setSelectedItemIds([])
    }

    // Filter and Calculate Stats based on SELECTED ITEMS
    const categoriesWithStats = categories.map(category => {
        // Only include selected items
        const selectedItems = category.items.filter(item => selectedItemIds.includes(item.id))

        if (selectedItems.length === 0) return null

        const itemCount = selectedItems.length
        const totalPrice = selectedItems.reduce((sum, item) => sum + Number(item.price), 0)

        // Score = Sum of all rates (30 max per item)
        const totalScore = selectedItems.reduce((sum, item) => {
            return sum + (item.wish_rate + item.neccessary_rate + item.interest_rate)
        }, 0)

        const avgScore = itemCount > 0 ? (totalScore / itemCount).toFixed(1) : '0'

        return {
            ...category,
            items: selectedItems, // Override with selected subset
            itemCount,
            totalPrice: BigInt(totalPrice),
            totalScore,
            avgScore
        }
    }).filter((c): c is NonNullable<typeof c> => c !== null)

    const maxScore = Math.max(...categoriesWithStats.map(c => c.totalScore), 0)
    const winnerIds = categoriesWithStats.filter(c => c.totalScore === maxScore && c.totalScore > 0).map(c => c.id)

    // Formatting currency
    const formatCurrency = (amount: bigint | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount))
    }

    const formatCompactCurrency = (amount: bigint | number) => {
        const num = Number(amount)
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'M'
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'Jt'
        return formatCurrency(amount)
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
                        {categoriesWithStats.map((category) => {
                            const isWinner = winnerIds.includes(category.id)
                            return (
                                <div
                                    key={category.id}
                                    className={`w-80 flex-shrink-0 bg-white rounded-xl shadow-md border-2 overflow-hidden flex flex-col relative transition-all duration-300 ${isWinner ? 'border-purple-400 shadow-xl scale-105 z-10' : 'border-gray-200 opacity-90'}`}
                                >
                                    {isWinner && (
                                        <div className="absolute top-0 inset-x-0 bg-purple-500 text-white text-center py-1 text-xs font-bold uppercase tracking-wider z-20">
                                            Winner 💎
                                        </div>
                                    )}

                                    <div className={`p-6 flex-grow flex flex-col space-y-6 ${isWinner ? 'pt-10' : ''}`}>
                                        <div className="text-center">
                                            <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                                            <p className="text-gray-500 text-sm">{category.itemCount} Item Terpilih</p>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Total Score */}
                                            <div className="bg-purple-50 p-4 rounded-lg text-center">
                                                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Total Value Points</p>
                                                <p className="text-3xl font-extrabold text-purple-700">{category.totalScore}</p>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                    <p className="text-xs text-gray-500 uppercase">Total Harga</p>
                                                    <p className="font-bold text-gray-800 text-sm">{formatCompactCurrency(category.totalPrice)}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                    <p className="text-xs text-gray-500 uppercase">Rata-rata</p>
                                                    <p className="font-bold text-gray-800 text-sm">{category.avgScore}</p>
                                                </div>
                                            </div>

                                            {/* Selected Items List */}
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-xs text-gray-400 font-semibold mb-2 uppercase">Item Terpilih:</p>
                                                <ul className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                                                    {category.items.map(item => (
                                                        <li key={item.id} className="flex justify-between">
                                                            <span className="truncate mr-2">{item.name}</span>
                                                            <span className="font-mono text-gray-400">
                                                                {item.wish_rate + item.neccessary_rate + item.interest_rate}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // UI for Selection
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Bandingkan Kategori (Granular)</h1>
                    <p className="text-gray-500">Pilih item spesifik dari tiap kategori untuk melihat kombinasi mana yang paling bernilai.</p>
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
                        disabled={selectedItemIds.length < 1}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Bandingkan ({selectedItemIds.length})
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {categories.map((category) => {
                    if (category.items.length === 0) return null

                    const categoryItemIds = category.items.map(i => i.id)
                    const selectedCount = categoryItemIds.filter(id => selectedItemIds.includes(id)).length
                    const isAllSelected = selectedCount === category.items.length && category.items.length > 0
                    const isPartiallySelected = selectedCount > 0 && !isAllSelected

                    return (
                        <div key={category.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${selectedCount > 0 ? 'border-purple-300 shadow-md' : 'border-gray-200'}`}>
                            {/* Category Header */}
                            <div className={`p-4 border-b flex justify-between items-center ${selectedCount > 0 ? 'bg-purple-50' : 'bg-gray-50/50'}`}>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedCount > 0 ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {category.name.charAt(0)}
                                    </span>
                                    {category.name}
                                </h3>
                                <div className="text-xs font-medium text-gray-500">
                                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={input => {
                                                if (input) input.indeterminate = isPartiallySelected;
                                            }}
                                            onChange={() => toggleCategory(category)}
                                            className="rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                                        />
                                        <span>Pilih Semua ({category.items.length})</span>
                                    </label>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                                {category.items.map(item => {
                                    const isSelected = selectedItemIds.includes(item.id)
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-purple-100/50' : 'hover:bg-gray-50'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }} // Handled by div click
                                                className="rounded text-purple-600 focus:ring-purple-500 border-gray-300 mr-3"
                                            />
                                            <div className="flex-grow min-w-0">
                                                <p className={`text-sm font-medium truncate ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>{item.name}</p>
                                                <p className="text-xs text-gray-500">{formatCompactCurrency(item.price)} • Score: {item.wish_rate + item.neccessary_rate + item.interest_rate}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {categories.every(c => c.items.length === 0) && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
                    Belum ada barang di kategori manapun.
                </div>
            )}
        </div>
    )
}
