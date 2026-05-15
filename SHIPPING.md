# Shipping to App Stores Guide

This guide covers the final steps required to publish Sirrine School to the **Amazon Appstore** and **Google Play Store**.

## 🛠️ Prerequisites
1.  **Android Studio** installed on your Windows host.
2.  **Amazon Developer Account** (Free) - [Register here](https://developer.amazon.com/)
3.  **Google Play Console Account** ($25) - [Register here](https://play.google.com/console/)

---

## 🏗️ Step 1: Technical Prep (Automated)
Run these commands in your terminal to ensure the code and assets are ready:
```bash
# 1. Sync the latest web code to the Android project
npm run mobile:sync

# 2. Increment the version number (Must do this for every store upload!)
npm run mobile:version

# 3. Generate native icons and splash screens
npm run mobile:assets
```

---

## 📦 Step 2: Build the Signed App (Manual)
You must digitally "sign" the app to prove you are the owner.
1.  Open **Android Studio**.
2.  Open the project folder: `C:\Users\jonat\~projects\SirrineSchool\android`.
3.  Go to **Build > Generate Signed Bundle / APK...**
4.  Select **Android App Bundle** and click Next.
5.  **Key Store Path:** If you don't have one, click **Create new...**
    -   *Crucial:* Save this file safely! If you lose it, you can never update your app again.
6.  Fill in the passwords and details, then click Next.
7.  Select **Release** build and click **Finish**.
8.  Android Studio will generate a `.aab` file in `android/app/release/`.

---

## 🚀 Step 3: Upload to Store
### Amazon Appstore (Fire Tablets)
1.  Log in to the Amazon Developer Console.
2.  Click **Add a New App > Android**.
3.  **App Details:**
    -   *Name:* Sirrine School
    -   *Category:* Education
    -   *Privacy Policy URL:* `https://sirrine-school-4c20b3093b37.herokuapp.com/privacy.html`
4.  **Upload:** Drop the `.aab` (or `.apk`) file you generated.
5.  **Targeting:** Select "Amazon Fire tablets."
6.  **Submit!**

### Google Play Store
1.  Log in to Google Play Console.
2.  Create a new app.
3.  Follow the **"Initial Setup"** tasks (Declaration of Target Age, Data Safety, etc.).
    -   *Target Age:* 5 and under / 6-8.
    -   *Data Safety:* Select "No" to data collection.
4.  **Production > Create new release.**
5.  Upload the `.aab` file.
6.  **Submit!**

---

## 🔐 Privacy Policy
Both stores require a public URL. Your COPPA-compliant policy is live at:
`https://sirrine-school-4c20b3093b37.herokuapp.com/privacy.html`
