# 🍎 Apple App Store Review Compliance Check - YourFuture

**Datum:** 28 januari 2026  
**Status:** ⚠️ **KRITIEKE PROBLEMEN GEVONDEN** - App zal waarschijnlijk AFGEWEZEN worden

---

## 📋 Executive Summary

De app heeft **5 kritieke en 8 waarschuwings-niveau issues** die moeten worden opgelost voordat Apple Review zal slagen. De meest ernstige zijn:
1. **Blootgestelde Firebase API Keys** (beveiligingsrisico)
2. **Ontbrekende Privacy Policy & Terms of Service**
3. **Ontbrekende App Store metadata**
4. **Backend dependency issues**
5. **Incomplete Privacy Manifest**

---

## 🚨 KRITIEKE PROBLEMEN (MOET REPAREREN)

### 1. **Firebase API Keys Hardcoded in Client Code** ⚠️ SECURITY RISK
**Status:** KRITIEK  
**Locatie:** `App.js:59-69`, `firebase.js:4-14`, `firebase-node.js:5-15`

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBCVfUpTplRIqiLAcgHrc5VVA7LO6T_Bbc",
  // ↑ Deze sleutel is nu publiek beschikbaar!
};
```

**Problemen:**
- API keys zijn zichtbaar in app binary (decompiling)
- Iemand kan deze keys gebruiken voor ongeautoriseerde Firebase access
- Apple kan app afwijzen wegens beveiligingsrisico

**Oplossing:**
- Verwijder API keys uit client code
- Zet environment variables in `app.config.js` / `eas.json`
- Gebruik Firebase Security Rules om te beperken wat anonieme users kunnen doen

**Actie:** [Zie Fix #1 hieronder]

---

### 2. **Ontbrekende Privacy Policy & App Store Metadata** 📝
**Status:** KRITIEK

**Wat ontbreekt:**
- ❌ Privacy Policy URL (vereist voor App Store)
- ❌ Terms of Service
- ❌ Contactgegevens developer
- ❌ Support URL
- ❌ App description/screenshots/keywords

**Waarom dit probleem:**
- Apple accepteert geen apps zonder Privacy Policy
- App Store Connect vereist deze info

**Oplossing:**
1. Maak privacy policy (bijv. via Termly.io of Legal Monster)
2. Host het op een domein
3. Voeg URL toe aan `app.json`

**Voorbeeld app.json:**
```json
{
  "expo": {
    "infoPlist": {
      "NSContactsUsageDescription": "Optioneel - voor contact met vrienden"
    }
  }
}
```

---

### 3. **Ontbrekende Privacy Manifest (NSPrivacy)** 📄
**Status:** KRITIEK (voor iOS 17+)

**Huidige situatie:**
- `PrivacyInfo.xcprivacy` is bijna leeg: `NSPrivacyCollectedDataTypes` is `<array/>`

**Wat moet erin:**
App gebruikt gegevens die moeten worden gerapporteerd:
- User profile data (naam, bio, contactgegevens)
- Task/goal data (persoonlijke informatie)
- Firebase analytics

**Actie:** [Zie Fix #2 hieronder]

---

### 4. **Backend Server als Dependency** 🖥️
**Status:** KRITIEK

**Probleem:**
- App vereist lokale MongoDB + Node.js backend (`server.js`)
- Dit werkt niet in App Store Review environment
- Firebase database gebruikt, maar backend is ook vereist

**Vragen:**
- ❓ Is backend cloud-gehoost of lokaal?
- ❓ Is het vereist voor app functionaliteit?

**Oplossing:**
- Maak cloud deployment (Firebase Cloud Functions, Vercel, Heroku, Railway)
- Of: verwijder backend dependency en gebruik pure Firebase
- Voeg config toe voor production backend URL

---

### 5. **Google Sign-In Setup Onvolledig** 🔐
**Status:** KRITIEK

**Vereiste stappen:**
- ❓ Google OAuth2 geconfigureerd in Firebase?
- ❓ iOS Bundle ID ingesteld in Google Cloud Console?
- ❓ Sign-in credentials in Xcode?

**Info.plist heeft custom URL schemes:**
```xml
<string>deffinal</string>
<string>casper.YourFuture.V1</string>
```
Dit moet matchen met Firebase + Google Sign-In config.

---

## ⚠️ WAARSCHUWINGS-NIVEAU (MOET CONTROLEREN)

### 6. **Ontbrekende Usage Descriptions in Info.plist**
**Status:** WAARSCHUWING

De app gebruikt mogelijks:
- ✅ Netwerk (impliciete online/offline detectie)
- ❓ Contacten (voor Add People feature?)
- ❓ Foto's/Camera (voor profielfoto's?)

**Vereist voor App Store:**
```xml
<key>NSContactsUsageDescription</key>
<string>We use your contacts to help you find friends</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>To set your profile picture</string>
```

**Actie:** [Zie Fix #3 hieronder]

---

### 7. **Incomplete Bundle Identifier Configuration**
**Status:** WAARSCHUWING

`app.config.js`:
```javascript
bundle: "com.huijsen.yourfuture", // Nederlands domein?
```

**Issue:** Ziet er informeel uit. Beter:
- `com.yourcompany.yourfuture`
- `com.richardmos.yourfuture`

---

### 8. **Version Number Hardcoded**
**Status:** WAARSCHUWING

`app.config.js` heeft `version: "1.0.0"` hardcoded.  
Dit maakt updates lastig.

**Beter:** Voeg environment variable toe:
```javascript
version: process.env.APP_VERSION || "1.0.0",
```

---

### 9. **No Crash Reporting/Analytics**
**Status:** WAARSCHUWING

Firebase Analytics is ingesteld maar:
- ❓ Wordt het gebruikt?
- ❓ Zijn events trackend?

Apple waardeert crash reporting (via Sentry, BugSnag, etc.)

---

### 10. **Testflight/Production Configuratie**
**Status:** WAARSCHUWING

`eas.json` heeft development build, maar geen production config.

**Vereist voor submission:**
```json
{
  "build": {
    "production": {
      "ios": {
        "buildType": "app-store"
      }
    }
  }
}
```

---

### 11. **Database Security Rules Onbekend**
**Status:** WAARSCHUWING

Firebase Realtime DB gebruikt geen mention van security rules.

**Probleem:** Op "development" ingesteld = iedereen kan alles lezen/schrijven!

**Vereist:**
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

### 12. **No Error Handling/Crashes**
**Status:** WAARSCHUWING

App heeft veel try/catch, maar:
- ❓ Wat gebeurt er bij Firebase connection failure?
- ❓ Geeft app bruikbare error messages?

Slechte UX = lage ratings.

---

## ✅ QUICK FIXES

### Fix #1: Verwijder Hardcoded API Keys
**Stappen:**

1. **Maak `.env.local` (NIET in git):**
```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBCVfUpTplRIqiLAcgHrc5VVA7LO6T_Bbc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=messages1-fb178.firebaseapp.com
# ... rest van config
```

2. **Update `app.config.js`:**
```javascript
export default ({ config }) => ({
  ...config,
  name: "Your Future",
  extra: {
    firebaseConfig: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    },
  },
});
```

3. **Update `App.js`:**
```javascript
import Constants from 'expo-constants';
const firebaseConfig = Constants.expoConfig?.extra?.firebaseConfig;
const app = initializeApp(firebaseConfig);
```

---

### Fix #2: Privacy Manifest Update
**Update `ios/YourFuture/PrivacyInfo.xcprivacy`:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSPrivacyTracking</key>
	<false/>
	<key>NSPrivacyCollectedDataTypes</key>
	<array>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypeUserID</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array>
				<string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
			</array>
		</dict>
		<dict>
			<key>NSPrivacyCollectedDataType</key>
			<string>NSPrivacyCollectedDataTypeUserName</string>
			<key>NSPrivacyCollectedDataTypeLinked</key>
			<true/>
			<key>NSPrivacyCollectedDataTypeTracking</key>
			<false/>
			<key>NSPrivacyCollectedDataTypePurposes</key>
			<array>
				<string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
			</array>
		</dict>
	</array>
	<key>NSPrivacyAccessedAPITypes</key>
	<array>
		<dict>
			<key>NSPrivacyAccessedAPIType</key>
			<string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
			<key>NSPrivacyAccessedAPITypeReasons</key>
			<array>
				<string>C617.1</string>
				<string>0A2A.1</string>
				<string>3B52.1</string>
			</array>
		</dict>
		<dict>
			<key>NSPrivacyAccessedAPIType</key>
			<string>NSPrivacyAccessedAPICategoryUserDefaults</string>
			<key>NSPrivacyAccessedAPITypeReasons</key>
			<array>
				<string>CA92.1</string>
				<string>1C8F.1</string>
				<string>C56D.1</string>
			</array>
		</dict>
		<dict>
			<key>NSPrivacyAccessedAPIType</key>
			<string>NSPrivacyAccessedAPICategoryDiskSpace</string>
			<key>NSPrivacyAccessedAPITypeReasons</key>
			<array>
				<string>E174.1</string>
				<string>85F4.1</string>
			</array>
		</dict>
	</array>
</dict>
</plist>
```

