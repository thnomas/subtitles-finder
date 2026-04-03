const API_KEY = "NQWJD9AVi}zKRFmi7D@m";

const genres = [
  "Documentaries",
  "Drama",
  "Entertainment",
  "Lifestyle",
  "Music",
  "News",
  "Sport",
  "Cula4",
];

async function loadAllGenres() {
  document.querySelector(".loading").style.display = "none";

  for (const genre of genres) {
    await loadGenre(genre);
  }
}

async function loadGenre(genre) {
  try {
    const encodedGenre = encodeURIComponent(genre);

    const res = await fetch(
      `https://playerapi.tg4tech.com/genres?genre=${encodedGenre}`,
      { headers: { "x-api-key": API_KEY } },
    );

    const data = await res.json();
    const videos = data.videos || data;

    const filtered = videos.filter((video) => {
      const isIrish = video.custom_fields?.language === "Gaeilge";

      const hasIrishSubs = video.text_tracks?.some((track) =>
        track.srclang?.startsWith("ga"),
      );

      return isIrish && hasIrishSubs;
      // return isIrish;
    });

    if (!filtered.length) return;

    // Deduplicate by series title
    const uniqueSeries = {};
    filtered.forEach((video) => {
      const title = video.custom_fields?.seriestitle || video.name;
      if (!uniqueSeries[title]) {
        uniqueSeries[title] = video;
      }
    });

    createGenreSection(genre, Object.values(uniqueSeries));
  } catch (err) {
    console.error("Error loading genre:", genre, err);
  }
}

function createGenreSection(genre, videos) {
  const container = document.getElementById("genres");

  const section = document.createElement("section");

  section.innerHTML = `
    <h2>${genre}</h2>
    <div class="row"></div>
  `;

  const row = section.querySelector(".row");

  videos.forEach((video) => {
    const title = video.custom_fields?.seriestitle || video.name;

    const isGeoLocked = video.custom_fields?.geo_restrict === "Y";

    const watchLink = `https://www.tg4.ie/en/search/?s=${title}`;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${video.poster || ""}" alt="">
      <div class="card-content">
        <strong>${title}</strong><br>
        <a href="${watchLink}" target="_blank">
          Watch on TG4 →
        </a>
      </div>
    `;

    row.appendChild(card);
  });

  container.appendChild(section);
}

loadAllGenres();
