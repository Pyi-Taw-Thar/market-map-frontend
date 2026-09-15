import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { shopService } from "../services/api";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { MYANMAR_STATES } from "../constants/regions";

function Dashboard() {
  const navigate = useNavigate();
  const searchRequestIdRef = useRef(0);
  const [shops, setShops] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedTownship, setSelectedTownship] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingShop, setDeletingShop] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingShop) return;
    setDeleteLoading(true);
    try {
      await shopService.deleteShop(deletingShop._id);
      setShops((prev) => prev.filter((s) => s._id !== deletingShop._id));
      setUpcomingBirthdays((prev) => prev.filter((s) => s._id !== deletingShop._id));
      showToast(`"${deletingShop.shopName}" ဆိုင်ကို အောင်မြင်စွာ ဖျက်ပစ်ပြီးပါပြီ`);
      setDeletingShop(null);
    } catch (err) {
      setError(err.response?.data?.message || "ဆိုင် ဖျက်ပစ်ရန် မအောင်မြင်ပါ");
    } finally {
      setDeleteLoading(false);
    }
  };

  const [shopsLoading, setShopsLoading] = useState(false);

  useEffect(() => {
    fetchUpcomingBirthdays();
  }, []);

  // Fetch shops directly from Backend API whenever state, township or search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShops();
    }, 250); // 250ms debounce for typing search

    return () => clearTimeout(timer);
  }, [selectedState, selectedTownship, searchTerm]);

  // Load all available townships for the dropdown from Backend API
  useEffect(() => {
    let isMounted = true;
    const fetchTownshipOptions = async () => {
      try {
        const data = await shopService.getMetaTownships(selectedState);
        if (isMounted && Array.isArray(data)) {
          setAvailableTownships(data);
        }
      } catch (err) {
        console.error("Failed to load townships:", err);
      }
    };
    fetchTownshipOptions();
    return () => {
      isMounted = false;
    };
  }, [selectedState]);

  const [availableTownships, setAvailableTownships] = useState([]);

  const fetchShops = async () => {
    const currentRequestId = ++searchRequestIdRef.current;
    setShopsLoading(true);
    try {
      const params = {};
      if (selectedState) params.state = selectedState;
      if (selectedTownship) params.township = selectedTownship;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await shopService.getAllShops(params);
      if (currentRequestId === searchRequestIdRef.current) {
        setShops(data);
        setError("");
      }
    } catch (err) {
      if (currentRequestId === searchRequestIdRef.current) {
        setError(err.response?.data?.message || "Failed to fetch shops");
      }
    } finally {
      if (currentRequestId === searchRequestIdRef.current) {
        setLoading(false);
        setShopsLoading(false);
      }
    }
  };

  const fetchUpcomingBirthdays = async () => {
    try {
      const data = await shopService.getUpcomingBirthdays();
      setUpcomingBirthdays(data);
    } catch (err) {
      console.error("Failed to fetch upcoming birthdays:", err);
    }
  };

  const handleStateFilterChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedTownship(""); // Reset township when state changes
  };

  const clearFilters = () => {
    setSelectedState("");
    setSelectedTownship("");
    setSearchTerm("");
  };

  const getDirections = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-green-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Shop Dashboard
            </h2>
            <p className="text-gray-500 mt-1 font-medium">
              Manage and monitor field operations
            </p>
          </div>
          {(selectedState || selectedTownship || searchTerm) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition flex items-center gap-1.5"
            >
              <span>✕</span>
              <span>Filter များ ရှင်းထုတ်မည် (Clear All)</span>
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white/60 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200/70 shadow-sm">
          {/* Search Box */}
          <div className="md:col-span-5 relative group">
            <label htmlFor="shop-search" className="sr-only">
              Search shops
            </label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="shop-search"
              type="text"
              placeholder="ဆိုင်အမည်၊ ဖုန်း၊ ပိုင်ရှင် သို့ လိပ်စာဖြင့် ရှာရန်..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`input-field pl-10 ${searchTerm ? 'pr-9' : 'pr-3'} py-2.5 text-sm bg-white`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
                title="ရှင်းထုတ်မည်"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* State / Region Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedState}
              onChange={handleStateFilterChange}
              className="input-field py-2.5 text-sm bg-white font-medium text-gray-700"
              aria-label="Filter by State or Region"
            >
              <option value="">တိုင်းဒေသကြီး / ပြည်နယ်အားလုံး (All States)</option>
              {MYANMAR_STATES.map((s) => (
                <option key={s.id} value={s.nameEn}>
                  {s.nameMm} ({s.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* Township Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedTownship}
              onChange={(e) => setSelectedTownship(e.target.value)}
              className="input-field py-2.5 text-sm bg-white font-medium text-gray-700 disabled:opacity-60"
              aria-label="Filter by Township"
            >
              <option value="">မြို့နယ်အားလုံး (All Townships)</option>
              {availableTownships.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
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

      {/* Birthday Banner */}
      {upcomingBirthdays.length > 0 ? (
        <section className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-emerald-700">
                Upcoming Celebrations
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBirthdays.map((shop) => (
                <div
                  key={shop._id}
                  className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-green-50 transition-colors">
                      <span className="text-xl font-bold text-green-600">
                        {shop.ownerName.charAt(0)}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        shop.daysUntilBirthday === 0
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {shop.daysUntilBirthday === 0
                        ? "Today"
                        : `in ${shop.daysUntilBirthday} days`}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-1">
                      {shop.ownerName}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium">
                      {shop.shopName}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(shop.upcomingBirthdayDate).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/shop/${shop._id}`)}
                      className="text-green-600 hover:text-green-700 font-bold text-xs py-1"
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
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-semibold tracking-tight">
            No birthdays in the coming week
          </p>
        </div>
      )}

      {/* Main Shops List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-gray-900">Registered Shops</h3>
            {shopsLoading && (
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <span className="text-sm font-bold text-gray-400 bg-gray-100/50 px-3 py-1 rounded-full">
            {shops.length} TOTAL
          </span>
        </div>

        {/* Desktop table */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-sm hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Shop Information
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Owner
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Location
                  </th>
                  <th className="px-8 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/50">
                {shops.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <EmptyState searchTerm={searchTerm} />
                    </td>
                  </tr>
                ) : (
                  shops.map((shop) => (
                    <tr
                      key={shop._id}
                      className="hover:bg-green-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm group-hover:border-green-200 transition-colors">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                              {shop.shopName}
                            </p>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-tight mt-0.5">
                              ID: {shop._id?.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-700">
                        <p className="font-semibold">{shop.ownerName}</p>
                        {shop.ownerBirthday && (
                          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 01-1.5-.454M9 16v2m3-6v6m3-8v8M9 6a2 2 0 114 0 2 2 0 01-4 0zM5 11c0-3.866 3.134-7 7-7s7 3.134 7 7v7H5v-7z"
                              />
                            </svg>
                            {new Date(shop.ownerBirthday).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-600 font-medium max-w-[200px] truncate">
                          {shop.address}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {(shop.township || shop.state) && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/80">
                              <span>📍</span>
                              <span>{[shop.township, shop.state].filter(Boolean).join(', ')}</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-tighter italic">
                            {shop.location?.lat?.toFixed(4)},{" "}
                            {shop.location?.lng?.toFixed(4)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => navigate(`/shop/${shop._id}`)}
                            className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-90"
                            aria-label={`View details for ${shop.shopName}`}
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              getDirections(
                                shop.location.lat,
                                shop.location.lng,
                              )
                            }
                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all active:scale-90"
                            aria-label={`Get directions to ${shop.shopName}`}
                            title="Get Directions"
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
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => navigate(`/edit-shop/${shop._id}`)}
                            className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all active:scale-90"
                            aria-label={`Edit ${shop.shopName}`}
                            title="Edit Shop"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingShop(shop)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-90"
                            aria-label={`Delete ${shop.shopName}`}
                            title="Delete Shop"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {shops.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-3">
              <EmptyState searchTerm={searchTerm} />
            </div>
          ) : (
            shops.map((shop) => (
              <div
                key={shop._id}
                className="glass-card rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {shop.shopName}
                      </p>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-tight mt-0.5">
                        ID: {shop._id?.slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-semibold">
                    {shop.ownerName}{" "}
                    {shop.ownerBirthday && (
                      <span className="text-gray-400 font-medium">
                        · {new Date(shop.ownerBirthday).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-600 font-medium leading-snug">
                    {shop.address}
                  </p>
                  {(shop.township || shop.state) && (
                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        <span>📍</span>
                        <span>{[shop.township, shop.state].filter(Boolean).join(', ')}</span>
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] font-mono text-gray-400">
                    {shop.location?.lat?.toFixed(4)},{" "}
                    {shop.location?.lng?.toFixed(4)}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/shop/${shop._id}`)}
                    className="btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Details
                  </button>
                  <button
                    onClick={() =>
                      getDirections(shop.location.lat, shop.location.lng)
                    }
                    className="btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                    Route
                  </button>
                  <button
                    onClick={() => navigate(`/edit-shop/${shop._id}`)}
                    className="btn-secondary py-2 text-xs text-amber-600 hover:text-amber-700 flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingShop(shop)}
                    className="btn-secondary py-2 text-xs text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-3 animate-bounce"
        >
          <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingShop}
        shopName={deletingShop?.shopName || ""}
        loading={deleteLoading}
        onClose={() => setDeletingShop(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function EmptyState({ searchTerm }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <p className="text-gray-400 font-medium">
        {searchTerm
          ? `No results found for "${searchTerm}"`
          : "Your shop list is empty"}
      </p>
    </div>
  );
}

export default Dashboard;