'use client'

import { deleteItem } from '@/app/actions/item'
import { useState } from 'react'

export default function DeleteButton({ itemId }: { itemId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (confirm('Apakah anda yakin ingin menghapus barang ini?')) {
            setIsDeleting(true)
            await deleteItem(itemId)
        }
    }

    return (
        <form onSubmit={handleDelete}>
            <button
                type="submit"
                disabled={isDeleting}
                className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 hover:bg-red-50 rounded px-2 py-1 transition-colors"
            >
                {isDeleting ? '...' : 'Hapus'}
            </button>
        </form>
    )
}
