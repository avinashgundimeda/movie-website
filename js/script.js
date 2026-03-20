// Global
const global = {
  currentPage: window.location.pathname,
};

// ─────────────────────────────────────────
// Header scroll + search toggle
// ─────────────────────────────────────────
function initHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  // Scroll effect
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Search toggle
  const toggleBtn = document.getElementById('search-toggle');
  const searchBar = document.getElementById('header-search-bar');
  if (toggleBtn && searchBar) {
    toggleBtn.addEventListener('click', () => {
      searchBar.classList.toggle('open');
      if (searchBar.classList.contains('open')) {
        searchBar.querySelector('input') && searchBar.querySelector('input').focus();
      }
    });
    // close on click outside
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        searchBar.classList.remove('open');
      }
    });
  }
}

// ─────────────────────────────────────────
// HERO — Netflix big banner
// ─────────────────────────────────────────
async function displayHero() {
  const { results } = await fetchAPIData('movie/now_playing');
  if (!results || results.length === 0) return;

  // Pick a random movie from top 5
  const pick = results[Math.floor(Math.random() * Math.min(5, results.length))];

  const backdropEl = document.getElementById('hero-backdrop');
  const contentEl  = document.getElementById('hero-content');
  const ageBadge   = document.getElementById('hero-age-badge');

  if (backdropEl && pick.backdrop_path) {
    backdropEl.style.backgroundImage =
      `url(https://image.tmdb.org/t/p/original${pick.backdrop_path})`;
  }

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="hero-meta">
        <span class="hero-tag">Now Playing</span>
        <span class="hero-year">${pick.release_date ? pick.release_date.slice(0,4) : ''}</span>
      </div>
      <h1 class="hero-title">${pick.title}</h1>
      <div class="hero-rating">
        <i class="fas fa-star"></i>
        <span>${pick.vote_average.toFixed(1)}</span>
        <span class="slash">/</span>
        <span>10</span>
      </div>
      <p class="hero-overview">${pick.overview}</p>
      <div class="hero-actions">
        <a href="movie-details.html?id=${pick.id}" class="hero-btn hero-btn-play">
          <i class="fas fa-play"></i> Play
        </a>
        <a href="movie-details.html?id=${pick.id}" class="hero-btn hero-btn-info">
          <i class="fas fa-info-circle"></i> More Info
        </a>
      </div>
    `;
  }

  if (ageBadge) {
    const score = pick.vote_average;
    const label = score >= 7 ? '7+' : score >= 5 ? '13+' : '16+';
    ageBadge.textContent = label;
  }
}

// ─────────────────────────────────────────
// Build card HTML
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// Popular Movies
// ─────────────────────────────────────────
async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular');
  const container = document.getElementById('popular-movies');
  if (!container) return;
  results.forEach((movie) => {
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'images/no-image.jpg';
    container.innerHTML += buildCard(
      `movie-details.html?id=${movie.id}`,
      posterUrl,
      movie.title,
      movie.release_date ? movie.release_date.slice(0, 4) : '',
      movie.vote_average
    );
  });
}

// ─────────────────────────────────────────
// Popular TV Shows
// ─────────────────────────────────────────
async function displayPopularShows() {
  const { results } = await fetchAPIData('tv/popular');
  const container = document.getElementById('popular-shows');
  if (!container) return;
  results.forEach((show) => {
    const posterUrl = show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : 'images/no-image.jpg';
    container.innerHTML += buildCard(
      `tv-details.html?id=${show.id}`,
      posterUrl,
      show.name,
      show.first_air_date ? show.first_air_date.slice(0, 4) : '',
      show.vote_average
    );
  });
}

// ─────────────────────────────────────────
// Now Playing Swiper Row
// ─────────────────────────────────────────
async function displaySlider() {
  const { results } = await fetchAPIData('movie/now_playing');
  const wrapper = document.querySelector('.swiper-wrapper');
  if (!wrapper) return;

  results.forEach((movie) => {
    if (!movie.poster_path) return;
    const div = document.createElement('div');
    div.classList.add('swiper-slide');
    div.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
        <img src="https://image.tmdb.org/t/p/w342${movie.poster_path}" alt="${movie.title}" loading="lazy" />
      </a>
      <div class="swiper-rating">
        <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
      </div>
    `;
    wrapper.appendChild(div);
  });

  new Swiper('.row-swiper', {
    slidesPerView: 3,
    spaceBetween: 8,
    loop: true,
    autoplay: { delay: 3200, disableOnInteraction: false },
    speed: 650,
    breakpoints: {
      480:  { slidesPerView: 4, spaceBetween: 8 },
      768:  { slidesPerView: 5, spaceBetween: 10 },
      1024: { slidesPerView: 7, spaceBetween: 10 },
      1280: { slidesPerView: 8, spaceBetween: 10 },
    },
  });
}

