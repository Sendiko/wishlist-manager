
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
import { toggleItemPurchased } from '@/app/actions/item'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from './delete-button'

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

    const topItems = await prisma.item.findMany({
        where: {
            userId: session.userId,
            isPurchased: false // Only show unpurchased in most wanted
        },
        include: {
            category: true
        },
        orderBy: [
            { wish_rate: 'desc' },
            { neccessary_rate: 'desc' },
        ],
        take: 3,
    })

    // Show all items, sorted by purchased status (unpurchased first) then date
    const allItems = await prisma.item.findMany({
        where: { userId: session.userId },
        include: {
            category: true
        },
        orderBy: [
            { isPurchased: 'asc' },
            { createdAt: 'desc' }
        ],
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
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Top App Bar */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Title */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/dashboard" className="text-xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition">
                                ulala
                            </Link>
                        </div>

                        {/* Actions (Logout) */}
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard/compare-categories"
                                className="text-sm font-medium text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-md transition-colors"
                            >
                                📊 Kategori
                            </Link>
                            <Link
                                href="/dashboard/compare"
                                className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors"
                            >
                                ⚖️ Bandingkan
                            </Link>
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="text-sm font-medium text-gray-600 hover:text-red-600 transition duration-150 ease-in-out px-3 py-2 rounded-md"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-4 sm:p-6 lg:p-8 mb-20">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Section 1: Top Most Wanted */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">🔥 Top Most Wanted</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topItems.length > 0 ? (
                                topItems.map((item) => (
                                    <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 relative border border-orange-100">
                                        <div className="absolute top-2 right-2 flex flex-col items-end space-y-1 z-10">
                                            <span className="bg-orange-500/90 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                ★ Wish: {item.wish_rate}
                                            </span>
                                            <span className="bg-blue-500/90 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                ★ Interest: {item.interest_rate}
                                            </span>
                                        </div>
                                        <div className="relative h-48 w-full bg-gray-200">
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
                                            {item.category && (
                                                <div className="absolute bottom-2 left-2 z-10">
                                                    <span className="bg-gray-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                        {item.category.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex-grow flex flex-col">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                                            <p className="text-orange-600 font-semibold mb-2">{formatCurrency(item.price)}</p>
                                            <p className="text-gray-500 text-sm line-clamp-2 flex-grow">{item.reasoning}</p>

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
                                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {item.isPurchased ? 'Sudah Dibeli ✅' : 'Tandai Dibeli'}
                                                    </button>
                                                </form>

                                                <div className="flex gap-2">
                                                    <Link href={`/dashboard/edit/${item.id}`} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md border border-gray-200" title="Edit">
                                                        ✏️
                                                    </Link>
                                                    {item.link && (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200" title="Link Pembelian">
                                                            ↗
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500">Belum ada barang di top wishlist.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section 2: Summary Stats */}
                    <section>
                        <div className="grid grid-cols-3 gap-2 sm:gap-6">
                            {/* Total Items */}
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 sm:p-6 text-white shadow-lg flex flex-col items-center sm:items-start text-center sm:text-left">
                                <p className="text-blue-100 text-xs sm:text-sm font-medium uppercase tracking-wider">Barang</p>
                                <p className="text-xl sm:text-4xl font-bold mt-1 sm:mt-2">{totalItems}</p>
                            </div>

                            {/* Total Price */}
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 sm:p-6 text-white shadow-lg flex flex-col items-center sm:items-start text-center sm:text-left">
                                <p className="text-purple-100 text-xs sm:text-sm font-medium uppercase tracking-wider">Total</p>
                                <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 truncate w-full" title={formatCurrency(totalPrice)}>
                                    {formatCompactCurrency(totalPrice)}
                                </p>
                            </div>

                            {/* Purchased Stats */}
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 sm:p-6 text-white shadow-lg flex flex-col items-center sm:items-start text-center sm:text-left">
                                <p className="text-green-100 text-xs sm:text-sm font-medium uppercase tracking-wider">Dibeli</p>
                                <p className="text-xl sm:text-4xl font-bold mt-1 sm:mt-2">{purchasedItems}</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: All Items */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 Semua Barang</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {allItems.map((item) => (
                                <div key={item.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 group ${item.isPurchased ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                    <div className="relative h-40 w-full bg-gray-100 group-hover:scale-105 transition-transform duration-500">
                                        {item.photoUrl ? (
                                            <Image
                                                src={item.photoUrl}
                                                alt={item.name}
                                                fill
                                                className={`object-cover ${item.isPurchased ? 'grayscale' : ''}`}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
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
                                        <h4 className={`font-semibold truncate ${item.isPurchased ? 'text-gray-500 line-through' : 'text-gray-900'}`} title={item.name}>{item.name}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{formatCompactCurrency(item.price)}</p>

                                        <div className="mt-4 space-y-2">
                                            <form action={async () => {
                                                'use server'
                                                await toggleItemPurchased(item.id, item.isPurchased)
                                            }}>
                                                <button
                                                    type="submit"
                                                    className={`w-full py-1.5 px-3 rounded-md text-xs font-medium border transition-colors ${item.isPurchased
                                                        ? 'border-green-300 text-green-700 bg-green-100 hover:bg-green-200'
                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {item.isPurchased ? 'Mark Unpurchased' : 'Mark Purchased'}
                                                </button>
                                            </form>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                                <Link href={`/dashboard/edit/${item.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                                    Edit
                                                </Link>
                                                <DeleteButton itemId={item.id} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {allItems.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500">
                                    Tidak ada barang. Tambahkan barang baru dengan tombol + di bawah.
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>

            {/* FAB */}
            <Link
                href="/dashboard/add"
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg flex items-center transition duration-200 z-50 hover:scale-105 active:scale-95"
            >
                <span className="mr-2 text-xl">+</span>
                <span className="sr-only">Tambah Barang</span>
                Tambah Barang
            </Link>
        </div>
    )
}
