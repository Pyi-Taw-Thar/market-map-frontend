import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shopService } from '../services/api'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

function ShopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchShop()
  }, [id])

  const fetchShop = async () => {
    try {
      const found = await shopService.getShopById(id)
      if (found) {
        setShop(found)
      } else {
        setError('ဆိုင်အချက်အလက် ရှာမတွေ့ပါ')
      }
    } catch (err) {
      setError('ဆိုင်အချက်အလက် ရယူရန် မအောင်မြင်ပါ')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!shop) return
    setDeleteLoading(true)
    try {
      await shopService.deleteShop(shop._id)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'ဆိုင် ဖျက်ပစ်ရန် မအောင်မြင်ပါ')
      setIsDeleteOpen(false)
    } finally {
      setDeleteLoading(false)
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
        <div role="alert" className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-green-600 px-6 py-8 sm:px-8 sm:py-10 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/50 to-transparent"></div>
        <div className="relative z-10">
          <span className="text-green-100 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-3 inline-block">
            Shop Profile
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{shop.shopName}</h2>
          <p className="text-green-100 font-medium mt-1 flex items-center gap-1.5">
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {shop.ownerName}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl px-6 py-8 sm:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
            <p className="text-gray-900 font-bold flex items-center gap-2">
              <svg aria-hidden="true" className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {shop.phoneNumber ? (
                <a href={`tel:${shop.phoneNumber}`} className="text-green-700 hover:underline">
                  {shop.phoneNumber}
                </a>
              ) : (
                <span className="text-gray-400 font-normal">မရှိပါ</span>
              )}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Owner Birthday</p>
            <p className="text-gray-900 font-bold flex items-center gap-2">
              <svg aria-hidden="true" className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-1.5-.454M9 16v2m3-6v6m3-8v8M9 6a2 2 0 114 0 2 2 0 01-4 0zM5 11c0-3.866 3.134-7 7-7s7 3.134 7 7v7H5v-7z" />
              </svg>
              {shop.ownerBirthday ? (
                new Date(shop.ownerBirthday).toLocaleDateString(undefined, { dateStyle: 'long' })
              ) : (
                <span className="text-gray-400 font-normal">မရှိပါ</span>
              )}
            </p>
          </div>
        </div>

        {/* State & Township Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/60">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">State / Region (တိုင်းဒေသကြီး/ပြည်နယ်)</p>
            <p className="text-gray-900 font-bold text-sm">
              {shop.state || <span className="text-gray-400 font-normal">ဖော်ပြထားခြင်းမရှိပါ</span>}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Township (မြို့နယ်)</p>
            <p className="text-gray-900 font-bold text-sm">
              {shop.township || <span className="text-gray-400 font-normal">ဖော်ပြထားခြင်းမရှိပါ</span>}
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

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary py-3 px-5 text-sm"
          >
            Back
          </button>
          <button
            onClick={() => getDirections(shop.location.lat, shop.location.lng)}
            className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Get Route
          </button>
          <button
            onClick={() => navigate(`/edit-shop/${shop._id}`)}
            className="py-3 px-5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200 transition-all flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Shop
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="py-3 px-5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-all flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Shop
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        shopName={shop.shopName}
        loading={deleteLoading}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default ShopDetail
