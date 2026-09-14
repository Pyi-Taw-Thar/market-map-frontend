# မြေပုံပေါ်တွင် Pin ထောက်၍ ဆိုင်အသစ်ထည့်သွင်းခြင်းနှင့် ထည့်သွင်းပြီးပါက မြေပုံပေါ်တွင် တိုက်ရိုက်ပြသခြင်း စီမံချက် (Implementation Plan)

## ပြဿနာနှင့် လိုအပ်ချက် သုံးသပ်ချက် (Analysis)

အသုံးပြုသူ၏ လိုအပ်ချက်နှင့် လက်ရှိအခြေအနေ-
1. **မြေပုံပေါ်တွင် Pin ထောက်ခွင့် မရှိသေးခြင်း:** လက်ရှိ [MapView.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/MapView.jsx) တွင် စာရင်းသွင်းပြီးသား ဆိုင်များကိုသာ ကြည့်ရှုနိုင်ပြီး မြေပုံပေါ်တွင် click နှိပ်၍ Pin အသစ်ထောက်ကာ ဆိုင်ထည့်သွင်းနိုင်သည့် လုပ်ဆောင်ချက် မရှိသေးပါ။
2. **ဆိုင်ထည့်သွင်းပြီးပါက Dashboard သို့သာ ရောက်သွားခြင်း:** [AddShop.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/AddShop.jsx) တွင် ဆိုင်အသစ် သိမ်းဆည်းပြီးပါက `navigate("/")` ဖြင့် Dashboard သို့သာ သွားနေပြီး မြေပုံစာမျက်နှာသို့ မရောက်ရှိပါ။
3. **Default Center သည် New York ဖြစ်နေခြင်း:** [MapView.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/MapView.jsx) နှင့် [AddShop.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/AddShop.jsx) နှစ်ခုလုံးတွင် Default Coordinates သည် New York (`lat: 40.7128, lng: -74.0060`) ဖြစ်နေသောကြောင့် ဆိုင်မရှိသေးချိန် သို့မဟုတ် ဆိုင်သစ်ထည့်ချိန်တွင် မြန်မာနိုင်ငံ (ရန်ကုန်) မြေပုံမပေါ်ဘဲ ဖြစ်နေခြင်း။

---

## အဆိုပြု ပြင်ဆင်ချက်များ (Proposed Changes)

### Frontend Modifications

#### 1. [MODIFY] [MapView.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/MapView.jsx)
- **Default Center ကို ရန်ကုန်သို့ ပြောင်းလဲခြင်း:**
  `defaultCenter` အား ရန်ကုန်မြို့ Coordinates (`lat: 16.8409, lng: 96.1735`) သို့ ပြောင်းလဲပါမည်။
- **မြေပုံပေါ်တွင် Click နှိပ်၍ Pin ထောက်နိုင်ခြင်း (`onMapClick`):**
  - အသုံးပြုသူ မြေပုံပေါ် နေရာလွတ်တစ်ခုခုကို click နှိပ်လိုက်ပါက ယာယီ Pin အသစ် (New Pin Marker) ကျလာစေမည်။
  - အဆိုပါ နေရာ၏ လိပ်စာ (Address) ကို Google Geocoder ဖြင့် အလိုအလျောက် ရယူပေးမည်။
  - "Add Shop Here" popup ခလုတ် သို့မဟုတ် Modal Dialog ပွင့်လာမည်။
- **Quick Add Shop Modal ပေါင်းထည့်ခြင်း:**
  - မြေပုံပေါ်မှ မထွက်ဘဲ ဆိုင်အမည်၊ ပိုင်ရှင်အမည်၊ ဖုန်းနံပါတ်၊ မွေးနေ့၊ မှတ်ချက်တို့ကို တိုက်ရိုက် ဖြည့်စွက်၍ Save နှိပ်နိုင်မည့် Modal Component တစ်ခု ထည့်သွင်းပေးမည်။
  - ဆိုင်သစ် Save လုပ်ပြီးပါက Backend သို့ ပေးပို့ကာ `shops` state ထဲသို့ ချက်ချင်း ပေါင်းထည့်ပေးမည် ဖြစ်သောကြောင့် မြေပုံပေါ်တွင် Pin အသစ် ချက်ချင်း ပေါ်လာပြီး InfoWindow ပါ အလိုအလျောက် ပွင့်ပြပေးမည်။
