class StatusBanner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.API_HEARTBEAT_URL = 'https://uptime-kuma-cros.madebydannyuk.workers.dev/api/status-page/heartbeat/public';
        this.API_STATUS_PAGE_URL = 'https://uptime-kuma-cros.madebydannyuk.workers.dev/api/status-page/public';
        this.ORIGINAL_STATUS_PAGE_URL = 'https://status.danielmorrisey.com/';
        this.MOCK_DATA = {
            heartbeatList: {
                "1": [{ status: 1, time: new Date().toISOString(), msg: "OK", ping: 50 }],
                "2": [{ status: 0, time: new Date().toISOString(), msg: "Timeout", ping: null }],
                "3": [{ status: 3, time: new Date().toISOString(), msg: "Maintenance", ping: 120 }],
            },
            uptimeList: { "1_24": 0.999, "2_24": 0.85, "3_24": 0.95 },
            incident: {
                title: "Investigating Connectivity Issues (Mock)",
                content: "This is a mock incident to show how the banner works. Updates will be provided on our full status page.",
                style: "warning",
                pin: true
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
                    all: initial;
                    display: block;
                }
                
                .overall-status-banner {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid;
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

                .status-header {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                .status-icon {
                    font-size: 1.5rem;
                    margin-right: 1rem;
                    line-height: 1;
                }
                .status-text {
                    flex-grow: 1;
                    text-align: left;
                }
                .status-text strong {
                    font-weight: 700;
                    margin-right: 0.25rem;
                }
                .status-text a {
                    text-decoration: underline;
                    font-weight: 600;
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
                .incident-detail {
                    width: 100%;
                    font-size: 0.8rem;
                    text-align: left;
                    padding-left: calc(1.5rem + 1rem);
                    margin-top: 0.5rem;
                    line-height: 1.4;
                }
                .incident-detail.hidden {
                    display: none;
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

                /* Dynamic Color Styles */
                .status-style-warning { background-color: #fef9e6; border-color: #fce7b0; color: #4b3e21; }
                .status-style-warning .status-icon, .status-style-warning .status-text a { color: #d17800; }
                .status-style-danger { background-color: #fee2e2; border-color: #fca5a5; color: #991b1b; }
                .status-style-danger .status-icon, .status-style-danger .status-text a { color: #dc2626; }
                .status-style-info { background-color: #e0f2fe; border-color: #93c5fd; color: #1e40af; }
                .status-style-info .status-icon, .status-style-info .status-text a { color: #3b82f6; }
                .status-style-primary { background-color: #eef2ff; border-color: #c7d2fe; color: #4338ca; }
                .status-style-primary .status-icon, .status-style-primary .status-text a { color: #6366f1; }
                .status-style-light { background-color: #f9fafb; border-color: #e5e7eb; color: #374151; }
                .status-style-light .status-icon, .status-style-light .status-text a { color: #9ca3af; }
                .status-style-dark { background-color: #1f2937; border-color: #4b5563; color: #f9fafb; }
                .status-style-dark .status-icon, .status-style-dark .status-text a { color: #d1d5db; }

            </style>
            
            <div id="status-banner" class="overall-status-banner">
                <div class="status-header">
                    <span id="status-icon" class="status-icon"></span>
                    <div id="status-text" class="flex-grow"></div>
                    <button id="close-button" class="close-button">&times;</button>
                </div>
                <div id="incident-detail" class="incident-detail hidden"></div>
            </div>
            
            <div id="loading-indicator" class="loading-spinner"></div>
        `;
    }

    async initializeStatusPage() {
        const loadingIndicator = this.shadowRoot.getElementById('loading-indicator');
        const statusBanner = this.shadowRoot.getElementById('status-banner');

        statusBanner.classList.remove('visible');
        loadingIndicator.style.display = 'block';

        let heartbeatData = await this.fetchData(this.API_HEARTBEAT_URL, 'heartbeat');
        let statusPageData = await this.fetchData(this.API_STATUS_PAGE_URL, 'status page');

        if (!heartbeatData && !statusPageData) {
            heartbeatData = this.MOCK_DATA;
            statusPageData = this.MOCK_DATA;
        } else if (!heartbeatData) {
            heartbeatData = this.MOCK_DATA;
        } else if (!statusPageData) {
            statusPageData = { incident: null };
        }
        
        this.renderStatus(heartbeatData, statusPageData);
    }
    
    async fetchData(url, dataType, retries = 0) {
        const maxRetries = 5;
        const baseDelay = 1000;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${dataType} data:`, error);
            if (retries < maxRetries) {
                const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchData(url, dataType, retries + 1);
            } else {
                console.warn(`Max retries reached for ${dataType} data. Using mock data as fallback.`);
                return null;
            }
        }
    }
    
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
    
    renderStatus(heartbeatData, statusPageData) {
        const overallStatus = this.calculateOverallStatus(heartbeatData.heartbeatList);
        const loadingIndicator = this.shadowRoot.getElementById('loading-indicator');
        const statusBanner = this.shadowRoot.getElementById('status-banner');
        const statusText = this.shadowRoot.getElementById('status-text');
        const statusIcon = this.shadowRoot.getElementById('status-icon');
        const closeButton = this.shadowRoot.getElementById('close-button');
        const incidentDetail = this.shadowRoot.getElementById('incident-detail');

        loadingIndicator.style.display = 'none';
        statusBanner.className = 'overall-status-banner';
        incidentDetail.classList.add('hidden');

        let incident = statusPageData?.incident;
        let incidentFound = incident?.pin;

        if (overallStatus === 'operational' && !incidentFound) {
            statusBanner.classList.remove('visible');
            return;
        }

        let bannerStyleClass;
        let statusMessage;
        let iconText;
        
        if (incidentFound) {
            bannerStyleClass = `status-style-${incident.style?.toLowerCase() || 'warning'}`;
            statusMessage = `<strong>${incident.title}:</strong> For more details, visit the <a href="${this.ORIGINAL_STATUS_PAGE_URL}" target="_blank">full status page</a>.`;
            iconText = '⚠️';
            
            if (incident.style === 'danger') iconText = '🚨';
            else if (incident.style === 'info') iconText = 'ℹ️';

            incidentDetail.innerHTML = incident.content;
            incidentDetail.classList.remove('hidden');
        } else {
            switch (overallStatus) {
                case 'degraded':
                    bannerStyleClass = 'status-style-warning';
                    statusMessage = `<strong>Degraded Performance:</strong> Some services are currently experiencing issues. Please visit the <a href="${this.ORIGINAL_STATUS_PAGE_URL}" target="_blank">full status page</a> for more details.`;
                    iconText = '⚠️';
                    break;
                case 'partial-outage':
                    bannerStyleClass = 'status-style-danger';
                    statusMessage = `<strong>Partial Outage:</strong> Some services are currently experiencing an outage. Please visit the <a href="${this.ORIGINAL_STATUS_PAGE_URL}" target="_blank">full status page</a> for more details.`;
                    iconText = '❌';
                    break;
                case 'major-outage':
                    bannerStyleClass = 'status-style-danger';
                    statusMessage = `<strong>Major Outage:</strong> All services are currently experiencing a major outage. Please visit the <a href="${this.ORIGINAL_STATUS_PAGE_URL}" target="_blank">full status page</a> for more details.`;
                    iconText = '🚨';
                    break;
                case 'unknown':
                default:
                    bannerStyleClass = 'status-style-light';
                    statusMessage = `<strong>Status Unknown:</strong> Unable to retrieve service status. Please visit the <a href="${this.ORIGINAL_STATUS_PAGE_URL}" target="_blank">full status page</a>.`;
                    iconText = '❓';
                    break;
            }
        }
        
        statusBanner.classList.add(bannerStyleClass);
        statusText.innerHTML = statusMessage;
        statusIcon.textContent = iconText;
        statusBanner.classList.add('visible');

        closeButton.onclick = () => {
            statusBanner.classList.remove('visible');
        };
    }
}

customElements.define('status-banner', StatusBanner);