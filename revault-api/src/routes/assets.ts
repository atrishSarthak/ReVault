import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
    const { category, search } = req.query

    const assets = await prisma.asset.findMany({
        where: {
            status: 'VERIFIED',
            ...(category && category !== 'ALL' ? { category: category as any } : {}),
            ...(search ? { title: { contains: search as string, mode: 'insensitive' } } : {})
        },
        include: { seller: { select: { email: true } } },
        orderBy: { createdAt: 'desc' }
    })

    res.json(assets)
})

export default router
