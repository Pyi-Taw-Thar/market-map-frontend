import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { shopService } from "../services/api";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { MYANMAR_STATES, matchStateFromGeocoder } from "../constants/regions";
import TownshipInput from "../components/TownshipInput";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "1.5rem",
};

const defaultCenter = {
  lat: 16.8409,
  lng: 96.1735,
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
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialLat =
    location.state?.lat ||
    (searchParams.get("lat") ? parseFloat(searchParams.get("lat")) : null) ||
    defaultCenter.lat;
  const initialLng =
    location.state?.lng ||
    (searchParams.get("lng") ? parseFloat(searchParams.get("lng")) : null) ||
    defaultCenter.lng;
  const initialAddress = location.state?.address || searchParams.get("address") || "";

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    phoneNumber: "",
    state: "",
    township: "",
    address: initialAddress,
    ownerBirthday: "",
    notes: "",
    location: {
      lat: initialLat,
      lng: initialLng,
    },
  });

  const [mapCenter, setMapCenter] = useState({
    lat: initialLat,
    lng: initialLng,
  });
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
        let detectedState = "";
        let detectedTownship = "";

        const comps = results[0].address_components || [];
        for (const comp of comps) {
          const types = comp.types || [];
          if (types.includes("administrative_area_level_1")) {
            detectedState = matchStateFromGeocoder(comp.long_name);
          } else if (
            types.includes("sublocality_level_1") ||
            types.includes("locality") ||
            types.includes("administrative_area_level_2")
          ) {
            if (!detectedTownship) {
              detectedTownship = comp.long_name.replace(/township/gi, "").trim();
            }
          }
        }

        setFormData((prev) => ({
          ...prev,
          address: results[0].formatted_address,
          state: detectedState || prev.state,
          township: detectedTownship || prev.township,
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

  useEffect(() => {
    if (!initialAddress && initialLat && initialLng) {
      geocodePosition(initialLat, initialLng);
    }
  }, [initialAddress, initialLat, initialLng, geocodePosition]);

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
      const createdShop = await shopService.createShop(submissionData);
      navigate("/map", {
        state: {
          newShopId: createdShop._id,
          newShopLocation: createdShop.location,
          newShopName: createdShop.shopName,
        },
      });
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
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
              <MarkerF
                key={`${markerPosition.lat}-${markerPosition.lng}`}
                position={{
                  lat: Number(markerPosition.lat),
                  lng: Number(markerPosition.lng),
                }}
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
                <label
                  htmlFor="shopName"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Shop Name
                </label>
                <input
                  id="shopName"
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
                <label
                  htmlFor="ownerName"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Owner Full Name
                </label>
                <input
                  id="ownerName"
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
                <label
                  htmlFor="phoneNumber"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. 09123456789"
                />
              </div>

              {/* State & Township Fields */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                >
                  State / Region (တိုင်း/ပြည်နယ်)
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input-field bg-white"
                >
                  <option value="">-- တိုင်း/ပြည်နယ် ရွေးချယ်ပါ --</option>
                  {MYANMAR_STATES.map((s) => (
                    <option key={s.id} value={s.nameEn}>
                      {s.nameMm} ({s.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="township"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Township (မြို့နယ်)
                </label>
                <TownshipInput
                  id="township"
                  name="township"
                  value={formData.township}
                  stateFilter={formData.state}
                  onChange={handleChange}
                  placeholder="ရွေးချယ်ပါ (သို့) ရိုက်ထည့်ပါ"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="ownerBirthday"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Owner Birthday (Optional)
                </label>
                <input
                  id="ownerBirthday"
                  type="date"
                  name="ownerBirthday"
                  value={formData.ownerBirthday}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Detected Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="input-field bg-gray-50/50 resize-none"
                  placeholder="Select on map or type address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="lat"
                    className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                  >
                    Lat
                  </label>
                  <input
                    id="lat"
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
                  <label
                    htmlFor="lng"
                    className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                  >
                    Lng
                  </label>
                  <input
                    id="lng"
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
                <label
                  htmlFor="notes"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Notes (Optional)
                </label>
                <input
                  id="notes"
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