- **Navigation State မှ လာသော ဆိုင်ကို Focus ပြုလုပ်ခြင်း:**
  - `AddShop` စာမျက်နှာမှ ဆိုင်ထည့်သွင်းပြီး ပြန်ရောက်လာပါက အဆိုပါ ဆိုင်အသစ်နေရာသို့ မြေပုံ center ရွှေ့ပေးပြီး InfoWindow ပွင့်စေမည်။

#### 2. [MODIFY] [AddShop.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/AddShop.jsx)
- **Default Center ကို ရန်ကုန်သို့ ပြောင်းလဲခြင်း:**
  `defaultCenter` အား ရန်ကုန်မြို့ Coordinates (`lat: 16.8409, lng: 96.1735`) သို့ ပြောင်းလဲပါမည်။
- **ဆိုင်ထည့်သွင်းပြီးပါက Map View သို့ တိုက်ရိုက် ပြန်ညွှန်းပေးခြင်း:**
  `await shopService.createShop(submissionData)` အောင်မြင်ပါက `navigate("/map", { state: { newShopId: response._id } })` ဖြင့် မြေပုံစာမျက်နှာသို့ တိုက်ရိုက် ပို့ဆောင်ပေးမည်။
- **URL Parameters / Location State မှ Coordinate များ လက်ခံနိုင်စေခြင်း:**
  မြေပုံမှတစ်ဆင့် Add Shop စာမျက်နှာသို့ လာရောက်ပါက ရွေးချယ်ထားသော Lat/Lng များကို အလိုအလျောက် ဖြည့်သွင်းထားပေးမည်။

---

## အတည်ပြုချက် ရယူရန် (User Review Required)

> [!IMPORTANT]
> - မြေပုံ (MapView) ပေါ်တွင် နေရာလွတ်ကို click နှိပ်၍ Pin အသစ်ထောက်ပြီး ဆိုင်အချက်အလက် ဖြည့်စွက်နိုင်ရန် **Quick Add Shop Modal** အား MapView မျက်နှာပြင်တွင် တိုက်ရိုက် ထည့်သွင်းပေးရန် စီစဉ်ထားပါသည်။
> - ထို့အပြင် မူလ [AddShop](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/AddShop.jsx) စာမျက်နှာမှ ဆိုင်အသစ် ထည့်သွင်းပြီးလျှင်လည်း Dashboard သို့ မသွားတော့ဘဲ မြေပုံ ([MapView](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/pages/MapView.jsx)) သို့ တိုက်ရိုက် ရောက်ရှိသွားစေမည် ဖြစ်ပါသည်။

---

## စစ်ဆေးမှု အစီအစဉ် (Verification Plan)

### Manual Verification
1. **မြေပုံပေါ်တွင် Pin ထောက်ခြင်း စမ်းသပ်ခြင်း:**
   - Map View စာမျက်နှာသို့ သွားရောက်မည်။
   - မြေပုံပေါ်တွင် ကြိုက်နှစ်သက်ရာ နေရာကို Click နှိပ်မည်။
   - ယာယီ Pin အသစ် ကျလာပြီး ဆိုင်ထည့်သွင်းမည့် Modal ပွင့်လာခြင်း ရှိမရှိ စစ်ဆေးမည်။
2. **ဆိုင်အသစ် သိမ်းဆည်းပြီး မြေပုံပေါ်တွင် ချက်ချင်း ပေါ်လာခြင်း စစ်ဆေးခြင်း:**
   - အချက်အလက်များ ဖြည့်စွက်ပြီး "Save Shop" ခလုတ်ကို နှိပ်မည်။
   - ဒေတာဘေ့စ်သို့ သိမ်းဆည်းပြီးသည်နှင့် မြေပုံပေါ်တွင် Pin အမှတ်အသား အသစ် ချက်ချင်း ထွက်ပေါ်လာပြီး ဆိုင်အချက်အလက် InfoWindow ပွင့်လာခြင်း ရှိမရှိ စစ်ဆေးမည်။
3. **Add Shop စာမျက်နှာမှ ထည့်သွင်းခြင်း စမ်းသပ်ခြင်း:**
   - Navigation မှ "Add Shop" သို့ သွားမည်။
   - ရန်ကုန်မြို့ တည်နေရာဖြင့် ဆိုင်အသစ်တစ်ခုကို သိမ်းဆည်းမည်။
   - သိမ်းဆည်းပြီးပါက Map View စာမျက်နှာသို့ အလိုအလျောက် ပြန်ရောက်သွားပြီး ထည့်သွင်းလိုက်သော ဆိုင် Pin အား မြေပုံပေါ်တွင် တွေ့မြင်ရခြင်း ရှိမရှိ စစ်ဆေးမည်။
