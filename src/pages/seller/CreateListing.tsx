import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { encryptCredentials } from '../../lib/encryption'
import axios from 'axios'
import './CreateListing.css'

const CATEGORIES = ['GAMING', 'DIGITAL_CONTENT', 'EVENT_TICKET']

export default function CreateListing() {
    const { getToken } = useAuth()
    const [form, setForm] = useState({
        title: '', description: '', category: 'GAMING',
        price: '', imageUrl: ''
    })
    const [creds, setCreds] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Fetch server's RSA public key
            const { data: keyData } = await axios.get('http://localhost:3000/api/keys/public')

            // 2. Encrypt credentials in browser
            const encrypted = await encryptCredentials(creds, keyData.publicKey)

            // 3. Get Clerk JWT for authenticated request
            const token = await getToken()

            // 4. Send asset + encrypted credentials to backend
            await axios.post('http://localhost:3000/api/seller/assets', {
                ...form,
                price: parseFloat(form.price),
                encryptedCredential: encrypted
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setSuccess(true)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (success) return (
        <div className="success-message">
            Listing submitted for admin review!
        </div>
    )

    return (
        <div className="create-listing-page">
            <form onSubmit={handleSubmit} className="create-listing-form">
                <h1 className="create-listing-title">Create Listing</h1>

                <input placeholder="Title" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="create-listing-input" required />

                <textarea placeholder="Description" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="create-listing-textarea" required />

                <select value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="create-listing-select">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <input type="number" placeholder="Price (USD)" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="create-listing-input" required />

                <input placeholder="Image URL (Optional)" value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    className="create-listing-input" />

                <div className="encryption-container">
                    <p className="encryption-notice">🔒 Credentials — encrypted in your browser before submission</p>
                    <input placeholder="Username / Email" value={creds.username}
                        onChange={e => setCreds({ ...creds, username: e.target.value })}
                        className="create-listing-input encryption-input" required />
                    <input type="password" placeholder="Password" value={creds.password}
                        onChange={e => setCreds({ ...creds, password: e.target.value })}
                        className="create-listing-input encryption-input" required />
                </div>

                <button type="submit" disabled={loading} className="create-listing-submit">
                    {loading ? 'Encrypting & Submitting...' : 'Submit Listing'}
                </button>
            </form>
        </div>
    )
}
