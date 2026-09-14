import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api'
import { shopService } from '../services/api'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 200px)',
  minHeight: '65vh',
  borderRadius: '2rem'
}

const defaultCenter = {
  lat: 16.8409,
  lng: 96.1735,
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  styles: [
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "poi",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "transit",
      "stylers": [{ "visibility": "off" }]
    }
  ]
}

function MapView() {
  const location = useLocation()
  const navigate = useNavigate()

  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [deletingShop, setDeletingShop] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Map viewport state
  const [map, setMap] = useState(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapZoom, setMapZoom] = useState(13)

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance)
  }, [])

  // Pin point addition state
  const [newPin, setNewPin] = useState(null)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [quickAddForm, setQuickAddForm] = useState({
    shopName: '',
    ownerName: '',
    phoneNumber: '',
    ownerBirthday: '',
    address: '',
    notes: '',
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 4500)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingShop) return
    setDeleteLoading(true)
    try {
      await shopService.deleteShop(deletingShop._id)
      setShops((prev) => prev.filter((s) => s._id !== deletingShop._id))
      if (selectedShop?._id === deletingShop._id) {
        setSelectedShop(null)
      }
      showToast(`"${deletingShop.shopName}" ဆိုင်ကို အောင်မြင်စွာ ဖျက်ပစ်ပြီးပါပြီ`)
      setDeletingShop(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'ဆိုင် ဖျက်ပစ်ရန် မအောင်မြင်ပါ')
    } finally {
      setDeleteLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  // Auto-fit bounds to show all markers when map and shops are ready
  useEffect(() => {
    if (map && window.google?.maps && shops.length > 0 && !location.state?.newShopId) {
      if (shops.length === 1) {
        setMapCenter({
          lat: Number(shops[0].location.lat),
          lng: Number(shops[0].location.lng),
        })
        setMapZoom(15)
      } else {
        const bounds = new window.google.maps.LatLngBounds()
        shops.forEach((s) => {
          if (s.location && !isNaN(s.location.lat) && !isNaN(s.location.lng)) {
            bounds.extend({
              lat: Number(s.location.lat),
              lng: Number(s.location.lng),
            })
          }
        })
        map.fitBounds(bounds)
      }
    }
  }, [map, shops, location.state])

  const fetchShops = async () => {
    try {
      const data = await shopService.getAllShops()
      setShops(data)

      // If arrived from AddShop with state
      if (location.state?.newShopId) {
        const found = data.find((s) => s._id === location.state.newShopId)
        if (found) {
          setSelectedShop(found)
          setMapCenter({
            lat: Number(found.location.lat),
            lng: Number(found.location.lng),
          })
          setMapZoom(16)
        } else if (location.state.newShopLocation) {
          setMapCenter({
            lat: Number(location.state.newShopLocation.lat),
            lng: Number(location.state.newShopLocation.lng),
          })
          setMapZoom(16)
        }
        showToast(
          location.state.newShopName
            ? `"${location.state.newShopName}" ဆိုင်ကို မြေပုံပေါ်တွင် အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ!`
            : 'ဆိုင်အသစ်ကို မြေပုံပေါ်တွင် အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ!'
        )
      } else if (data.length > 0) {
        // Center on the first shop if available
        setSelectedShop(data[0])
        setMapCenter({
          lat: Number(data[0].location.lat),
          lng: Number(data[0].location.lng),
        })
      }
    } catch (err) {
      setError('Failed to fetch shops')
    } finally {
      setLoading(false)
    }
  }

  // Handle clicking on map to place a pin
  const handleMapClick = useCallback((e) => {
    if (!e.latLng) return
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    setSelectedShop(null) // Close any existing open InfoWindow
    setNewPin({ lat, lng })
    setSaveError('')
    setIsGeocoding(true)
    setIsQuickAddOpen(true)

    setQuickAddForm({
      shopName: '',
      ownerName: '',
      phoneNumber: '',
      ownerBirthday: '',
      address: 'တည်နေရာ လိပ်စာ ရှာဖွေနေပါသည်...',
      notes: '',
    })

    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setIsGeocoding(false)
        if (status === 'OK' && results && results[0]) {
          setQuickAddForm((prev) => ({
            ...prev,
            address: results[0].formatted_address,
          }))
        } else {
          setQuickAddForm((prev) => ({
            ...prev,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          }))
        }
      })
    } else {
      setIsGeocoding(false)
      setQuickAddForm((prev) => ({
        ...prev,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      }))
    }
  }, [])

  // Handle dragging the newly dropped pin
  const handleNewPinDragEnd = useCallback((e) => {
    if (!e.latLng) return
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    setNewPin({ lat, lng })
    setIsGeocoding(true)

    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setIsGeocoding(false)
        if (status === 'OK' && results && results[0]) {
          setQuickAddForm((prev) => ({
            ...prev,
            address: results[0].formatted_address,
          }))
        }
      })
    } else {
      setIsGeocoding(false)
    }
  }, [])

  const handleQuickAddChange = (e) => {
    const { name, value } = e.target
    setQuickAddForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancelNewPin = () => {
    setNewPin(null)
    setIsQuickAddOpen(false)
    setSaveError('')
  }

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault()
    if (!newPin) return

    if (!quickAddForm.shopName.trim()) {
      setSaveError('ဆိုင်အမည် ဖြည့်စွက်ရန် လိုအပ်ပါသည်')
      return
    }
    if (!quickAddForm.ownerName.trim()) {
      setSaveError('ဆိုင်ရှင်အမည် ဖြည့်စွက်ရန် လိုအပ်ပါသည်')
      return
    }

    setIsSaving(true)
    setSaveError('')

    try {
      const submissionData = {
        shopName: quickAddForm.shopName.trim(),
        ownerName: quickAddForm.ownerName.trim(),
        phoneNumber: quickAddForm.phoneNumber.trim(),
        address: quickAddForm.address.trim() || `${newPin.lat.toFixed(6)}, ${newPin.lng.toFixed(6)}`,
        ownerBirthday: quickAddForm.ownerBirthday ? new Date(quickAddForm.ownerBirthday) : undefined,
        notes: quickAddForm.notes.trim(),
        location: {
          lat: Number(newPin.lat),
          lng: Number(newPin.lng),
        },
      }

      const created = await shopService.createShop(submissionData)

      // Immediately append new shop to list
      setShops((prev) => [created, ...prev])
      setSelectedShop(created)
      setMapCenter(created.location)
      setMapZoom(16)
      setNewPin(null)
      setIsQuickAddOpen(false)

      showToast(`"${created.shopName}" ဆိုင်ကို မြေပုံပေါ်တွင် အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ!`)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'ဆိုင်အချက်အလက် သိမ်းဆည်းရန် မအောင်မြင်ပါ')
    } finally {
      setIsSaving(false)
    }
  }

  const getDirections = useCallback((lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-green-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">မြေပုံ ဖွင့်လှစ်နေပါသည်...</p>
      </div>
    )
  }

  return (
    <div className="animate-in space-y-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Geographic Overview</h2>
          <p className="text-gray-500 font-medium">မြေပုံပေါ်တွင် မှတ်တမ်းတင်ထားသော ဆိုင်များကို လေ့လာကြည့်ရှုနိုင်ပါသည်</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold text-sm flex items-center gap-2 border border-green-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {shops.length} Active Markers
          </div>
          <button
            type="button"
            onClick={() => navigate('/add-shop')}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Shop
          </button>
        </div>
      </div>

      {/* Helpful Hint Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-green-200/60 rounded-2xl px-5 py-3 text-sm text-green-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg">📌</span>
          <span className="font-semibold">
            အကြံပြုချက်: မြေပုံပေါ်တွင် ဆိုင်အသစ်ထည့်သွင်းရန် သင်လိုချင်သော နေရာကို <strong className="text-green-900 underline underline-offset-2">Click နှိပ်၍ Pin ထောက်ပါ</strong>။
          </span>
        </div>
        {newPin && (
          <button
            type="button"
            onClick={handleCancelNewPin}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-1.5 rounded-lg transition-colors ml-3 whitespace-nowrap"
          >
            Pin ဖျက်မည်
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 animate-bounce"
        >
          <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative glass-card p-3 rounded-[2.5rem] shadow-2xl shadow-green-100 overflow-hidden">
        {error && (
          <div
            role="alert"
            className="absolute top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:w-auto sm:transform sm:-translate-x-1/2 z-20 px-6 py-3 bg-red-600 text-white rounded-2xl shadow-xl font-bold text-sm"
          >
            {error}
          </div>
        )}

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={mapOptions}
          onLoad={onMapLoad}
          onClick={handleMapClick}
        >
          {/* Registered Shops Markers */}
          {shops.map((shop) => (
            <MarkerF
              key={shop._id}
              position={{
                lat: Number(shop.location.lat),
                lng: Number(shop.location.lng),
              }}
              onClick={() => {
                setSelectedShop(shop)
                setNewPin(null)
                setIsQuickAddOpen(false)
              }}
              title={shop.shopName}
            />
          ))}

          {/* New Temporary Pin Dropped by User */}
          {newPin && (
            <MarkerF
              position={{
                lat: Number(newPin.lat),
                lng: Number(newPin.lng),
              }}
              draggable={true}
              onDragEnd={handleNewPinDragEnd}
              title="Drag to adjust shop position"
            />
          )}

          {/* InfoWindow for Selected Existing Shop */}
          {selectedShop && !newPin && (
            <InfoWindowF
              position={{
                lat: Number(selectedShop.location.lat),
                lng: Number(selectedShop.location.lng),
              }}
              onCloseClick={() => setSelectedShop(null)}
            >
              <div className="p-4 w-[calc(100vw-2rem)] sm:w-[290px] max-h-[60vh] overflow-y-auto">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{selectedShop.shopName}</h3>
                    <p className="text-xs font-semibold text-gray-400 uppercase mt-0.5 tracking-tight">{selectedShop.ownerName}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-[13px] text-gray-600">
                  {selectedShop.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <svg aria-hidden="true" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${selectedShop.phoneNumber}`} className="text-green-700 font-semibold hover:underline">
                        {selectedShop.phoneNumber}
                      </a>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium line-clamp-2">{selectedShop.address}</span>
                  </div>
                  {selectedShop.ownerBirthday && (
                    <div className="flex items-center gap-2">
                      <svg aria-hidden="true" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        {new Date(selectedShop.ownerBirthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => getDirections(selectedShop.location.lat, selectedShop.location.lng)}
                    className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Open in Maps
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/shop/${selectedShop._id}`)}
                      className="flex-1 btn-secondary py-1.5 text-xs text-center font-semibold"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => navigate(`/edit-shop/${selectedShop._id}`)}
                      className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200 text-xs flex items-center justify-center gap-1 transition-colors"
                      title="Edit Shop"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingShop(selectedShop)}
                      className="flex-1 py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 text-xs flex items-center justify-center gap-1 transition-colors"
                      title="Delete Shop"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      {/* Quick Add Shop Modal (Opens upon clicking the map) */}
      {isQuickAddOpen && newPin && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelNewPin()
            }
          }}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
                  📍
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Add Shop at this Pin</h3>
                  <p className="text-xs text-gray-500 font-medium">မြေပုံပေါ်တွင် ဆိုင်အသစ် ချက်ချင်း ထည့်သွင်းခြင်း</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelNewPin}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {saveError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{saveError}</span>
              </div>
            )}

            {/* Coordinates Badge */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-600 border border-gray-200/60">
              <span className="font-semibold text-gray-500">Selected Coordinates:</span>
              <span className="text-green-700 font-bold">
                {newPin.lat.toFixed(6)}, {newPin.lng.toFixed(6)}
              </span>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                  Shop Name (ဆိုင်အမည်) *
                </label>
                <input
                  type="text"
                  name="shopName"
                  value={quickAddForm.shopName}
                  onChange={handleQuickAddChange}
                  required
                  autoFocus
                  placeholder="e.g. ရွှေစင် စတိုးဆိုင်"
                  className="input-field py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                  Owner Full Name (ပိုင်ရှင်အမည်) *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={quickAddForm.ownerName}
                  onChange={handleQuickAddChange}
                  required
                  placeholder="e.g. ဦးအောင်ကို"
                  className="input-field py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={quickAddForm.phoneNumber}
                    onChange={handleQuickAddChange}
                    placeholder="e.g. 09123456789"
                    className="input-field py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Birthday (မွေးနေ့)
                  </label>
                  <input
                    type="date"
                    name="ownerBirthday"
                    value={quickAddForm.ownerBirthday}
                    onChange={handleQuickAddChange}
                    className="input-field py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                  Detected Address (လိပ်စာ) {isGeocoding && <span className="text-green-600 font-normal">(ရှာဖွေနေပါသည်...)</span>}
                </label>
                <textarea
                  name="address"
                  value={quickAddForm.address}
                  onChange={handleQuickAddChange}
                  rows="2"
                  className="input-field py-2 text-sm resize-none bg-gray-50/70"
                  placeholder="လိပ်စာ ထည့်သွင်းပါ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                  Notes (မှတ်ချက် - Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={quickAddForm.notes}
                  onChange={handleQuickAddChange}
                  placeholder="အထွေထွေ မှတ်ချက်များ..."
                  className="input-field py-2.5 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex-1 py-3 text-sm font-bold shadow-green-200 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>သိမ်းဆည်းနေပါသည်...</span>
                    </div>
                  ) : (
                    'Save Shop (သိမ်းဆည်းမည်)'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelNewPin}
                  className="btn-secondary py-3 px-5 text-sm font-semibold"
                >
                  မလုပ်တော့ပါ
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() =>
                    navigate('/add-shop', {
                      state: {
                        lat: newPin.lat,
                        lng: newPin.lng,
                        address: quickAddForm.address,
                      },
                    })
                  }
                  className="text-xs text-green-700 hover:text-green-800 font-bold hover:underline"
                >
                  Full Registration Form ဖြင့် ဖွင့်ရန် &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingShop}
        shopName={deletingShop?.shopName || ''}
        loading={deleteLoading}
        onClose={() => setDeletingShop(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default MapView