import { useState, useEffect } from 'react';
import { shopService } from '../services/api';

/**
 * Township Creatable Input with Autocomplete Dropdown
 * Displays existing townships from the system/state,
 * while allowing user to easily type a new township if not in list.
 */
export default function TownshipInput({
  value,
  onChange,
  stateFilter = '',
  id = 'township',
  name = 'township',
  placeholder = 'e.g. Hlaing / လှိုင်',
  className = '',
  required = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTownships = async () => {
      try {
        const data = await shopService.getMetaTownships(stateFilter);
        if (isMounted && Array.isArray(data)) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Failed to load townships:', err);
      }
    };

    fetchTownships();
    return () => {
      isMounted = false;
    };
  }, [stateFilter]);

  const filteredSuggestions = suggestions.filter((t) =>
    t.toLowerCase().includes((value || '').toLowerCase())
  );

  const handleSelect = (townshipName) => {
    onChange({ target: { name, value: townshipName } });
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    onChange(e);
    setShowDropdown(true);
  };

  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        name={name}
        value={value || ''}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 250)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={
          className ||
          'w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-4 focus:ring-green-50/50 outline-none transition duration-200 text-sm'
        }
      />

      {/* Suggestions Dropdown */}
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-48 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-sm divide-y divide-gray-50">
          <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase bg-gray-50/70">
            ရှိပြီးသား မြို့နယ်များ (Select existing)
          </div>
          {filteredSuggestions.map((t, idx) => (
            <button
              key={`${t}-${idx}`}
              type="button"
              onMouseDown={() => handleSelect(t)}
              className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-700 text-gray-700 transition flex items-center justify-between text-xs font-medium"
            >
              <span>{t}</span>
              <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                ရွေးမည်
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
