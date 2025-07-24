        document.addEventListener('DOMContentLoaded', function() {
            // Existing script for current year (if main.js doesn't handle it)
            const currentYearSpan = document.getElementById('currentYear');
            if (currentYearSpan) {
                currentYearSpan.textContent = new Date().getFullYear();
            }

            // Search functionality
            const searchInput = document.getElementById('projectSearch');
            const projectCards = document.querySelectorAll('.project-card'); // Select all project cards

            searchInput.addEventListener('keyup', function() {
                const searchTerm = searchInput.value.toLowerCase(); // Get search term and convert to lowercase

                projectCards.forEach(card => {
                    // Get the title and description elements within the current card
                    const titleElement = card.querySelector('.project-title-text');
                    const descriptionElement = card.querySelector('.project-description');

                    // Extract text content and convert to lowercase for comparison
                    const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';
                    const descriptionText = descriptionElement ? descriptionElement.textContent.toLowerCase() : '';

                    // Check if the search term is found in either the title or description
                    if (titleText.includes(searchTerm) || descriptionText.includes(searchTerm)) {
                        card.style.display = ''; // Show the project card
                    } else {
                        card.style.display = 'none'; // Hide the project card
                    }
                });
            });
        });
