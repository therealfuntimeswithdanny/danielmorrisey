/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */
const CONFIG = {
  FEED_URL: 'https://medium.com/feed/@danielmorrisey',
  PROXY_URL: (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  POSTS_TO_SHOW: 15,
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
 * Main Initializer
 * ------------------------------------------------------------------ */
window.addEventListener('load', () => {
  dom = {
    postList: document.getElementById('post-list'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    cdnFileInput: document.getElementById('cdn-file-input'),
    cdnSelectBtn: document.getElementById('cdn-select-btn'),
    cdnUploadBtn: document.getElementById('cdn-upload-btn'),
    cdnFileName: document.getElementById('cdn-file-name'),
    cdnStatus: document.getElementById('cdn-status'),
    // Bluesky DOM elements
    blueskyPostsContainer: document.getElementById('bluesky-posts-container'),
    blueskyLoading: document.getElementById('bluesky-loading'),
    blueskyErrorMessage: document.getElementById('bluesky-error-message'),
  };

  // --- Set up RSS feed ---
  if (dom.postList) {
    fetchFeed();
    setInterval(fetchFeed, CONFIG.REFRESH_INTERVAL_MS);
  }

  // --- Theme Toggler ---
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    document.body.classList.toggle('light-mode', localStorage.getItem('theme') === 'light');
  }

  // --- Other initializers ---
  setRootDomain();
  setErrorUrl();
  // --- Alt RSS feed ---
  fetchAltFeed();
  // --- Bluesky Feed ---
  fetchBlueskyPosts();
});

/* ------------------------------------------------------------------ *
 * Theme Switching
 * ------------------------------------------------------------------ */
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
}

/* ------------------------------------------------------------------ *
 * CDN functions
 * ------------------------------------------------------------------ */

function setRootDomain() {
  const rootDomain = window.location.hostname;
  document.querySelectorAll('[data-root-domain]').forEach(el => {
    el.textContent = rootDomain;
  });
}

function setErrorUrl() {
  const errorUrl = `/error.html?error=404&domain=${window.location.hostname}`;
  document.querySelectorAll('[data-error-url]').forEach(el => {
    el.href = errorUrl;
  });
}

/* ------------------------------------------------------------------ *
 * CDN Upload Logic
 * ------------------------------------------------------------------ */

if (dom.cdnSelectBtn && dom.cdnFileInput && dom.cdnUploadBtn) {
  // Open file picker when the "Select" button is clicked
  dom.cdnSelectBtn.addEventListener('click', () => {
    dom.cdnFileInput.click();
  });

  // Show the selected filename
  dom.cdnFileInput.addEventListener('change', () => {
    const file = dom.cdnFileInput.files[0];
    dom.cdnFileName.textContent = file ? file.name : 'No file selected';
    toggleVisibility(dom.cdnUploadBtn, !!file);
    dom.cdnStatus.textContent = '';
  });

  // Handle upload button
  dom.cdnUploadBtn.addEventListener('click', async () => {
    const file = dom.cdnFileInput.files[0];
    if (!file) return alert('Please select a file first.');

    dom.cdnStatus.textContent = 'Uploading…';
    dom.cdnUploadBtn.disabled = true;
    dom.cdnSelectBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://cdn-upload.madebydanny.uk/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = await res.json();

      // Expecting a response like: { url: "https://cdn.madebydanny.uk/path/to/file.png" }
      if (data.url) {
        dom.cdnStatus.innerHTML = `
          ✅ Uploaded successfully: 
          <a href="${data.url}" target="_blank" rel="noopener">${data.url}</a>
        `;
      } else {
        throw new Error('Unexpected server response.');
      }
    } catch (err) {
      console.error('CDN upload error:', err);
      dom.cdnStatus.textContent = '❌ Upload failed: ' + err.message;
    } finally {
      dom.cdnUploadBtn.disabled = false;
      dom.cdnSelectBtn.disabled = false;
    }
  });
}

/* ------------------------------------------------------------------ *
 * Fetch and render main RSS feed (Medium)
 * ------------------------------------------------------------------ */