// ─────────────────────────────────────────
// Movie Details
// ─────────────────────────────────────────
async function displayMovieDetails() {
  const movieId = window.location.search.split('=')[1];
  const movie = await fetchAPIData(`movie/${movieId}`);

  displayBackgroundImage('movie', movie.backdrop_path);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'images/no-image.jpg';

  const div = document.createElement('div');
  div.innerHTML = `
    <div class="details-top">
      <div>
        <img src="${posterUrl}" alt="${movie.title}" />
      </div>
      <div>
        <h2>${movie.title}</h2>
        <div class="rating-row">
          <i class="fas fa-star"></i>
          ${movie.vote_average.toFixed(1)} / 10
        </div>
        <p class="release-date">Release &mdash; ${movie.release_date}</p>
        <p class="overview">${movie.overview}</p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${movie.genres.map((g) => `<li>${g.name}</li>`).join('')}
        </ul>
        ${movie.homepage
          ? `<a href="${movie.homepage}" target="_blank" class="btn"><i class="fas fa-external-link-alt"></i> Visit Homepage</a>`
          : ''}
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
        ${movie.production_companies.map((c) => `<span style="color:var(--muted);font-size:13px;">${c.name}</span>`).join(' &middot; ')}
      </div>
    </div>
  `;
  document.getElementById('movie-details').appendChild(div);
}

// ─────────────────────────────────────────
// Show Details
// ─────────────────────────────────────────
async function displayShowDetails() {
  const showId = window.location.search.split('=')[1];
  const show = await fetchAPIData(`tv/${showId}`);

  displayBackgroundImage('show', show.backdrop_path);

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : 'images/no-image.jpg';

  const div = document.createElement('div');
  div.innerHTML = `
    <div class="details-top">
      <div>
        <img src="${posterUrl}" alt="${show.name}" />
      </div>
      <div>
        <h2>${show.name}</h2>
        <div class="rating-row">
          <i class="fas fa-star"></i>
          ${show.vote_average.toFixed(1)} / 10
        </div>
        <p class="release-date">First Air &mdash; ${show.first_air_date}</p>
        <p class="overview">${show.overview}</p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${show.genres.map((g) => `<li>${g.name}</li>`).join('')}
        </ul>
        ${show.homepage
          ? `<a href="${show.homepage}" target="_blank" class="btn"><i class="fas fa-external-link-alt"></i> Visit Homepage</a>`
          : ''}
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
        ${show.production_companies.map((c) => `<span style="color:var(--muted);font-size:13px;">${c.name}</span>`).join(' &middot; ')}
      </div>
    </div>
  `;
  document.getElementById('show-details').appendChild(div);
}

// ─────────────────────────────────────────
// Background for details pages
// ─────────────────────────────────────────
function displayBackgroundImage(type, backgroundPath) {
  if (!backgroundPath) return;
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;inset:0;
    background:url(https://image.tmdb.org/t/p/original${backgroundPath}) center/cover no-repeat;
    z-index:-1;opacity:0.1;filter:blur(3px);
  `;
  document.body.appendChild(el);
}

// ─────────────────────────────────────────
// Fetch + Spinner
// ─────────────────────────────────────────
async function fetchAPIData(endpoint) {
  const API_KEY = '306029ce9b318abdcf1eaa883dc7e69e';
  const API_URL = 'https://api.themoviedb.org/3/';
  showSpinner();
  const res = await fetch(`${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  hideSpinner();
  return data;
}

function showSpinner() {
  const s = document.querySelector('.spinner');
  if (s) s.classList.add('show');
}
function hideSpinner() {
  const s = document.querySelector('.spinner');
  if (s) s.classList.remove('show');
}

// ─────────────────────────────────────────
// Active nav link
// ─────────────────────────────────────────
function highlightActiveLink() {
  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === global.currentPage) {
      link.classList.add('active');
    }
  });
}

