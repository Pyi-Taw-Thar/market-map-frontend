import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { shopService } from "../services/api";
import { GoogleMap, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "1.5rem",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  styles: [
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }],
    },
  ],
};

function AddShop() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    address: "",
    ownerBirthday: "",
    notes: "",
    location: {
      lat: defaultCenter.lat,
      lng: defaultCenter.lng,
    },
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      const numValue = value === "" ? "" : parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: numValue },
      }));
      if (numValue !== "" && !isNaN(numValue)) {
        setMapCenter((prev) => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const geocodePosition = useCallback((lat, lng) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setFormData((prev) => ({
          ...prev,
          address: results[0].formatted_address,
        }));
      }
    });
  }, []);

  const handleDragEnd = useCallback(
    (e) => {
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setFormData((prev) => ({
        ...prev,
        location: { lat: newLat, lng: newLng },
      }));
      setMapCenter({ lat: newLat, lng: newLng });
      geocodePosition(newLat, newLng);
    },
    [geocodePosition],
  );

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          location: { lat, lng },
        }));
        setMapCenter({ lat, lng });
        geocodePosition(lat, lng);
        setError("");
      },
      (err) => {
        setError("Unable to retrieve your location. Please enter manually.");
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNaN(formData.location.lat) || isNaN(formData.location.lng)) {
      setError("Invalid coordinates");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const submissionData = {
        ...formData,
        location: {
          lat: Number(formData.location.lat),
          lng: Number(formData.location.lng),
        },
      };
      await shopService.createShop(submissionData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  const markerPosition = {
    lat: Number(formData.location.lat) || defaultCenter.lat,
    lng: Number(formData.location.lng) || defaultCenter.lng,
  };

  return (
    <div className="max-w-5xl mx-auto animate-in space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Register New Shop
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Pinpoint location and add owner details
          </p>
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="btn-secondary active:bg-green-50 active:text-green-600 active:border-green-200"
        >
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Detect My Location
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Col: Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-[2rem] p-3 shadow-2xl shadow-green-100">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={15}
              options={mapOptions}
            >
              <Marker
                key={`${markerPosition.lat}-${markerPosition.lng}`}
                position={markerPosition}
                draggable={true}
                onDragEnd={handleDragEnd}
              />
            </GoogleMap>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-green-50/50 rounded-2xl border border-green-100/50">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-green-700 font-medium">
              Drag the marker to the exact shop location. Address will update
              automatically.
            </p>
          </div>
        </div>

        {/* Right Col: Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-[2rem] p-8 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g. Blue Star General Store"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Owner Birthday
                </label>
                <input
                  type="date"
                  name="ownerBirthday"
                  value={formData.ownerBirthday}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Detected Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="input-field bg-gray-50/50 resize-none"
                  placeholder="Select on map or type address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Lat
                  </label>
                  <input
                    type="number"
                    name="lat"
                    value={formData.location.lat}
                    onChange={handleChange}
                    required
                    step="any"
                    className="input-field text-sm font-mono bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Lng
                  </label>
                  <input
                    type="number"
                    name="lng"
                    value={formData.location.lng}
                    onChange={handleChange}
                    required
                    step="any"
                    className="input-field text-sm font-mono bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Any specific field notes..."
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg shadow-green-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  "Complete Registration"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-2"
              >
                Cancel and Go Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddShop;
