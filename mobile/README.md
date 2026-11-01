# SELF Mobile Companion (React Native / Expo)

The native mobile accountability companion engineered around behavioral psychology (*100 Things Every Designer Needs to Know About People* by Susan Weinschenk) and the Kaizen philosophy of incremental, compounding improvement.

---

## 🚀 Quickstart: Run Instantly on Your Android Phone

You can run this companion app directly on your physical phone in **30 seconds** without cables or build toolchains:

### Step 1: Install Expo Go
- On your Android phone, install **Expo Go** from the Google Play Store (free).

### Step 2: Start the Bundler
In this directory (`Projects/Self/mobile`):
```bash
npx expo start
```
- A large QR code will appear in your terminal.

### Step 3: Scan & Launch
- Open the **Expo Go** app on your phone.
- Tap **"Scan QR code"** and point your camera at the terminal.
- The app will load onto your phone with **120Hz native touch gestures**, **hardware haptic feedback**, and **0ms offline latency**!

---

## 📱 Core Features & Daily Workflow

### 1. The Ritual Timeline ("Now" Mode)
- Dynamically adapts to your exact time of day:
  - `05:30 - 08:30`: **Morning Ritual** (Calisthenics, Ankle Prehab, Hydration).
  - `08:30 - 10:15`: **Deep Work Block 1** (Core Code Engine: Quant Bot / Paper Thoughts).
  - `10:15 - 11:30`: **Midday Reset & Hydrate**.
  - `11:30 - 13:00`: **Deep Work Block 2** (Course Sprint: MIT OCW Multivariable Calc).
  - `13:00 - 14:30`: **Lunch & Midday Life Buffer**.
  - `14:30 - 15:45`: **Deep Work Block 3** (Fellowships / Technical Paper).
  - `15:45 - 20:00`: **Open Life Buffer** (5+ hours of zero-guilt breathing room for unplanned necessities).
  - `20:00 - 21:30`: **Evening Sanctuary** (Guitar 15m, Creative Quests, Reflection).

### 2. Kaizen Movement & Progressive Overload Engine
- **Pushups**, **Horse Stance**, **Active Dead Hang**, **Situps**.
- **1-Tap Set Logging**: Tapping any set button records completion with tactile haptic vibration and auto-starts a 45-second rest countdown.
- **The 3-Session Overload Rule**: When you hit your targets for 3 consecutive clean sessions, SELF triggers an overload prompt before your next session:
  > *"You mastered 3×10 pushups 3 times in a row! Step up to 3×11 today? [Accept / Hold]"*
- **Technique Form Guides & Motion Loops (`ℹ️ Form`)**:
  - Tapping `ℹ️ Form` next to any exercise opens a visual motion loop animation, anatomical cues, mistakes to avoid, Kaizen tempo guidelines, and a curated video demonstration.
- **Left Ankle Prehab**: Dedicated prehab cards for *Tibialis Wall Raises*, *Slow Eccentric Calf Raises*, *Couch Stretch*, and *90-90 Hip Flow* on Tue/Thu/Sat active recovery days.

### 3. The 3-Pillar Integrity Protocol
- **Hydration**: 1-tap `+500ml Glass` button with ripple progress toward 3,000ml.
- **Satiety Guard (*Hara Hachi Bu*)**: Rating Breakfast, Lunch, and Dinner on a 1–5 scale. Target is Level 3 (80% full / satisfied) to dismantle compulsive overeating.
- **Discreet Purity Shield**: Clean day streak counter for No Nut November & Celibacy.
- **⚡ Emergency Urge Defeater**: A 3-step pattern-interrupt protocol:
  1. *30s Cold Water Shock* (mammalian dive reflex).
  2. *30s Somatic Horse Stance* (adrenaline transmutation).
  3. *Grounding Prayer & Identity Realignment*.

### 4. Instant 3-Second Spend Logger
- Tap the floating `[₦ Quick Log]` button anywhere in the app.
- Type the amount on the clean mobile NumPad (e.g. `1500`).
- Tap one of the 5 smart quick-tags:
  - `[🍽 Food]`
  - `[🚗 Transport]`
  - `[📱 Data]`
  - `[🎁 Gift]`
  - `[🔧 Misc]`
- Saves in **1.8 seconds** with haptics. Zero form friction.

### 5. Universal 90-Minute Focus Shield
- Built-in countdown ring with project tagging (*Quant Bot*, *Paper Thoughts*, *MIT OCW Calc*, *Fellowships*, *Technical Paper*).
- Prevents runaway hyperfocus burnout.
- When 90 minutes elapses, automatically triggers a mandatory 15-minute eye, posture, and hydration reset.

### 6. Guilt-Free Evening Sanctuary
- **15-Minute Acoustic Guitar Anchor**: Daily tactile acoustic decompression.
- **Weekly "Rule of 1" Creative Quests**: Complete at least 1 session of *Photo Editing*, *Novel Reading*, and *Poem/Story Drafting* per week. Non-punitive: no broken streaks if you need pure rest.
- **60-Second Micro-Journal**: Captures wins, friction observations, and tomorrow's #1 anchor block.

---

## 📦 Building Standalone Android APK

When you want an installable `.apk` file:
```bash
npm install -g eas-cli
eas build -p android --profile preview
```
EAS Build will generate an APK download link that you can install directly on any Android device.

