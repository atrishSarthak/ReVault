import express from 'express'
import { Webhook } from 'svix'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!SIGNING_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers and body
    const headers = req.headers
    const payload = req.body

    // Get the Svix headers for verification
    const svix_id = headers['svix-id'] as string
    const svix_timestamp = headers['svix-timestamp'] as string
    const svix_signature = headers['svix-signature'] as string

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return void res.status(400).json({
            success: false,
            message: 'Error occured -- no svix headers',
        })
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(SIGNING_SECRET)

    let evt: any

    // Attempt to verify the incoming webhook
    // If successful, the payload will be available from 'evt'
    // If the verification fails, error out and  return error code
    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        })
    } catch (err: any) {
        console.log('Error verifying webhook:', err.message)
        return void res.status(400).json({
            success: false,
            message: err.message,
        })
    }

    // Do something with the payload
    const { id } = evt.data
    const eventType = evt.type

    if (eventType === 'user.created') {
        const { email_addresses } = evt.data
        const email = email_addresses && email_addresses[0]?.email_address

        if (email) {
            try {
                await prisma.user.create({
                    data: {
                        clerkId: id,
                        email: email,
                        role: 'BUYER' // Default role
                    }
                })
                console.log(`User ${id} created in database!`)
            } catch (dbError) {
                console.error('Failed to create user in DB:', dbError)
            }
        }
    }

    res.status(200).json({
        success: true,
        message: 'Webhook received',
    })
})

export default router
