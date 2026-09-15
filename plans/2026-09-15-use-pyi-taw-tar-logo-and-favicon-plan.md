# Navbar Logo နှင့် Chrome Tab Favicon အဖြစ် pyi-taw-tar.jpg အသုံးပြုခြင်း စီမံချက်

## ပြောင်းလဲမှု ရည်ရွယ်ချက် (Objective)
အသုံးပြုသူ၏ တောင်းဆိုချက်အရ `frontend/public/pyi-taw-tar.jpg` ပုံကို:
1. Navbar တွင် လက်ရှိသုံးထားသော Location Pin SVG Icon အစား Application Logo အဖြစ် အသုံးပြုရန်
2. Chrome Tab (Browser Tab) ၏ Favicon အဖြစ် Vite icon အစား အသုံးပြုရန်

> [!NOTE]
> အသုံးပြုသူမှ Browser ဖြင့် မစမ်းသပ်ရန်နှင့် ကိုယ်တိုင် manual စမ်းသပ်စစ်ဆေးမည်ဖြစ်ကြောင်း ကြိုတင်ညွှန်ကြားထားပါသည်။

---

## အဆိုပြု ပြင်ဆင်ချက်များ (Proposed Changes)

### ၁။ Chrome Tab Favicon ပြင်ဆင်ခြင်း — [index.html](file:///c:/Users/PC/Desktop/field-operation-app/frontend/index.html)
- `index.html` ၏ line 5 တွင်ရှိသော `<link rel="icon" type="image/svg+xml" href="/vite.svg" />` ကို:
  `<link rel="icon" type="image/jpeg" href="/pyi-taw-tar.jpg" />` အဖြစ် ပြောင်းလဲသတ်မှတ်မည်။

### ၂။ Navbar Logo ပြင်ဆင်ခြင်း — [App.jsx](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/App.jsx)
- `App.jsx` ၏ Navbar header အပိုင်း (lines 111-137) တွင် လက်ရှိ သုံးထားသော အစိမ်းရောင် SVG Icon wrapper အစား:
  ```jsx
  <Link to="/" className="flex items-center gap-3 group">
    <img
      src="/pyi-taw-tar.jpg"
      alt="Pyi Taw Tar Logo"
      className="w-10 h-10 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
    />
    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
      PTT Marketing Map
    </h1>
  </Link>
  ```
  Logo ပုံလေးအား နှိပ်ပါက Home (Dashboard) သို့ ပြန်သွားနိုင်ရန် Link ဖြင့် ချိတ်ဆက်ပေးမည်ဖြစ်ပြီး Rounded corner နှင့် subtle shadow ဖြင့် အလွန်ကြည့်ကောင်းအောင် ပြင်ဆင်ပါမည်။

---

## စမ်းသပ်စစ်ဆေးမည့် အစီအစဉ် (Verification Plan)
- Browser subagent အသုံးမပြုဘဲ ဖိုင်များ syntactically မှန်ကန်စွာ compile ဖြစ်ခြင်း ရှိ/မရှိ build check (သို့မဟုတ် lint check) ဖြင့်သာ စစ်ဆေးမည်။
- အသုံးပြုသူမှ Chrome Browser တွင် reload ပြုလုပ်၍ manual စမ်းသပ်စစ်ဆေးမည် ဖြစ်ပါသည်။
