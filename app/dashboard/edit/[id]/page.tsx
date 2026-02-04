import { getSession } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditItemForm from './edit-form'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    const { id } = await params
    const item = await prisma.item.findUnique({
        where: { id },
    })

    if (!item || item.userId !== session.userId) {
        notFound()
    }

    const categories = await prisma.category.findMany()

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Barang</h1>
                <EditItemForm item={item} categories={categories} />
            </div>
        </div>
    )
}
