/**
 * This script adds search functionality to the page and updates the copyright year.
 */
document.addEventListener('DOMContentLoaded', function() {
    // --- Copyright Year Updater ---
    // Finds the 'currentYear' span and sets its text to the current year.
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Search Functionality ---
    const searchInput = document.getElementById('projectSearch');
    const projectCards = document.querySelectorAll('.project-card'); // Select all project cards

    // Listen for the 'input' event, which is more responsive than 'keyup' for this purpose.
    // It fires immediately when the value of the input element changes.
    searchInput.addEventListener('input', function() {
        // Get the search term and convert it to lowercase for case-insensitive matching.
        const searchTerm = searchInput.value.toLowerCase();

        // Loop through each project card to see if it matches the search term.
        projectCards.forEach(card => {
            // Get the title and description elements within the current card.
            const titleElement = card.querySelector('.project-title-text');
            const descriptionElement = card.querySelector('.project-description');

            // Extract text content and convert to lowercase for comparison.
            // If an element doesn't exist, default to an empty string.
            const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';
            const descriptionText = descriptionElement ? descriptionElement.textContent.toLowerCase() : '';

            // Check if the search term is found in either the title or description.
            if (titleText.includes(searchTerm) || descriptionText.includes(searchTerm)) {
                card.style.display = ''; // Show the project card if it matches.
            } else {
                card.style.display = 'none'; // Hide the project card if it doesn't match.
            }
        });
    });
});
