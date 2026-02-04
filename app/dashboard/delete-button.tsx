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
                className="text-error hover:text-on-error hover:bg-error/10 text-xs font-medium border border-error/50 rounded px-2 py-1 transition-colors disabled:opacity-50"
            >
                {isDeleting ? '...' : 'Hapus'}
            </button>
        </form>
    )
}
