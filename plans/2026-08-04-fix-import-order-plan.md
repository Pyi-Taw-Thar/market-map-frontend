# စီမံချက် (Implementation Plan) — Fix CSS @import Order

- **နေ့စွဲ:** 2026-08-04
- **ဖိုင်:** `frontend/src/index.css`
- **အဆင့်:** စောင့်ဆိုင်းနေသည် — သုံးစွဲသူ အတည်ပြုချက် လိုအပ်သည်

## 1. ပြဿနာ

Build က warning ပြသည်: `@import must precede all other statements` — index.css:5 ၌
font `@import url('.../Outfit...')` သည် `@tailwind base/components/utilities` directives
များ၏ **နောက်တွင်** ရှိနေသောကြောင့် ဖြစ်သည်။ CSS စည်းမျဉ်းအရ `@import` သည်
ဖိုင်အစဆုံးတွင် ဖြစ်ရမည်။

## 2. ဖြေရှင်းနည်း

`@import url('.../Outfit...')` line (လက်ရှိ line 5) ကို `@tailwind` directives များ၏
**ရှေ့သို့** ရွှေ့မည်။

- **မှ (ယခု):**
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  @import url('.../Outfit...');
  ```
- **သို့:**
  ```css
  @import url('.../Outfit...');
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

## 3. ထိခိုက်မှု

- ဖိုင်တစ်ခုတည်း၊ line ရွှေ့မှု တစ်ခုတည်းသာ — CSS ဝိသေသန (font) မပြောင်းပါ၊
  render/responsive/a11y ကို မထိခိုက်ပါ။

## 4. စစ်ဆေးနည်း

- `npm run build` ပြန်လည်လုပ်ဆောင်ပြီး warning ပျောက်ကြောင်း အတည်ပြုမည်။

## 5. နောက်တစ်ဆင့်

- သုံးစွဲသူ **"OK" / "Go ahead"** ပေးမှသာ ပြုပြင်မည်။