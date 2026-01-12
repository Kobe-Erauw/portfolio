# 📂 Portfolio - GitHub Explorer

Een moderne, interactieve portfolio-website met een subtiele retro-vibe die automatisch al mijn openbare GitHub repositories ophaalt en de bijbehorende documentatie direct op de site toont.

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Retro Style](https://img.shields.io/badge/Style-Subtle%20Retro-green?style=for-the-badge)

## 🌐 Live Demo

**[Bekijk mijn portfolio hier!](https://www.kobeerauw.com/)**

De website is een dynamisch overzicht van al mijn codeer-projecten, live gesynchroniseerd met GitHub.

## 🌟 Features

- **Dynamische GitHub Sync**: Haalt automatisch alle openbare repositories op van GitHub.
- **Subtiele Retro Aesthetic**: Een modern dark theme met neon-groene accenten en retro typografie voor een unieke "hacker-lite" look.
- **In-App README Viewer**: Bekijk projectdetails zonder de website te verlaten.
- **Smart Asset Handling**: Corrigeert automatisch relatieve paden voor afbeeldingen en links in externe README-bestanden naar de juiste GitHub Raw bronnen.
- **Interactieve Stats**: GitHub sterren zijn direct geïntegreerd in de navigatieknoppen voor een overzichtelijk beeld.
- **Efficiënte Caching**: Maakt gebruik van Pinia Colada voor razendsnelle navigatie en minimale API-calls.
- **Responsive Design**: Volledig geoptimaliseerd voor desktop, tablet en mobiel.

## 🚀 Technologieën

- **Vue 3**: Composition API & Script Setup voor een moderne architectuur.
- **TypeScript**: Robuuste type-checking voor de GitHub API integratie.
- **Pinia Colada**: Geavanceerde data-fetching en state management.
- **Bootstrap 5 & Custom CSS**: Krachtige grid-layout gecombineerd met een op maat gemaakt retro-thema.
- **Bootstrap Icons**: Gebruik van de officiële Bootstrap iconenset voor een consistente UI.
- **Marked.js**: Krachtige markdown-to-html conversie met custom renderers.

## 📁 Project Structuur

```
├── src/
│   ├── assets/           
│   │   └── retro.css     # Custom retro-thema
│   ├── components/
│   │   └── ProjectList.vue # Grid van GitHub repository kaarten
│   ├── services/
│   │   └── github.ts     # API integratie met GitHub (REST)
│   ├── views/
│   │   ├── HomeView.vue  # Hoofdpagina met introductie
│   │   └── ProjectDetailView.vue # Dynamische detailpagina met README
│   ├── router/           # Routing configuratie
│   ├── App.vue           # Hoofd layout component
│   └── main.ts           # Applicatie entry point & plugin configuratie
└── README.md
```

## ⚙️ Hoe het werkt

1. **API Koppeling**: De site vraagt de `/repos` endpoint van GitHub op voor de gebruiker `kobe-erauw`.
2. **Data Processing**: Pinia Colada cached de resultaten, zodat de lijst direct beschikbaar is bij het navigeren.
3. **Thema & Styling**: Bootstrap levert de fundamenten, terwijl `retro.css` de kleuren, fonts en hover-effecten aanpast naar een moderne dark-mode met retro invloeden.
4. **Markdown Rendering**: Bij het selecteren van een project wordt de `README.md` opgehaald. Een custom renderer in `Marked.js` herschrijft on-the-fly de afbeeldingspaden naar de `raw.githubusercontent.com` URLs op basis van de `default_branch` van de repository.

## 🔧 Setup & Installatie

1. Clone de repository
```bash
git clone https://github.com/Kobe-Erauw/portfolio
cd portfolio
```

2. Installeer dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Build voor productie
```bash
npm run build
```

## 📝 Licentie

Dit project is open source en beschikbaar onder de MIT License.