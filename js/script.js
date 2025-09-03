/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */
const CONFIG = {
  FEED_URL: 'https://medium.com/feed/@danielmorrisey',
  PROXY_URL: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  POSTS_TO_SHOW: 5,
  REFRESH_INTERVAL_MS: 60_000, // 1 minute
};

/* ------------------------------------------------------------------ *
 * DOM references – grab them once so we don’t query repeatedly
 * ------------------------------------------------------------------ */
let dom = {};

/* ------------------------------------------------------------------ *
 * Helper: show / hide UI elements
 * ------------------------------------------------------------------ */
function toggleVisibility(el, visible) {
  if (!el) return;
  el.style.display = visible ? '' : 'none';
}

/* ------------------------------------------------------------------ *
 * Helper: create a single post element
 * ------------------------------------------------------------------ */
function createPostItem({ title = '(no title)', link = '#' }) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  const icn = document.createElement('i');

  a.href = link;
  a.textContent = title;
  a.target = '_blank';

  icn.className = 'fa-solid fa-arrow-up-right-from-square';
  icn.style.marginLeft = '5px';

  p.appendChild(a);
  p.appendChild(icn);
  return p;
}

/* ------------------------------------------------------------------ *
 * Main: fetch, parse and render the RSS feed
 * ------------------------------------------------------------------ */
async function fetchPosts() {
  toggleVisibility(dom.loading, true);
  toggleVisibility(dom.errorMessage, false);
  if (dom.postList) dom.postList.innerHTML = ''; // clear previous items

  try {
    const response = await fetch(CONFIG.PROXY_URL(CONFIG.FEED_URL));
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const rawXml = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawXml, 'application/xml');

    const items = [...xmlDoc.querySelectorAll('item')];
    if (items.length === 0) throw new Error('No posts found.');

    items
      .slice(0, CONFIG.POSTS_TO_SHOW)
      .map((item) => ({
        title: item.querySelector('title')?.textContent ?? '(no title)',
        link: item.querySelector('link')?.textContent ?? '#',
      }))
      .forEach((postData) =>
        dom.postList.appendChild(createPostItem(postData))
      );
  } catch (err) {
    console.error('RSS fetch/parse error:', err);
    if (dom.errorMessage) {
      dom.errorMessage.textContent = err.message || 'Failed to load articles.';
      toggleVisibility(dom.errorMessage, true);
    }
  } finally {
    toggleVisibility(dom.loading, false);
  }
}

/* ------------------------------------------------------------------ *
 * Utility: set the root domain dynamically
 * ------------------------------------------------------------------ */
function setRootDomain() {
  const el = document.getElementById('root-domain');
  if (el) {
    const domain = 'madebydanny.uk';
    el.textContent = domain;
  }
}

/* ------------------------------------------------------------------ *
 * Utility: set the current URL in the hidden <url> element
 * ------------------------------------------------------------------ */
function setErrorUrl() {
  const el = document.getElementById('error-url');
  if (el) el.textContent = window.location.href;
}

/* ------------------------------------------------------------------ *
 * Initialise – run once now and then on an interval
 * ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  dom = {
    postList: document.getElementById('post-list'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    body: document.body,
  };

  // Set current year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialise utilities and start fetching posts
  setErrorUrl();
  setRootDomain();
  fetchPosts();
  setInterval(fetchPosts, CONFIG.REFRESH_INTERVAL_MS);
});