---

### Fix #3: Privacy Policy & Info.plist Update

**Voeg toe aan `Info.plist`:**
```xml
<key>NSContactsUsageDescription</key>
<string>We use your contacts to help you connect with friends in Your Future</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>To set your profile picture</string>

<key>NSCameraUsageDescription</key>
<string>To take a profile picture</string>

<!-- Privacy & Support Links -->
<key>NSPrivacyPolicyLink</key>
<string>https://yourfuture.example.com/privacy</string>
```

---

## 📋 Checklist Vóór Submission

- [ ] Firebase API keys verwijderd uit code
- [ ] Environment variables geconfigureerd
- [ ] Privacy Policy URL beschikbaar
- [ ] Privacy Manifest (PrivacyInfo.xcprivacy) compleet
- [ ] App Store metadata (description, keywords, screenshots)
- [ ] Google Sign-In geconfigureerd in Google Cloud Console
- [ ] Firebase Security Rules ingesteld (NOT in test mode!)
- [ ] Backend server cloud-gehoost (of puur Firebase)
- [ ] App icon en splash screen (1024x1024px)
- [ ] Build number verhoogd (`buildNumber` in `app.config.js`)
- [ ] Tested op device (niet alleen simulator)
- [ ] All screenshots en metadata in English (of gewenste taal)

---

## 🎯 Aanbevolen Actieplan

**Week 1:** Fix kritieke beveiligingsproblemen (API keys, Security Rules)  
**Week 2:** Maak Privacy Policy + complete metadata  
**Week 3:** Test build creation via EAS  
**Week 4:** Submit naar TestFlight, herlezen Apple feedback  
**Week 5:** Fixes toepassen, opnieuw indienen  

---

## 📞 Vragen voor Jou

1. **Backend:** Cloud-gehoost of moet dit worden?
2. **Privacy Policy:** Heb je al een template/domein?
3. **Google Sign-In:** Is dit geconfigureerd in Firebase Console?
4. **App Store Account:** Heb je al een Apple Developer account?

---

**Volgende stap:** Wil je dat ik de fixes implementeer? Begin met Fix #1 (API keys verwijderen)?
