import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Middleware to verify admin role
async function requireAdmin(req: any, res: any, next: any) {
    const clerkId = req.auth?.userId
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized payload' })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })
    next()
}

// GET all pending assets
router.get('/queue', requireAdmin, async (req, res) => {
    const assets = await prisma.asset.findMany({
        where: { status: 'PENDING' },
        include: { seller: { select: { email: true } } },
        orderBy: { createdAt: 'asc' }
    })
    res.json(assets)
})

// PATCH verify or reject
router.patch('/:id/review', requireAdmin, async (req, res) => {
    const { action, note } = req.body // action: 'VERIFY' | 'REJECT'

    const asset = await prisma.asset.update({
        where: { id: req.params.id },
        data: {
            status: action === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
            verificationNote: note || null
        }
    })
    res.json(asset)
})

export default router
