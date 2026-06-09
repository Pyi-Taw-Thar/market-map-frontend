import { useState, useEffect } from 'react'
import { shopService } from '../services/api'

function Dashboard() {
  const [shops, setShops] = useState([])
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedShopDetails, setSelectedShopDetails] = useState(null)

  useEffect(() => {
    fetchShops()
    fetchUpcomingBirthdays()
  }, [])

  const fetchShops = async () => {
    try {
      const data = await shopService.getAllShops()
      setShops(data)
    } catch (err) {
      setError('Failed to fetch shops')
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingBirthdays = async () => {
    try {
      const data = await shopService.getUpcomingBirthdays()
      setUpcomingBirthdays(data)
    } catch (err) {
      console.error('Failed to fetch upcoming birthdays:', err)
    }
  }

  const filteredShops = shops.filter(shop =>
    shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="animate-in space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Shop Dashboard</h2>
          <p className="text-gray-500 mt-1 font-medium">Manage and monitor field operations</p>
        </div>
        
        <div className="relative w-full lg:w-[400px] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by shop, owner or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Birthday Banner */}
      {upcomingBirthdays.length > 0 ? (
        <section className="relative overflow-hidden glass-card rounded-3xl p-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700">
                Upcoming Celebrations
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBirthdays.map((shop) => (
                <div key={shop._id} className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <span className="text-xl font-bold text-indigo-600">
                        {shop.ownerName.charAt(0)}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      shop.daysUntilBirthday === 0 
                        ? 'bg-red-100 text-red-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {shop.daysUntilBirthday === 0 ? 'Today' : `in ${shop.daysUntilBirthday} days`}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-1">{shop.ownerName}</h4>
                    <p className="text-sm text-gray-500 font-medium">{shop.shopName}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       {new Date(shop.upcomingBirthdayDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <button 
                      onClick={() => setSelectedShopDetails(shop)}
                      className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="glass-card rounded-3xl p-6 flex items-center gap-4 border-dashed border-2 border-gray-200 bg-transparent shadow-none">
          <div className="p-2 bg-gray-100 text-gray-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <p className="text-gray-500 font-semibold tracking-tight">No birthdays in the coming week</p>
        </div>
      )}

      {/* Main Shops List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-bold text-gray-900">Registered Shops</h3>
           <span className="text-sm font-bold text-gray-400 bg-gray-100/50 px-3 py-1 rounded-full">
            {filteredShops.length} TOTAL
           </span>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Shop Information</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Owner</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
                  <th className="px-8 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/50">
                {filteredShops.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <p className="text-gray-400 font-medium">
                          {searchTerm ? `No results found for "${searchTerm}"` : 'Your shop list is empty'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredShops.map((shop) => (
                    <tr key={shop._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm group-hover:border-indigo-200 transition-colors">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{shop.shopName}</p>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-tight mt-0.5">ID: {shop._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-700">
                        <p className="font-semibold">{shop.ownerName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-1.5-.454M9 16v2m3-6v6m3-8v8M9 6a2 2 0 114 0 2 2 0 01-4 0zM5 11c0-3.866 3.134-7 7-7s7 3.134 7 7v7H5v-7z" /></svg>
                          {new Date(shop.ownerBirthday).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-600 font-medium max-w-[200px] truncate">{shop.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-tighter italic">
                            {shop.location?.lat?.toFixed(4)}, {shop.location?.lng?.toFixed(4)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setSelectedShopDetails(shop)}
                            className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-90"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button
                            onClick={() => getDirections(shop.location.lat, shop.location.lng)}
                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-90"
                            title="Directions"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shop Details Modal */}
      {selectedShopDetails && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setSelectedShopDetails(null)}
            ></div>

            <div className="relative inline-block align-middle bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-indigo-600 px-8 py-10 text-white relative">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/50 to-transparent"></div>
                 <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <span className="text-indigo-100 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-3 inline-block">Shop Profile</span>
                        <h3 className="text-3xl font-extrabold tracking-tight">{selectedShopDetails.shopName}</h3>
                        <p className="text-indigo-100 font-medium mt-1 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {selectedShopDetails.ownerName}
                        </p>
                    </div>
                    <button 
                        onClick={() => setSelectedShopDetails(null)}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
              </div>

              <div className="px-8 py-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Owner Birthday</p>
                    <p className="text-gray-900 font-bold flex items-center gap-2">
                       <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-1.5-.454M9 16v2m3-6v6m3-8v8M9 6a2 2 0 114 0 2 2 0 01-4 0zM5 11c0-3.866 3.134-7 7-7s7 3.134 7 7v7H5v-7z" /></svg>
                       {new Date(selectedShopDetails.ownerBirthday).toLocaleDateString(undefined, { dateStyle: 'long' })}
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
                    <p className="text-gray-700 font-medium leading-relaxed">{selectedShopDetails.address}</p>
                    <div className="mt-3 text-[10px] font-mono text-gray-400 bg-white px-2 py-1 rounded-lg inline-block border border-gray-100">
                        {selectedShopDetails.location?.lat}, {selectedShopDetails.location?.lng}
                    </div>
                  </div>
                </div>

                {selectedShopDetails.notes && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Field Notes</p>
                    <p className="text-gray-600 font-medium bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 italic">
                      "{selectedShopDetails.notes}"
                    </p>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 bg-gray-50 flex gap-4">
                <button
                  onClick={() => setSelectedShopDetails(null)}
                  className="flex-1 btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    getDirections(selectedShopDetails.location.lat, selectedShopDetails.location.lng)
                  }}
                  className="flex-1 btn-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Get Route
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
