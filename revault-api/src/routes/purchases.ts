import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const router = Router()
const prisma = new PrismaClient()

// Helper middleware for auth
const requireAuth = (req: any, res: any, next: any) => {
    if (!req.auth?.userId) return res.status(401).json({ error: 'Unauthorized payload' })
    next()
}

// POST /api/purchases — buyer initiates purchase
router.post('/', requireAuth, async (req: any, res) => {
    const { assetId } = req.body
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const asset = await prisma.asset.findUnique({ where: { id: assetId } })
    if (!asset || asset.status !== 'VERIFIED')
        return res.status(400).json({ error: 'Asset not available' })

    if (asset.sellerId === user.id)
        return res.status(400).json({ error: 'Cannot buy your own listing' })

    const transaction = await prisma.transaction.create({
        data: {
            assetId,
            buyerId: user.id,
            amount: asset.price,
            status: 'COMPLETED' // Mock payment — replace with Stripe later
        }
    })

    // Mark asset as sold
    await prisma.asset.update({
        where: { id: assetId },
        data: { status: 'SOLD' }
    })

    res.json(transaction)
})

// GET /api/purchases/my — buyer's purchase history
router.get('/my', requireAuth, async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const purchases = await prisma.transaction.findMany({
        where: { buyerId: user.id },
        include: { asset: { select: { title: true, category: true, price: true } } },
        orderBy: { createdAt: 'desc' }
    })

    res.json(purchases)
})

// GET /api/purchases/:txId/credentials — decrypt and return credentials
router.get('/:txId/credentials', requireAuth, async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const transaction = await prisma.transaction.findUnique({
        where: { id: req.params.txId },
        include: { asset: { include: { credential: true } } }
    })

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' })
    if (transaction.buyerId !== user.id) return res.status(403).json({ error: 'Forbidden' })
    if (!transaction.asset.credential) return res.status(404).json({ error: 'No credentials found' })

    const { encryptedKey } = transaction.asset.credential

    // Decrypt the AES key using server's RSA private key
    const privateKey = process.env.RSA_PRIVATE_KEY!.replace(/\\n/g, '\n')
    const decryptedAesKey = crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(encryptedKey, 'base64')
    )

    // Return ciphertext + decrypted AES key to browser
    // Browser will do final decryption locally
    res.json({
        ciphertext: transaction.asset.credential.ciphertext,
        iv: transaction.asset.credential.iv,
        aesKey: decryptedAesKey.toString('base64') // AES key, decrypted server-side
    })
})

export default router
