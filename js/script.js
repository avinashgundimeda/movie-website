// Global
const global = {
  currentPage: window.location.pathname,
};

// =====================
// Header scroll effect
// =====================
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// =====================
// Build card HTML
// =====================
function buildCard(href, posterUrl, title, subtitle, rating) {
  return `
    <div class="card">
      <a href="${href}">
        <div class="card-poster">
          <img src="${posterUrl}" alt="${title}" loading="lazy" />
          <div class="card-overlay">
            <span class="card-overlay-rating">
              <i class="fas fa-star"></i> ${rating ? parseFloat(rating).toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>
      </a>
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text"><small>${subtitle || ''}</small></p>
      </div>
    </div>
  `;
}

// =====================
// Popular Movies
// =====================
async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular");

  const container = document.getElementById("popular-movies");
  results.forEach((movie) => {
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "images/no-image.jpg";

    container.innerHTML += buildCard(
      `movie-details.html?id=${movie.id}`,
      posterUrl,
      movie.title,
      movie.release_date ? `Released ${movie.release_date}` : '',
      movie.vote_average
    );
  });
}

// =====================
// Popular TV Shows
// =====================
async function displayPopularShows() {
  const { results } = await fetchAPIData("tv/popular");

  const container = document.getElementById("popular-shows");
  results.forEach((show) => {
    const posterUrl = show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : "images/no-image.jpg";

    container.innerHTML += buildCard(
      `tv-details.html?id=${show.id}`,
      posterUrl,
      show.name,
      show.first_air_date ? `First aired ${show.first_air_date}` : '',
      show.vote_average
    );
  });
}

// =====================
// Movie Details
// =====================
async function displayMovieDetails() {
  const movieId = window.location.search.split("=")[1];
  const movie = await fetchAPIData(`movie/${movieId}`);

  displayBackgroundImage("movie", movie.backdrop_path);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "images/no-image.jpg";

  const div = document.createElement("div");
  div.innerHTML = `
    <div class="details-top">
      <div>
        <img src="${posterUrl}" class="card-img-top" alt="${movie.title}" />
      </div>
      <div>
        <h2>${movie.title}</h2>
        <div class="rating-row">
          <i class="fas fa-star"></i>
          ${movie.vote_average.toFixed(1)} / 10
        </div>
        <p class="release-date">Release Date &mdash; ${movie.release_date}</p>
        <p class="overview">${movie.overview}</p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${movie.genres.map((g) => `<li>${g.name}</li>`).join("")}
        </ul>
        ${movie.homepage ? `<a href="${movie.homepage}" target="_blank" class="btn"><i class="fas fa-external-link-alt"></i> Visit Homepage</a>` : ""}
      </div>
    </div>
    <div class="details-bottom">
      <h2>Movie Info</h2>
      <ul>
        <li><span class="text-secondary">Budget</span> $${addCommasToNumber(movie.budget)}</li>
        <li><span class="text-secondary">Revenue</span> $${addCommasToNumber(movie.revenue)}</li>
        <li><span class="text-secondary">Runtime</span> ${movie.runtime} min</li>
        <li><span class="text-secondary">Status</span> ${movie.status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">
        ${movie.production_companies.map((c) => `<span style="color:var(--muted);font-size:13px;">${c.name}</span>`).join(" &middot; ")}
      </div>
    </div>
  `;

  document.getElementById("movie-details").appendChild(div);
}

// =====================
// TV Show Details
// =====================
async function displayShowDetails() {
  const showId = window.location.search.split("=")[1];
  const show = await fetchAPIData(`tv/${showId}`);

  displayBackgroundImage("show", show.backdrop_path);

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "images/no-image.jpg";

  const div = document.createElement("div");
  div.innerHTML = `
    <div class="details-top">
      <div>
        <img src="${posterUrl}" class="card-img-top" alt="${show.name}" />
      </div>
      <div>
        <h2>${show.name}</h2>
        <div class="rating-row">
          <i class="fas fa-star"></i>
          ${show.vote_average.toFixed(1)} / 10
        </div>
        <p class="release-date">First Air Date &mdash; ${show.first_air_date}</p>
        <p class="overview">${show.overview}</p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${show.genres.map((g) => `<li>${g.name}</li>`).join("")}
        </ul>
        ${show.homepage ? `<a href="${show.homepage}" target="_blank" class="btn"><i class="fas fa-external-link-alt"></i> Visit Homepage</a>` : ""}
      </div>
    </div>
    <div class="details-bottom">
      <h2>Show Info</h2>
      <ul>
        <li><span class="text-secondary">Seasons</span> ${show.number_of_seasons}</li>
        <li><span class="text-secondary">Episodes</span> ${show.number_of_episodes}</li>
        <li><span class="text-secondary">Status</span> ${show.status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">
        ${show.production_companies.map((c) => `<span style="color:var(--muted);font-size:13px;">${c.name}</span>`).join(" &middot; ")}
      </div>
    </div>
  `;

  document.getElementById("show-details").appendChild(div);
}

// =====================
// Background Image
// =====================
function displayBackgroundImage(type, backgroundPath) {
  if (!backgroundPath) return;

  const overlayDiv = document.createElement("div");
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backgroundPath})`;
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center top";
  overlayDiv.style.position = "fixed";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.width = "100%";
  overlayDiv.style.height = "100%";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.12";
  overlayDiv.style.filter = "blur(2px)";

  document.body.appendChild(overlayDiv);
}

// =====================
// Slider
// =====================
async function displaySlider() {
  const { results } = await fetchAPIData("movie/now_playing");

  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
        <img
          src="https://image.tmdb.org/t/p/w780${movie.poster_path}"
          alt="${movie.title}"
        />
      </a>
      <div class="swiper-rating">
        <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
      </div>
    `;
    document.querySelector(".swiper-wrapper").appendChild(div);
  });

  initSwiper();
}

