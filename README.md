# Data Dunkers Junior

A bright, hands-on data-literacy resource for grade 5 and 6 students. Students collect basketball measurements and shot results, explore the class dataset, and complete seven no-code investigations.

The site is front-end only. It reads and writes records through the existing Data Dunkers API at `https://api.datadunkers.ca`.

## What is included

```
junior/
├── docs/
│   ├── index.html                 Home + event-key gate + class summary
│   ├── measurement.html           Measurement form with heart-rate, reaction, and 10-pass timers
│   ├── shots.html                 Five-distance shot form with history and progress
│   ├── collected.html             Merged data table, filters, auto-refresh, CSV export
│   ├── visualizations.html        Shot profile, bar, pie, scatter, correlation matrix
│   ├── top.html                   Today / all-time leaderboards
│   ├── activities/
│   │   ├── index.html             Activity chooser
│   │   ├── chart-interpretation.html
│   │   ├── averages-spread.html
│   │   ├── scatterplots-relationships.html
│   │   ├── shots-percentages.html
│   │   ├── probability-predictions.html
│   │   ├── misleading-graphs.html
│   │   └── data-storytelling.html
│   ├── app.js                     Shared API, stats, charts, questions, CSV, navigation
│   ├── style.css                  Bright Fredoka/Nunito theme
│   └── assets/
│       ├── datadunkers-logo.png   Official Data Dunkers logo (hero art)
│       └── datadunkers-mark.png   Basketball mark (favicon and nav)
├── README.md
├── BACKEND.md                     PocketBase schema and rules
├── TEACHER-GUIDE.md
└── ANSWER-KEYS.md
```

## Nickname format

Students use a four-character nickname made of two letters and two digits, for example:

- `RC78`
- `AB12`
- `MJ23`

The nickname links a student's measurement record to their shot records. Students should use the same nickname every time.

The nickname fields enforce the format while typing: the first two characters must be letters and the last two must be digits.

## Event key

The site uses the same browser storage key as Data Skaters:

```js
localStorage.getItem("event_key")
```

The event key is entered on the home page. Every API request is filtered by that key, so different classes or events can use the same collections without mixing their data.

The key chip in the top bar is a shortcut: clicking it returns to the home page, clears the old key, and opens a fresh key entry.

The key is not a password. It is a grouping label. Do not put private information in it.

## Run locally

Because the site is static, any local web server works. For example:

```bash
cd junior/docs
python -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly with `file://` may work in some browsers, but a local server is more reliable for API requests.

## Deploy

The `junior/docs/` folder can be published as a static site (for example, GitHub Pages). No build step is required.

If you publish the whole repository, the teacher documents remain one level above `docs/`. The footer links to them with relative paths.

## Data collections

The site expects two PocketBase collections:

- `data_dunkers_junior_measurements`
- `data_dunkers_junior_shots`

See [BACKEND.md](BACKEND.md) for the field list, rules, indexes, and example payloads.

## Main workflows

1. **Teacher** creates the two collections and shares an event key.
2. **Students** enter the key on the home page.
3. **Students** complete the measurement form.
4. **Students** record five shots at each of 2, 4, 6, 8, and 10 feet.
5. **Class** opens Collected Data to check completion and download a CSV.
6. **Class** opens Visualisations to look for patterns.
7. **Students** choose an activity and answer the questions. Answers save in the browser and can be copied.

## Local storage keys

| Key | Purpose |
| --- | --- |
| `event_key` | Shared class/event grouping key |
| `junior_nickname` | Last used nickname |
| `junior_collected_autorefresh` | Collected-data auto-refresh preference |
| `junior_*_answers` | Saved activity answers |

## Notes

- Charts use live collected data only. There is no bundled sample dataset.
- If a collection is empty, the site shows an empty state instead of a fake chart.
- The app escapes event-key values before building PocketBase filters.
- The app uses the latest measurement and latest result for each shot distance for each nickname.
- The site does not include a photo booth, player-card creator, or group form.
- The logo assets come from the official [Data Dunkers branding repository](https://github.com/Data-Dunkers/branding). The hero uses the full logo; the nav and favicon use the basketball mark cropped from it.

## Teacher documents

- [Teacher guide](TEACHER-GUIDE.md)
- [Answer keys](ANSWER-KEYS.md)
- [Backend notes](BACKEND.md)