async function fetchFeed() {
  if (!dom.postList) return;

  dom.loading.style.display = 'block';
  dom.errorMessage.style.display = 'none';
  dom.postList.innerHTML = '';

  try {
    const res = await fetch(CONFIG.PROXY_URL(CONFIG.FEED_URL));
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
    items = items.slice(0, 15).map(i => i.node);

    dom.postList.innerHTML = '';
    if (items.length === 0) {
      dom.postList.innerHTML = '<p class="alt">No items found in the feed.</p>';
      return;
    }

    items.forEach((it) => {
      const title = it.querySelector('title')?.textContent || '(no title)';
      const link = it.querySelector('link')?.getAttribute('href') || it.querySelector('link')?.textContent || '#';

      const el = document.createElement('div');
      el.className = 'feed-item';
      el.innerHTML = `<p class="feed-title"><a href="${link}" target="_blank">${title}</a></p>`;
      dom.postList.appendChild(el);
    });

  } catch (err) {
    console.error('Failed to fetch feed:', err);
    dom.errorMessage.style.display = 'block';
    dom.errorMessage.textContent = 'Failed to load Medium feed.';
  } finally {
    dom.loading.style.display = 'none';
  }
}


/* ------------------------------------------------------------------ *
 * Fetch and render Alt RSS feed (Leaflet)
 * ------------------------------------------------------------------ */
async function fetchAltFeed() {
  const container = document.getElementById('alt-feed');
  if (!container) return;

  const altFeedUrl = 'https://danielmorriseyaltq.leaflet.pub/rss';
  
  try {
    const res = await fetch(CONFIG.PROXY_URL(altFeedUrl));
    if (!res.ok) throw new Error(`Network error fetching feed: ${res.status}`);

    const raw = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(raw, 'application/xml');
    
    let items = [...xml.querySelectorAll('item')];
    
    items = items.map((it) => {
        const pub = it.querySelector('pubDate')?.textContent || '';
        const ts = pub ? Date.parse(pub) : 0;
        return { node: it, ts };
    }).sort((a, b) => (b.ts || 0) - (a.ts || 0));

    items = items.slice(0, 5).map(i => i.node);

    container.innerHTML = '';
    if (items.length === 0) {
      container.innerHTML = '<p class="alt">No items found in the feed.</p>';
      return;
    }

    items.forEach((it) => {
      const title = it.querySelector('title')?.textContent || '(no title)';
      const link = it.querySelector('link')?.textContent || '#';
      const el = document.createElement('div');
      el.className = 'feed-item';
      el.innerHTML = `<p class="feed-title"><a href="${link}" target="_blank">${title}</a></p>`;
      container.appendChild(el);
    });

  } catch (err) {
    console.error('Failed to fetch Alt feed:', err);
    container.innerHTML = '<p class="alt">Unable to load feed.</p>';
  }
}

/* ------------------------------------------------------------------ *
 * Fetch and render Bluesky feed                                      *
 * ------------------------------------------------------------------ */

// --- Bluesky Helper Functions ---

function bskyFormatDate(isoString) {
    if (!isoString) return 'Unknown date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function bskyLinkifyText(text) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0ea5e9;">${url}</a>`);
}

function bskyRenderImages(imagesEmbed) {
    let imagesHtml = '<div class="bsky-embed-images">';
    imagesEmbed.images.forEach(image => {
        imagesHtml += `
            <a href="${image.fullsize}" target="_blank" rel="noopener noreferrer">
                <img src="https://imrs.madebydanny.uk/?url=${image.thumb}" alt="${image.alt || 'Embedded image'}">
            </a>`;
    });
    imagesHtml += '</div>';
    return imagesHtml;
}

