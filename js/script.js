// Global
const global = {
  currentPage: window.location.pathname,
};

// =====================
// Popular Movies
// =====================
async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular");

  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("card");

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "images/no-image.jpg";

    div.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
        <img
          src="${posterUrl}"
          class="card-img-top"
          alt="${movie.title}"
        />
      </a>
      <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>
        <p class="card-text">
          <small class="text-muted">Release: ${movie.release_date}</small>
        </p>
      </div>
    `;

    document.getElementById("popular-movies").appendChild(div);
  });
}

// =====================
// Popular TV Shows
// =====================
async function displayPopularShows() {
  const { results } = await fetchAPIData("tv/popular");

  results.forEach((show) => {
    const div = document.createElement("div");
    div.classList.add("card");

    // If no poster, show no-image placeholder
    const posterUrl = show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : "images/no-image.jpg";

    div.innerHTML = `
      <a href="tv-details.html?id=${show.id}">
        <img
          src="${posterUrl}"
          class="card-img-top"
          alt="${show.name}"
        />
      </a>
      <div class="card-body">
        <h5 class="card-title">${show.name}</h5>
        <p class="card-text">
          <small class="text-muted">Release: ${show.first_air_date}</small>
        </p>
      </div>
    `;

    document.getElementById("popular-shows").appendChild(div);
  });
}

// =====================
// Movie Details
// =====================
async function displayMovieDetails() {
  const movieId = window.location.search.split("=")[1];

  const movie = await fetchAPIData(`movie/${movieId}`);

  // Background image
  displayBackgroundImage("movie", movie.backdrop_path);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "images/no-image.jpg";

  const div = document.createElement("div");
  div.innerHTML = `
    <div class="details-top">
      <div>
        <img
          src="${posterUrl}"
          class="card-img-top"
          alt="${movie.title}"
        />
      </div>
      <div>
        <h2>${movie.title}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${movie.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">Release Date: ${movie.release_date}</p>
        <p>${movie.overview}</p>
        <h5>Genres :</h5>
        <ul class="list-group">
          ${movie.genres.map((genre) => `<li>${genre.name}</li>`).join("")}
        </ul>
        ${
          movie.homepage
            ? `<a href="${movie.homepage}" target="_blank" class="btn">Visit Movie Homepage</a>`
            : ""
        }
      </div>
    </div>
    <div class="details-bottom">
      <h2>Movie Info</h2>
      <ul>
        <li><span class="text-secondary">Budget:</span> $${addCommasToNumber(
          movie.budget
        )}</li>
        <li><span class="text-secondary">Revenue:</span> $${addCommasToNumber(
          movie.revenue
        )}</li>
        <li><span class="text-secondary">Runtime:</span> ${
          movie.runtime
        } minutes</li>
        <li><span class="text-secondary">Status:</span> ${movie.status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">
        ${movie.production_companies.map((company) => company.name).join(", ")}
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

  // Background image
  displayBackgroundImage("show", show.backdrop_path);

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "images/no-image.jpg";

  const div = document.createElement("div");
  div.innerHTML = `
    <div class="details-top">
      <div>
        <img
          src="${posterUrl}"
          class="card-img-top"
          alt="${show.name}"
        />
      </div>
      <div>
        <h2>${show.name}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${show.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">First Air Date: ${show.first_air_date}</p>
        <p>${show.overview}</p>
        <h5>Genres :</h5>
        <ul class="list-group">
          ${show.genres.map((genre) => `<li>${genre.name}</li>`).join("")}
        </ul>
        ${
          show.homepage
            ? `<a href="${show.homepage}" target="_blank" class="btn">Visit Show Homepage</a>`
            : ""
        }
      </div>
    </div>
    <div class="details-bottom">
      <h2>Show Info</h2>
      <ul>
        <li><span class="text-secondary">Seasons:</span> ${
          show.number_of_seasons
        }</li>
        <li><span class="text-secondary">Episodes:</span> ${
          show.number_of_episodes
        }</li>
        <li><span class="text-secondary">Status:</span> ${show.status}</li>
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">
        ${show.production_companies.map((company) => company.name).join(", ")}
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
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "-30%";
  overlayDiv.style.width = "160%";
  overlayDiv.style.height = "100%";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.2";

  const parent =
    type === "movie"
      ? document.querySelector("#movie-details")
      : document.querySelector("#show-details");

  if (!parent) return;

  if (getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }

  parent.appendChild(overlayDiv);
}

///Display slider moviess

async function displaySlider() {
  const { results } = await fetchAPIData("movie/now_playing");
  console.log(results);

  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = `
        
            <a href="movie-details.html?id=${movie.id}">
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
            </a>
            <h4 class="swiper-rating">
              <i class="fas fa-star text-secondary"></i> ${movie.vote_average} / 10
            </h4>
        `;
    document.querySelector(".swiper-wrapper").appendChild(div);

    intiSwiper();
  });
}

function intiSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 40,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 2000, // wait time
      disableOnInteraction: false,
    },
    speed: 800, // slide animation duration (0.8s)
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 5,
      },
    },
  });
}

// =====================
// API + Spinner
// =====================
async function fetchAPIData(endpoint) {
  const API_KEY = "306029ce9b318abdcf1eaa883dc7e69e";
  const API_URL = "https://api.themoviedb.org/3/";

  showSpinner();

  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
  );
  const data = await response.json();

  hideSpinner();
  return data;
}

function showSpinner() {
  const spinner = document.querySelector(".spinner");
  if (spinner) spinner.classList.add("show");
}

function hideSpinner() {
  const spinner = document.querySelector(".spinner");
  if (spinner) spinner.classList.remove("show");
}

// =====================
// Helpers
// =====================
function highlightActiveLink() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (link.getAttribute("href") === global.currentPage) {
      link.classList.add("active");
    }
  });
}

function addCommasToNumber(number) {
  if (!number && number !== 0) return "0";
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Init

function init() {
  // Detect page by existing elements – works with your file names
  if (document.getElementById("popular-movies")) {
    displayPopularMovies();
    displaySlider();
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

  highlightActiveLink();
}

document.addEventListener("DOMContentLoaded", init);

// Add this code to the existing script.js file

// =====================
// Search
// =====================
async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  
  const type = urlParams.get('type') || 'movie';
  const searchTerm = urlParams.get('search-term');
  
  if (searchTerm) {
    await searchAPIData(type, searchTerm);
  } else {
    showAlert('Please enter a search term', 'error');
  }
}

// =====================
// Search API Data
// =====================
async function searchAPIData(type, searchTerm, page = 1) {
  const API_KEY = "306029ce9b318abdcf1eaa883dc7e69e";
  const API_URL = "https://api.themoviedb.org/3/";
  
  showSpinner();
  
  const response = await fetch(
    `${API_URL}search/${type}?api_key=${API_KEY}&language=en-US&query=${searchTerm}&page=${page}`
  );
  
  const data = await response.json();
  
  hideSpinner();
  
  if (data.results.length === 0) {
    showAlert('No results found', 'error');
    return;
  }
  
  displaySearchResults(type, data, searchTerm, page);
}

// =====================
// Display Search Results
// =====================
function displaySearchResults(type, data, searchTerm, page) {
  // Clear previous results
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
  
  // Update heading
  const heading = document.getElementById('search-results-heading');
  if (heading) {
    heading.innerHTML = `<h2>Search Results for "${searchTerm}" (${type === 'movie' ? 'Movies' : 'TV Shows'})</h2>`;
  }
  
  // Display results
  data.results.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('card');
    
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'images/no-image.jpg';
    
    const title = type === 'movie' ? item.title : item.name;
    const releaseDate = type === 'movie' ? item.release_date : item.first_air_date;
    const detailsPage = type === 'movie' ? 'movie-details.html' : 'tv-details.html';
    
    div.innerHTML = `
      <a href="${detailsPage}?id=${item.id}">
        <img
          src="${posterUrl}"
          class="card-img-top"
          alt="${title}"
        />
      </a>
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">
          <small class="text-muted">Release: ${releaseDate || 'N/A'}</small>
        </p>
      </div>
    `;
    
    if (resultsContainer) {
      resultsContainer.appendChild(div);
    }
  });
  
  // Display pagination
  displayPagination(type, data, searchTerm, page);
}

// =====================
// Display Pagination
// =====================
function displayPagination(type, data, searchTerm, page) {
  const paginationDiv = document.getElementById('pagination');
  if (!paginationDiv) return;
  
  const totalPages = data.total_pages;
  
  if (totalPages <= 1) {
    paginationDiv.style.display = 'none';
    return;
  }
  
  paginationDiv.style.display = 'block';
  
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const pageCounter = paginationDiv.querySelector('.page-counter');
  
  if (pageCounter) {
    pageCounter.textContent = `Page ${page} of ${totalPages}`;
  }
  
  // Previous button
  if (prevBtn) {
    if (page > 1) {
      prevBtn.disabled = false;
      prevBtn.onclick = () => {
        searchAPIData(type, searchTerm, page - 1);
      };
    } else {
      prevBtn.disabled = true;
    }
  }
  
  // Next button
  if (nextBtn) {
    if (page < totalPages) {
      nextBtn.disabled = false;
      nextBtn.onclick = () => {
        searchAPIData(type, searchTerm, page + 1);
      };
    } else {
      nextBtn.disabled = true;
    }
  }
}

// =====================
// Show Alert
// =====================
function showAlert(message, className) {
  const alertDiv = document.getElementById('alert');
  if (!alertDiv) return;
  
  alertDiv.innerHTML = `<div class="alert alert-${className}">${message}</div>`;
  
  // Remove alert after 3 seconds
  setTimeout(() => {
    alertDiv.innerHTML = '';
  }, 3000);
}

// =====================
// Handle Search Form Submission
// =====================
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
// Update init function
// =====================
function init() {
  // Detect page by existing elements – works with your file names
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

  highlightActiveLink();
}