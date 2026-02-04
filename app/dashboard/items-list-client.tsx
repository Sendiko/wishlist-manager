'use client'

import { useState } from 'react'
import { Item, Category } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from './delete-button'
import ItemDetailModal from './item-detail-modal'

type ItemWithCategory = Item & { category: Category | null }

interface ItemsListClientProps {
    items: ItemWithCategory[]
    categories: Category[]
}


export default function ItemsListClient({ items, categories }: ItemsListClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedItem, setSelectedItem] = useState<ItemWithCategory | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Format currency functions defined in client component
    const formatCompactCurrency = (amount: bigint | number) => {
        const num = Number(amount)
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'M'
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'Jt'
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'Rb'
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num)
    }

    const formatCurrency = (amount: bigint | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount))
    }

    // Filter items based on selected category
    const filteredItems = selectedCategory === 'all'
        ? items
        : items.filter(item => item.categoryId === selectedCategory)

    const handleItemClick = (item: ItemWithCategory) => {
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setTimeout(() => setSelectedItem(null), 200) // Clear after animation
    }

    return (
        <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold text-on-surface font-display">📦 Semua Barang</h2>

                {/* Category Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === 'all'
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant'
                            }`}
                    >
                        All Categories
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category.id
                                ? 'bg-primary text-on-primary shadow-md'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`bg-surface rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer ${item.isPurchased ? 'border-primary-container bg-primary-container/5' : 'border-outline-variant'}`}
                    >
                        <div className="relative h-40 w-full bg-surface-container-low group-hover:scale-105 transition-transform duration-500">
                            {item.photoUrl ? (
                                <Image
                                    unoptimized={true}
                                    src={item.photoUrl}
                                    alt={item.name}
                                    fill
                                    className={`object-cover ${item.isPurchased ? 'grayscale' : ''}`}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-on-surface-variant/50 text-sm">
                                    No Image
                                </div>
                            )}
                            {item.isPurchased && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
                                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">Purchased</span>
                                </div>
                            )}
                            {item.category && (
                                <div className="absolute bottom-2 left-2 z-10">
                                    <span className="bg-gray-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">
                                        {item.category.name}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h4 className={`font-semibold truncate ${item.isPurchased ? 'text-on-surface-variant line-through opacity-70' : 'text-on-surface'}`} title={item.name}>{item.name}</h4>
                            <p className="text-secondary text-sm mt-1">{formatCompactCurrency(item.price)}</p>

                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
                                    <Link href={`/dashboard/edit/${item.id}`} className="text-primary hover:text-primary/80 text-xs font-medium">
                                        Edit
                                    </Link>
                                    <DeleteButton itemId={item.id} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredItems.length === 0 && (
                    <div className="col-span-full py-12 text-center text-on-surface-variant">
                        {selectedCategory === 'all'
                            ? 'Tidak ada barang. Tambahkan barang baru dengan tombol + di bawah.'
                            : 'Tidak ada barang dalam kategori ini.'}
                    </div>
                )}
            </div>

            {/* Item Detail Modal */}
            <ItemDetailModal
                item={selectedItem}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                formatCurrency={formatCurrency}
            />
        </section>
    )
}