function addCommasToNumber(n) {
  if (!n && n !== 0) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ─────────────────────────────────────────
// Search
// ─────────────────────────────────────────
async function search() {
  const params    = new URLSearchParams(window.location.search);
  const type      = params.get('type') || 'movie';
  const term      = params.get('search-term');

  // pre-fill filter form if present
  const filterInput = document.getElementById('search-term-filter');
  if (filterInput && term) filterInput.value = term;
  const filterRadio = document.querySelector(`input[name="type"][value="${type}"]`);
  if (filterRadio) filterRadio.checked = true;

  if (term) {
    await searchAPIData(type, term, 1);
  } else {
    showAlert('Please enter a search term', 'error');
  }
}

async function searchAPIData(type, term, page = 1) {
  const API_KEY = '306029ce9b318abdcf1eaa883dc7e69e';
  const API_URL = 'https://api.themoviedb.org/3/';
  showSpinner();
  const res = await fetch(
    `${API_URL}search/${type}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(term)}&page=${page}`
  );
  const data = await res.json();
  hideSpinner();

  if (!data.results || data.results.length === 0) {
    showAlert('No results found', 'error');
    return;
  }
  displaySearchResults(type, data, term, page);
}

function displaySearchResults(type, data, term, page) {
  const container = document.getElementById('search-results');
  if (container) container.innerHTML = '';

  const heading = document.getElementById('search-results-heading');
  if (heading) {
    heading.innerHTML = `<h2>Results for &ldquo;${term}&rdquo;</h2>`;
  }

  data.results.forEach((item) => {
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'images/no-image.jpg';
    const title       = type === 'movie' ? item.title : item.name;
    const releaseDate = type === 'movie' ? item.release_date : item.first_air_date;
    const detailsPage = type === 'movie' ? 'movie-details.html' : 'tv-details.html';
    if (container) {
      container.innerHTML += buildCard(
        `${detailsPage}?id=${item.id}`,
        posterUrl,
        title,
        releaseDate ? releaseDate.slice(0, 4) : '',
        item.vote_average
      );
    }
  });

  displayPagination(type, data, term, page);
}

function displayPagination(type, data, term, page) {
  const paginationDiv = document.getElementById('pagination');
  if (!paginationDiv) return;
  const totalPages = data.total_pages;
  if (totalPages <= 1) { paginationDiv.style.display = 'none'; return; }
  paginationDiv.style.display = 'block';

  const prevBtn     = document.getElementById('prev');
  const nextBtn     = document.getElementById('next');
  const pageCounter = paginationDiv.querySelector('.page-counter');

  if (pageCounter) pageCounter.textContent = `Page ${page} of ${totalPages}`;
  if (prevBtn) {
    prevBtn.disabled = page <= 1;
    prevBtn.onclick  = () => { if (page > 1) searchAPIData(type, term, page - 1); };
  }
  if (nextBtn) {
    nextBtn.disabled = page >= totalPages;
    nextBtn.onclick  = () => { if (page < totalPages) searchAPIData(type, term, page + 1); };
  }
}

function showAlert(message, className) {
  const alertDiv = document.getElementById('alert');
  if (!alertDiv) return;
  alertDiv.innerHTML = `<div class="alert alert-${className}">${message}</div>`;
  setTimeout(() => { alertDiv.innerHTML = ''; }, 3500);
}

// ─────────────────────────────────────────
// Init
// ─────────────────────────────────────────
function init() {
  initHeader();
  highlightActiveLink();

  if (document.getElementById('popular-movies')) {
    displayHero();
    displaySlider();
    displayPopularMovies();
  }

  if (document.getElementById('popular-shows')) {
    displayPopularShows();
  }

  if (document.getElementById('movie-details')) {
    displayMovieDetails();
  }

  if (document.getElementById('show-details')) {
    displayShowDetails();
  }

  if (window.location.pathname.includes('search.html')) {
    search();
  }
}

document.addEventListener('DOMContentLoaded', init);