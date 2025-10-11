/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */
const CONFIG = {
  FEED_URL: 'https://medium.com/feed/@danielmorrisey',
  PROXY_URL: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  POSTS_TO_SHOW: 7,
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
 * Main execution: runs when the DOM is ready
 * ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  // --- Grab all DOM elements ---
  dom = {
    postList: document.getElementById('post-list'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    cdnFileInput: document.getElementById('cdn-file-input'),
    cdnSelectBtn: document.getElementById('cdn-select-btn'),
    cdnUploadBtn: document.getElementById('cdn-upload-btn'),
    cdnFileName: document.getElementById('cdn-file-name'),
    cdnStatus: document.getElementById('cdn-status'),
  };

  // --- Set up RSS feed ---
  fetchPosts();
  setInterval(fetchPosts, CONFIG.REFRESH_INTERVAL_MS);

  // --- Set up CDN Uploader ---
  if (dom.cdnSelectBtn) {
    dom.cdnSelectBtn.addEventListener('click', () => dom.cdnFileInput.click());
  }

  if (dom.cdnFileInput) {
    dom.cdnFileInput.addEventListener('change', () => {
      const file = dom.cdnFileInput.files[0];
      if (file) {
        dom.cdnFileName.textContent = `Selected: ${file.name}`;
        toggleVisibility(dom.cdnUploadBtn, true);
        toggleVisibility(dom.cdnSelectBtn, false);
      }
    });
  }

  if (dom.cdnUploadBtn) {
    dom.cdnUploadBtn.addEventListener('click', async () => {
      const file = dom.cdnFileInput.files[0];
      if (!file) {
        dom.cdnStatus.innerHTML = '<p style="color: red;">Please select a file first.</p>';
        return;
      }

      dom.cdnStatus.innerHTML = '<p><i class="fa-solid fa-arrows-rotate fa-spin"></i> Uploading...</p>';
      dom.cdnUploadBtn.disabled = true;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('https://cdn-upload.madebydanny.uk/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          dom.cdnStatus.innerHTML = `<p style="color: green;">Success! <a href="https://imrs.madebydanny.uk/?url=${result.url}" target="_blank">View Image</a></p>`;
        } else {
          const errorText = await response.text();
          dom.cdnStatus.innerHTML = `<p style="color: red;">Upload failed: ${errorText}</p>`;
        }
      } catch (error) {
        dom.cdnStatus.innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
      } finally {
        dom.cdnUploadBtn.disabled = false;
        toggleVisibility(dom.cdnUploadBtn, false);
        toggleVisibility(dom.cdnSelectBtn, true);
        dom.cdnFileName.textContent = '';
        dom.cdnFileInput.value = '';
      }
    });
  }

  // --- Other initializers ---
  setRootDomain();
  setErrorUrl();
  // --- Alt RSS feed ---
  fetchAltFeed();
});

/* ------------------------------------------------------------------ */
/* Fetch and render RSS feed from alternative source via corsproxy.io */
/* ------------------------------------------------------------------ */
async function fetchAltFeed() {
  const container = document.getElementById('alt-feed');
  if (!container) return;
  const feedUrl = 'https://danielmorriseyaltq.leaflet.pub/rss';
  container.innerHTML = '<p class="alt">Loading feed…</p>';

  try {
    const res = await fetch(CONFIG.PROXY_URL(feedUrl));
    if (!res.ok) throw new Error(`Network error fetching feed: ${res.status}`);

    const raw = await res.text();
    // Parse as XML RSS/Atom
    const parser = new DOMParser();
    const xml = parser.parseFromString(raw, 'application/xml');

    let items = [...xml.querySelectorAll('item, entry')];

    // Parse dates where available and sort newest-first
    items = items.map((it) => {
      const pub = it.querySelector('pubDate')?.textContent || it.querySelector('updated')?.textContent || it.querySelector('published')?.textContent || '';
      const ts = pub ? Date.parse(pub) : 0;
      return { node: it, ts };
    });

    items.sort((a, b) => (b.ts || 0) - (a.ts || 0));

    // Limit to first 7 after sorting
    items = items.slice(0, 7).map(i => i.node);

    container.innerHTML = '';
    if (items.length === 0) {
      container.innerHTML = '<p class="alt">No items found in the feed.</p>';
      return;
    }

    items.forEach((it) => {
      const title = it.querySelector('title')?.textContent || '(no title)';
      const link = it.querySelector('link')?.getAttribute('href') || it.querySelector('link')?.textContent || '#';

      const el = document.createElement('div');
      el.className = 'feed-item';
      el.innerHTML = `<p class="feed-title"><a href="${link}" target="_blank">${title}</a></p>`;
      container.appendChild(el);
    });
  } catch (err) {
    console.error('Alt feed error', err);
    container.innerHTML = '<p class="alt">Unable to load feed.</p>';
  }
}
