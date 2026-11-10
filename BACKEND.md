# Data Dunkers Junior — backend notes

This project is intentionally front-end only. It uses the existing PocketBase API at:

```
https://api.datadunkers.ca
```

No migrations, hooks, or server code are included in this folder. The two collections below must exist in PocketBase before the site can save or load data.

> **Schema check:** both collections must store `event_key` as a **text** field. A number field silently turns every class key into `0`, and the class filter then returns no records.

## Collections

### `data_dunkers_junior_measurements`

One record per measurement submission.

| Field | PocketBase type | Required | Notes |
| --- | --- | --- | --- |
| `nickname` | text | yes | Four characters: two letters + two digits, e.g. `RC78` |
| `basketball_interest` | number | yes | Integer 1–5 |
| `resting_heart_rate` | number | yes | Integer bpm |
| `height_cm` | number | yes | Decimal centimetres |
| `wingspan_cm` | number | yes | Decimal centimetres |
| `hand_span_cm` | number | yes | Decimal centimetres |
| `shoe_size` | number | yes | Decimal shoe size |
| `reaction_time_ms` | number | yes | Integer milliseconds (average of three trials) |
| `free_throws_made` | number | yes | Integer 0–5 |
| `ten_pass_seconds` | number | yes | Decimal seconds |
| `handedness` | text | yes | `Left`, `Right`, or `Ambidextrous` |
| `birth_month` | text | yes | Month name |
| `hair_colour` | text | yes | `Black`, `Brown`, `Blonde`, `Red`, or `Other` |
| `event_key` | text | yes | Class/event grouping key |
| `created` | system autodate | auto | PocketBase creation timestamp |
| `updated` | system autodate | auto | PocketBase update timestamp |

### `data_dunkers_junior_shots`

One record per student per distance. A student with all five distances has five records.

| Field | PocketBase type | Required | Notes |
| --- | --- | --- | --- |
| `nickname` | text | yes | Four characters: two letters + two digits, e.g. `RC78` |
| `distance` | number | yes | One of `2`, `4`, `6`, `8`, `10` |
| `shots_made` | number | yes | Integer 0–5 |
| `event_key` | text | yes | Class/event grouping key |
| `created` | system autodate | auto | PocketBase creation timestamp |
| `updated` | system autodate | auto | PocketBase update timestamp |

## Suggested field options

In the PocketBase field editor:

- Set `nickname` max length to **4**.
- Set `basketball_interest` minimum **1**, maximum **5**.
- Set `free_throws_made` minimum **0**, maximum **5**.
- Set `shots_made` minimum **0**, maximum **5**.
- Set `distance` minimum **2**, maximum **10**.
- Leave `event_key` as a text field with a reasonable max length (for example, 80).

PocketBase number fields accept decimals by default. If a field should only accept whole numbers, set its `onlyInt` option where available in your PocketBase version, or validate in the form (the front-end already does).

## API rules

Recommended starting rules, matching the existing Data Skaters pattern:

| Operation | Rule |
| --- | --- |
| List | `""` (public) |
| View | `""` (public) |
| Create | `""` (public) |
| Update | `null` (admin only) |
| Delete | `null` (admin only) |

Why update/delete are admin-only: students should not be able to rewrite or remove another student's records. If a correction is needed, a teacher can edit or delete the record in the PocketBase admin UI.

### Optional hardening

If you want to reduce accidental or abusive writes while keeping the site simple:

- Require `event_key` to be non-empty.
- Validate `nickname` in a create rule, for example with a pattern check, if your PocketBase version supports it.
- Restrict allowed origins at the reverse-proxy/CORS layer to your school's site.
- Rotate event keys between classes or terms.

The front-end filters every request by `event_key`, but a public list rule means a determined user can still query the collection directly. Do not store private or sensitive information in these collections. This is classroom data, not a secure student information system.

## Indexes

Add indexes for the queries the site makes:

```text
CREATE INDEX idx_junior_measurements_event_key ON data_dunkers_junior_measurements (event_key);
CREATE INDEX idx_junior_measurements_event_nickname ON data_dunkers_junior_measurements (event_key, nickname);

CREATE INDEX idx_junior_shots_event_key ON data_dunkers_junior_shots (event_key);
CREATE INDEX idx_junior_shots_event_nickname ON data_dunkers_junior_shots (event_key, nickname);
```

A compound index on `(event_key, nickname, distance)` can also help the shot-history query.

## API endpoints used

```text
GET  /api/collections/data_dunkers_junior_measurements/records
POST /api/collections/data_dunkers_junior_measurements/records

GET  /api/collections/data_dunkers_junior_shots/records
POST /api/collections/data_dunkers_junior_shots/records
```

The front-end sends JSON. Example measurement payload:

```json
{
  "nickname": "RC78",
  "basketball_interest": 5,
  "resting_heart_rate": 72,
  "height_cm": 148.5,
  "wingspan_cm": 151.0,
  "hand_span_cm": 18.2,
  "shoe_size": 5.5,
  "reaction_time_ms": 284,
  "free_throws_made": 3,
  "ten_pass_seconds": 12.47,
  "handedness": "Right",
  "birth_month": "April",
  "hair_colour": "Brown",
  "event_key": "lincoln-2026"
}
```

Example shot payload:

```json
{
  "nickname": "RC78",
  "distance": 6,
  "shots_made": 4,
  "event_key": "lincoln-2026"
}
```

## Filtering and escaping

The site uses PocketBase's `filter` query parameter:

```text
?filter=(event_key='lincoln-2026')
```

Event keys are escaped before they are inserted into the filter. The shared helper does this:

```js
function escapeFilterValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
```

The front-end builds the query with `URLSearchParams`, so spaces and special characters are URL-encoded automatically.

## Loading all records

PocketBase paginates list responses. The shared helper requests up to 500 records per page and keeps requesting until `page >= totalPages`.

```js
const params = new URLSearchParams({
  page: String(page),
  perPage: "500",
  filter: "event_key='" + escapedKey + "'",
  sort: "-created"
});
```

## Merging records

The front-end merges the two collections by `nickname`:

1. Keep the **latest** measurement for each nickname.
2. Keep the **latest** shot record for each nickname and distance.
3. A player is complete when they have a measurement and all five distances.
4. Shot percentage is `total made ÷ (number of recorded distances × 5) × 100`.
5. Top-shooter leaderboards only include players with all five distances, so the average is fair.

If a student submits a correction, the newest record wins in the merged view. The older records remain in the collection and are visible to an administrator.

## Local development with a different API

The API base is defined once in `docs/app.js`:

```js
const API_BASE = "https://api.datadunkers.ca";
```

For a local PocketBase instance, change that constant to your local URL and make sure the collections exist there.

## Not included

- No PocketBase migrations.
- No server-side validation or hooks.
- No authentication for students.
- No photo uploads.
- No group/team field.
- No sample/demo data.

If you later want a more controlled deployment, add migrations and server-side validation in the PocketBase project that owns `api.datadunkers.ca`.
