const bitesData = [
    {
        date: "2025-08-24",
        displayDate: "Aug 24, 2025",
        title: "null",
        content: "null",
        image: "null",
        tags: ["null"],
        url: ""
    }
];

document.getElementById('current-year').textContent = new Date().getFullYear();

const dateInput = document.getElementById('date-input');
const tagInput = document.getElementById('tag-input');
const listContainer = document.getElementById('text-bites-list');
const themeToggle = document.getElementById('theme-toggle');

function renderBites(bitesToRender) {
    listContainer.innerHTML = '';
    if (bitesToRender.length === 0) {
        listContainer.innerHTML = '<p class="no-results">No bites found.</p>';
        return;
    }
    
    bitesToRender.forEach(bite => {
        const biteDiv = document.createElement('div');
        biteDiv.innerHTML = `
            <p class="text-bite-date">${bite.displayDate}</p>
            <a href="${bite.url}" target="_blank" rel="noopener noreferrer"><p class="text-bite-title">${bite.title}</p></a>
            <p class="text-bite-content">${bite.content}</p>
            ${bite.image ? `<img src="${bite.image}" alt="${bite.title}">` : ''}
            <p class="text-bite-tags">${bite.tags.map(tag => `#${tag}`).join(' ')}</p>
        `;
        listContainer.appendChild(biteDiv);

        const hr = document.createElement('hr');
        listContainer.appendChild(hr);
    });
}

function filterBites() {
    const dateQuery = dateInput.value;
    const tagQuery = tagInput.value.toLowerCase().trim().replace(/#/g, '');
    const tagsToSearch = tagQuery.split(' ').filter(tag => tag);
    
    const filtered = bitesData.filter(bite => {
        const dateMatch = !dateQuery || bite.date === dateQuery;
        const tagMatch = !tagsToSearch.length || tagsToSearch.every(searchTag => 
            bite.tags.some(biteTag => biteTag.toLowerCase().includes(searchTag))
        );
        return dateMatch && tagMatch;
    });
    renderBites(filtered);
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderBites(bitesData);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    dateInput.addEventListener('input', filterBites);
    tagInput.addEventListener('input', filterBites);
    themeToggle.addEventListener('click', toggleTheme);
});