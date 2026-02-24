import express from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@clerk/express'

const router = express.Router()
const prisma = new PrismaClient()

// Protect all routes in this router
router.use(requireAuth())

router.post('/assets', async (req, res) => {
    try {
        // @ts-ignore
        const clerkId = req.auth.userId
        if (!clerkId) {
            return void res.status(401).json({ error: 'Unauthorized payload' })
        }

        const user = await prisma.user.findUnique({
            where: { clerkId }
        })

        if (!user) {
            return void res.status(404).json({ error: 'User mapping not found. Webhook synchronization delay.' })
        }

        const { title, description, category, price, imageUrl, credential } = req.body

        // This transaction atomically writes both the asset and the encrypted credentials 
        // using the one-to-one schema relationship we built earlier.
        const asset = await prisma.asset.create({
            data: {
                title,
                description,
                category,
                price: parseFloat(price),
                imageUrl,
                sellerId: user.id,
                credential: {
                    create: {
                        ciphertext: credential.ciphertext,
                        encryptedKey: credential.encryptedKey,
                        iv: credential.iv
                    }
                }
            }
        })

        res.status(201).json({ success: true, asset })
    } catch (error) {
        console.error('Failed to vault asset:', error)
        res.status(500).json({ error: 'Failed to vault asset securely.' })
    }
})

export default router
