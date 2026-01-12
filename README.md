# 📂 Portfolio - GitHub Explorer

Een moderne, interactieve portfolio-website die automatisch al mijn openbare GitHub repositories ophaalt en de bijbehorende documentatie direct op de site toont.

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

## 🌐 Live Demo

**[Bekijk mijn portfolio hier!](https://www.kobeerauw.com/)**

De website is een dynamisch overzicht van al mijn codeer-projecten, live gesynchroniseerd met GitHub.

## 🌟 Features

- **Dynamische GitHub Sync**: Haalt automatisch alle openbare repositories op van GitHub.
- **In-App README Viewer**: Bekijk projectdetails zonder de website te verlaten.
- **Smart Asset Handling**: Corrigeert automatisch relatieve paden voor afbeeldingen en links in externe README-bestanden naar de juiste GitHub Raw bronnen.
- **Efficiënte Caching**: Maakt gebruik van Pinia Colada voor razendsnelle navigatie en minimale API-calls.
- **Responsive Design**: Volledig geoptimaliseerd voor desktop, tablet en mobiel dankzij Bootstrap 5.
- **Type-Safe**: Volledig geschreven in TypeScript voor betrouwbare code.

## 🚀 Technologieën

- **Vue 3**: Composition API & Script Setup voor een moderne architectuur.
- **TypeScript**: Robuuste type-checking voor de GitHub API integratie.
- **Pinia Colada**: Geavanceerde data-fetching en state management.
- **Vue Router**: Vloeiende navigatie tussen het overzicht en de detailpagina's.
- **Marked.js**: Krachtige markdown-to-html conversie met custom renderers.
- **Bootstrap 5**: Strakke en responsieve UI componenten.

## 📁 Project Structuur

```
├── src/
│   ├── assets/           # Statische bestanden en CSS
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
3. **Markdown Rendering**: Bij het selecteren van een project wordt de `README.md` opgehaald. Een custom renderer in `Marked.js` herschrijft on-the-fly de afbeeldingspaden naar de `raw.githubusercontent.com` URLs op basis van de `default_branch` van de repository.

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
