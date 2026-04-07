const API_KEY = "NQWJD9AVi}zKRFmi7D@m";

const genres = [
  { key: "Documentaries", ga: "Faisnéis", en:"Documentaries"},
  { key: "Drama", ga: "Drámaíocht", en:"Drama"},
  { key: "Entertainment", ga: "Siamsaíocht", en:"Entertainment"},
  { key: "Lifestyle", ga: "Saolchláir", en:" Lifestyle" },
  { key: "Music", ga: "Ceol", en:" Music" },
  { key: "News", ga: "Cúrsaí Reatha", en:" Current Affairs" },
  { key: "Sport", ga: "Spórt", en:"Sport" },
  { key: "Cula4", ga: "Cúla4", en:"Cúla4"},
];

// State
let showOnlySubs = true;
let allData = {};

// Load all genres
async function loadAllGenres() {
  document.querySelector(".loading").style.display = "none";

  for (const genre of genres) {
    await loadGenre(genre);
  }

  render(); // render once everything is loaded
}

// Fetch each genre
async function loadGenre(genre) {
  try {
    const encodedGenre = encodeURIComponent(genre.key);

    const res = await fetch(
      `https://playerapi.tg4tech.com/genres?genre=${encodedGenre}`,
      { headers: { "x-api-key": API_KEY } }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const videos = data.videos || data;

    // Store raw data (no filtering yet)
    allData[genre.key] = videos;

  } catch (err) {
    console.error("Error loading genre:", genre.key, err);
    allData[genre.key] = null;
  }
}

// Render everything
function render() {
  let hasAnyData = false;
  let hasError = false;
  const container = document.getElementById("genres");
  container.innerHTML = "";

  for (const genre of genres) {
    const videos = allData[genre.key];

  if (videos === null) {
    hasError = true;
    continue;
  }

  if (!videos) continue;

  hasAnyData = true;

    const filtered = videos.filter((video) => {

      const isIrish =
        video.custom_fields?.language === "Gaeilge";

      if (!isIrish) return false;

      if (!showOnlySubs) return true;

      const hasIrishSubs =
        video.text_tracks?.some(track =>
          track.srclang?.startsWith("ga")
        );

      return hasIrishSubs;
    });

    if (!filtered.length) continue;

    // Deduplicate by series
    const uniqueSeries = {};
    filtered.forEach((video) => {
      const title =
        video.custom_fields?.seriestitle || video.name;

      if (!uniqueSeries[title]) {
        uniqueSeries[title] = video;
      }
    });

    createGenreSection(genre , Object.values(uniqueSeries));
  }

    // Handle empty / error states
  if (!hasAnyData) {
    if (hasError) {
      container.innerHTML = `
        <div class="error">
          💀 Bad news, something has gone <i><u>very</u></i> wrong! 💀<br><br>
          <img src="https://img.gifglobe.com/grabs/fatherted/S03E03/gif/mkp0X6IkDr35.gif">
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="error">
          No programmes found.
        </div>
      `;
    }
  }
}

// Build each genre section
function createGenreSection(genre, videos) {
  const container = document.getElementById("genres");

  const section = document.createElement("section");

  section.innerHTML = `
    <h2>${genre.ga} <span class="en"> > ${genre.en}</span></h2>
    <div class="row"></div>
  `;

  const row = section.querySelector(".row");

  videos.forEach((video) => {

    const title =
      video.custom_fields?.seriestitle || video.name;

    const isGeoLocked =
      video.custom_fields?.geo_restrict === "Y";

    const hasIrishSubs =
      video.text_tracks?.some(track =>
        track.srclang?.startsWith("ga")
      );

    const watchLink =
      `https://www.tg4.ie/en/search/?s=${encodeURIComponent(title)}`;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${video.poster || ""}" alt="">
      <div class="card-content">
        <strong>${title}</strong><br>
        <a href="${watchLink}" target="_blank"> ${isGeoLocked ? "🔒" : "🌎"} Watch on TG4 →</a><br>
        <small>Language: ${video.custom_fields?.language} ${hasIrishSubs ? "& 🇮🇪 Subs" : ""} </small>
      </div>
      </div>
    `;

    row.appendChild(card);
  });

  container.appendChild(section);
}

// Checkbox toggle
document.getElementById("subsToggle").addEventListener("change", (e) => {
  showOnlySubs = e.target.checked;
  render();
});

// Start
loadAllGenres();