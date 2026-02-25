import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { useState } from 'react'
import axios from 'axios'
import { decryptCredentials } from '../../lib/encryption'
import './BuyerDashboard.css'

const API = 'http://localhost:3000'

export default function BuyerDashboard() {
    const { getToken } = useAuth()
    const [revealed, setRevealed] = useState<Record<string, object>>({})

    const { data: purchases, isLoading } = useQuery({
        queryKey: ['my-purchases'],
        queryFn: async () => {
            const token = await getToken()
            const { data } = await axios.get(`${API}/api/purchases/my`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return data
        }
    })

    async function revealCredentials(txId: string) {
        try {
            const token = await getToken()
            const { data } = await axios.get(`${API}/api/purchases/${txId}/credentials`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Final decryption happens HERE in the browser
            const creds = decryptCredentials(data.ciphertext, data.iv, data.aesKey)
            setRevealed(prev => ({ ...prev, [txId]: creds }))
        } catch (error) {
            console.error('Failed to reveal credentials:', error)
            alert('Failed to decrypt credentials.')
        }
    }

    if (isLoading) return <div className="buyer-dashboard-page"><div className="buyer-container"><p className="buyer-title" style={{ color: '#a1a1aa' }}>Loading...</p></div></div>

    return (
        <div className="buyer-dashboard-page">
            <div className="buyer-container">
                <h1 className="buyer-title">My Purchases</h1>

                {purchases?.length === 0 && (
                    <p className="buyer-empty">No purchases yet.</p>
                )}

                <div className="buyer-list">
                    {purchases?.map((tx: any) => (
                        <div key={tx.id} className="buyer-card">
                            <div className="buyer-card-header">
                                <div>
                                    <span className="buyer-card-category">{tx.asset.category}</span>
                                    <h2 className="buyer-card-title">{tx.asset.title}</h2>
                                    <p className="buyer-card-desc">${tx.amount} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {revealed[tx.id] ? (
                                <div className="buyer-decrypted">
                                    <p className="buyer-decrypted-label">🔓 DECRYPTED CREDENTIALS</p>
                                    {Object.entries(revealed[tx.id]).map(([k, v]) => (
                                        <div key={k} className="buyer-decrypted-row">
                                            <span className="buyer-decrypted-key">{k}:</span>
                                            <span className="buyer-decrypted-val">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    onClick={() => revealCredentials(tx.id)}
                                    className="buyer-btn-reveal"
                                >
                                    🔒 Reveal Credentials
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
