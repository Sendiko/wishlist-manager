'use client'

import { useActionState, useState, useEffect } from 'react'
import { updateItem } from '@/app/actions/item'
import Link from 'next/link'
import { Item, Category } from '@prisma/client'

export default function EditItemForm({ item, categories }: { item: Item, categories: Category[] }) {
    // @ts-ignore
    const [state, action, isPending] = useActionState(updateItem, {})

    const [name, setName] = useState(item.name)
    const [categoryId, setCategoryId] = useState(item.categoryId || '')
    const [photoUrl, setPhotoUrl] = useState(item.photoUrl || '')
    const [link, setLink] = useState(item.link || '')
    const [reasoning, setReasoning] = useState(item.reasoning || '')
    const [neccessaryRate, setNeccessaryRate] = useState(item.neccessary_rate)
    const [wishRate, setWishRate] = useState(item.wish_rate)
    const [interestRate, setInterestRate] = useState(item.interest_rate)
    const [price, setPrice] = useState(item.price.toString())
    const [displayPrice, setDisplayPrice] = useState('')

    const formatRupiah = (value: string) => {
        const number = value.replace(/\D/g, '')
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '')
        setPrice(rawValue)
        setDisplayPrice(formatRupiah(rawValue))
    }

    useEffect(() => {
        setDisplayPrice(formatRupiah(item.price.toString()))
    }, [])

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="id" value={item.id} />

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant">Nama Barang</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-outline bg-surface text-on-surface px-3 py-2 placeholder-on-surface-variant/50 focus:border-primary focus:ring-primary"
                />
                {state?.errors?.name && <p className="mt-1 text-sm text-error">{state.errors.name}</p>}
            </div>

            {/* Category */}
            <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-on-surface-variant">Kategori</label>
                <select
                    id="categoryId"
                    name="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-outline bg-surface text-on-surface px-3 py-2 focus:border-primary focus:ring-primary"
                >
                    <option value="" disabled>Pilih Kategori (Optional)</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Photo Upload */}
            <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant">
                <label htmlFor="photo" className="block text-sm font-medium text-on-surface-variant mb-2">Ganti Foto (Opsional)</label>
                <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    className="block w-full text-sm text-on-surface-variant
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-primary-container file:text-on-primary-container
        hover:file:bg-primary-container/80"
                />
                <p className="mt-2 text-xs text-on-surface-variant">Foto saat ini: {item.photoUrl || 'Tidak ada'}</p>
            </div>

            {/* Photo URL */}
            <div>
                <label htmlFor="photoUrl" className="block text-sm font-medium text-on-surface-variant">URL Foto (Opsional)</label>
                <input
                    type="url"
                    id="photoUrl"
                    name="photoUrl"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-outline bg-surface text-on-surface px-3 py-2 placeholder-on-surface-variant/50 focus:border-primary focus:ring-primary"
                    placeholder="https://example.com/image.jpg"
                />
                {state?.errors?.photoUrl && <p className="mt-1 text-sm text-error">{state.errors.photoUrl}</p>}
            </div>

            {/* Link */}
            <div>
                <label htmlFor="link" className="block text-sm font-medium text-on-surface-variant">Link Pembelian (Opsional)</label>
                <input
                    type="url"
                    id="link"
                    name="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-outline bg-surface text-on-surface px-3 py-2 placeholder-on-surface-variant/50 focus:border-primary focus:ring-primary"
                />
                {state?.errors?.link && <p className="mt-1 text-sm text-error">{state.errors.link}</p>}
            </div>

            {/* Price */}
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-on-surface-variant">Harga (IDR)</label>
                <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">Rp</span>
                    <input
                        type="text"
                        id="price-display"
                        value={displayPrice}
                        onChange={handlePriceChange}
                        className="block w-full rounded-md border border-outline bg-surface text-on-surface pl-10 pr-3 py-2 placeholder-on-surface-variant/50 focus:border-primary focus:ring-primary"
                        placeholder="15.000.000"
                    />
                    <input
                        type="hidden"
                        name="price"
                        value={price}
                    />
                </div>
                {state?.errors?.price && <p className="mt-1 text-sm text-error">{state.errors.price}</p>}
            </div>

            {/* Reasoning */}
            <div>
                <label htmlFor="reasoning" className="block text-sm font-medium text-on-surface-variant">Alasan Menginginkan</label>
                <textarea
                    id="reasoning"
                    name="reasoning"
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-outline bg-surface text-on-surface px-3 py-2 placeholder-on-surface-variant/50 focus:border-primary focus:ring-primary"
                />
                {state?.errors?.reasoning && <p className="mt-1 text-sm text-error">{state.errors.reasoning}</p>}
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <div className="flex justify-between">
                        <label htmlFor="neccessary_rate" className="block text-sm font-medium text-on-surface-variant">Seberapa Butuh</label>
                        <span className="text-sm font-bold text-primary">{neccessaryRate}</span>
                    </div>
                    <input
                        type="range"
                        id="neccessary_rate"
                        name="neccessary_rate"
                        min="0"
                        max="10"
                        value={neccessaryRate}
                        onChange={(e) => setNeccessaryRate(Number(e.target.value))}
                        className="mt-2 w-full h-2 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <div>
                    <div className="flex justify-between">
                        <label htmlFor="wish_rate" className="block text-sm font-medium text-on-surface-variant">Seberapa Ingin</label>
                        <span className="text-sm font-bold text-primary">{wishRate}</span>
                    </div>
                    <input
                        type="range"
                        id="wish_rate"
                        name="wish_rate"
                        min="0"
                        max="10"
                        value={wishRate}
                        onChange={(e) => setWishRate(Number(e.target.value))}
                        className="mt-2 w-full h-2 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <div>
                    <div className="flex justify-between">
                        <label htmlFor="interest_rate" className="block text-sm font-medium text-on-surface-variant">Seberapa Tertarik</label>
                        <span className="text-sm font-bold text-primary">{interestRate}</span>
                    </div>
                    <input
                        type="range"
                        id="interest_rate"
                        name="interest_rate"
                        min="0"
                        max="10"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="mt-2 w-full h-2 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>

            {/* Global Message */}
            {state?.message && (
                <p className="text-sm text-red-600">{state.message}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
                <Link
                    href="/dashboard"
                    className="px-4 py-2 border border-outline rounded-md shadow-sm text-sm font-medium text-on-surface-variant bg-surface hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Batal
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                    {isPending ? 'Menyimpan...' : 'Update Barang'}
                </button>
            </div>
        </form>
    )
}
