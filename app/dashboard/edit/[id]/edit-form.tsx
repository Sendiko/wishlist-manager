'use client'

import { useActionState, useState } from 'react'
import { updateItem } from '@/app/actions/item'
import Link from 'next/link'
import { Item, Category } from '@prisma/client'

export default function EditItemForm({ item, categories }: { item: Item, categories: Category[] }) {
    // @ts-ignore
    const [state, action, isPending] = useActionState(updateItem, {})

    const [neccessaryRate, setNeccessaryRate] = useState(item.neccessary_rate)
    const [wishRate, setWishRate] = useState(item.wish_rate)
    const [interestRate, setInterestRate] = useState(item.interest_rate)

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="id" value={item.id} />

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Barang</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={item.name}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
                {state?.errors?.name && <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>}
            </div>

            {/* Category */}
            <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                    id="categoryId"
                    name="categoryId"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    defaultValue={item.categoryId || ""}
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
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">Ganti Foto (Opsional)</label>
                <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-gray-500">Foto saat ini: {item.photoUrl || 'Tidak ada'}</p>
            </div>

            {/* Photo URL */}
            <div>
                <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">URL Foto (Opsional)</label>
                <input
                    type="url"
                    id="photoUrl"
                    name="photoUrl"
                    defaultValue={item.photoUrl}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                />
                {state?.errors?.photoUrl && <p className="mt-1 text-sm text-red-600">{state.errors.photoUrl}</p>}
            </div>

            {/* Link */}
            <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link Pembelian (Opsional)</label>
                <input
                    type="url"
                    id="link"
                    name="link"
                    defaultValue={item.link}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
                {state?.errors?.link && <p className="mt-1 text-sm text-red-600">{state.errors.link}</p>}
            </div>

            {/* Price */}
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Harga (IDR)</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    defaultValue={item.price.toString()}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
                {state?.errors?.price && <p className="mt-1 text-sm text-red-600">{state.errors.price}</p>}
            </div>

            {/* Reasoning */}
            <div>
                <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700">Alasan Menginginkan</label>
                <textarea
                    id="reasoning"
                    name="reasoning"
                    rows={3}
                    defaultValue={item.reasoning}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
                {state?.errors?.reasoning && <p className="mt-1 text-sm text-red-600">{state.errors.reasoning}</p>}
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <div className="flex justify-between">
                        <label htmlFor="neccessary_rate" className="block text-sm font-medium text-gray-700">Seberapa Butuh</label>
                        <span className="text-sm font-bold text-blue-600">{neccessaryRate}</span>
                    </div>
                    <input
                        type="range"
                        id="neccessary_rate"
                        name="neccessary_rate"
                        min="0"
                        max="10"
                        value={neccessaryRate}
                        onChange={(e) => setNeccessaryRate(Number(e.target.value))}
                        className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <div className="flex justify-between">
                        <label htmlFor="wish_rate" className="block text-sm font-medium text-gray-700">Seberapa Ingin</label>
                        <span className="text-sm font-bold text-blue-600">{wishRate}</span>
                    </div>
                    <input
                        type="range"
                        id="wish_rate"
                        name="wish_rate"
                        min="0"
                        max="10"
                        value={wishRate}
                        onChange={(e) => setWishRate(Number(e.target.value))}
                        className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <div className="flex justify-between">
                        <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700">Seberapa Tertarik</label>
                        <span className="text-sm font-bold text-blue-600">{interestRate}</span>
                    </div>
                    <input
                        type="range"
                        id="interest_rate"
                        name="interest_rate"
                        min="0"
                        max="10"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Batal
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isPending ? 'Menyimpan...' : 'Update Barang'}
                </button>
            </div>
        </form>
    )
}
