import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/assets', async (req: any, res) => {
    const clerkId = req.auth?.userId
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized payload' })
    const { title, description, category, price, imageUrl, encryptedCredential } = req.body

    let user = await prisma.user.findUnique({ where: { clerkId } })

    if (!user) {
        // Auto-provision locally to resolve webhook synchronization gap
        user = await prisma.user.create({
            data: {
                clerkId,
                email: `user_${clerkId.slice(0, 8)}@revault-local.app`,
                role: 'SELLER'
            }
        })
    }

    const asset = await prisma.asset.create({
        data: {
            title, description, category, price: parseFloat(price.toString()), imageUrl,
            sellerId: user.id,
            status: 'PENDING',
            credential: {
                create: {
                    ciphertext: encryptedCredential.ciphertext,
                    encryptedKey: encryptedCredential.encryptedKey,
                    iv: encryptedCredential.iv
                }
            }
        }
    })

    res.json(asset)
})

export default router
