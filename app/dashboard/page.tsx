
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
import { toggleItemPurchased } from '@/app/actions/item'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from './delete-button'
import ItemsListClient from './items-list-client'
import ThemeToggle from '@/app/components/theme-toggle'

export default async function DashboardPage() {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    // Fetch Data
    const totalItems = await prisma.item.count({
        where: { userId: session.userId },
    })

    const priceAggregate = await prisma.item.aggregate({
        where: { userId: session.userId },
        _sum: { price: true },
    })
    const totalPrice = priceAggregate._sum.price || BigInt(0)

    // Purchased Stats
    const purchasedItems = await prisma.item.count({
        where: {
            userId: session.userId,
            isPurchased: true,
        },
    });

    // Fetch all unpurchased items to calculate total scores
    const allUnpurchasedItems = await prisma.item.findMany({
        where: {
            userId: session.userId,
            isPurchased: false // Only show unpurchased in most wanted
        },
        include: {
            category: true
        },
    })

    // Calculate total score for each item and sort by it
    const topItems = allUnpurchasedItems
        .map(item => ({
            ...item,
            totalScore: item.wish_rate + item.neccessary_rate + item.interest_rate
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 3)

    // Show all items, sorted by purchased status (unpurchased first) then by total score
    const allItemsRaw = await prisma.item.findMany({
        where: { userId: session.userId },
        include: {
            category: true
        },
    })

    // Calculate total score and sort: unpurchased first, then by total score descending
    const allItems = allItemsRaw
        .map(item => ({
            ...item,
            totalScore: item.wish_rate + item.neccessary_rate + item.interest_rate
        }))
        .sort((a, b) => {
            // First sort by purchased status (unpurchased first)
            if (a.isPurchased !== b.isPurchased) {
                return a.isPurchased ? 1 : -1
            }
            // Then sort by total score descending
            return b.totalScore - a.totalScore
        })

    // Fetch all categories for filtering
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    })

    // Formatting currency
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

    // Formatting standard currency
    const formatCurrency = (amount: bigint | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount))
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <header className="flex justify-between items-center pt-8 px-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-on-background font-display">✨ Dashboard</h1>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <form action={logout}>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-error text-on-error rounded-md hover:bg-error/90 transition-colors text-sm font-medium"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </header>

            {/* Section 1: Top Most Wanted */}
            <section>
                <h2 className="text-2xl font-bold text-on-surface mb-4 font-display">🔥 Top Most Wanted</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topItems.length > 0 ? (
                        topItems.map((item) => (
                            <div key={item.id} className="bg-surface-container rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 relative border border-tertiary-container">
                                <div className="absolute top-2 right-2 flex flex-col items-end space-y-1 z-10">
                                    <span className="bg-tertiary text-on-tertiary text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                        ★ Wish: {item.wish_rate}
                                    </span>
                                    <span className="bg-secondary text-on-secondary text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                        ★ Interest: {item.interest_rate}
                                    </span>
                                </div>
                                <div className="relative h-48 w-full bg-surface-container-low mt-6">
                                    {item.photoUrl ? (
                                        <Image
                                            src={item.photoUrl}
                                            alt={item.name}
                                            fill
                                            unoptimized={true}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-on-surface-variant/50">
                                            No Image
                                        </div>
                                    )}
                                    {item.category && (
                                        <div className="absolute bottom-2 left-2 z-10">
                                            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">
                                                {item.category.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="text-lg font-bold text-on-surface mb-1 font-display">{item.name}</h3>
                                    <p className="text-tertiary font-semibold mb-2">{formatCurrency(item.price)}</p>
                                    <p className="text-on-surface-variant text-sm line-clamp-2 flex-grow">{item.reasoning}</p>

                                    <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
                                        {/* Purchase Toggle Form */}
                                        <form action={async () => {
                                            'use server'
                                            await toggleItemPurchased(item.id, item.isPurchased)
                                        }} className="flex-grow">
                                            <button
                                                type="submit"
                                                className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${item.isPurchased
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80'
                                                    }`}
                                            >
                                                {item.isPurchased ? 'Sudah Dibeli ✅' : 'Tandai Dibeli'}
                                            </button>
                                        </form>

                                        <div className="flex gap-2">
                                            <Link href={`/dashboard/edit/${item.id}`} className="p-2 text-primary hover:bg-primary/10 rounded-md border border-outline-variant" title="Edit">
                                                ✏️
                                            </Link>
                                            {item.link && (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 text-secondary hover:bg-secondary/10 rounded-md border border-outline-variant" title="Link Pembelian">
                                                    ↗
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10 bg-surface rounded-xl border border-dashed border-outline-variant">
                            <p className="text-on-surface-variant">Belum ada barang di top wishlist.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Section 2: Summary Stats */}
            <section>
                <div className="grid grid-cols-3 gap-2 sm:gap-6">
                    {/* Total Items */}
                    <div className="bg-primary-container text-on-primary-container rounded-xl p-3 sm:p-6 shadow-lg flex flex-col items-center sm:items-start text-center sm:text-left">
                        <p className="text-on-primary-container/80 text-xs sm:text-sm font-medium uppercase tracking-wider">Barang</p>
                        <p className="text-xl sm:text-4xl font-bold mt-1 sm:mt-2">{totalItems}</p>
                    </div>

                    {/* Total Price */}
                    <div className="bg-secondary-container text-on-secondary-container rounded-xl p-3 sm:p-6 shadow-lg flex flex-col items-center sm:items-start text-center sm:text-left">
                        <p className="text-on-secondary-container/80 text-xs sm:text-sm font-medium uppercase tracking-wider">Total</p>
                        <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 truncate w-full" title={formatCurrency(totalPrice)}>
                            {formatCompactCurrency(totalPrice)}
                        </p>
                    </div>

                    {/* Purchased Stats */}
                    <div className="bg-tertiary-container text-on-tertiary-container rounded-xl p-3 sm:p-6 shadow-lg flex flex-col items-center sm:items-start text-center sm:text-left">
                        <p className="text-on-tertiary-container/80 text-xs sm:text-sm font-medium uppercase tracking-wider">Dibeli</p>
                        <p className="text-xl sm:text-4xl font-bold mt-1 sm:mt-2">{purchasedItems}</p>
                    </div>
                </div>
            </section>

            {/* Section 3: All Items */}
            <ItemsListClient
                items={allItems}
                categories={categories}
            />

            {/* FAB */}
            <Link
                href="/dashboard/add"
                className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-on-primary font-semibold py-3 px-6 rounded-full shadow-lg flex items-center transition duration-200 z-50 hover:scale-105 active:scale-95"
            >
                <span className="mr-2 text-xl">+</span>
                <span className="sr-only">Tambah Barang</span>
                Tambah Barang
            </Link>
        </div>
    )
}
