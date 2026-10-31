// Unicorn Rentals Frontend JavaScript

class UnicornRentalsApp {
    constructor() {
        this.baseUrl = window.location.origin;
        this.init();
    }

    init() {
        // Initialize event listeners
        this.setupEventListeners();
        
        // Check health status on load
        this.checkHealth();
    }

    setupEventListeners() {
        // Hire Unicorn form
        const hireForm = document.getElementById('hire-unicorn-form');
        if (hireForm) {
            hireForm.addEventListener('submit', (e) => this.handleHireUnicorn(e));
        }

        // Fleet Report form  
        const fleetForm = document.getElementById('fleet-report-form');
        if (fleetForm) {
            fleetForm.addEventListener('submit', (e) => this.handleFleetReport(e));
        }

        // Health Check button
        const healthBtn = document.getElementById('health-check-btn');
        if (healthBtn) {
            healthBtn.addEventListener('click', () => this.checkHealth());
        }
    }

    async handleHireUnicorn(event) {
        event.preventDefault();
        
        const requestIdInput = document.getElementById('request-id');
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const responseArea = document.getElementById('hire-response');
        const loading = document.getElementById('hire-loading');
        
        const requestId = requestIdInput.value.trim();
        if (!requestId) {
            this.showResponse(responseArea, 'Please enter a request ID', 'error');
            return;
        }

        try {
            // Show loading state
            submitBtn.disabled = true;
            loading.classList.add('show');
            responseArea.classList.remove('show');

            const response = await fetch(`${this.baseUrl}/unicorn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_id: requestId
                })
            });

            const data = await response.json();

            if (response.ok) {
                const message = `
                    <strong>✅ ${data.message}</strong><br>
                    <strong>Request ID:</strong> ${data.request_id}<br>
                    <strong>Signature:</strong> <code>${data.signature}</code>
                `;
                this.showResponse(responseArea, message, 'success');
                requestIdInput.value = ''; // Clear form
            } else {
                this.showResponse(responseArea, `Error: ${data.error || 'Failed to hire unicorn'}`, 'error');
            }

        } catch (error) {
            this.showResponse(responseArea, `Network error: ${error.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
            loading.classList.remove('show');
        }
    }

    async handleFleetReport(event) {
        event.preventDefault();
        
        const unicornIdsInput = document.getElementById('unicorn-ids');
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const responseArea = document.getElementById('fleet-response');
        const loading = document.getElementById('fleet-loading');
        
        const unicornIdsText = unicornIdsInput.value.trim();
        if (!unicornIdsText) {
            this.showResponse(responseArea, 'Please enter unicorn IDs', 'error');
            return;
        }

        // Parse unicorn IDs (comma-separated or line-separated)
        const unicornIds = unicornIdsText
            .split(/[,\n]/)
            .map(id => id.trim())
            .filter(id => id.length > 0);

        if (unicornIds.length === 0) {
            this.showResponse(responseArea, 'Please enter valid unicorn IDs', 'error');
            return;
        }

        if (unicornIds.length > 50) {
            this.showResponse(responseArea, 'Maximum 50 unicorns per report', 'error');
            return;
        }

        try {
            // Show loading state
            submitBtn.disabled = true;
            loading.classList.add('show');
            responseArea.classList.remove('show');

            const response = await fetch(`${this.baseUrl}/fleet-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    unicorn_ids: unicornIds
                })
            });

            const data = await response.json();

            if (response.ok) {
                let message = `<strong>✅ ${data.message}</strong><br>`;
                message += `<strong>Report ID:</strong> ${data.report_id}<br>`;
                message += `<strong>Location:</strong> ${data.location}<br>`;
                
                if (data.status === 'queued') {
                    message += `<strong>Status:</strong> Queued for processing<br>`;
                    message += `<strong>Unicorn Count:</strong> ${data.unicorn_count}<br>`;
                    message += `<strong>Estimated Completion:</strong> ${data.estimated_completion}`;
                } else {
                    message += `<strong>Processing Time:</strong> ${data.processing_time_seconds}s`;
                }

                this.showResponse(responseArea, message, 'success');
                unicornIdsInput.value = ''; // Clear form
            } else {
                this.showResponse(responseArea, `Error: ${data.error || 'Failed to generate fleet report'}`, 'error');
            }

        } catch (error) {
            this.showResponse(responseArea, `Network error: ${error.message}`, 'error');
        } finally {
            submitBtn.disabled = false;
            loading.classList.remove('show');
        }
    }

    async checkHealth() {
        const healthStatus = document.getElementById('health-status');
        const healthIndicator = document.getElementById('health-indicator');
        
        try {
            const response = await fetch(`${this.baseUrl}/healthcheck`);
            
            if (response.ok) {
                healthStatus.innerHTML = 'System Healthy';
                healthIndicator.className = 'status-indicator status-healthy';
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            healthStatus.innerHTML = `System Error: ${error.message}`;
            healthIndicator.className = 'status-indicator status-error';
        }
    }

    showResponse(responseArea, message, type) {
        responseArea.innerHTML = message;
        responseArea.className = `response-area show ${type}`;
    }

    // Utility method to generate sample data
    generateSampleUnicornIds() {
        const sampleIds = [
            'sparkle_123', 'rainbow_456', 'thunder_789', 
            'moonbeam_101', 'stardust_202', 'comet_303',
            'aurora_404', 'nebula_505', 'galaxy_606'
        ];
        
        // Return 3-5 random IDs
        const count = Math.floor(Math.random() * 3) + 3;
        const shuffled = sampleIds.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).join(', ');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UnicornRentalsApp();
    
    // Add sample data button functionality
    const sampleBtn = document.getElementById('sample-data-btn');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', () => {
            const unicornIdsInput = document.getElementById('unicorn-ids');
            const app = new UnicornRentalsApp();
            unicornIdsInput.value = app.generateSampleUnicornIds();
        });
    }
});