# စီမံချက် (Implementation Plan) — Mobile Responsiveness & Accessibility (ဖျက်) — UI/UX

- **နေ့စွဲ:** 2026-08-04
- **ဧရိယာ:** frontend/ (pages + App + index.css)
- **အဆင့်:** စောင့်ဆိုင်းနေသည် — သုံးစွဲသူ အတည်ပြုချက် လိုအပ်သည်

---

## 1. ရည်ရွယ်ချက်

`ui-ux` skill ၏ guidelines အတိုင်း frontend ၏ pages နှင့် components အားလုံးကို
**mobile responsiveness** နှင့် **accessibility (a11y)** မြှင့်တင်မည်။ ဖုန်း/တက်ဘလက်
နှင့် desktop အားလုံးတွင် ကောင်းမွန်စွာ ပြသရန် + screen reader / keyboard အသုံးပြုသူများ
အတွက် သုံးလွယ်စေရန် ပြုပြင်မည်။

## 2. လက်ရှိ ပြဿနာများ (ခွဲခြမ်းစိတ်ဖြာချက်)

| ဖိုင် | Mobile / A11y ပြဿနာ |
|------|------------------------|
| **App.jsx** | Mobile nav သည် icon ၃ ခုသာဖြစ်ပြီး **label/aria-label မပါ** → screen reader ၌ အဓိပ္ပါယ်မဲ့။ Hamburger menu မရှိ။ Skip-link မရှိ။ |
| **Dashboard.jsx** | Search input သည် **label မပါ** (placeholder သာ)။ Table ကို horizontal scroll ဖြင့်ပြ → ဖုန်းတွင် မကောင်း။ Icon-only button များတွင် aria-label မပါ။ Error banner တွင် `role="alert"` မပါ။ |
| **AddShop.jsx** | Label/input တို့တွင် **id ↔ htmlFor မချိတ်ဆက်ထား**။ Lat/Lng grid သည် `grid-cols-2` → သေးငယ်သော ဖုန်းတွင် ကျဉ်းမြောင်း။ Error banner `role="alert"` မပါ။ |
| **MapView.jsx** | InfoWindow သည် `min-w-[260px]` fixed → ဖုန်းတွင် လွှမ်းထွက်။ Map height `calc(100vh - 180px)` → ဖုန်းတွင် သေးငယ်။ Error banner responsive မဟုတ်။ |
| **ShopDetail.jsx** | Birthday/GPS grid `grid-cols-2` → ဖုန်းတွင် ကျဉ်းမြောင်း။ Error banner `role="alert"` မပါ။ |
| **index.css** | Button/link များတွင် **`:focus-visible` ring** မရှိ → keyboard user အတွက် focus indicator မရှိ။ Skip-link utility မရှိ။ |

## 3. ပြုပြင်မည့် အကြောင်းအရာများ (per-file)

### 3.1 `frontend/src/index.css`
- Global `:focus-visible` ring ထည့်မည် (button, a, [role=button], input) — keyboard focus မြင်သာစေရန်။
- `.skip-link` utility (visually-hidden until focus) ထည့်မည် — "Skip to content" အတွက်။

### 3.2 `frontend/src/App.jsx`
- `<main>` မစတင်မီ **skip link** ("Skip to main content") ထည့်မည်; `<main id="main-content">` + `<main>` (semantic) သေချာစေမည်။
- Desktop nav: `<nav aria-label="Main navigation">` ထည့်မည်။
- Mobile: icon-only ၃ ခုကို **hamburger menu** ဖြင့် အစားထိုးမည် — button (`aria-label="Open menu"`, `aria-expanded`, `aria-controls`) + toggle panel တွင် **labeled** nav links (Dashboard/Add Shop/Map View)။ Focus state ထည့်မည်။
- Icon SVG များတွင် `aria-hidden="true"` ထည့်မည် (decorative icons)။
- သေးငယ်သော screen အတွက် container padding (`px-4 sm:px-6`) ချိန်ညှိမည်။

