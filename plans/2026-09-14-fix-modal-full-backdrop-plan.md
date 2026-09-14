# Modal အနောက်ရှိ မည်းနက်သော အရိပ် (Backdrop Overlay) မျက်နှာပြင်အပြည့် ဖြစ်စေရန် ပြင်ဆင်မည့် စီမံချက် (Implementation Plan)

## ပြဿနာ ဖြစ်ပွားရသည့် အကြောင်းရင်း (Root Cause Analysis)

အသုံးပြုသူ ပေးပို့ထားသော ဓာတ်ပုံအရ "Add Shop at this Pin" Modal ပွင့်လာချိန်တွင် အနောက်ရှိ မည်းနက်သော အရိပ် (Backdrop Overlay) သည် မျက်နှာပြင်တစ်ခုလုံး (အပေါ် Navbar အပါအဝင်) အပြည့် မဖုံးလွှမ်းဘဲ ဖြစ်နေပါသည်။
1. **Stacking Context နှင့် Navbar z-index:** အပေါ် Navigation Bar (`nav`) တွင် `sticky top-0 z-50` သတ်မှတ်ထားပြီး Modal မှာမူ `<main>` container အတွင်းတွင် ရှိနေသောကြောင့် Navbar ၏ အောက်သို့ ရောက်ရှိနေပြီး Navbar နေရာတွင် အရိပ်မကျဘဲ ဖြစ်နေခြင်း။
2. **Container ကန့်သတ်ချက်:** Modal သည် ပင်မ စာမျက်နှာ DOM အောက်တွင် ရှိနေသဖြင့် `container mx-auto` စသည့် parent layout များ၏ လွှမ်းမိုးမှု ခံနေရခြင်း။

---

## အဆိုပြု ပြင်ဆင်ချက်များ (Proposed Changes)

### [MODIFY] [MapView.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/MapView.jsx)
1. **React Portal (`createPortal`) အသုံးပြုခြင်း:**
   - Modal အား `document.body` သို့ တိုက်ရိုက် Mount ပြုလုပ်နိုင်ရန် `react-dom` မှ `createPortal` ဖြင့် ရေးဆွဲပါမည်။
   - ၎င်းသည် React တွင် Modal များအတွက် အကောင်းဆုံး နည်းလမ်း (Standard Practice) ဖြစ်ပြီး Parent container များ၏ ကန့်သတ်ချက်မှ လုံးဝ ကင်းလွတ်သွားစေပါသည်။
2. **မျက်နှာပြင် အပြည့် Overlay နှင့် z-index အဆင့်မြှင့်တင်ခြင်း:**
   - Modal ၏ အပြင်ဘက် Backdrop အား `fixed inset-0 w-screen h-screen z-[9999] bg-black/60 backdrop-blur-sm` ဖြင့် သတ်မှတ်ပေးပါမည်။
   - ထို့ကြောင့် အပေါ် Navigation Bar အပါအဝင် မျက်နှာပြင် တစ်ခုလုံးကို ၁၀၀% မည်းနက်သော အရိပ်ဖြင့် အပြည့်အဝ ဖုံးလွှမ်းသွားစေမည် ဖြစ်ပါသည်။
3. **Modal Dialog ညာဘက်အနားသတ် ဒီဇိုင်း သပ်ရပ်စေခြင်း:**
   - Scrollbar နှင့် အနားသတ်များ အပြည့်အဝ အချိုးကျလှပစေရန် ချိန်ညှိပေးပါမည်။

---

## စစ်ဆေးမှု အစီအစဉ် (Verification Plan)

### Manual Verification
1. Browser တွင် Map View (`/map`) စာမျက်နှာသို့ သွားပါမည်။
2. မြေပုံပေါ်တွင် Click နှိပ်၍ "Add Shop at this Pin" Modal ကို ဖွင့်ပါမည်။
3. Modal ပွင့်လာချိန်တွင် အပေါ် Navbar အပါအဝင် မျက်နှာပြင်တစ်ခုလုံး ၁၀၀% မည်းနက်သော အရိပ် (Backdrop) ဖြင့် သပ်ရပ်စွာ အပြည့် ဖုံးလွှမ်းသွားခြင်း ရှိမရှိ စစ်ဆေးပါမည်။
