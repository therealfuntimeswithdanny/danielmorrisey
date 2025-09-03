/* ------------------------------------------------------------------ *
 * The "microblog database" - JSON data
 * ------------------------------------------------------------------ */
const MICROBLOG_DATA = [
    {
        "title": "A New Beginning",
        "date": "September 3, 2025",
        "content": "Starting a new microblog project. This is a place for short thoughts, quick links, and small updates. Using this as a test. It's built with simple HTML, CSS, and JS, just like the good old days."
    },
    {
        "title": "Coffee and Code",
        "date": "September 2, 2025",
        "content": "Enjoying my morning coffee and working on a new Python script. The goal is to automate some data analysis tasks. It’s a work in progress, but the journey is the fun part!"
    },
    {
        "title": "A Link to Check Out",
        "date": "September 1, 2025",
        "content": "Found a fascinating article on the evolution of front-end frameworks. A lot has changed since jQuery was king! Read it here: <a href='https://example.com/article' target='_blank'>The Evolution of Web Dev</a>."
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
    contentDiv.innerHTML = postData.content; // Use innerHTML to render links

    postDiv.appendChild(titleDiv);
    postDiv.appendChild(dateDiv);
    postDiv.appendChild(contentDiv);
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
// The "defer" attribute on the script tag ensures this runs after the DOM is ready.
renderPosts();