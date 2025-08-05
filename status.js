class StatusBanner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_URL = 'https://uptime-kuma-cros.madebydannyuk.workers.dev/api/status-page/heartbeat/public';
        this.ORIGINAL_STATUS_PAGE_URL = 'https://status.danielmorrisey.com/';
        this.MOCK_DATA = {
            heartbeatList: {
                "1": [{ status: 1, time: new Date().toISOString(), msg: "OK", ping: 50 }],
                "2": [{ status: 0, time: new Date().toISOString(), msg: "Timeout", ping: null }],
                "3": [{ status: 3, time: new Date().toISOString(), msg: "Maintenance", ping: 120 }],
            },
            uptimeList: {
                "1_24": 0.999,
                "2_24": 0.85,
                "3_24": 0.95,
            }
        };
        this.intervalId = null;
    }

    connectedCallback() {
        this.render();
        this.initializeStatusPage();
        this.intervalId = setInterval(() => this.initializeStatusPage(), 60000);
    }

    disconnectedCallback() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                :host {
                    all: initial; /* Reset all styles for the shadow root */
                    display: block;
                }

                .overall-status-banner {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background-color: #fef9e6;
                    border-bottom: 1px solid #fce7b0;
                    color: #4b3e21;
                    font-weight: 500;
                    font-size: 0.875rem;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    z-index: 9999;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    font-family: 'Inter', sans-serif;
                    box-sizing: border-box;
                    transition: transform 0.3s ease-in-out;
                    transform: translateY(-100%);
                }
                
                .overall-status-banner.visible {
                    transform: translateY(0);
                }

                .status-icon {
                    font-size: 1.5rem;
                    color: #d17800;
                    margin-right: 1rem;
                    line-height: 1;
                }
                .status-text {
                    flex-grow: 1;
                    text-align: left;
                }
                .status-text a {
                    color: #d17800;
                    text-decoration: underline;
                    font-weight: 600;
                }
                .status-text strong {
                    font-weight: 700;
                    margin-right: 0.25rem;
                }
                .close-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    color: #a1a1aa;
                    padding: 0.25rem;
                    line-height: 1;
                    margin-left: 1rem;
                }
                .loading-spinner {
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    border-left-color: #3b82f6;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                    margin: 1rem auto;
                    display: none;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
            
            <div id="status-banner" class="overall-status-banner">
                <span id="status-icon" class="status-icon">⚠️</span>
                <div id="status-text" class="flex-grow"></div>
                <button id="close-button" class="close-button">&times;</button>
            </div>
            
            <div id="loading-indicator" class="loading-spinner"></div>
        `;
    }
    
    async initializeStatusPage() {
        const loadingIndicator = this.shadowRoot.getElementById('loading-indicator');
        const statusBanner = this.shadowRoot.getElementById('status-banner');
        
        // Hide banner and show loading spinner
        statusBanner.classList.remove('visible');
        loadingIndicator.style.display = 'block';

        let data = await this.fetchStatus();
        if (!data) {
            data = this.MOCK_DATA;
        }
        
        this.renderStatus(data);
    }
    
    /**
     * Fetches status data from the Uptime Kuma API with retries.
     * @param {number} retries - The current retry attempt.
     * @returns {Promise<Object|null>} The parsed JSON data or null on failure.
     */
    async fetchStatus(retries = 0) {
        const maxRetries = 5;
        const baseDelay = 1000;
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching status:', error);
            if (retries < maxRetries) {
                const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchStatus(retries + 1);
            } else {
                console.warn('Max retries reached. Using mock data as fallback.');
                return null;
            }
        }
    }
    
    /**
     * Calculates the overall status based on individual monitor statuses.
     * @param {Object} heartbeatList - The heartbeat list from the API response.
     * @returns {string} The overall status ('operational', 'degraded', 'partial-outage', 'major-outage').
     */
    calculateOverallStatus(heartbeatList) {
        if (!heartbeatList || Object.keys(heartbeatList).length === 0) return 'unknown';
        let hasDown = false;
        let hasPendingOrMaintenance = false;
        let allDown = true;
        let activeMonitors = 0;

        for (const monitorId in heartbeatList) {
            const heartbeats = heartbeatList[monitorId];
            if (heartbeats && heartbeats.length > 0) {
                activeMonitors++;
                heartbeats.sort((a, b) => new Date(b.time) - new Date(a.time));
                const latestStatus = heartbeats[0].status;
                if (latestStatus === 0) hasDown = true;
                else allDown = false;
                if (latestStatus === 2 || latestStatus === 3) hasPendingOrMaintenance = true;
            } else {
                allDown = false;
            }
        }
        if (activeMonitors === 0) return 'unknown';
        if (hasDown) return allDown ? 'major-outage' : 'partial-outage';
        if (hasPendingOrMaintenance) return 'degraded';
        return 'operational';
    }
    
    /**
     * Renders the status banner based on the API data.
     * @param {Object} data - The data received from the Uptime Kuma API.
     */
    renderStatus(data) {
        const overallStatus = this.calculateOverallStatus(data.heartbeatList);
        const loadingIndicator = this.shadowRoot.getElementById('loading-indicator');
        const statusBanner = this.shadowRoot.getElementById('status-banner');
        const statusText = this.shadowRoot.getElementById('status-text');
        const closeButton = this.shadowRoot.getElementById('close-button');

        // Hide the loading spinner
        loadingIndicator.style.display = 'none';

        if (overallStatus === 'operational' || overallStatus === 'unknown') {
            statusBanner.classList.remove('visible');
            return;
        }

        let statusMessage = '';
        switch (overallStatus) {
            case 'degraded':
                statusMessage = `<strong>Degraded Performance:</strong> Some services are currently experiencing issues. Please visit the <a href="${this.ORIGINAL_STATUS_PAGE_URL}" target="_blank">full status page</a> for more details.`;
                break;
            case 'partial-outage':
                statusMessage = `<strong>Partial Outage:</strong> Some services are currently experiencing an outage. Please visit the <a href="${this.ORIGINAL_STATUS_PAGE_URL}" target="_blank">full status page</a> for more details.`;
                break;
            case 'major-outage':
                statusMessage = `<strong>Major Outage:</strong> All services are currently experiencing a major outage. Please visit the <a href="${this.ORIGINAL_STATUS_PAGE_URL}" target="_blank">full status page</a> for more details.`;
                break;
        }
        
        statusText.innerHTML = statusMessage;
        statusBanner.classList.add('visible'); // Show the banner with transition

        // Add close button functionality
        closeButton.onclick = () => {
            statusBanner.classList.remove('visible');
        };
    }
}

customElements.define('status-banner', StatusBanner);