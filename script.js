const YOUTUBE_API_KEY = "AIzaSyCckOfK-bQfmfK64d_LVfppCeGwqe_jQbM";
const UNSPLASH_ACCESS_KEY = "a2sMXaEm4RkUFl407MRksWNYSPddQuL7_22F1jeo5jE";

const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const filterButtons = document.querySelectorAll('.filters button');
let currentFilter = 'all';

document.getElementById('year').textContent = new Date().getFullYear();

async function fetchWikipediaResults(query) {
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const response = await fetch(endpoint);
  const data = await response.json();
  return data.query.search.map(item => ({
    title: item.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
    desc: item.snippet.replace(/<[^>]+>/g, '') + '...',
    type: 'text'
  }));
}

async function fetchYouTubeVideos(query) {
  const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(endpoint);
  const data = await response.json();
  return data.items.map(item => ({
    title: item.snippet.title,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    desc: item.snippet.description,
    image: item.snippet.thumbnails.medium.url,
    type: 'videos'
  }));
}

async function fetchUnsplashImages(query) {
  const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&client_id=${UNSPLASH_ACCESS_KEY}`;
  const response = await fetch(endpoint);
  const data = await response.json();
  return data.results.map(item => ({
    title: item.alt_description || 'Unsplash Image',
    url: item.links.html,
    desc: 'Image from Unsplash',
    image: item.urls.small,
    type: 'images'
  }));
}

async function performSearch() {
  const query = searchInput.value.trim();
  if (query === '') {
    resultsContainer.innerHTML = '';
    return;
  }
  let results = [];

  if (currentFilter === 'all' || currentFilter === 'text') {
    const wikiResults = await fetchWikipediaResults(query);
    results = results.concat(wikiResults);
  }

  if (currentFilter === 'all' || currentFilter === 'videos') {
    const youtubeResults = await fetchYouTubeVideos(query);
    results = results.concat(youtubeResults);
  }

  if (currentFilter === 'all' || currentFilter === 'images') {
    const imageResults = await fetchUnsplashImages(query);
    results = results.concat(imageResults);
  }

  renderResults(results);
}

function renderResults(results) {
  resultsContainer.innerHTML = '';
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p>No results found.</p>';
    return;
  }
  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      ${item.image ? `<img src="${item.image}" alt="${item.title}" />` : ''}
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <small>${item.url}</small>
    `;
    div.onclick = () => window.open(item.url, '_blank');
    resultsContainer.appendChild(div);
  });
}

searchInput.addEventListener('input', () => {
  clearTimeout(window.searchDebounce);
  window.searchDebounce = setTimeout(performSearch, 500);
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.type;
    performSearch();
  });
});
