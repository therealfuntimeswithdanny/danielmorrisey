        // Define a new class that extends the HTMLElement
        class InfoComponent extends HTMLElement {
            // The connectedCallback is called when the element is inserted into the DOM
            connectedCallback() {
                // Create a shadow root to encapsulate the component's content and styling
                const shadow = this.attachShadow({ mode: 'open' });
                
                // Set the inner HTML of the shadow root to the footer content
                shadow.innerHTML = `
                    <!-- Link to Font Awesome within the shadow DOM for icons -->
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" xintegrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
                    <script src="https://cdn.tailwindcss.com"></script>
                    <!-- The styles must be defined inside the shadow DOM to apply -->
                    <style>
                        /* Base styles for the component */
                        .mt-12 { margin-top: 3rem; }
                        .pt-4 { padding-top: 1rem; }
                        .text-center { text-align: center; }
                        .text-gray-500 { color: #6b7280; }
                        .border-t { border-top-width: 1px; }
                        .border-gray-200 { border-color: #e5e7eb; }
                        .flex { display: flex; }
                        .justify-center { justify-content: center; }
                        .space-x-6 > :not([hidden]) ~ :not([hidden]) { margin-left: 1.5rem; }
                        .mb-4 { margin-bottom: 1rem; }
                        .text-lg { font-size: 1.125rem; }
                        .text-gray-600 { color: #4b5563; }
                        .hover\\:text-indigo-600:hover { color: #4f46e5; }
                        .transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 0.3s; }
                        .duration-300 { transition-duration: 0.3s; }
                        .mt-8 { margin-top: 2rem; }
                        .text-sm { font-size: 0.875rem; }
                        .mt-1 { margin-top: 0.25rem; }
                        .font-medium { font-weight: 500; }
                        a { color: #4b5563; text-decoration: none; }
                        /* A few specific styles for the iframe to ensure it looks right */
                        iframe {
                            color-scheme: normal;
                        }
                    </style>

                    <!-- The user's provided footer HTML -->
                    <footer class="mt-12 pt-4 text-center text-gray-500 border-t border-gray-200">
                        <div class="flex justify-center space-x-6 mb-4 text-lg">
                            <a href="javascript:history.back()" class="text-gray-600 hover:text-indigo-600 transition duration-300"><i class="fa-solid fa-arrow-left"></i> Back</a>
                            <a href="/index.html" class="text-gray-600 hover:text-indigo-600 transition duration-300"><i class="fa-solid fa-house"></i> Home</a>
                        </div>
                        <!-- Centered Iframe -->
                        <div class="flex justify-center mt-8">
                            <iframe src="https://status.madebydanny.uk/badge?theme=light" width="200" height="30" frameborder="0" scrolling="no"></iframe>
                        </div>
                        <p>
                            &copy; 2024-<span id="currentYear"></span>
                            <a href="https://madebydanny.uk" target="blank_" class="hover:text-indigo-600 transition duration-300 font-medium">Made by Danny UK</a>
                        </p>
                        <p class="text-sm mt-1">
                            by Daniel Morrisey
                        </p>
                        <p>
                            MBD is made possible thanks to <a href="https://cloudflare.com" target="blank_">Cloudflare</a> & <a href="https://cloudinary.com" target="blank_">Cloudinary</a>
                        </p>
                    </footer>
                `;

                // Update the current year dynamically
                this.shadowRoot.getElementById('currentYear').textContent = new Date().getFullYear();
            }
        }
        
        // Define the new custom element with a hyphenated tag name
        // Custom element names must contain a hyphen
        customElements.define('app-info', InfoComponent);