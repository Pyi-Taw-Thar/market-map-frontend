import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shopService } from '../services/api'

function ShopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchShop()
  }, [id])

  const fetchShop = async () => {
    try {
      const data = await shopService.getAllShops()
      const found = data.find(s => s._id === id)
      if (found) {
        setShop(found)
      } else {
        setError('Shop not found')
      }
    } catch (err) {
      setError('Failed to fetch shop details')
    } finally {
      setLoading(false)
    }
  }

  const getDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-green-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Loading shop details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-in space-y-6">
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!shop) return null

  return (
    <div className="animate-in space-y-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-semibold transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-green-600 px-8 py-10 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/50 to-transparent"></div>
        <div className="relative z-10">
          <span className="text-green-100 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-3 inline-block">
            Shop Profile
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">{shop.shopName}</h2>
          <p className="text-green-100 font-medium mt-1 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {shop.ownerName}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Owner Birthday</p>
            <p className="text-gray-900 font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-1.5-.454M9 16v2m3-6v6m3-8v8M9 6a2 2 0 114 0 2 2 0 01-4 0zM5 11c0-3.866 3.134-7 7-7s7 3.134 7 7v7H5v-7z" />
              </svg>
              {new Date(shop.ownerBirthday).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GPS Status</p>
            <p className="text-green-600 font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active Link
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Permanent Address</p>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-700 font-medium leading-relaxed">{shop.address}</p>
            <div className="mt-3 text-[10px] font-mono text-gray-400 bg-white px-2 py-1 rounded-lg inline-block border border-gray-100">
              {shop.location?.lat}, {shop.location?.lng}
            </div>
          </div>
        </div>

        {shop.notes && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Field Notes</p>
            <p className="text-gray-600 font-medium bg-green-50/50 p-4 rounded-2xl border border-green-100/50 italic">
              "{shop.notes}"
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 btn-secondary"
          >
            Back
          </button>
          <button
            onClick={() => getDirections(shop.location.lat, shop.location.lng)}
            className="flex-1 btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Get Route
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShopDetail
