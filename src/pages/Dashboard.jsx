import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shopService } from "../services/api";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

function Dashboard() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState(null);

  useEffect(() => {
    fetchShops();
    fetchUpcomingBirthdays();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await shopService.getAllShops();
      setShops(data);
    } catch (err) {
      setError("Failed to fetch shops");
    } finally {
      setLoading(false);
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

  const filteredShops = shops.filter(
    (shop) =>
      shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shop.phoneNumber && shop.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getDirections = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank",
    );
  };

  const triggerDelete = (id, shopName) => {
    setShopToDelete({ id, shopName });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shopToDelete) return;
    try {
      setIsDeleteModalOpen(false);
      setLoading(true);
      await shopService.deleteShop(shopToDelete.id);
      await Promise.all([fetchShops(), fetchUpcomingBirthdays()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete shop");
      setLoading(false);
    } finally {
      setShopToDelete(null);
    }
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Shop Dashboard
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Manage and monitor field operations
          </p>
        </div>

        <div className="relative w-full lg:w-[400px] group">
          <label htmlFor="shop-search" className="sr-only">
            Search shops
          </label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors"
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
            placeholder="Search by shop, owner or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
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



      {/* Main Shops List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Registered Shops</h3>
          <span className="text-sm font-bold text-gray-400 bg-gray-100/50 px-3 py-1 rounded-full">
            {filteredShops.length} TOTAL
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
                {filteredShops.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <EmptyState searchTerm={searchTerm} />
                    </td>
                  </tr>
                ) : (
                  filteredShops.map((shop) => (
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
                        {shop.phoneNumber && (
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                            <svg
                              className="w-3.5 h-3.5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {shop.phoneNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-600 font-medium max-w-[200px] truncate">
                          {shop.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
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
                            onClick={() => triggerDelete(shop._id, shop.shopName)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-90"
                            aria-label={`Delete ${shop.shopName}`}
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
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
          {filteredShops.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-3">
              <EmptyState searchTerm={searchTerm} />
            </div>
          ) : (
            filteredShops.map((shop) => (
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
                    {shop.ownerName}
                  </p>
                  {shop.phoneNumber && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {shop.phoneNumber}
                    </p>
                  )}
                  <p className="text-gray-600 font-medium leading-snug">
                    {shop.address}
                  </p>
                  <p className="text-[10px] font-mono text-gray-400">
                    {shop.location?.lat?.toFixed(4)},{" "}
                    {shop.location?.lng?.toFixed(4)}
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => navigate(`/shop/${shop._id}`)}
                    className="flex-1 btn-secondary py-2.5 text-sm"
                  >
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
                    className="flex-1 btn-secondary py-2.5 text-sm"
                  >
                    <svg
                      className="w-4 h-4 text-green-500"
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
                    Directions
                  </button>
                  <button
                    onClick={() => triggerDelete(shop._id, shop.shopName)}
                    className="flex-1 px-3 py-2.5 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-bold flex items-center justify-center gap-1.5 transition-all border border-red-100"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setShopToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={shopToDelete?.shopName || ""}
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