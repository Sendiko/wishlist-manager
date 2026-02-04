'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const ItemSchema = z.object({
    name: z.string().min(1, { message: 'Nama barang wajib diisi.' }).trim(),
    photoUrl: z.string().optional(),
    link: z.string().url({ message: 'Link pembelian tidak valid.' }).or(z.literal('')),
    price: z.coerce.number().min(0, { message: 'Harga tidak boleh negatif.' }),
    reasoning: z.string().trim(),
    neccessary_rate: z.coerce.number().min(0).max(10),
    wish_rate: z.coerce.number().min(0).max(10),
    interest_rate: z.coerce.number().min(0).max(10),
    categoryId: z.string().optional(),
})

export type FormState = {
    errors?: {
        name?: string[]
        photoUrl?: string[]
        link?: string[]
        price?: string[]
        reasoning?: string[]
        neccessary_rate?: string[]
        wish_rate?: string[]
        interest_rate?: string[]
        categoryId?: string[]
    }
    message?: string
}

export async function addItem(prevState: FormState, formData: FormData) {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    // Handle File Upload
    const photoFile = formData.get('photo') as File | null
    let uploadedPhotoUrl = ''

    if (photoFile && photoFile.size > 0 && photoFile.name !== 'undefined') {
        try {
            const bytes = await photoFile.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Create uploads directory if it doesn't exist
            const uploadDir = join(process.cwd(), 'public', 'uploads')
            await mkdir(uploadDir, { recursive: true })

            // Create unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            const filename = uniqueSuffix + '-' + photoFile.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
            const filepath = join(uploadDir, filename)

            await writeFile(filepath, buffer)
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            uploadedPhotoUrl = `${baseUrl}/uploads/${filename}`
        } catch (error) {
            console.error('File upload error:', error)
            return { message: 'Gagal mengupload foto.' }
        }
    }

    const rawFormData = {
        name: formData.get('name'),
        photoUrl: uploadedPhotoUrl || formData.get('photoUrl') || '', // Use uploaded URL if available, else text input
        link: formData.get('link'),
        price: formData.get('price'),
        reasoning: formData.get('reasoning'),
        neccessary_rate: formData.get('neccessary_rate'),
        wish_rate: formData.get('wish_rate'),
        interest_rate: formData.get('interest_rate'),
        categoryId: formData.get('categoryId'),
    }

    const validation = ItemSchema.safeParse(rawFormData)

    if (!validation.success) {
        return {
            errors: validation.error.flatten().fieldErrors,
        }
    }

    const { name, photoUrl, link, price, reasoning, neccessary_rate, wish_rate, interest_rate, categoryId } = validation.data

    try {
        await prisma.item.create({
            data: {
                name,
                photoUrl: photoUrl || '',
                link,
                price: BigInt(price),
                reasoning,
                neccessary_rate,
                wish_rate,
                interest_rate,
                userId: session.userId,
                categoryId: categoryId || null,
            },
        })
    } catch (error: any) {
        return {
            message: 'Gagal membuat item: ' + error.message,
        }
    }

    redirect('/dashboard')
}

export async function toggleItemPurchased(itemId: string, currentStatus: boolean) {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    try {
        await prisma.item.update({
            where: {
                id: itemId,
                userId: session.userId,
            },
            data: {
                isPurchased: !currentStatus,
            },
        })
    } catch (error) {
        console.error('Failed to toggle purchased status:', error)
        return { message: 'Gagal mengubah status.' }
    }

    redirect('/dashboard')
}

export async function deleteItem(itemId: string) {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    try {
        // Verify ownership
        const item = await prisma.item.findUnique({
            where: { id: itemId },
        })

        if (!item || item.userId !== session.userId) {
            return { message: 'Item tidak ditemukan atau akses ditolak.' }
        }

        await prisma.item.delete({
            where: { id: itemId },
        })
    } catch (error) {
        console.error('Failed to delete item:', error)
        return { message: 'Gagal menghapus item.' }
    }

    redirect('/dashboard')
}

export async function updateItem(prevState: FormState, formData: FormData) {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    const itemId = formData.get('id') as string
    if (!itemId) {
        return { message: 'ID Item tidak valid.' }
    }

    // Handle File Upload
    const photoFile = formData.get('photo') as File | null
    let uploadedPhotoUrl = ''

    if (photoFile && photoFile.size > 0 && photoFile.name !== 'undefined') {
        try {
            const bytes = await photoFile.arrayBuffer()
            const buffer = Buffer.from(bytes)

            const uploadDir = join(process.cwd(), 'public', 'uploads')
            await mkdir(uploadDir, { recursive: true })

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            const filename = uniqueSuffix + '-' + photoFile.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
            const filepath = join(uploadDir, filename)

            await writeFile(filepath, buffer)
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            uploadedPhotoUrl = `${baseUrl}/uploads/${filename}`
        } catch (error) {
            console.error('File upload error:', error)
            return { message: 'Gagal mengupload foto.' }
        }
    }

    const rawFormData = {
        name: formData.get('name'),
        photoUrl: uploadedPhotoUrl || formData.get('photoUrl') || '',
        link: formData.get('link'),
        price: formData.get('price'),
        reasoning: formData.get('reasoning'),
        neccessary_rate: formData.get('neccessary_rate'),
        wish_rate: formData.get('wish_rate'),
        interest_rate: formData.get('interest_rate'),
        categoryId: formData.get('categoryId'),
    }

    const validation = ItemSchema.safeParse(rawFormData)

    if (!validation.success) {
        return {
            errors: validation.error.flatten().fieldErrors,
        }
    }

    const { name, photoUrl, link, price, reasoning, neccessary_rate, wish_rate, interest_rate, categoryId } = validation.data

    try {
        // Check ownership
        const existingItem = await prisma.item.findUnique({
            where: { id: itemId },
        })

        if (!existingItem || existingItem.userId !== session.userId) {
            return { message: 'Item tidak ditemukan atau akses ditolak.' }
        }

        const dataToUpdate: any = {
            name,
            link,
            price: BigInt(price),
            reasoning,
            neccessary_rate,
            wish_rate,
            interest_rate,
            categoryId: categoryId || null,
        }

        if (photoUrl) {
            dataToUpdate.photoUrl = photoUrl
        }

        await prisma.item.update({
            where: {
                id: itemId,
                userId: session.userId,
            },
            data: dataToUpdate,
        })
    } catch (error: any) {
        console.error('Update error:', error)
        return {
            message: 'Gagal mengupdate item: ' + error.message,
        }
    }

    redirect('/dashboard')
}
