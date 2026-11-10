# Data Dunkers Junior — teacher guide

## Big Idea

Students collect their own basketball data, then use it to make and check claims. The goal is not to memorise formulas. The goal is to ask good questions, choose useful evidence, and explain what the numbers mean.

The site is designed for grade 5 and 6 students and works well in a gym, classroom, or blended lesson.

## Learning Goals

By the end of the sequence, students can:

- collect data using a consistent method and a shared nickname;
- read and describe bar graphs, pie charts, scatterplots, and tables;
- calculate and interpret mean, median, mode, range, and a simple percentage;
- describe a relationship between two measurements and explain why correlation is not causation;
- use a probability estimate to make a prediction;
- recognise a truncated axis and a cherry-picked comparison;
- write a short data story with a claim, evidence, and a limitation.

## Curriculum Connections

The activities support common grade 5/6 expectations in:

- **Mathematics:** data collection, graphs, measures of centre and spread, fractions, decimals, percentages, probability, proportional reasoning.
- **Science:** fair testing, measurement, variables, evidence-based explanation.
- **Physical and health education:** movement skills, personal fitness, fair play, goal setting.
- **Language arts:** explaining, persuading, summarising, and choosing evidence.
- **Digital literacy:** using a web tool, saving work locally, exporting CSV, and evaluating visual claims.

Check your local curriculum for exact outcomes and adjust the language as needed.

## Before The Lesson

### 1. Confirm the backend

The site expects two collections in PocketBase:

- `data_dunkers_junior_measurements`
- `data_dunkers_junior_shots`

See [BACKEND.md](BACKEND.md). The site is front-end only; it will show empty states if the collections do not exist or the event key has no records.

### 2. Choose an event key

Use a short, non-private label, for example:

- `lincoln-2026`
- `grade6-room12`
- `basketball-day`

Share the same key with the class. Students enter it on the home page. The key groups records; it is not a password.

### 3. Set up the stations

**Measurement station**

- tape measure or height chart
- scale or shoe-size chart
- a timer/device for the reaction test
- a basketball for the 10-pass stopwatch
- a partner for the pass count

**Shooting station**

- basketball and hoop
- distance markers at 2, 4, 6, 8, and 10 feet
- a device for recording results

Keep the setup the same for every student. If the hoop height or ball changes halfway through, the comparison is no longer fair.

### 4. Plan devices and nicknames

Students can share devices, but each student needs a unique nickname. The format is two letters and two digits, for example `RC78`.

Ask students to write their nickname on a card or in their notebook. The site remembers the last nickname in the browser, but shared devices can mix students up.

## Suggested Lesson Sequences

### Option A: Three 45-Minute Sessions

**Session 1 — Collect**

- 10 min: introduce the question “What makes a strong basketball player?”
- 25 min: rotate through the measurement and shooting stations.
- 10 min: check the collected-data table for missing records.

**Session 2 — Explore**

- 10 min: open Visualisations and model how to read the shot profile.
- 25 min: students complete Chart Interpretation or Averages and Spread.
- 10 min: share one pattern and one question.

**Session 3 — Explain**

- 10 min: revisit the difference between correlation and causation.
- 25 min: students complete Scatterplots and Relationships or Shots and Percentages.
- 10 min: exit ticket — one claim, one piece of evidence, one limitation.

### Option B: Four 40-Minute Sessions

1. Collect and check data.
2. Chart interpretation + averages and spread.
3. Shots, percentages, and probability.
4. Misleading graphs + data storytelling.

### Option C: One Enrichment Day

Use the full sequence as a data festival:

- 30 min collection
- 20 min chart interpretation
- 20 min averages and spread
- 20 min scatterplots
- 20 min probability
- 20 min misleading graphs
- 30 min data storytelling and sharing

## Activity-By-Activity Notes

### 1. Chart interpretation

**Focus:** reading titles, axes, bars, and patterns.

**Look for:** students naming the highest and lowest bars with values, not just “the tall one”.

**Discussion prompt:** “What does this chart make easy to see? What does it hide?”

### 2. Averages and spread

**Focus:** mean, median, mode, range, standard deviation (as a measure of spread).

