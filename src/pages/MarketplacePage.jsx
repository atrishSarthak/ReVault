import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import Navbar from '../components/layout/Navbar'
import './MarketplacePage.css'

const API = 'http://localhost:3000'

export function useAssets(category, search) {
    // Translate frontend categories to backend DB enums
    const categoryMap = {
        'Gaming Accounts': 'GAMING',
        'Digital Content': 'DIGITAL_CONTENT',
        'Event Tickets': 'EVENT_TICKET',
        'All': 'ALL'
    }

    const mappedCategory = categoryMap[category] || 'ALL'

    return useQuery({
        queryKey: ['assets', mappedCategory, search],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/api/assets`, {
                params: { category: mappedCategory === 'ALL' ? undefined : mappedCategory, search }
            })
            return data
        }
    })
}

const CATEGORIES = ['All', 'Digital Content', 'Gaming Accounts', 'Event Tickets']

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' }
]

const TAGS = ['All Tags', 'Art', 'Music', 'Illustration', 'MOBA', 'FPS', 'Music Festival', 'Sports', 'Conference', 'Concert']

function BuyButton({ assetId, price }) {
    const { getToken, isSignedIn } = useAuth()

    const buyMutation = useMutation({
        mutationFn: async () => {
            const token = await getToken()
            const { data } = await axios.post(`${API}/api/purchases`,
                { assetId },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            return data
        },
        onSuccess: () => alert('Purchase successful! Check your dashboard.'),
        onError: (err) => alert(err.response?.data?.error || err.message || 'Purchase failed')
    })

    if (!isSignedIn) return <button className="asset-card__bid">Sign in to Buy</button>

    return (
        <button
            onClick={() => buyMutation.mutate()}
            disabled={buyMutation.isPending}
            className={`asset-card__bid ${buyMutation.isPending ? 'opacity-50' : ''}`}
            style={buyMutation.isPending ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
            {buyMutation.isPending ? 'Processing...' : `Purchase`}
        </button>
    )
}

/* ── AssetCard ───────────────────────────────────────────── */
function AssetCard({ asset }) {
    const [wishlist, setWishlist] = useState(false)

    return (
        <article className="asset-card">
            <div className="asset-card__img-wrap">
                <img
                    src={asset.imageUrl}
                    alt={asset.title}
                    className="asset-card__img"
                    loading="lazy"
                />
                <span className="asset-card__tag">{asset.category.replace('_', ' ')}</span>
                <div className="asset-card__timer">
                    <span className="asset-card__timer-dot" />
                    Available
                </div>
                <button
                    className={`asset-card__wish${wishlist ? ' asset-card__wish--active' : ''}`}
                    onClick={() => setWishlist(w => !w)}
                    aria-label="Add to wishlist"
                >
                    ♥
                </button>
            </div>

            <div className="asset-card__body">
                <p className="asset-card__creator">by {asset.seller?.email || 'Verified Seller'}</p>
                <h3 className="asset-card__name">{asset.title}</h3>

                <div className="asset-card__footer">
                    <div className="asset-card__price-block">
                        <span className="asset-card__label">Current Price</span>
                        <span className="asset-card__eth">
                            <span className="asset-card__eth-icon">$</span>
                            {asset.price}
                        </span>
                    </div>
                    <BuyButton assetId={asset.id} price={asset.price} />
                </div>
            </div>
        </article>
    )
}

/* ── MarketplacePage ──────────────────────────────────────── */
function MarketplacePage() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [activeTag, setActiveTag] = useState('All Tags')
    const [sortBy, setSortBy] = useState('newest')
    const [filtersOpen, setFiltersOpen] = useState(true)

    // Fetch live data directly from Prisma Database via Express!
    const { data: dbAssets, isLoading, error } = useAssets(
        activeCategory,
        ''
    )

    const filtered = useMemo(() => {
        if (!dbAssets) return []
        let list = [...dbAssets]

        // Tags are front-end only for now since we didn't add them to DB schema
        if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price)
        if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price)
        return list
    }, [dbAssets, sortBy, activeTag])

    return (
        <div className="mp">
            {/* Navbar always dark on the dark marketplace page */}
            <Navbar dark={false} />

            <div className="mp__layout">
                {/* ── Left filter sidebar ─────────────────────────── */}
                <aside className={`mp__sidebar${filtersOpen ? '' : ' mp__sidebar--hidden'}`}>
                    <div className="mp__sidebar-inner">
                        <div className="mp__sidebar-section">
                            <h4 className="mp__sidebar-heading">Categories</h4>
                            <ul className="mp__filter-list">
                                {CATEGORIES.map(cat => (
                                    <li key={cat}>
                                        <button
                                            className={`mp__filter-btn${activeCategory === cat ? ' mp__filter-btn--active' : ''}`}
                                            onClick={() => setActiveCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mp__sidebar-divider" />

                        <div className="mp__sidebar-section">
                            <h4 className="mp__sidebar-heading">Tags</h4>
                            <ul className="mp__filter-list">
                                {TAGS.map(tag => (
                                    <li key={tag}>
                                        <button
                                            className={`mp__filter-btn${activeTag === tag ? ' mp__filter-btn--active' : ''}`}
                                            onClick={() => setActiveTag(tag)}
                                        >
                                            {tag}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mp__sidebar-divider" />

                        <button
                            className="mp__reset-btn"
                            onClick={() => { setActiveCategory('All'); setActiveTag('All Tags') }}
                        >
                            Reset Filters
                        </button>
                    </div>
                </aside>

                {/* ── Main content ───────────────────────────────── */}
                <main className="mp__main">
                    {/* Toolbar */}
                    <div className="mp__toolbar">
                        <div className="mp__toolbar-left">
                            <button
                                className="mp__toggle-filters"
                                onClick={() => setFiltersOpen(o => !o)}
                            >
                                {filtersOpen ? '✕ Hide Filters' : '⊞ Show Filters'}
                            </button>
                            <span className="mp__count">{filtered.length} assets</span>
                        </div>
                        <div className="mp__toolbar-right">
                            <label className="mp__sort-label" htmlFor="sort-select">Sort by</label>
                            <select
                                id="sort-select"
                                className="mp__sort-select"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active category pill */}
                    {activeCategory !== 'All' && (
                        <div className="mp__active-filters">
                            <span className="mp__active-pill">
                                {activeCategory}
                                <button onClick={() => setActiveCategory('All')} className="mp__active-pill-x">✕</button>
                            </span>
                            {activeTag !== 'All Tags' && (
                                <span className="mp__active-pill">
                                    {activeTag}
                                    <button onClick={() => setActiveTag('All Tags')} className="mp__active-pill-x">✕</button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Grid */}
                    {isLoading ? (
                        <div className="mp__empty">Connecting to Vault Database...</div>
                    ) : error ? (
                        <div className="mp__empty">Failed to load from Supabase Database.</div>
                    ) : filtered.length === 0 ? (
                        <div className="mp__empty">No assets match your filters.</div>
                    ) : (
                        <div className="mp__grid">
                            {filtered.map(asset => (
                                <AssetCard key={asset.id} asset={asset} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default MarketplacePage
