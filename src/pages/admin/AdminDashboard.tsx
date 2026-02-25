import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { useState } from 'react'
import './AdminDashboard.css'

const API = 'http://localhost:3000'

export default function AdminDashboard() {
    const { getToken } = useAuth()
    const queryClient = useQueryClient()
    const [notes, setNotes] = useState<Record<string, string>>({})

    const { data: queue, isLoading, isError, error } = useQuery({
        queryKey: ['admin-queue'],
        queryFn: async () => {
            const token = await getToken()
            const { data } = await axios.get(`${API}/api/admin/queue`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            return data
        }
    })

    const reviewMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string, action: string }) => {
            const token = await getToken()
            await axios.patch(`${API}/api/admin/${id}/review`,
                { action, note: notes[id] || '' },
                { headers: { Authorization: `Bearer ${token}` } }
            )
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
    })

    if (isLoading) return <div className="admin-dashboard-page"><div className="admin-container"><p className="admin-subtitle">Loading queue...</p></div></div>

    if (isError) return (
        <div className="admin-dashboard-page">
            <div className="admin-container">
                <h1 className="admin-title" style={{ color: '#f87171' }}>Access Denied</h1>
                <p className="admin-subtitle text-red-500">
                    You are not authorized to view the admin review queue.
                    {(error as any)?.response?.data?.error || error?.message}
                </p>
            </div>
        </div>
    )

    return (
        <div className="admin-dashboard-page">
            <div className="admin-container">
                <h1 className="admin-title">Admin Queue</h1>
                <p className="admin-subtitle">{queue?.length || 0} pending assets</p>

                {(!queue || queue.length === 0) && (
                    <p className="admin-empty">No pending assets. You're all caught up.</p>
                )}

                <div className="admin-list">
                    {queue?.map((asset: any) => (
                        <div key={asset.id} className="admin-card">
                            <div className="admin-card-header">
                                <div>
                                    <span className="admin-card-category">{asset.category}</span>
                                    <h2 className="admin-card-title">{asset.title}</h2>
                                    <p className="admin-card-seller">by {asset.seller.email}</p>
                                    <p className="admin-card-desc">{asset.description}</p>
                                </div>
                                <span className="admin-card-price">${asset.price}</span>
                            </div>

                            <textarea
                                placeholder="Verification note (optional)..."
                                value={notes[asset.id] || ''}
                                onChange={e => setNotes({ ...notes, [asset.id]: e.target.value })}
                                className="admin-textarea"
                                rows={2}
                            />

                            <div className="admin-actions">
                                <button
                                    onClick={() => reviewMutation.mutate({ id: asset.id, action: 'VERIFY' })}
                                    className="admin-btn-verify"
                                >
                                    ✓ Verify
                                </button>
                                <button
                                    onClick={() => reviewMutation.mutate({ id: asset.id, action: 'REJECT' })}
                                    className="admin-btn-reject"
                                >
                                    ✗ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
