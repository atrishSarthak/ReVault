import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const seller = await prisma.user.upsert({
        where: { email: 'seller@test.com' },
        update: {},
        create: { clerkId: 'seed_user_1', email: 'seller@test.com', role: 'SELLER' }
    })

    // We are using the high-quality assets already requested by the user
    await prisma.asset.createMany({
        data: [
            {
                title: 'Ultra Miami 2025',
                description: 'Premium VIP Access, Backstage Included',
                category: 'EVENT_TICKET',
                price: 2499.00,
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: '/CardsReVault/Events1.png'
            },
            {
                title: 'Neon Genesis Pack',
                description: 'Elite 1-of-1 Digital Art piece',
                category: 'DIGITAL_CONTENT',
                price: 15.5, // 15.5 ETH etc.
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: '/CardsReVault/DigitalContent1.jpg'
            },
            {
                title: 'Diamond Rank · LoL',
                description: 'Grandmaster MMR, 180+ skins unlocked',
                category: 'GAMING',
                price: 450.00,
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: '/CardsReVault/GamingAcc1.png'
            },
            {
                title: 'Bored Ape #453',
                description: 'Iconic Bored Ape Yacht Club verified asset',
                category: 'DIGITAL_CONTENT',
                price: 85.0,
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&q=80&w=400'
            }, // Extra seed items since marketplace needs to look full
            {
                title: 'Tomorrowland Weekend 1',
                description: 'Full Madness Pass with Dreamville access',
                category: 'EVENT_TICKET',
                price: 850.00,
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400'
            },
            {
                title: 'CS:GO Dragon Lore',
                description: 'Factory New AWP Dragon Lore',
                category: 'GAMING',
                price: 9500.00,
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400'
            },
            {
                title: 'Super Bowl LVIII VIP',
                description: 'Club Level, Section 100, Row 5',
                category: 'EVENT_TICKET',
                price: 5400.00,
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: 'https://images.unsplash.com/photo-1628867332768-45ad8b9e6dc3?auto=format&fit=crop&q=80&w=400'
            },
            {
                title: 'Radiant Valorant Account',
                description: 'Rank 404, RGX Pro Bundle, Prime Vandal',
                category: 'GAMING',
                price: 520.00,
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: 'https://images.unsplash.com/photo-1542652694-40abf5262829?auto=format&fit=crop&q=80&w=400'
            },
            {
                title: 'CryptoPunk #334',
                description: 'Hoodie CryptoPunk classic',
                category: 'DIGITAL_CONTENT',
                price: 45.0,
                status: 'VERIFIED',
                sellerId: seller.id,
                imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400'
            },
        ]
    })
    console.log("Database perfectly seeded with premium ReVault assets!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
