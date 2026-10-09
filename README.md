# 🍽️ Pattanayak's Cuisine — Website

A mobile-first food blog website (Bengali & Italian cuisine) with an AI "Chef Bot" powered by Google Gemini.

Live site: https://pattanayakcuisine.web.app/

## 📁 Project structure

```
pattanayakscuisine/
├── index.html         Home page
├── explore.html       Food posts / recipes
├── about.html         About the founders
├── joinus.html        Join us page
├── css/style.css      All styles
├── js/
│   ├── main.js        Menu, filters, animations
│   ├── chatbot.js     Chef Bot (Gemini)
│   └── config.example.js   Template for the API key file
├── images/            All photos
├── functions/         Firebase Cloud Function (optional Gemini proxy)
├── firebase.json      Firebase Hosting config
├── sitemap.xml / robots.txt / site.webmanifest
└── favicon + app icons
```

## 🔐 Setup after cloning (required for Chef Bot)

Secret files are **not** stored in GitHub. After cloning:

1. Copy `js/config.example.js` to `js/config.js` and paste your Gemini API key.
2. (Only if using the Cloud Function) copy `functions/.env.example` to `functions/.env` and paste the key.

Never commit `js/config.js` or `functions/.env` (they are in `.gitignore`).

## 💻 Run locally

Open `index.html` in a browser, or run a local server:

```bash
python -m http.server 8000
# open http://localhost:8000
```

## 🚀 Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

## ✏️ Customizing

- **Add a food post:** copy an `<article class="post-card">` block in `explore.html`, set `data-cat` to `bengali`, `italian` or `random`, and update image, title and text.
- **Add photos:** put them in `images/` (web-friendly `.webp` or `.jpg`, around 800px wide).

## 📱 Social

- Instagram: https://www.instagram.com/pattanayakscuisine/
- Facebook: https://www.facebook.com/share/17nP2fxaYD/
- WhatsApp: https://whatsapp.com/channel/0029VaCn9EvCRs1x3YvdQt1g

Made with ❤️ for Pattanayak's Cuisine
