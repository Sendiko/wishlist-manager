import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { chmod } from 'fs/promises'

const ItemSchema = z.object({
    name: z.string().min(1, { message: 'Nama barang wajib diisi.' }).trim(),
    photoUrl: z.string().optional(),
    link: z.string().url({ message: 'Link pembelian tidak valid.' }).or(z.literal('')),
    price: z.coerce.number().min(0, { message: 'Harga tidak boleh negatif.' }),
    reasoning: z.string().trim(),
    neccessary_rate: z.coerce.number().min(0).max(10),
    wish_rate: z.coerce.number().min(0).max(10),
    interest_rate: z.coerce.number().min(0).max(10),
    categoryId: z.string().optional().nullable(),
})

// Helper to map BigInt price and absolute image URLs
function mapItem(item: any, baseUrl: string) {
    return {
        id: item.id,
        name: item.name,
        photoUrl: item.photoUrl && item.photoUrl.startsWith('/') ? `${baseUrl}${item.photoUrl}` : (item.photoUrl || ''),
        link: item.link,
        price: item.price.toString(),
        priceNumber: Number(item.price),
        reasoning: item.reasoning,
        neccessary_rate: item.neccessary_rate,
        wish_rate: item.wish_rate,
        interest_rate: item.interest_rate,
        isPurchased: item.isPurchased,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        userId: item.userId,
        categoryId: item.categoryId,
        category: item.category || null,
        totalScore: item.wish_rate + item.neccessary_rate + item.interest_rate
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await authenticateRequest(req)
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
        }

        const { id } = await params

        const item = await prisma.item.findFirst({
            where: {
                id,
                userId: session.userId,
            },
            include: {
                category: true,
            },
        })

        if (!item) {
            return NextResponse.json({ message: 'Item not found or access denied.' }, { status: 404 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        return NextResponse.json({ item: mapItem(item, baseUrl) }, { status: 200 })
    } catch (error: any) {
        console.error('Get Item Detail API error:', error)
        return NextResponse.json({
            message: 'An error occurred fetching item details.',
            error: error.message,
        }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await authenticateRequest(req)
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
        }

        const { id } = await params

        // Check ownership
        const existingItem = await prisma.item.findUnique({
            where: { id },
        })

        if (!existingItem || existingItem.userId !== session.userId) {
            return NextResponse.json({ message: 'Item not found or access denied.' }, { status: 404 })
        }

        const contentType = req.headers.get('content-type') || ''
        let rawData: any = {}
        let uploadedPhotoUrl = ''

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData()

            // Handle File Upload
            const photoFile = formData.get('photo') as File | null
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
                    await chmod(filepath, 0o644)

                    uploadedPhotoUrl = `/uploads/${filename}`
                } catch (err) {
                    console.error('File upload error:', err)
                    return NextResponse.json({ message: 'Failed to upload photo.' }, { status: 500 })
                }
            }

            rawData = {
                name: formData.get('name'),
                photoUrl: uploadedPhotoUrl || formData.get('photoUrl') || '',
                link: formData.get('link'),
                price: formData.get('price'),
                reasoning: formData.get('reasoning'),
                neccessary_rate: formData.get('neccessary_rate'),
                wish_rate: formData.get('wish_rate'),
                interest_rate: formData.get('interest_rate'),
                categoryId: formData.get('categoryId') || null,
            }
        } else {
            const body = await req.json()
            rawData = {
                ...body,
                categoryId: body.categoryId || null,
            }
        }

        const validation = ItemSchema.safeParse(rawData)
        if (!validation.success) {
            return NextResponse.json({
                message: 'Validation failed.',
                errors: validation.error.flatten().fieldErrors,
            }, { status: 400 })
        }

        const { name, photoUrl, link, price, reasoning, neccessary_rate, wish_rate, interest_rate, categoryId } = validation.data

        // Handle category verification if provided
        if (categoryId) {
            const categoryExists = await prisma.category.findUnique({
                where: { id: categoryId },
            })
            if (!categoryExists) {
                return NextResponse.json({ message: 'Category not found.' }, { status: 400 })
            }
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

        const updatedItem = await prisma.item.update({
            where: { id },
            data: dataToUpdate,
            include: {
                category: true,
            },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        return NextResponse.json({
            message: 'Item updated successfully.',
            item: mapItem(updatedItem, baseUrl)
        }, { status: 200 })
    } catch (error: any) {
        console.error('Update Item API error:', error)
        return NextResponse.json({
            message: 'An error occurred updating item.',
            error: error.message,
        }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await authenticateRequest(req)
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const item = await prisma.item.findUnique({
            where: { id },
        })

        if (!item || item.userId !== session.userId) {
            return NextResponse.json({ message: 'Item not found or access denied.' }, { status: 404 })
        }

        await prisma.item.delete({
            where: { id },
        })

        return NextResponse.json({
            message: 'Item deleted successfully.'
        }, { status: 200 })
    } catch (error: any) {
        console.error('Delete Item API error:', error)
        return NextResponse.json({
            message: 'An error occurred deleting item.',
            error: error.message,
        }, { status: 500 })
    }
}