function bskyRenderQuote(record) {
    if (!record || !record.author || !record.value) return '';
    const quoteAuthor = record.author;
    const quoteContent = record.value;
    let quoteText = bskyLinkifyText((quoteContent.text || '').replace(/\n/g, '<br>'));
    const nestedEmbed = record.embeds && record.embeds.length > 0 ? record.embeds[0] : null;
    const nestedEmbedHtml = nestedEmbed ? bskyRenderEmbed(nestedEmbed) : '';
    return `
        <div class="bsky-embed-quote">
            <div class="bsky-author" style="gap: 0.5rem;">
                <img src="https://imrs.madebydanny.uk/?url=${quoteAuthor.avatar}" alt="${quoteAuthor.displayName}'s avatar" class="bsky-avatar">
                <div>
                    <span class="bsky-display-name">${quoteAuthor.displayName}</span>
                    <span class="bsky-handle">@${quoteAuthor.handle}</span>
                </div>
            </div>
            <p class="bsky-text">${quoteText}</p>
            ${nestedEmbedHtml}
        </div>`;
}

function bskyRenderExternal(external) {
    if (!external || !external.uri) return '';
    const hostname = new URL(external.uri).hostname;
    return `
        <a href="${external.uri}" target="_blank" rel="noopener noreferrer" class="bsky-embed-external">
            ${external.thumb ? `<img src="https://imrs.madebydanny.uk/?url=${external.thumb}" alt="${external.title || 'Link preview'}">` : ''}
            <div class="bsky-embed-external-content">
                <div class="bsky-external-title">${external.title || ''}</div>
                <div class="bsky-external-desc line-clamp-2">${external.description || ''}</div>
                <div class="bsky-external-host">${hostname}</div>
            </div>
        </a>`;
}

function bskyRenderEmbed(embed) {
    if (!embed) return '';
    const type = embed.$type || '';
    let html = '';
    if (type.startsWith('app.bsky.embed.images')) {
        html += bskyRenderImages(embed);
    } else if (type.startsWith('app.bsky.embed.record') && !type.includes('WithMedia')) {
        html += bskyRenderQuote(embed.record);
    } else if (type.startsWith('app.bsky.embed.external')) {
        html += bskyRenderExternal(embed.external);
    } else if (type.startsWith('app.bsky.embed.recordWithMedia')) {
        if (embed.media) html += bskyRenderEmbed(embed.media);
        if (embed.record && embed.record.record) html += bskyRenderQuote(embed.record.record);
    }
    return html;
}

async function fetchBlueskyPosts() {
    const container = document.getElementById('bluesky-posts-container');
    const loading = document.getElementById('bluesky-loading');
    const errorMsg = document.getElementById('bluesky-error-message');
    if (!container || !loading || !errorMsg) return;

    // NOTE: This API URL is specifically filtered for posts *from* @madebydanny.uk
    const apiUrl = 'https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=from%3Amadebydanny.uk&limit=3';
    
    try {
        loading.style.display = 'block';
        errorMsg.style.display = 'none';

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        
        container.innerHTML = '';
        if (!data.posts || data.posts.length === 0) {
            container.innerHTML = '<p class="alt">No posts found.</p>';
            return;
        }

        data.posts
            .filter(post => !post.record.reply) // Filter out replies for a cleaner main feed
            .slice(0, 5) // Show latest 5 posts
            .forEach(post => {
                const postEl = document.createElement('div');
                postEl.className = 'bsky-post';

                const postText = bskyLinkifyText((post.record.text || '').replace(/\n/g, '<br>'));
                const embedHtml = bskyRenderEmbed(post.embed);

                postEl.innerHTML = `
                    <div class="bsky-author">
                        <img src="https://imrs.madebydanny.uk/?url=${post.author.avatar}" alt="${post.author.displayName}'s avatar" class="bsky-avatar">
                        <div class="bsky-author-info">
                            <div>
                                <span class="bsky-display-name">${post.author.displayName}</span>
                                <span class="bsky-handle">@${post.author.handle}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bsky-text">${postText}</div>
                    ${embedHtml}
                `;
                container.appendChild(postEl);
            });

    } catch (err) {
        console.error('Bluesky fetch error:', err);
        errorMsg.textContent = 'Failed to load Bluesky posts.';
        errorMsg.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}