### 3.3 `frontend/src/pages/Dashboard.jsx`
- Search input: `<label htmlFor="shop-search">` (visually-hidden) + `id="shop-search"` + `aria-label`။
- Heading: `text-3xl sm:text-4xl` ဖြင့် responsive။
- **Table → responsive:** Desktop တွင် table (`hidden md:block` + `overflow-x-auto`)၊ **Mobile တွင် card list** (`md:hidden`) — data နှင့် actions (View Details, Directions) တူညီ။
- Icon-only action buttons: `aria-label="View Details"` / `aria-label="Get Directions"` ထည့်မည်။
- Error banner: `role="alert"` ထည့်မည်။
- Touch target အတွက် action button size (`p-2.5`) → `p-3` (44px နီး) ချိန်ညှိမည်။

### 3.4 `frontend/src/pages/AddShop.jsx`
- Input/textarea အားလုံး: `id` + `htmlFor` ချိတ်ဆက်မည် (Shop Name, Owner Name, Birthday, Address, Lat, Lng, Notes)။
- Lat/Lng grid: `grid-cols-1 sm:grid-cols-2`။
- Error banner: `role="alert"` ထည့်မည်။
- "Detect My Location" / form buttons focus-visible ကို global CSS ဖြင့် ရပြီးသား။

### 3.5 `frontend/src/pages/MapView.jsx`
- InfoWindow content: `min-w-[260px] max-w-sm` → `w-[calc(100vw-2rem)] sm:w-[280px]` responsive + overflow/scroll safety ထည့်မည်။
- Map container: mobile တွင် `min-h` ထည့်မည် (e.g. `minHeight: '60vh'`) — height calc ကို responsive ဖြစ်စေမည်။
- Error banner: `role="alert"` + responsive positioning (`top-4 left-4 right-4` — full-width banner on mobile)။
- Marker `title` ရှိပြီးသား — ထိန်းထားမည်။

### 3.6 `frontend/src/pages/ShopDetail.jsx`
- Birthday/GPS grid: `grid-cols-2 gap-8` → `grid-cols-1 sm:grid-cols-2 gap-6`။
- Error banner: `role="alert"` ထည့်မည်။
- Header (shop profile) padding responsive (`px-6 py-8 sm:px-8 sm:py-10`)။
- Buttons (`flex-1`) — ဖုန်းတွင် column မလို၊ row တွင်ထားနိုင်ကြောင်း သေချာစေမည် (`flex flex-col sm:flex-row gap-4`)။

## 4. ထိခိုက်မှု (Impact)

- ပြောင်းလဲမည့် ဖိုင်: `index.css`, `App.jsx`, `Dashboard.jsx`, `AddShop.jsx`, `MapView.jsx`, `ShopDetail.jsx`
- **ပြောင်းလဲမည့် ဖိုင်: (၆) ခု**
- Functionality/API/backend ကို မထိခိုက်ပါ — UI & markup သာ။
- Dashboard table → mobile card ပြောင်းလဲခြင်းသည် **structure** ပြောင်းမည် (data မပြောင်း)။

## 5. စစ်ဆေးနည်း (Verification)

- Mobile (375px) / tablet (768px) / desktop (1280px) တွင် layout စမ်းသပ်မည်။
- Keyboard tab navigation + visible focus စစ်မည်။
- Screen reader (aria-label / htmlFor / role=alert) စစ်မည်။
- `npm run build` / dev server ဖြင့် errors မရှိကြောင်း အတည်ပြုမည်။

## 6. နောက်တစ်ဆင့်

- ဤ plan ကို မြန်မာဘာသာဖြင့် ပြသပြီးဖြစ်သည်။
- သုံးစွဲသူ **"OK" / "Go ahead"** ပေးမှသာ code ကို စတင်ပြုပြင်မည်။
