/* ------------------------------------------------------------------ *
 * The "microblog database" - JSON data
 * ------------------------------------------------------------------ */
const MICROBLOG_DATA = [
    {
        "title": "EasyScribe is Live!",
        "date": "September 4, 2025",
        "content": "A simple easy to use Rich Text editor note-taking app, with suuport for local and cloud sync.",
        "url": "https://easyscribe.madebydanny.uk" // Optional link
    }
];

/* ------------------------------------------------------------------ *
 * Helper: create a single microblog post element
 * ------------------------------------------------------------------ */
function createPostItem(postData) {
    const postDiv = document.createElement('div');
    postDiv.className = 'text-bite';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'text-bite-title';
    titleDiv.textContent = postData.title;

    const dateDiv = document.createElement('div');
    dateDiv.className = 'text-bite-date';
    dateDiv.textContent = postData.date;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'text-bite-content';
    contentDiv.innerHTML = postData.content; // Supports <a> tags

    postDiv.appendChild(titleDiv);
    postDiv.appendChild(dateDiv);
    postDiv.appendChild(contentDiv);

    // If "url" exists, add a "Read more" link
    if (postData.url) {
        const linkDiv = document.createElement('div');
        linkDiv.className = 'text-bite-link';
        linkDiv.innerHTML = `<a href="${postData.url}" target="_blank" rel="noopener noreferrer">Read more</a>`;
        postDiv.appendChild(linkDiv);
    }

    return postDiv;
}

/* ------------------------------------------------------------------ *
 * Main: render the microblog posts
 * ------------------------------------------------------------------ */
function renderPosts() {
    const microblogContainer = document.getElementById('microblog-container');
    if (!microblogContainer) return;
    microblogContainer.innerHTML = ''; // Clear previous items

    MICROBLOG_DATA.forEach(post => {
        const postElement = createPostItem(post);
        microblogContainer.appendChild(postElement);
        microblogContainer.appendChild(document.createElement('hr')); // Add a separator
    });
}

// Initialise by rendering posts when the script is loaded
renderPosts();
