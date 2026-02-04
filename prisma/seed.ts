import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
    const categories = [
        'Electronics',
        'Fashion',
        'Home & Living',
        'Toys & Hobbies',
        'Automotive',
        'Books & Stationery',
        'Sports',
        'Health & Beauty',
        'Others'
    ]

    for (const name of categories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        })
    }

    console.log('Categories seeded successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
