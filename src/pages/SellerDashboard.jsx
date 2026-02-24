import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import Navbar from '../components/layout/Navbar'
import { encryptCredentialLocally } from '../utils/encryption'
import './SellerDashboard.css'

export default function SellerDashboard() {
    const { getToken } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'GAMING',
        price: '',
        username: '',
        password: '',
        ticket: ''
    })
    const [status, setStatus] = useState('idle') // idle, encrypting, uploading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('encrypting')

        try {
            // 1. Fetch Server's RSA Public Key for key-wrapping
            const { data: keyData } = await axios.get('http://localhost:3000/api/keys/public')

            // 1.5. Compile the raw credential object based on current category
            let credentialRaw = {}
            if (formData.category === 'EVENT_TICKET') {
                credentialRaw = { ticket: formData.ticket }
            } else {
                credentialRaw = { username: formData.username, password: formData.password }
            }

            // 2. Encrypt the credential locally (Zero-Knowledge Architecture)
            const encryptedPayload = await encryptCredentialLocally(credentialRaw, keyData.publicKey)

            setStatus('uploading')

            // 3. Get secure JWT from Clerk
            const token = await getToken()

            // 4. Send encrypted payload to our protected Express API
            await axios.post('http://localhost:3000/api/seller/assets', {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: parseFloat(formData.price),
                imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400', // Auto-fallback for aesthetic grid
                credential: encryptedPayload // The ciphertext, iv, and RSA-wrapped AES key
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setStatus('success')
            setTimeout(() => navigate('/marketplace'), 2000)

        } catch (err) {
            console.error(err)
            setStatus('error')
        }
    }

    return (
        <div className="seller-dash">
            <Navbar dark={false} />

            <main className="seller-main">
                <div className="seller-card">
                    <h1 className="seller-title">Create New Listing</h1>
                    <p className="seller-subtitle">Your credentials are encrypted locally before transmission.</p>

                    <form onSubmit={handleSubmit} className="seller-form">
                        <div className="form-group">
                            <label>Asset Title</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Diamond Rank LoL Account" />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the asset..." />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="GAMING">Gaming Account</option>
                                    <option value="DIGITAL_CONTENT">Digital Content</option>
                                    <option value="EVENT_TICKET">Event Ticket</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Price (ETH)</label>
                                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.5" />
                            </div>
                        </div>

                        <div className="form-group credential-group">
                            <label>
                                Secret Credentials
                                <span className="secure-badge">🔒 End-to-End Encrypted</span>
                            </label>

                            {formData.category === 'EVENT_TICKET' ? (
                                <input required type="text" value={formData.ticket} onChange={e => setFormData({ ...formData, ticket: e.target.value })} placeholder="Enter Ticket Number or Barcode" />
                            ) : (
                                <div className="form-row">
                                    <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="Username / Email" />
                                    <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Password" />
                                </div>
                            )}

                            <small>This will be converted to military-grade AES ciphertext before leaving your browser.</small>
                        </div>

                        <button type="submit" disabled={status !== 'idle'} className={`submit-btn ${status}`}>
                            {status === 'idle' ? 'Encrypt & List Asset' :
                                status === 'encrypting' ? '🔒 Encrypting Locally...' :
                                    status === 'uploading' ? '⚡ Broadcasting to Vault...' :
                                        status === 'success' ? '✅ Asset Listed!' : '❌ Error, try again'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
