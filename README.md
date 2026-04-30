 Developer Productivity Insights

A React-based MVP that transforms developer productivity metrics into actionable insights.
Instead of just displaying numbers, the app helps developers understand what is happening, why it is happening, and what actions to take next.

---

 Problem

Developers and managers often see metrics like lead time, cycle time, and bug rate, but these numbers alone do not explain what actions to take.
This project solves that by converting raw metrics into meaningful insights and actionable recommendations.

---

 Solution

This application provides a simple developer dashboard where:

- Users select a developer and month
- Key productivity metrics are displayed
- Insights are generated using pattern classification
- Actionable recommendations are suggested

Core Flow: Metrics -> Interpretation -> Action

---

 Features

- Developer and month filtering
- Display of 5 key metrics:
  - Lead Time
  - Cycle Time
  - PR Throughput
  - Deployment Frequency
  - Bug Rate
- Insight generation using pattern hints (Healthy flow, Quality watch, Needs review)
- Actionable recommendations based on metric analysis
- Clean and responsive UI built with Tailwind CSS

---

 Tech Stack

- React.js
- JavaScript (ES6+)
- Tailwind CSS
- Vite

---

 Project Structure

```
src/
├── main.js
├── App.js
├── index.css
├── data/
│   └── data.js
├── utils/
│   └── insightEngine.js
└── components/
    ├── Header.js
    ├── Filters.js
    ├── ProfileCard.js
    ├── MetricsGrid.js
    ├── InsightCard.js
    ├── ActionCard.js
    ├── Dashboard.js
    └── EmptyState.js
```

---

 Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## How the Insight Engine Works

The app reads the pattern_hint field from the metrics data and maps it to an interpretation:

| Pattern       | Meaning              |
|---------------|----------------------|
| Healthy flow  | Everything is good   |
| Quality watch | Bug rate is high     |
| Needs review  | Something is off     |

Actions are derived from the actual metric values to give specific, relevant recommendations.
