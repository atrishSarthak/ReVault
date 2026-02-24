import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { encryptCredentials } from '../../lib/encryption'
import axios from 'axios'

const CATEGORIES = ['GAMING', 'DIGITAL_CONTENT', 'EVENT_TICKET']

export default function CreateListing() {
    const { getToken } = useAuth()
    const [form, setForm] = useState({
        title: '', description: '', category: 'GAMING',
        price: ''
    })
    const [creds, setCreds] = useState({ username: '', password: '', barcode: '' })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Fetch server's RSA public key
            const { data: keyData } = await axios.get('http://localhost:3000/api/keys/public')

            // 2. Encrypt credentials in browser exactly as required based on the category
            const credentialsToEncrypt = form.category === 'EVENT_TICKET'
                ? { barcode: creds.barcode }
                : { username: creds.username, password: creds.password }

            const encrypted = await encryptCredentials(credentialsToEncrypt, keyData.publicKey)

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
            // Automatically redirect to marketplace so the user can see their validated asset
            setTimeout(() => window.location.href = '/marketplace', 1500)
        } catch (err) {
            console.error(err)
            alert("Error, try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#4ade80', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            Listing submitted for marketplace display!
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#09090b', display: 'flex', flexDirection: 'column' }}>
            <form onSubmit={handleSubmit} style={{ margin: 'auto', width: '100%', maxWidth: '32rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'sans-serif' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Create Listing</h1>

                <input placeholder="Title" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#27272a', color: 'white', border: '1px solid #3f3f46' }} required />

                <textarea placeholder="Description" rows={3} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#27272a', color: 'white', border: '1px solid #3f3f46' }} required />

                <select value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#27272a', color: 'white', border: '1px solid #3f3f46' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <input type="number" step="0.01" placeholder="Price (USD)" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#27272a', color: 'white', border: '1px solid #3f3f46' }} required />

                <div style={{ border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.25rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ color: '#4ade80', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>🔒 Credentials — encrypted in your browser before submission</p>

                    {form.category === 'EVENT_TICKET' ? (
                        <input placeholder="Barcode or Ticket Number" value={creds.barcode}
                            onChange={e => setCreds({ ...creds, barcode: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#18181b', color: 'white', border: '1px solid #3f3f46' }} required />
                    ) : (
                        <>
                            <input placeholder="Username / Email" value={creds.username}
                                onChange={e => setCreds({ ...creds, username: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#18181b', color: 'white', border: '1px solid #3f3f46' }} required />
                            <input type="password" placeholder="Password" value={creds.password}
                                onChange={e => setCreds({ ...creds, password: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#18181b', color: 'white', border: '1px solid #3f3f46' }} required />
                        </>
                    )}
                </div>

                <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#22c55e', color: 'black', fontWeight: 'bold', borderRadius: '0.25rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Encrypting & Submitting...' : 'Submit Listing'}
                </button>
            </form>
        </div>
    )
}
