        // --- REDIRECTION SCRIPT ---

        // Get DOM elements
        const countdownElement = document.getElementById('countdown');
        const destinationLinkElement = document.getElementById('destination-link');
        const goNowButton = document.getElementById('go-now-button');
        const redirectContainer = document.getElementById('redirect-container');
        const errorContainer = document.getElementById('error-container');

        // Get the destination URL from the '?link=' parameter
        const params = new URLSearchParams(window.location.search);
        const destinationUrl = params.get('link');

        // Function to perform the redirection
        const redirectToDestination = () => {
            if (destinationUrl) {
                window.location.href = destinationUrl;
            }
        };
        
        // Validate the URL
        if (destinationUrl) {
            try {
                // Check if the URL is valid
                new URL(destinationUrl);
                
                // Update the link on the page for user visibility
                destinationLinkElement.href = destinationUrl;
                destinationLinkElement.textContent = destinationUrl;

                // Set initial countdown value
                let secondsLeft = 5;
                
                // Set up the final redirect timer
                const redirectTimer = setTimeout(redirectToDestination, secondsLeft * 1000);

                // Set up the interval to update the countdown display every second
                const countdownInterval = setInterval(() => {
                    secondsLeft--;
                    countdownElement.textContent = secondsLeft;
                    if (secondsLeft <= 0) {
                        clearInterval(countdownInterval);
                    }
                }, 1000);

                // Add event listener for the "Go Now" button
                goNowButton.addEventListener('click', () => {
                    clearTimeout(redirectTimer); // Clear the scheduled redirect
                    clearInterval(countdownInterval); // Stop the countdown
                    redirectToDestination(); // Redirect immediately
                });

            } catch (e) {
                // Handle invalid URL format
                redirectContainer.classList.add('hidden');
                errorContainer.classList.remove('hidden');
            }
        } else {
            // Handle case where '?link=' parameter is missing
            redirectContainer.classList.add('hidden');
            errorContainer.classList.remove('hidden');
        }
