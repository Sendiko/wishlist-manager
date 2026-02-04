import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AddItemForm from './add-form'

export default async function AddItemPage() {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    const categories = await prisma.category.findMany()

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Tambah Barang Baru</h1>
                <AddItemForm categories={categories} />
            </div>
        </div>
    )
}
