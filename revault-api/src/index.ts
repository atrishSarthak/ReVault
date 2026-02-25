import 'dotenv/config'
import express from 'express'
import cors from 'cors'
// import { clerkMiddleware, requireAuth } from '@clerk/express'
import assetRoutes from './routes/assets'
import webhookRoutes from './routes/webhooks'

import sellerRoutes from './routes/seller'

import { clerkMiddleware } from '@clerk/express'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))

// Clerk Webhooks must use express.raw(), so they need to be registered BEFORE express.json()
app.use('/api/webhooks', webhookRoutes)

app.use(express.json())

app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
}))

// Routes
app.use('/api/assets', assetRoutes)

// Protected endpoints using Clerk
app.use('/api/seller', sellerRoutes)

// Expose public key for Client-Side RSA wrapping
app.get('/api/keys/public', (req, res) => {
    // Standardize whitespace handling by replacing \n literals with actual newlines
    const pubKey = process.env.RSA_PUBLIC_KEY ? process.env.RSA_PUBLIC_KEY.replace(/\\n/g, '\n') : '';
    res.json({ publicKey: pubKey })
})

app.listen(3000, () => console.log('Server running on 3000'))
