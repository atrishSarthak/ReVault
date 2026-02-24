import express from 'express'
import cors from 'cors'
import assetRoutes from './routes/assets'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/assets', assetRoutes)

app.listen(3000, () => console.log('Server running on 3000'))