**Look for:** students noticing when the mean and median tell different stories.

**Discussion prompt:** “If you were the coach, which summary would you use — and why?”

### 3. Scatterplots and relationships

**Focus:** two-variable data, trend lines, correlation, causation.

**Look for:** students describing direction and strength, and suggesting a third factor.

**Discussion prompt:** “Could a third variable explain both measurements?”

### 4. Shots and percentages

**Focus:** fractions to percentages, fair comparisons, sample size.

**Look for:** students checking attempts, not just the percentage.

**Discussion prompt:** “Is 1 out of 1 better than 8 out of 10? How would you explain your answer?”

### 5. Probability and predictions

**Focus:** probability as a long-run estimate, expected value, randomness.

**Look for:** students distinguishing “expected” from “guaranteed”.

**Discussion prompt:** “Why does the simulation not always match the prediction exactly?”

### 6. Misleading graphs

**Focus:** truncated axes, cherry-picking, missing context.

**Look for:** students identifying the axis range and explaining how it changes the impression.

**Discussion prompt:** “Can a chart be accurate and still misleading?”

### 7. Data storytelling

**Focus:** claim, evidence, so what, limitation.

**Look for:** headlines that are supported by the chart and do not overclaim.

**Discussion prompt:** “What would make your story stronger?”

## Assessment

### Quick Exit Ticket

> One thing I noticed: ______
> One number that supports it: ______
> One question I still have: ______

### Rubric (adapt to your class)

| Level | Evidence |
| --- | --- |
| **Beginning** | Retells what the chart shows with little or no numerical evidence. |
| **Developing** | Reads the chart correctly and gives one relevant number. |
| **Secure** | Makes a clear claim, cites appropriate evidence, and explains the pattern. |
| **Strong** | Uses evidence precisely, considers an alternative explanation, and names a limitation. |

### What To Listen For

- “The average at 2 ft was higher than at 10 ft.”
- “There is a positive relationship, but that does not prove cause.”
- “This group is small, so the percentage could change.”
- “The axis starts at 3, so the difference looks bigger than it is.”

## Differentiation

### Support

- Pair students for reading and typing.
- Use the sentence starters in each activity.
- Ask students to answer only questions 1–3.
- Provide a printed copy of the data table.
- Let students use the chart hover text to find exact values.

### Extension

- Ask students to calculate the mean by hand and check it against the site.
- Challenge students to find a relationship that is strong but not causal.
- Ask students to redraw one chart with a fairer axis.
- Have students create a one-slide story for a younger class.
- Ask students to compare two groups with very different sample sizes.

## Safety, Privacy, And Fair Use

- Use nicknames, not full names, in the public data table.
- Do not collect sensitive health information beyond the class activity.
- Explain that resting heart rate and body measurements are personal. Students may opt out of any measurement and use a teacher-provided placeholder if needed.
- Keep the event key non-private and do not reuse it as a password.
- Remind students that leaderboards are a snapshot, not a judgment about a person.
- If a student is uncomfortable with a physical measurement, offer an alternative role (recorder, timer, data checker).

## Troubleshooting

| Problem | Try this |
| --- | --- |
| “Could not load data” | Check the event key, internet connection, and that the collections exist. |
| The home page keeps asking for a key | Enter the key and press “Enter the data lab”. |
| A student’s shots are missing | Check that they used the same nickname on both forms. |
| A distance is locked | That nickname already has a saved result for that distance. A teacher can delete the record in PocketBase if it is wrong. |
| Charts are empty | The event key has no records yet, or the student has not collected that measurement. |
| CSV opens with odd columns | Open it in a spreadsheet app and check the comma-separated format. |
| Answers disappeared | Answers save in the browser’s local storage. Clearing site data or using a different device will remove them. |

## Answer Keys

Sample answers and look-fors are in [ANSWER-KEYS.md](ANSWER-KEYS.md). Because the charts use live class data, the exact numbers will change. The answer keys focus on reasoning and evidence rather than one fixed number.

## Quick Links

- [Project overview](README.md)
- [Backend setup](BACKEND.md)
- [Answer keys](ANSWER-KEYS.md)
