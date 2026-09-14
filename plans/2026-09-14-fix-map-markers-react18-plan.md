# မြေပုံပေါ်တွင် Pin (Markers) များ မပေါ်သည့် ပြဿနာအား ဖြေရှင်းရန် စီမံချက် (Implementation Plan)

## ပြဿနာ ဖြစ်ပွားရသည့် အကြောင်းရင်း (Root Cause Analysis)

လက်ရှိ Database ထဲတွင် ဆိုင် ၃ ဆိုင် (Moe Shwe, TEST, OTAS Tech Solutions) အောင်မြင်စွာ ရှိနေသော်လည်း မြေပုံပေါ်တွင် Pin များ မပေါ်ရသည့် အဓိက အကြောင်းရင်းမှာ-
- ပရောဂျက်တွင် **React 18** ကို အသုံးပြုထားပါသည်။
- `@react-google-maps/api` library တွင် မူလ `<Marker>` နှင့် `<InfoWindow>` (Class-based components) များသည် React 18 ၏ Concurrent Rendering နှင့် Lifecycle ကြောင့် Google Maps ပေါ်တွင် Pin instance များ mount မဖြစ်ဘဲ ပျောက်ဆုံးသွားတတ်ပါသည်။
- ၎င်းပြဿနာအတွက် `@react-google-maps/api` က React 18 အတွက် သီးသန့် ထုတ်လုပ်ပေးထားသော Functional Components ဖြစ်သည့် **`<MarkerF>`** နှင့် **`<InfoWindowF>`** ကို အသုံးပြုရမည် ဖြစ်ပါသည်။

---

## အဆိုပြု ပြင်ဆင်ချက်များ (Proposed Changes)

### 1. [MODIFY] [MapView.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/MapView.jsx)
- **`MarkerF` နှင့် `InfoWindowF` သို့ ပြောင်းလဲခြင်း:**
  `@react-google-maps/api` မှ `Marker` နှင့် `InfoWindow` အစား `MarkerF` နှင့် `InfoWindowF` ကို ပြောင်းလဲ import လုပ်ပြီး အသုံးပြုပါမည်။
  ```javascript
  import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
  ```
- **Coordinates တန်ဖိုးများကို Number အဖြစ် သေချာစွာ စစ်ဆေးပေးခြင်း:**
  `position={{ lat: Number(shop.location.lat), lng: Number(shop.location.lng) }}` ဟု သေချာစွာ parse ပြုလုပ်ပေးပါမည်။
- **မြေပုံ Fit Bounds (Auto Zoom & Center):**
  ဆိုင်များ load ဖြစ်လာသည့်အခါ ဆိုင်အားလုံး တစ်ပြိုင်နက် မြင်ကွင်းထဲသို့ အကုန်ရောက်ရှိစေရန် `map.fitBounds()` ဖြင့် အလိုအလျောက် ဗဟိုပြုပေးပါမည်။

### 2. [MODIFY] [AddShop.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/AddShop.jsx)
- `Marker` အစား `MarkerF` သို့ ပြောင်းလဲအသုံးပြုပေးပါမည်။

---

## စစ်ဆေးမှု အစီအစဉ် (Verification Plan)

### Manual Verification
1. **မြေပုံပေါ်တွင် ဆိုင် Pin များ ပေါ်လာခြင်း စစ်ဆေးခြင်း:**
   - Browser တွင် Map View (`/map`) စာမျက်နှာကို Refresh လုပ်ပါမည်။
   - Database ထဲရှိ ဆိုင် ၃ ဆိုင်လုံး၏ Pin အမှတ်အသားများ ရန်ကုန်မြေပုံပေါ်တွင် ချက်ချင်း ထွက်ပေါ်လာခြင်း ရှိမရှိ စစ်ဆေးပါမည်။
2. **Pin နှိပ်၍ InfoWindow ဖွင့်လှစ်ခြင်း:**
   - ဆိုင် Pin တစ်ခုခုကို Click နှိပ်ပါက ဆိုင်အချက်အလက် InfoWindow ကောင်းမွန်စွာ ပွင့်လာခြင်း ရှိမရှိ စစ်ဆေးပါမည်။
3. **Pin အသစ်ထောက်ခြင်း စစ်ဆေးခြင်း:**
   - မြေပုံပေါ်တွင် Click နှိပ်၍ Pin အသစ်ထောက်ပြီး ဆိုင်အသစ် ထပ်မံထည့်သွင်းကြည့်ပါမည်။