function initSwiper() {
  new Swiper(".swiper", {
    slidesPerView: 2,
    spaceBetween: 12,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    speed: 700,
    breakpoints: {
      480:  { slidesPerView: 3, spaceBetween: 16 },
      768:  { slidesPerView: 4, spaceBetween: 20 },
      1024: { slidesPerView: 5, spaceBetween: 24 },
      1280: { slidesPerView: 6, spaceBetween: 24 },
    },
  });
}

// =====================
// Fetch API Data
// =====================
async function fetchAPIData(endpoint) {
  const API_KEY = "306029ce9b318abdcf1eaa883dc7e69e";
  const API_URL = "https://api.themoviedb.org/3/";

  showSpinner();
  const response = await fetch(`${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
  const data = await response.json();
  hideSpinner();
  return data;
}

function showSpinner() {
  const s = document.querySelector(".spinner");
  if (s) s.classList.add("show");
}

function hideSpinner() {
  const s = document.querySelector(".spinner");
  if (s) s.classList.remove("show");
}

// =====================
// Nav active link
// =====================
function highlightActiveLink() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (link.getAttribute("href") === global.currentPage) {
      link.classList.add("active");
    }
  });
}

// =====================
// Helpers
// =====================
function addCommasToNumber(number) {
  if (!number && number !== 0) return "0";
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// =====================
// Search
// =====================
async function search() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type') || 'movie';
  const searchTerm = urlParams.get('search-term');

  if (searchTerm) {
    await searchAPIData(type, searchTerm);
  } else {
    showAlert('Please enter a search term', 'error');
  }
}

async function searchAPIData(type, searchTerm, page = 1) {
  const API_KEY = "306029ce9b318abdcf1eaa883dc7e69e";
  const API_URL = "https://api.themoviedb.org/3/";

  showSpinner();
  const response = await fetch(
    `${API_URL}search/${type}?api_key=${API_KEY}&language=en-US&query=${searchTerm}&page=${page}`
  );
  const data = await response.json();
  hideSpinner();

  if (!data.results || data.results.length === 0) {
    showAlert('No results found', 'error');
    return;
  }

  displaySearchResults(type, data, searchTerm, page);
}

function displaySearchResults(type, data, searchTerm, page) {
  const container = document.getElementById('search-results');
  if (container) container.innerHTML = '';

  const heading = document.getElementById('search-results-heading');
  if (heading) {
    heading.innerHTML = `<h2>Results for &ldquo;${searchTerm}&rdquo; &mdash; ${type === 'movie' ? 'Movies' : 'TV Shows'}</h2>`;
  }

  data.results.forEach((item) => {
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'images/no-image.jpg';

    const title = type === 'movie' ? item.title : item.name;
    const releaseDate = type === 'movie' ? item.release_date : item.first_air_date;
    const detailsPage = type === 'movie' ? 'movie-details.html' : 'tv-details.html';

    if (container) {
      container.innerHTML += buildCard(
        `${detailsPage}?id=${item.id}`,
        posterUrl,
        title,
        releaseDate ? `Released ${releaseDate}` : '',
        item.vote_average
      );
    }
  });

  displayPagination(type, data, searchTerm, page);
}

function displayPagination(type, data, searchTerm, page) {
  const paginationDiv = document.getElementById('pagination');
  if (!paginationDiv) return;

  const totalPages = data.total_pages;
  if (totalPages <= 1) { paginationDiv.style.display = 'none'; return; }
  paginationDiv.style.display = 'block';

  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const pageCounter = paginationDiv.querySelector('.page-counter');

  if (pageCounter) pageCounter.textContent = `Page ${page} of ${totalPages}`;

  if (prevBtn) {
    prevBtn.disabled = page <= 1;
    prevBtn.onclick = () => { if (page > 1) searchAPIData(type, searchTerm, page - 1); };
  }

  if (nextBtn) {
    nextBtn.disabled = page >= totalPages;
    nextBtn.onclick = () => { if (page < totalPages) searchAPIData(type, searchTerm, page + 1); };
  }
}

function showAlert(message, className) {
  const alertDiv = document.getElementById('alert');
  if (!alertDiv) return;
  alertDiv.innerHTML = `<div class="alert alert-${className}">${message}</div>`;
  setTimeout(() => { alertDiv.innerHTML = ''; }, 3500);
}

function setupSearchForm() {
  const searchForm = document.querySelector('.search-form');
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById('search-term').value.trim();
    const type = document.querySelector('input[name="type"]:checked').value;

    if (searchTerm) {
      window.location.href = `search.html?type=${type}&search-term=${encodeURIComponent(searchTerm)}`;
    } else {
      showAlert('Please enter a search term', 'error');
    }
  });
}

// =====================
// Init
// =====================
function init() {
  initHeaderScroll();
  highlightActiveLink();

  if (document.getElementById("popular-movies")) {
    displayPopularMovies();
    displaySlider();
    setupSearchForm();
  }

  if (document.getElementById("popular-shows")) {
    displayPopularShows();
  }

  if (document.getElementById("movie-details")) {
    displayMovieDetails();
  }

  if (document.getElementById("show-details")) {
    displayShowDetails();
  }

  if (window.location.pathname.includes('search.html')) {
    setupSearchForm();
    search();
  }
}

document.addEventListener("DOMContentLoaded", init);