# YourFuture – iOS build & release (EAS)

## Stappenplan

### 1. Ga naar de projectmap
```bash
cd YourFuture
```

### 2. Haal de laatste wijzigingen op van upstream
```bash
git fetch upstream
```

### 3. Zorg dat je op de `main` branch zit
```bash
git checkout main
```

### 4. Rebase je lokale `main` op `upstream/main`
```bash
git rebase upstream/main
```

### 5. (Optioneel) Verhoog Git HTTP post buffer
Handig bij grotere pushes.
```bash
git config http.postBuffer 524288000
```

### 6. Controleer de status van je repository
```bash
git status
```

### 7. Push je wijzigingen naar `origin`
Gebruik `--force-with-lease` na een rebase.
```bash
git push origin main --force-with-lease
```

---

## iOS build met EAS

### 8. Start een iOS build
```bash
eas build -p ios
```

Tijdens deze stap:
- Build number wordt automatisch verhoogd
- Remote iOS credentials worden gebruikt
- Je logt in met je Apple Developer account
- Certificaten en provisioning profiles worden gesynchroniseerd

### 9. Wacht tot de build is afgerond
Na afloop krijg je een `.ipa` downloadlink via Expo.

---

## iOS submit naar App Store Connect

### 10. Start de iOS submit
```bash
eas submit -p ios
```

### 11. Selecteer de zojuist gebouwde EAS build
- Kies de build op basis van Build ID / datum

### 12. Inloggen bij Apple Developer account
- App wordt (indien nodig) aangemaakt in App Store Connect
- App Store Connect API Key wordt gebruikt

### 13. Upload naar App Store Connect
Na succesvolle upload:
- De binary wordt door Apple verwerkt
- Dit duurt meestal 5–10 minuten

### 14. Controleer TestFlight
Zodra Apple klaar is met verwerken, is de build zichtbaar in TestFlight:
- App Store Connect → TestFlight → iOS

---

## Resultaat
✅ iOS app succesvol gebouwd met EAS
✅ Binary geüpload naar App Store Connect
✅ Klaar voor TestFlight en verdere review

