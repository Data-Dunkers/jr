/* ============================================================
   Data Dunkers Junior — shared front-end helpers
   ============================================================ */
(function () {
  "use strict";

  const API_BASE = "https://api.datadunkers.ca";
  const COLLECTIONS = {
    measurements: "data_dunkers_junior_measurements",
    shots: "data_dunkers_junior_shots",
  };
  const DISTANCES = [2, 4, 6, 8, 10];
  const SHOTS_PER_DISTANCE = 5;
  const MAX_SHOTS = DISTANCES.length * SHOTS_PER_DISTANCE;
  const NICKNAME_KEY = "junior_nickname";

  const NUMERIC_METRICS = [
    { key: "basketball_interest", label: "Basketball interest", short: "Interest", unit: "/5", decimals: 0 },
    { key: "resting_heart_rate", label: "Resting heart rate", short: "Heart rate", unit: "bpm", decimals: 0 },
    { key: "height_cm", label: "Height", short: "Height", unit: "cm", decimals: 1 },
    { key: "wingspan_cm", label: "Wingspan", short: "Wingspan", unit: "cm", decimals: 1 },
    { key: "hand_span_cm", label: "Hand span", short: "Hand span", unit: "cm", decimals: 1 },
    { key: "shoe_size", label: "Shoe size", short: "Shoe size", unit: "", decimals: 1 },
    { key: "reaction_time_ms", label: "Reaction time", short: "Reaction", unit: "ms", decimals: 0 },
    { key: "free_throws_made", label: "Free throws made", short: "Free throws", unit: "/5", decimals: 0 },
    { key: "ten_pass_seconds", label: "10-pass time", short: "10-pass time", unit: "s", decimals: 2 },
    { key: "shot_total", label: "Total shots made", short: "Shots made", unit: "/25", decimals: 0, computed: true },
    { key: "shot_percentage", label: "Shot percentage", short: "Shot %", unit: "%", decimals: 1, computed: true },
    { key: "shot_average", label: "Average per distance", short: "Shot average", unit: "/5", decimals: 2, computed: true },
  ];

  const CATEGORICAL_METRICS = [
    { key: "handedness", label: "Handedness" },
    { key: "birth_month", label: "Birth month" },
    { key: "hair_colour", label: "Hair colour" },
    { key: "basketball_interest", label: "Basketball interest (1–5)" },
    { key: "free_throws_made", label: "Free throws made (0–5)" },
    { key: "shoe_size", label: "Shoe size" },
  ];

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const CHART_COLOURS = ["#ff7a1a", "#2f80ed", "#19b978", "#ffd166", "#ff5d8f", "#7c5cff", "#00a6a6", "#f25c05"];

  /* ------------------------------------------------------------
     Small utilities
     ------------------------------------------------------------ */
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function normalizeNickname(value) {
    return String(value == null ? "" : value)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4);
  }

  // Same rule as Data Skaters' nickname field: two letters, then two digits.
  // Filtering by result length (not input position) keeps the value well formed.
  function sanitizeNicknameInput(value) {
    const cleaned = String(value == null ? "" : value).toUpperCase().replace(/[^A-Z0-9]/g, "");
    let result = "";
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      const isLetter = /[A-Z]/.test(char);
      if (result.length < 2 ? isLetter : result.length < 4 && !isLetter) {
        result += char;
      }
    }
    return result;
  }

  function isValidNickname(value) {
    return /^[A-Z]{2}[0-9]{2}$/.test(normalizeNickname(value));
  }

  function nicknameMessage(value) {
    if (!value) return "Enter your nickname.";
    if (!isValidNickname(value)) return "Use two letters and two digits, like RC78.";
    return "";
  }

  function bindNicknameInput(input) {
    if (!input) return;
    input.addEventListener("input", function () {
      const start = input.selectionStart;
      input.value = sanitizeNicknameInput(input.value);
      if (typeof start === "number") {
        try { input.setSelectionRange(start, start); } catch (error) { /* ignore */ }
      }
    });
  }

  function getSavedNickname() {
    return normalizeNickname(localStorage.getItem(NICKNAME_KEY) || "");
  }

  function saveNickname(value) {
    const nickname = normalizeNickname(value);
    if (isValidNickname(nickname)) localStorage.setItem(NICKNAME_KEY, nickname);
  }

  function eventKey() {
    return (localStorage.getItem("event_key") || "").trim();
  }

  function setEventKey(value) {
    const key = String(value == null ? "" : value).trim();
    if (key) localStorage.setItem("event_key", key);
    else localStorage.removeItem("event_key");
    paintKeyBackground(key || null);
    refreshNav();
    return key;
  }

  function clearEventKey() {
    localStorage.removeItem("event_key");
    paintKeyBackground(null);
    refreshNav();
  }

  function escapeFilterValue(value) {
    return String(value == null ? "" : value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  function apiUrl(collectionId) {
    return API_BASE + "/api/collections/" + collectionId + "/records";
  }

  function homeUrl() {
    return /\/activities\//.test(window.location.pathname) ? "../index.html" : "index.html";
  }

  function activitiesUrl() {
    return /\/activities\//.test(window.location.pathname) ? "index.html" : "activities/index.html";
  }

  function recordTime(record) {
    if (!record || typeof record.created !== "string") return NaN;
    const normalized = record.created.indexOf("T") === -1 ? record.created.replace(" ", "T") : record.created;
    return Date.parse(normalized);
  }

  function localDateKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function todayKey() {
    return localDateKey(new Date());
  }

  function isToday(record) {
    const time = recordTime(record);
    return Number.isFinite(time) && localDateKey(new Date(time)) === todayKey();
  }

  function formatDate(record, options) {
    const time = recordTime(record);
    if (!Number.isFinite(time)) return "—";
    const opts = options || { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
    return new Intl.DateTimeFormat(undefined, opts).format(new Date(time));
  }

  function formatNumber(value, decimals) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    const places = typeof decimals === "number" ? decimals : (Math.abs(number) >= 10 ? 1 : 2);
    return number.toFixed(places).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  }

  function finiteNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* ------------------------------------------------------------
     API
     ------------------------------------------------------------ */
  async function fetchAll(collectionId, options) {
    const opts = options || {};
    const key = opts.eventKey !== undefined ? opts.eventKey : eventKey();
    if (!key) throw new Error("No event key is set.");

    const records = [];
    let page = 1;
    const perPage = 500;
    while (true) {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        filter: "event_key='" + escapeFilterValue(key) + "'",
        sort: "-created",
      });
      if (opts.filter) params.set("filter", "(" + opts.filter + ") && " + params.get("filter"));
      const response = await fetch(apiUrl(collectionId) + "?" + params.toString(), { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load " + collectionId + " (HTTP " + response.status + ").");
      }
      const data = await response.json();
      const items = data.items || [];
      records.push.apply(records, items);
      if (!data.totalPages || page >= data.totalPages || items.length === 0) break;
      page += 1;
    }
    return records;
  }

  async function loadData() {
    const results = await Promise.all([
      fetchAll(COLLECTIONS.measurements),
      fetchAll(COLLECTIONS.shots),
    ]);
    return { measurements: results[0], shots: results[1] };
  }

  async function postRecord(collectionId, payload) {
    const key = eventKey();
    if (!key) throw new Error("No event key is set.");
    const body = Object.assign({}, payload, { event_key: key });
    const response = await fetch(apiUrl(collectionId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let detail = "";
      try {
        const data = await response.json();
        detail = data.message || data.data || "";
      } catch (error) { /* ignore */ }
      throw new Error("Save failed (HTTP " + response.status + ")" + (detail ? ": " + detail : ""));
    }
    return response.json();
  }

  /* ------------------------------------------------------------
     Data merging and stats
     ------------------------------------------------------------ */
  function latestByNickname(records) {
    const latest = new Map();
    (records || []).forEach(function (record) {
      const nickname = normalizeNickname(record.nickname);
      if (!nickname) return;
      const current = latest.get(nickname);
      if (!current || recordTime(record) > recordTime(current)) latest.set(nickname, record);
    });
    return latest;
  }

  function mergePlayers(measurements, shots) {
    const measurementMap = latestByNickname(measurements);
    const shotMap = new Map();
    (shots || []).forEach(function (record) {
      const nickname = normalizeNickname(record.nickname);
      const distance = Number(record.distance);
      if (!nickname || DISTANCES.indexOf(distance) === -1) return;
      if (!shotMap.has(nickname)) shotMap.set(nickname, new Map());
      const byDistance = shotMap.get(nickname);
      const current = byDistance.get(distance);
      if (!current || recordTime(record) > recordTime(current)) byDistance.set(distance, record);
    });

    const allNicknames = new Set(Array.from(measurementMap.keys()).concat(Array.from(shotMap.keys())));
    return Array.from(allNicknames).sort().map(function (nickname) {
      const measurement = measurementMap.get(nickname) || null;
      const shotRecords = shotMap.get(nickname) || new Map();
      const shotValues = {};
      DISTANCES.forEach(function (distance) {
        const record = shotRecords.get(distance);
        shotValues[distance] = record ? finiteNumber(record.shots_made) : null;
      });

      const recordedDistances = DISTANCES.filter(function (distance) { return shotValues[distance] !== null; });
      const totalShots = recordedDistances.reduce(function (sum, distance) { return sum + shotValues[distance]; }, 0);
      const attempts = recordedDistances.length * SHOTS_PER_DISTANCE;
      const lastTimes = [];
      if (measurement) lastTimes.push(recordTime(measurement));
      shotRecords.forEach(function (record) { lastTimes.push(recordTime(record)); });
      const lastActivity = Math.max.apply(null, lastTimes.filter(Number.isFinite).concat([0]));

      return {
        nickname: nickname,
        measurement: measurement,
        shotRecords: Array.from(shotRecords.values()),
        shots: shotValues,
        recordedDistances: recordedDistances,
        hasMeasurement: Boolean(measurement),
        completedShots: recordedDistances.length === DISTANCES.length,
        totalShots: totalShots,
        attempts: attempts,
        shotPercentage: attempts ? (totalShots / attempts) * 100 : null,
        shotAverage: recordedDistances.length ? totalShots / recordedDistances.length : null,
        lastActivity: lastActivity,
      };
    });
  }

  function metricValue(player, key) {
    if (!player) return null;
    if (key === "shot_total") return player.totalShots;
    if (key === "shot_percentage") return player.shotPercentage;
    if (key === "shot_average") return player.shotAverage;
    if (!player.measurement) return null;
    return finiteNumber(player.measurement[key]);
  }

  function metricDefinition(key) {
    return NUMERIC_METRICS.find(function (metric) { return metric.key === key; }) || null;
  }

  function valuesFor(players, key) {
    return (players || []).map(function (player) { return metricValue(player, key); }).filter(function (value) {
      return value !== null && Number.isFinite(value);
    });
  }

  function mean(values) {
    const clean = (values || []).filter(function (value) { return Number.isFinite(value); });
    if (!clean.length) return null;
    return clean.reduce(function (sum, value) { return sum + value; }, 0) / clean.length;
  }

  function median(values) {
    const clean = (values || []).filter(function (value) { return Number.isFinite(value); }).sort(function (a, b) { return a - b; });
    if (!clean.length) return null;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  }

  function mode(values) {
    const clean = (values || []).filter(function (value) { return Number.isFinite(value); });
    if (!clean.length) return [];
    const counts = new Map();
    let highest = 0;
    clean.forEach(function (value) {
      const count = (counts.get(value) || 0) + 1;
      counts.set(value, count);
      if (count > highest) highest = count;
    });
    if (highest === 1) return [];
    return Array.from(counts.entries()).filter(function (entry) { return entry[1] === highest; }).map(function (entry) { return entry[0]; });
  }

  function stdev(values) {
    const clean = (values || []).filter(function (value) { return Number.isFinite(value); });
    if (clean.length < 2) return null;
    const avg = mean(clean);
    const variance = clean.reduce(function (sum, value) { return sum + Math.pow(value - avg, 2); }, 0) / (clean.length - 1);
    return Math.sqrt(variance);
  }

  function summarize(values) {
    const clean = (values || []).filter(function (value) { return Number.isFinite(value); });
    if (!clean.length) {
      return { count: 0, mean: null, median: null, mode: [], min: null, max: null, range: null, stdev: null };
    }
    const min = Math.min.apply(null, clean);
    const max = Math.max.apply(null, clean);
    return {
      count: clean.length,
      mean: mean(clean),
      median: median(clean),
      mode: mode(clean),
      min: min,
      max: max,
      range: max - min,
      stdev: stdev(clean),
    };
  }

  function pearson(xValues, yValues) {
    const pairs = [];
    const length = Math.min((xValues || []).length, (yValues || []).length);
    for (let index = 0; index < length; index += 1) {
      const x = Number(xValues[index]);
      const y = Number(yValues[index]);
      if (Number.isFinite(x) && Number.isFinite(y)) pairs.push([x, y]);
    }
    if (pairs.length < 2) return null;
    const meanX = mean(pairs.map(function (pair) { return pair[0]; }));
    const meanY = mean(pairs.map(function (pair) { return pair[1]; }));
    let numerator = 0;
    let sumXX = 0;
    let sumYY = 0;
    pairs.forEach(function (pair) {
      numerator += (pair[0] - meanX) * (pair[1] - meanY);
      sumXX += Math.pow(pair[0] - meanX, 2);
      sumYY += Math.pow(pair[1] - meanY, 2);
    });
    const denominator = Math.sqrt(sumXX * sumYY);
    return denominator ? numerator / denominator : null;
  }

  function linearRegression(xValues, yValues) {
    const pairs = [];
    const length = Math.min((xValues || []).length, (yValues || []).length);
    for (let index = 0; index < length; index += 1) {
      const x = Number(xValues[index]);
      const y = Number(yValues[index]);
      if (Number.isFinite(x) && Number.isFinite(y)) pairs.push([x, y]);
    }
    if (pairs.length < 2) return null;
    const meanX = mean(pairs.map(function (pair) { return pair[0]; }));
    const meanY = mean(pairs.map(function (pair) { return pair[1]; }));
    let sumXX = 0;
    let sumXY = 0;
    pairs.forEach(function (pair) {
      sumXX += Math.pow(pair[0] - meanX, 2);
      sumXY += (pair[0] - meanX) * (pair[1] - meanY);
    });
    if (!sumXX) return null;
    const slope = sumXY / sumXX;
    return {
      slope: slope,
      intercept: meanY - slope * meanX,
      minX: Math.min.apply(null, pairs.map(function (pair) { return pair[0]; })),
      maxX: Math.max.apply(null, pairs.map(function (pair) { return pair[0]; })),
    };
  }

  function shotAverages(players) {
    return DISTANCES.map(function (distance) {
      const values = (players || []).map(function (player) { return player.shots[distance]; }).filter(function (value) {
        return value !== null && value !== undefined && Number.isFinite(Number(value));
      }).map(Number);
      return {
        distance: distance,
        count: values.length,
        average: values.length ? mean(values) : null,
        total: values.reduce(function (sum, value) { return sum + value; }, 0),
      };
    });
  }

  function shotPercentageByDistance(players) {
    return shotAverages(players).map(function (row) {
      return {
        distance: row.distance,
        count: row.count,
        average: row.average,
        percentage: row.count ? (row.average / SHOTS_PER_DISTANCE) * 100 : null,
      };
    });
  }

  function groupBy(players, key) {
    const groups = new Map();
    (players || []).forEach(function (player) {
      let value = null;
      if (player.measurement) value = player.measurement[key];
      if (value === null || value === undefined || value === "") value = "Unknown";
      const label = String(value);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(player);
    });
    return groups;
  }

  /* ------------------------------------------------------------
     CSV
     ------------------------------------------------------------ */
  function csvEscape(value) {
    if (value === null || value === undefined) return "";
    const text = String(value);
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function toCsv(rows, columns) {
    const head = columns.map(function (column) { return csvEscape(column.label); }).join(",");
    const body = (rows || []).map(function (row) {
      return columns.map(function (column) {
        const value = typeof column.value === "function" ? column.value(row) : row[column.key];
        return csvEscape(value);
      }).join(",");
    });
    return [head].concat(body).join("\r\n");
  }

  function downloadCsv(filename, csv) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function playersToCsv(players) {
    const columns = [
      { label: "Nickname", value: function (player) { return player.nickname; } },
      { label: "Measurement date", value: function (player) { return player.measurement ? player.measurement.created : ""; } },
      { label: "Basketball interest", value: function (player) { return player.measurement ? player.measurement.basketball_interest : ""; } },
      { label: "Resting heart rate (bpm)", value: function (player) { return player.measurement ? player.measurement.resting_heart_rate : ""; } },
      { label: "Height (cm)", value: function (player) { return player.measurement ? player.measurement.height_cm : ""; } },
      { label: "Wingspan (cm)", value: function (player) { return player.measurement ? player.measurement.wingspan_cm : ""; } },
      { label: "Hand span (cm)", value: function (player) { return player.measurement ? player.measurement.hand_span_cm : ""; } },
      { label: "Shoe size", value: function (player) { return player.measurement ? player.measurement.shoe_size : ""; } },
      { label: "Reaction time (ms)", value: function (player) { return player.measurement ? player.measurement.reaction_time_ms : ""; } },
      { label: "Free throws made", value: function (player) { return player.measurement ? player.measurement.free_throws_made : ""; } },
      { label: "10-pass time (s)", value: function (player) { return player.measurement ? player.measurement.ten_pass_seconds : ""; } },
      { label: "Handedness", value: function (player) { return player.measurement ? player.measurement.handedness : ""; } },
      { label: "Birth month", value: function (player) { return player.measurement ? player.measurement.birth_month : ""; } },
      { label: "Hair colour", value: function (player) { return player.measurement ? player.measurement.hair_colour : ""; } },
    ];
    DISTANCES.forEach(function (distance) {
      columns.push({
        label: "Shots made at " + distance + " ft",
        value: function (player) { return player.shots[distance] === null ? "" : player.shots[distance]; },
      });
    });
    columns.push(
      { label: "Total shots made", value: function (player) { return player.recordedDistances.length ? player.totalShots : ""; } },
      { label: "Shot percentage", value: function (player) { return player.shotPercentage === null ? "" : player.shotPercentage.toFixed(1); } },
      { label: "Completed all distances", value: function (player) { return player.completedShots ? "Yes" : "No"; } }
    );
    return toCsv(players, columns);
  }

  /* ------------------------------------------------------------
     Questions and answer saving
     ------------------------------------------------------------ */
  function renderQuestions(container, questions, storageKey, options) {
    const host = typeof container === "string" ? (document.getElementById(container) || $(container)) : container;
    if (!host) return null;
    const opts = options || {};
    const key = storageKey || ("junior_answers_" + window.location.pathname);
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (error) { saved = {}; }

    host.innerHTML = "";
    const list = document.createElement("div");
    list.className = "question-list";

    questions.forEach(function (question, index) {
      const id = "question-" + (index + 1);
      const wrapper = document.createElement("div");
      wrapper.className = "question";
      const label = document.createElement("label");
      label.htmlFor = id;
      const number = document.createElement("span");
      number.className = "question-number";
      number.textContent = String(index + 1);
      label.appendChild(number);
      label.appendChild(document.createTextNode(question));
      const textarea = document.createElement("textarea");
      textarea.id = id;
      textarea.placeholder = "Type your thinking here…";
      textarea.value = saved[id] || "";
      textarea.rows = 3;
      wrapper.appendChild(label);
      wrapper.appendChild(textarea);
      list.appendChild(wrapper);
    });

    const actions = document.createElement("div");
    actions.className = "btn-row";
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "btn btn-primary";
    copyButton.textContent = "Copy my answers";
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "btn btn-ghost";
    clearButton.textContent = "Clear answers";
    actions.appendChild(copyButton);
    actions.appendChild(clearButton);
    host.appendChild(list);
    host.appendChild(actions);

    let saveTimer = null;
    function saveAnswers() {
      const answers = {};
      questions.forEach(function (_, index) {
        const id = "question-" + (index + 1);
        answers[id] = $("#" + id, host).value;
      });
      localStorage.setItem(key, JSON.stringify(answers));
      return answers;
    }
    function scheduleSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveAnswers, 250);
    }

    host.addEventListener("input", function (event) {
      if (event.target && event.target.matches("textarea")) scheduleSave();
    });

    copyButton.addEventListener("click", function () {
      saveAnswers();
      const text = questions.map(function (question, index) {
        const answer = $("#question-" + (index + 1), host).value.trim() || "(no answer yet)";
        return (index + 1) + ". " + question + "\nAnswer: " + answer;
      }).join("\n\n");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyButton.textContent = "Copied!";
          setTimeout(function () { copyButton.textContent = "Copy my answers"; }, 1600);
        }).catch(function () {
          window.prompt("Copy your answers:", text);
        });
      } else {
        window.prompt("Copy your answers:", text);
      }
    });

    clearButton.addEventListener("click", function () {
      if (!window.confirm("Clear all of your saved answers for this activity?")) return;
      questions.forEach(function (_, index) {
        $("#question-" + (index + 1), host).value = "";
      });
      localStorage.removeItem(key);
    });

    return { saveAnswers: saveAnswers, key: key };
  }

  /* ------------------------------------------------------------
     Charts
     ------------------------------------------------------------ */
  const chartTheme = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Nunito, Segoe UI, sans-serif", color: "#35435f", size: 13 },
    colorway: CHART_COLOURS,
    margin: { t: 48, r: 22, b: 58, l: 58 },
    hoverlabel: { bgcolor: "#1e2a44", bordercolor: "#1e2a44", font: { color: "#ffffff", family: "Nunito, sans-serif" } },
    xaxis: { gridcolor: "#edf2f9", zerolinecolor: "#dfe6f0", linecolor: "#cfd9e8", tickfont: { color: "#5f6d87" } },
    yaxis: { gridcolor: "#edf2f9", zerolinecolor: "#dfe6f0", linecolor: "#cfd9e8", tickfont: { color: "#5f6d87" } },
    legend: { orientation: "h", y: -0.22, x: 0, font: { size: 11 } },
  };

  function plot(elementOrId, traces, layout) {
    const element = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
    if (!element) return;
    if (typeof Plotly === "undefined") {
      emptyChart(element, "Charts need Plotly. Check your internet connection and reload.");
      return;
    }
    const finalLayout = Object.assign({}, chartTheme, layout || {});
    finalLayout.xaxis = Object.assign({}, chartTheme.xaxis, (layout && layout.xaxis) || {});
    finalLayout.yaxis = Object.assign({}, chartTheme.yaxis, (layout && layout.yaxis) || {});
    finalLayout.margin = Object.assign({}, chartTheme.margin, (layout && layout.margin) || {});
    Plotly.newPlot(element, traces, finalLayout, { responsive: true, displayModeBar: false });
  }

  function emptyChart(elementOrId, message) {
    const element = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
    if (!element) return;
    if (typeof Plotly !== "undefined" && element.data) {
      Plotly.purge(element);
    }
    element.innerHTML = '<div class="chart-loading"><div><strong>No chart yet</strong><br>' + escapeHtml(message || "Collect some data first, then come back!") + "</div></div>";
  }

  function chartReady(elementOrId) {
    const element = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
    if (!element) return false;
    if (element.querySelector(".chart-loading")) element.innerHTML = "";
    return true;
  }

  function shotProfileChart(elementOrId, players, options) {
    const opts = options || {};
    const averages = shotAverages(players);
    const hasData = averages.some(function (row) { return row.average !== null; });
    if (!hasData) {
      emptyChart(elementOrId, "No shot data has been collected yet.");
      return;
    }
    const traces = [{
      type: "bar",
      x: averages.map(function (row) { return row.distance + " ft"; }),
      y: averages.map(function (row) { return row.average; }),
      text: averages.map(function (row) { return row.average === null ? "" : formatNumber(row.average, 1) + " / 5"; }),
      textposition: "outside",
      marker: { color: CHART_COLOURS, line: { color: "#ffffff", width: 2 } },
      hovertemplate: "%{x}<br>Average: %{y:.2f} made<br>Players: %{customdata}<extra></extra>",
      customdata: averages.map(function (row) { return row.count; }),
      cliponaxis: false,
    }];
    plot(elementOrId, traces, {
      title: { text: opts.title || "Average shots made by distance", x: 0, font: { size: 17 } },
      xaxis: { title: "Distance from hoop" },
      yaxis: { title: "Average shots made (out of 5)", range: [0, 5.5] },
      showlegend: false,
    });
  }

  function correlationHeatmap(elementOrId, players, keys, options) {
    const opts = options || {};
    const metrics = (keys || NUMERIC_METRICS.map(function (metric) { return metric.key; })).filter(function (key) {
      return key !== "shot_percentage" && key !== "shot_average";
    });
    const labels = metrics.map(function (key) {
      const def = metricDefinition(key);
      return def ? def.short : key;
    });
    const z = [];
    let hasAny = false;
    metrics.forEach(function (rowKey) {
      const row = [];
      metrics.forEach(function (colKey) {
        const rowValues = (players || []).map(function (player) { return metricValue(player, rowKey); });
        const colValues = (players || []).map(function (player) { return metricValue(player, colKey); });
        const pairs = [];
        rowValues.forEach(function (value, index) {
          if (value !== null && colValues[index] !== null && Number.isFinite(value) && Number.isFinite(colValues[index])) {
            pairs.push([value, colValues[index]]);
          }
        });
        const r = pairs.length >= 2 ? pearson(pairs.map(function (pair) { return pair[0]; }), pairs.map(function (pair) { return pair[1]; })) : null;
        if (r !== null) hasAny = true;
        row.push(r);
      });
      z.push(row);
    });
    if (!hasAny) {
      emptyChart(elementOrId, "Not enough complete measurements for a correlation matrix yet.");
      return;
    }
    plot(elementOrId, [{
      type: "heatmap",
      x: labels,
      y: labels,
      z: z,
      zmin: -1,
      zmax: 1,
      colorscale: [
        [0, "#2f80ed"],
        [0.5, "#fff8ed"],
        [1, "#ff7a1a"],
      ],
      colorbar: { title: "r", thickness: 14, len: 0.8 },
      hovertemplate: "%{y} × %{x}<br>r = %{z:.2f}<extra></extra>",
      text: z.map(function (row) {
        return row.map(function (value) { return value === null ? "—" : value.toFixed(2); });
      }),
      texttemplate: "%{text}",
      textfont: { size: 10, color: "#1e2a44" },
    }], {
      title: { text: opts.title || "How strongly do the measurements relate?", x: 0, font: { size: 17 } },
      xaxis: { tickangle: -30, automargin: true },
      yaxis: { automargin: true, autorange: "reversed" },
      margin: { t: 50, r: 30, b: 120, l: 110 },
    });
  }

  /* ------------------------------------------------------------
     Navigation, footer, event key background
     ------------------------------------------------------------ */
  const NAV_ITEMS = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "measurement", label: "Measurements", href: "measurement.html" },
    { key: "shots", label: "Shots", href: "shots.html" },
    { key: "collected", label: "Collected Data", href: "collected.html" },
    { key: "visualizations", label: "Visualisations", href: "visualizations.html" },
    { key: "top", label: "Top Ten", href: "top.html" },
    { key: "activities", label: "Activities", href: "activities/index.html" },
  ];

  let navActive = null;
  let requiresKey = false;

  function renderNav(active) {
    const host = document.getElementById("site-nav");
    if (!host) return;
    navActive = active || "";
    const prefix = /\/activities\//.test(window.location.pathname) ? "../" : "";
    const items = NAV_ITEMS.map(function (item) {
      const isActive = item.key === active;
      const href = prefix + item.href;
      return '<a href="' + href + '"' + (isActive ? ' aria-current="page"' : "") + ">" + escapeHtml(item.label) + "</a>";
    }).join("");
    const key = eventKey();
    const keyLabel = escapeHtml(key ? key.toUpperCase() : "—");
    const keyChip = key
      ? '<a class="key-chip key-chip-link" href="' + prefix + 'index.html?change=1" title="Change event key" aria-label="Change event key (current key ' + keyLabel + ')">' +
          "Key: <strong>" + keyLabel + "</strong>" +
          '<span class="key-chip-edit" aria-hidden="true">✎</span>' +
        "</a>"
      : '<span class="key-chip">Key: <strong>' + keyLabel + "</strong></span>";
    host.innerHTML =
      '<div class="page-shell nav-inner">' +
        '<a class="brand" href="' + prefix + 'index.html">' +
          '<img src="' + prefix + 'assets/datadunkers-mark.png" alt="">' +
          '<span class="brand-text"><strong>Data Dunkers</strong><span>Junior</span></span>' +
        "</a>" +
        '<nav class="nav-links" aria-label="Main navigation">' + items + "</nav>" +
        keyChip +
      "</div>";
  }

  function refreshNav() {
    if (navActive === null) return;
    renderNav(navActive);
  }

  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    const prefix = /\/activities\//.test(window.location.pathname) ? "../" : "";
    host.innerHTML =
      '<div class="page-shell footer-inner">' +
        "<span><strong>Data Dunkers</strong> Junior</span>" +
        '<span class="footer-links">' +
          '<a href="' + prefix + 'activities/index.html">Activities</a>' +
          '<a href="https://github.com/Data-Dunkers/jr/blob/main/TEACHER-GUIDE.md">Teacher guide</a>' +
          '<a href="https://github.com/Data-Dunkers/jr/blob/main/ANSWER-KEYS.md">Answer keys</a>' +
          '<a href="' + prefix + 'index.html">Home</a>' +
        "</span>" +
      "</div>";
  }

  function paintKeyBackground(key) {
    const old = document.getElementById("event-key-bg");
    if (old) old.remove();
    if (!key) return;
    const width = 280;
    const height = 120;
    const pad = 14;
    const label = String(key).slice(0, 30);
    const escaped = escapeHtml(label);
    // Each copy is anchored inside the tile, so repeated tiles cannot overlap
    // at the seams. Long keys shrink so a copy still fits in half the tile.
    const fontSize = Math.max(7, Math.min(26, (width / 2 - pad * 2) / (0.56 * Math.max(label.length, 1))));
    const yTop = 38;
    const yBottom = 96;
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
        '<g font-family="Fredoka, Trebuchet MS, sans-serif" font-weight="600" font-size="' + fontSize.toFixed(1) + '" fill="#2f80ed" fill-opacity="0.08">' +
          '<text x="' + (width / 2) + '" y="' + yTop + '" text-anchor="middle" transform="rotate(-8 ' + (width / 2) + ' ' + yTop + ')">' + escaped + "</text>" +
          '<text x="' + pad + '" y="' + yBottom + '" text-anchor="start" transform="rotate(-8 ' + pad + ' ' + yBottom + ')">' + escaped + "</text>" +
          '<text x="' + (width - pad) + '" y="' + yBottom + '" text-anchor="end" transform="rotate(-8 ' + (width - pad) + ' ' + yBottom + ')">' + escaped + "</text>" +
        "</g>" +
      "</svg>";
    const layer = document.createElement("div");
    layer.id = "event-key-bg";
    layer.setAttribute("aria-hidden", "true");
    layer.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    layer.style.backgroundSize = width + "px " + height + "px";
    document.body.prepend(layer);
  }

  function init(options) {
    const opts = options || {};
    requiresKey = opts.requireKey !== false;
    if (opts.page) document.documentElement.dataset.page = opts.page;
    if (requiresKey && !eventKey()) {
      window.location.replace(homeUrl());
      return false;
    }
    renderNav(opts.active || "");
    renderFooter();
    paintKeyBackground(eventKey());
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
    return true;
  }

  function setStatus(elementOrId, message, type) {
    const element = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
    if (!element) return;
    element.textContent = message;
    element.className = type === "success" ? "status-success" : type === "error" ? "status-error" : "status-info";
    element.style.display = "block";
    if (type === "success" || type === "info") {
      setTimeout(function () {
        if (element.textContent === message) {
          element.style.display = "none";
        }
      }, 5000);
    }
  }

  function emptyStateHtml(title, message) {
    return '<div class="empty-state"><strong>' + escapeHtml(title) + "</strong>" + escapeHtml(message || "") + "</div>";
  }

  function setupNicknameField(input) {
    bindNicknameInput(input);
    if (input) {
      const saved = getSavedNickname();
      if (saved) input.value = saved;
    }
    return input;
  }

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    refreshNav();
    if (requiresKey && !eventKey()) window.location.replace(homeUrl());
  });

  window.Junior = {
    API_BASE: API_BASE,
    COLLECTIONS: COLLECTIONS,
    DISTANCES: DISTANCES,
    SHOTS_PER_DISTANCE: SHOTS_PER_DISTANCE,
    MAX_SHOTS: MAX_SHOTS,
    NUMERIC_METRICS: NUMERIC_METRICS,
    CATEGORICAL_METRICS: CATEGORICAL_METRICS,
    MONTHS: MONTHS,
    CHART_COLOURS: CHART_COLOURS,
    chartTheme: chartTheme,
    $: $,
    $$: $$,
    escapeHtml: escapeHtml,
    normalizeNickname: normalizeNickname,
    sanitizeNicknameInput: sanitizeNicknameInput,
    isValidNickname: isValidNickname,
    nicknameMessage: nicknameMessage,
    bindNicknameInput: bindNicknameInput,
    getSavedNickname: getSavedNickname,
    saveNickname: saveNickname,
    eventKey: eventKey,
    setEventKey: setEventKey,
    clearEventKey: clearEventKey,
    escapeFilterValue: escapeFilterValue,
    apiUrl: apiUrl,
    homeUrl: homeUrl,
    activitiesUrl: activitiesUrl,
    recordTime: recordTime,
    localDateKey: localDateKey,
    todayKey: todayKey,
    isToday: isToday,
    formatDate: formatDate,
    formatNumber: formatNumber,
    finiteNumber: finiteNumber,
    clamp: clamp,
    fetchAll: fetchAll,
    loadData: loadData,
    postRecord: postRecord,
    mergePlayers: mergePlayers,
    metricValue: metricValue,
    metricDefinition: metricDefinition,
    valuesFor: valuesFor,
    mean: mean,
    median: median,
    mode: mode,
    stdev: stdev,
    summarize: summarize,
    pearson: pearson,
    linearRegression: linearRegression,
    shotAverages: shotAverages,
    shotPercentageByDistance: shotPercentageByDistance,
    groupBy: groupBy,
    toCsv: toCsv,
    downloadCsv: downloadCsv,
    playersToCsv: playersToCsv,
    renderQuestions: renderQuestions,
    plot: plot,
    emptyChart: emptyChart,
    chartReady: chartReady,
    shotProfileChart: shotProfileChart,
    correlationHeatmap: correlationHeatmap,
    init: init,
    setStatus: setStatus,
    emptyStateHtml: emptyStateHtml,
    setupNicknameField: setupNicknameField,
  };
})();
