# CSS Import Order အမှား ပြင်ဆင်ရန် အစီအစဉ်

`frontend/src/index.css` ဖိုင်ရှိ `@import` statement သည် အခြား css rules များထက် စောပြီး တည်ရှိရမည် ဖြစ်သော်လည်း လက်ရှိတွင် `@tailwind` ညွှန်ကြားချက်များ၏ နောက်တွင် ရှိနေသည့်အတွက် Vite build/dev process တွင် error တက်နေခြင်းကို ပြင်ဆင်ရန် ဖြစ်သည်။

## Proposed Changes (အဆိုပြုပြင်ဆင်ချက်များ)

### Frontend Component

#### [MODIFY] [index.css](file:///c:/Users/PC/Desktop/field-operation-app/frontend/src/index.css)

`@import` statement ကို `@tailwind` ညွှန်ကြားချက်များထက် အရင်ဦးဆုံး ရောက်ရှိစေရန် ဖိုင်၏ ထိပ်ဆုံးသို့ ရွှေ့ပါမည်။

**လက်ရှိ ကုဒ်:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
```

**ပြင်ဆင်မည့် ကုဒ်:**
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Verification Plan (စစ်ဆေးမှု အစီအစဉ်)

1. Frontend directory ထဲတွင် dev server ကို run ပါမည် (`npm run dev`)။
2. CSS import loading error မရှိတော့ဘဲ Google Fonts (Outfit) ကောင်းမွန်စွာ load လုပ်နိုင်ခြင်း ရှိမရှိ browser တွင် စစ်ဆေးပါမည်။
