import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createErrorResponse } from '@/lib/api-response'
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
        price: item.price.toString(), // BigInt serialized as string
        priceNumber: Number(item.price), // BigInt serialized as number
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

export async function GET(req: Request) {
    try {
        const session = await authenticateRequest(req)
        if (!session) {
            return createErrorResponse(401, 'Unauthorized.', 'Unauthorized')
        }

        const { searchParams } = new URL(req.url)
        const categoryId = searchParams.get('categoryId')

        const whereClause: any = { userId: session.userId }
        if (categoryId) {
            whereClause.categoryId = categoryId
        }

        const itemsRaw = await prisma.item.findMany({
            where: whereClause,
            include: {
                category: true,
            },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        const items = itemsRaw
            .map(item => mapItem(item, baseUrl))
            .sort((a, b) => {
                if (a.isPurchased !== b.isPurchased) {
                    return a.isPurchased ? 1 : -1
                }
                return b.totalScore - a.totalScore
            })

        return NextResponse.json({ items }, { status: 200 })
    } catch (error: any) {
        console.error('List Items API error:', error)
        return createErrorResponse(500, 'An error occurred fetching items.', error.message)
    }
}

export async function POST(req: Request) {
    try {
        const session = await authenticateRequest(req)
        if (!session) {
            return createErrorResponse(401, 'Unauthorized.', 'Unauthorized')
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
                    return createErrorResponse(500, 'Failed to upload photo.', 'File upload error')
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
            return createErrorResponse(400, 'Validation failed.', validation.error.flatten().fieldErrors)
        }

        const { name, photoUrl, link, price, reasoning, neccessary_rate, wish_rate, interest_rate, categoryId } = validation.data

        // Handle category verification if provided
        if (categoryId) {
            const categoryExists = await prisma.category.findUnique({
                where: { id: categoryId },
            })
            if (!categoryExists) {
                return createErrorResponse(400, 'Category not found.', 'Category not found')
            }
        }

        const newItem = await prisma.item.create({
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
            include: {
                category: true,
            },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        return NextResponse.json({
            message: 'Item created successfully.',
            item: mapItem(newItem, baseUrl)
        }, { status: 201 })
    } catch (error: any) {
        console.error('Create Item API error:', error)
        return createErrorResponse(500, 'An error occurred creating item.', error.message)
    }
}
