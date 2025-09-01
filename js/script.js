/* ------------------------------------------------------------------ *
 *  Utility: set the current year
 * ------------------------------------------------------------------ */
document.getElementById('current-year').textContent = new Date().getFullYear();

/* ------------------------------------------------------------------ *
 *  Configuration
 * ------------------------------------------------------------------ */
const CONFIG = {
  FEED_URL:            'https://medium.com/feed/@danielmorrisey',
  PROXY_URL:           url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  POSTS_TO_SHOW:      5,
  REFRESH_INTERVAL_MS: 60_000, // 1 minute
};

/* ------------------------------------------------------------------ *
 *  DOM references – grab them once so we don’t query repeatedly
 * ------------------------------------------------------------------ */
const dom = {
  postList:     document.getElementById('post-list'),
  loading:      document.getElementById('loading'),
  errorMessage: document.getElementById('error-message')
};

/* ------------------------------------------------------------------ *
 *  Helper: show / hide UI elements
 * ------------------------------------------------------------------ */
function toggleVisibility(el, visible) {
  el.style.display = visible ? '' : 'none';
}

/* ------------------------------------------------------------------ *
 *  Helper: create a single post element
 * ------------------------------------------------------------------ */
function createPostItem({ title = '(no title)', link = '#' }) {
  const p   = document.createElement('p');
  const a   = document.createElement('a');
  const icn = document.createElement('i');

  a.href   = link;
  a.textContent = title;
  a.target = '_blank';

  icn.className = 'fa-solid fa-arrow-up-right-from-square';
  icn.style.marginLeft = '5px';

  p.appendChild(a);
  p.appendChild(icn);
  return p;
}

/* ------------------------------------------------------------------ *
 *  Main: fetch, parse and render the RSS feed
 * ------------------------------------------------------------------ */
async function fetchPosts() {
  toggleVisibility(dom.loading, true);
  toggleVisibility(dom.errorMessage, false);
  dom.postList.innerHTML = ''; // clear previous items

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
      .map(item => ({
        title: item.querySelector('title')?.textContent ?? '(no title)',
        link:  item.querySelector('link')?.textContent ?? '#'
      }))
      .forEach(postData => dom.postList.appendChild(createPostItem(postData)));

  } catch (err) {
    console.error('RSS fetch/parse error:', err);
    dom.errorMessage.textContent = err.message || 'Failed to load articles.';
    toggleVisibility(dom.errorMessage, true);
  } finally {
    toggleVisibility(dom.loading, false);
  }
}

/* ------------------------------------------------------------------ *
 *  Helper: store the current URL in the hidden <url> element
 * ------------------------------------------------------------------ */
function setErrorUrl() {
  const el = document.getElementById('error-url');
  if (el) el.textContent = window.location.href;
}

/* ------------------------------------------------------------------ *
 *  Initialise – run once now and then on an interval
 * ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  setErrorUrl();                 // store the URL for your 404 page
  fetchPosts();                  // initial load
  setInterval(fetchPosts, CONFIG.REFRESH_INTERVAL_MS); // repeat periodically
});
