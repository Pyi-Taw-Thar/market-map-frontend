import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { shopService } from '../services/api'

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 180px)',
  borderRadius: '2rem'
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
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
  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchShops()
  }, [])

  const fetchShops = async () => {
    try {
      const data = await shopService.getAllShops()
      setShops(data)
      if (data.length > 0) {
        setSelectedShop(data[0])
      }
    } catch (err) {
      setError('Failed to fetch shops')
    } finally {
      setLoading(false)
    }
  }

  const getDirections = useCallback((lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Initializing map...</p>
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Geographic Overview</h2>
          <p className="text-gray-500 font-medium">Explore registered shops on the map</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm flex items-center gap-2 border border-indigo-100">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
           {shops.length} Active Markers
        </div>
      </div>

      <div className="relative glass-card p-3 rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden">
        {error && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 px-6 py-3 bg-red-600 text-white rounded-2xl shadow-xl font-bold text-sm">
            {error}
          </div>
        )}

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={shops.length > 0 ? (selectedShop?.location || shops[0].location) : defaultCenter}
          zoom={13}
          options={mapOptions}
        >
          {shops.map((shop) => (
            <Marker
              key={shop._id}
              position={shop.location}
              onClick={() => setSelectedShop(shop)}
              title={shop.shopName}
            />
          ))}

          {selectedShop && (
            <InfoWindow
              position={selectedShop.location}
              onCloseClick={() => setSelectedShop(null)}
            >
              <div className="p-4 min-w-[260px] max-w-sm">
                 <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-900 leading-tight">{selectedShop.shopName}</h3>
                       <p className="text-xs font-semibold text-gray-400 truncate uppercase mt-0.5 tracking-tight">{selectedShop.ownerName}</p>
                    </div>
                 </div>
                
                <div className="space-y-2.5 mb-5">
                   <div className="flex items-start gap-2 text-[13px] text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="font-medium line-clamp-2">{selectedShop.address}</span>
                   </div>
                   <div className="flex items-center gap-2 text-[13px] text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="font-medium">{new Date(selectedShop.ownerBirthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                   </div>
                </div>

                <button
                  onClick={() => getDirections(selectedShop.location.lat, selectedShop.location.lng)}
                  className="w-full btn-primary py-2 text-sm shadow-indigo-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Open in Maps
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  )
}

export default MapView