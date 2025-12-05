// API Base URL (relative since frontend and backend on same server)
const API_BASE_URL = '/api';

// Health Score Animation
document.addEventListener('DOMContentLoaded', function () {
    loadSoilDataFromDatabase();
    setupEventListeners();
    checkAuthState();

    // Auto-refresh data every 30 seconds to catch admin changes
    setInterval(loadSoilDataFromDatabase, 30000);
});

// Check if user is logged in and update UI accordingly
function checkAuthState() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.name) {
        // User is NOT logged in - redirect to login page
        window.location.href = 'login.html';
        return;
    }

    // User is logged in - show their name
    const userName = document.getElementById('userName');
    if (userName) userName.textContent = `Welcome, ${user.name}`;
}

// Logout function - called from button onclick
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Load soil data from the backend database
async function loadSoilDataFromDatabase() {
    try {
        const response = await fetch(`${API_BASE_URL}/soil/history`);

        if (!response.ok) {
            throw new Error('Failed to fetch soil data');
        }

        const records = await response.json();

        if (records && records.length > 0) {
            // Get the most recent record
            const latestRecord = records[0];
            updateDashboardWithData(latestRecord);
        } else {
            console.log('No soil data available yet');
            showNoDataMessage();
        }
    } catch (error) {
        console.error('Error loading soil data from database:', error);
        showNoDataMessage();
    }
}

// Update the dashboard UI with data from the database
function updateDashboardWithData(data) {
    // Update Land Information
    const landAreaEl = document.getElementById('landArea');
    const locationEl = document.getElementById('location');
    const soilTypeEl = document.getElementById('soilType');
    const irrigationEl = document.getElementById('irrigation');

    if (landAreaEl) landAreaEl.textContent = `${data.land_area} Acres`;
    if (locationEl) locationEl.textContent = data.location;
    if (soilTypeEl) soilTypeEl.textContent = `${data.soil_type} Soil`;
    if (irrigationEl) irrigationEl.textContent = `${data.irrigation} System`;

    // Update pH Level
    updateSoilMetric('ph', data.ph_level, 6.0, 7.5, '', 14);

    // Update Nitrogen
    updateSoilMetric('nitrogen', data.nitrogen, 250, 300, ' kg/ha', 400);

    // Update Phosphorus
    updateSoilMetric('phosphorus', data.phosphorus, 40, 50, ' kg/ha', 100);

    // Update Potassium
    updateSoilMetric('potassium', data.potassium, 300, 400, ' kg/ha', 500);

    // Update Organic Carbon
    updateSoilMetric('carbon', data.organic_carbon, 0.5, 0.75, '%', 1);

    // Update Zinc
    updateSoilMetric('zinc', data.zinc, 0.6, 1.0, ' ppm', 2);

    // Update Health Score based on soil_score from recommendations
    const soilScore = data.soil_score || calculateOverallScore(data);
    animateHealthScore(soilScore);

    // Update Recommendations
    renderFertilizerRecommendations(data.fertilizers || []);
    renderPesticideRecommendations(data.pesticides || []);
    renderCropRecommendations(data.recommended_crops || []);
}

// Update individual soil metric with fill bar and status
function updateSoilMetric(metricName, value, idealMin, idealMax, unit, maxValue) {
    const fillEl = document.getElementById(`${metricName}Fill`);
    const currentEl = document.getElementById(`${metricName}Current`);
    const statusEl = document.getElementById(`${metricName}Status`);

    if (fillEl) {
        const percentage = Math.min((value / maxValue) * 100, 100);
        fillEl.style.width = `${percentage}%`;
    }

    if (currentEl) {
        currentEl.textContent = `Current: ${value}${unit}`;
    }

    if (statusEl) {
        if (value >= idealMin && value <= idealMax) {
            statusEl.textContent = '✓';
            statusEl.className = 'status-icon';
        } else {
            statusEl.textContent = '⚠';
            statusEl.className = 'status-icon warning';
        }
    }
}

// Calculate overall score if not provided
function calculateOverallScore(data) {
    let score = 10;

    // pH check
    if (data.ph_level < 6.0 || data.ph_level > 7.5) score -= 1;

    // Nitrogen check
    if (data.nitrogen < 250) score -= 1.5;

    // Phosphorus check
    if (data.phosphorus < 40 || data.phosphorus > 50) score -= 1;

    // Potassium check
    if (data.potassium < 300 || data.potassium > 400) score -= 1;

    // Organic Carbon check
    if (data.organic_carbon < 0.5 || data.organic_carbon > 0.75) score -= 1;

    // Zinc check
    if (data.zinc < 0.6) score -= 1;

    return Math.max(score, 0);
}

// Render fertilizer recommendations
function renderFertilizerRecommendations(fertilizers) {
    const container = document.getElementById('fertilizersList');
    if (!container) return;

    if (!fertilizers || fertilizers.length === 0) {
        container.innerHTML = `
            <div class="recommendation-item">
                <div class="rec-icon">✅</div>
                <div class="rec-details">
                    <h4>Soil nutrients are balanced!</h4>
                    <p>No additional fertilizers needed at this time</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = fertilizers.map(fert => `
        <div class="recommendation-item">
            <div class="rec-icon">${fert.priority === 'high' ? '🔴' : fert.priority === 'medium' ? '🟡' : '💧'}</div>
            <div class="rec-details">
                <h4>${fert.name}</h4>
                <p>Application: ${fert.application} | ${fert.frequency}</p>
                ${fert.purpose ? `<p class="purpose">Purpose: ${fert.purpose}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Render pesticide recommendations
function renderPesticideRecommendations(pesticides) {
    const container = document.getElementById('pesticidesList');
    if (!container) return;

    if (!pesticides || pesticides.length === 0) {
        container.innerHTML = `
            <div class="recommendation-item">
                <div class="rec-icon">✅</div>
                <div class="rec-details">
                    <h4>Standard preventive measures</h4>
                    <p>No specific pesticide requirements detected</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = pesticides.map(pest => `
        <div class="recommendation-item">
            <div class="rec-icon">${pest.priority === 'high' ? '🔴' : '🔬'}</div>
            <div class="rec-details">
                <h4>${pest.name}</h4>
                <p>Application: ${pest.application}</p>
                <p class="purpose">Purpose: ${pest.purpose}</p>
            </div>
        </div>
    `).join('');
}

// Render crop recommendations
function renderCropRecommendations(crops) {
    const container = document.getElementById('cropsList');
    if (!container) return;

    // Crop icons mapping
    const cropIcons = {
        'Wheat': '🌾',
        'Maize': '🌽',
        'Potato': '🥔',
        'Mustard': '🌱',
        'Rice': '🍚',
        'Cotton': '🌿',
        'Sugarcane': '🎋',
        'Tomato': '🍅',
        'Onion': '🧅',
        'default': '🌱'
    };

    if (!crops || crops.length === 0) {
        container.innerHTML = `
            <div class="crop-card">
                <div class="crop-icon">🌾</div>
                <h4>General Crops</h4>
                <p class="crop-timing">Add soil data for specific recommendations</p>
                <span class="crop-badge suitable">Pending Analysis</span>
            </div>
        `;
        return;
    }

    container.innerHTML = crops.map(crop => `
        <div class="crop-card">
            <div class="crop-icon">${cropIcons[crop.name] || cropIcons['default']}</div>
            <h4>${crop.name}</h4>
            <p class="crop-timing">Sowing/Harvest: ${crop.timing}</p>
            <p class="crop-yield">Expected Yield: ${crop.yield}</p>
            <span class="crop-badge ${crop.suitability === 'Highly Recommended' ? 'recommended' : 'suitable'}">${crop.suitability}</span>
        </div>
    `).join('');
}

// Show message when no data is available
function showNoDataMessage() {
    const landAreaEl = document.getElementById('landArea');
    const locationEl = document.getElementById('location');
    const soilTypeEl = document.getElementById('soilType');
    const irrigationEl = document.getElementById('irrigation');

    if (landAreaEl) landAreaEl.textContent = 'No data yet';
    if (locationEl) locationEl.textContent = 'Add soil data in admin panel';
    if (soilTypeEl) soilTypeEl.textContent = '--';
    if (irrigationEl) irrigationEl.textContent = '--';

    // Show loading/placeholder for recommendations
    renderFertilizerRecommendations([]);
    renderPesticideRecommendations([]);
    renderCropRecommendations([]);
}

// Animate the circular progress bar
function animateHealthScore(score = 7.8) {
    const maxScore = 10;
    const percentage = (score / maxScore) * 100;

    const circle = document.getElementById('progressCircle');
    const healthScoreEl = document.getElementById('healthScore');
    const circumference = 2 * Math.PI * 80; // radius is 80
    const offset = circumference - (percentage / 100) * circumference;

    // Update score display
    if (healthScoreEl) {
        healthScoreEl.textContent = score.toFixed(1);
    }

    // Animate the circle
    setTimeout(() => {
        if (circle) circle.style.strokeDashoffset = offset;
    }, 100);

    // Update color and description based on score
    const statusDescEl = document.getElementById('statusDesc');

    if (score >= 8) {
        if (circle) circle.style.stroke = '#2e7d32'; // Excellent - Dark Green
        document.getElementById('statusBadge').textContent = 'Excellent';
        document.getElementById('statusBadge').className = 'status-badge excellent';
        if (statusDescEl) statusDescEl.textContent = 'Your soil is in excellent condition! Keep up the great work.';
    } else if (score >= 6) {
        if (circle) circle.style.stroke = '#4caf50'; // Good - Green
        document.getElementById('statusBadge').textContent = 'Good';
        document.getElementById('statusBadge').className = 'status-badge good';
        if (statusDescEl) statusDescEl.textContent = 'Your soil is in good condition with minor improvements needed.';
    } else if (score >= 4) {
        if (circle) circle.style.stroke = '#ff9800'; // Fair - Orange
        document.getElementById('statusBadge').textContent = 'Fair';
        document.getElementById('statusBadge').className = 'status-badge fair';
        if (statusDescEl) statusDescEl.textContent = 'Your soil needs attention. Consider applying recommended fertilizers.';
    } else {
        if (circle) circle.style.stroke = '#f44336'; // Poor - Red
        document.getElementById('statusBadge').textContent = 'Needs Improvement';
        document.getElementById('statusBadge').className = 'status-badge fair';
        if (statusDescEl) statusDescEl.textContent = 'Your soil urgently needs improvement. Contact an expert for guidance.';
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Mode Switch
    const modeSwitch = document.getElementById('modeSwitch');
    const modeLabel = document.getElementById('modeLabel');

    modeSwitch.addEventListener('change', function () {
        if (this.checked) {
            modeLabel.textContent = 'Admin Mode';
            document.body.style.background = 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';
            showAdminAlert();
        } else {
            modeLabel.textContent = 'Customer Mode';
            document.body.style.background = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
        }
    });

    // Login Button
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');

    loginBtn.addEventListener('click', function () {
        loginModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function () {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Login Form Submit
    const loginForm = document.querySelector('.login-form');
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Login functionality will be implemented with backend integration!');
        loginModal.style.display = 'none';
    });

    // Call Expert Button
    const callExpertBtn = document.getElementById('callExpertBtn');
    callExpertBtn.addEventListener('click', function () {
        showExpertDialog();
    });

    // Book Service Button
    const bookServiceBtn = document.getElementById('bookServiceBtn');
    bookServiceBtn.addEventListener('click', function () {
        showBookingDialog();
    });
}

// Show admin mode alert
function showAdminAlert() {
    alert('🔐 Admin Mode Activated\n\nYou now have access to:\n• User Management\n• System Analytics\n• Service Configuration\n• Report Generation\n• Database Management');
}

// Show expert call dialog
function showExpertDialog() {
    const expertName = 'Dr. Rajesh Kumar';
    const expertSpecialty = 'Agricultural Soil Specialist';
    const expertPhone = '+91 98765 43210';

    const message = `📞 Connect with our Expert\n\n` +
        `Name: ${expertName}\n` +
        `Specialty: ${expertSpecialty}\n` +
        `Phone: ${expertPhone}\n\n` +
        `Available: Mon-Sat, 9 AM - 6 PM\n\n` +
        `Would you like to call now?`;

    if (confirm(message)) {
        alert(`Connecting to ${expertName}...\n\nIn a real application, this would initiate a call or schedule a consultation.`);
    }
}

// Show booking dialog
function showBookingDialog() {
    const services = [
        '🔬 Comprehensive Soil Testing - ₹2,500',
        '🌾 Crop Advisory Service - ₹1,500',
        '💧 Irrigation System Setup - ₹15,000',
        '🛡️ Pest Management Service - ₹3,000',
        '📊 Farm Management Consultation - ₹5,000'
    ];

    let message = '📅 Book Our Services\n\nAvailable Services:\n\n';
    services.forEach((service, index) => {
        message += `${index + 1}. ${service}\n`;
    });
    message += '\nSelect a service number (1-5):';

    const selection = prompt(message);

    if (selection && selection >= 1 && selection <= 5) {
        const selectedService = services[selection - 1];
        alert(`✅ Booking Confirmed!\n\nService: ${selectedService}\n\nOur team will contact you within 24 hours to schedule the appointment.\n\nThank you for choosing GrowNEX!`);
    } else if (selection) {
        alert('Invalid selection. Please try again.');
    }
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add hover effects to profile cards
const profileCards = document.querySelectorAll('.profile-card');
profileCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    });
});

// Add animation to recommendation items on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe recommendation items
document.querySelectorAll('.recommendation-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'all 0.5s ease';
    observer.observe(item);
});

// Observe crop cards
document.querySelectorAll('.crop-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Dynamic date in footer
const currentYear = new Date().getFullYear();
const footerText = document.querySelector('.footer-bottom p');
if (footerText) {
    footerText.innerHTML = footerText.innerHTML.replace('2024', currentYear);
}

// Simulate real-time data updates (optional feature)
function simulateDataUpdate() {
    // This function could be connected to a real API in production
    console.log('Checking for data updates...');

    // Example: Update soil health score
    // In real application, this would fetch from backend
    const updateInterval = 300000; // 5 minutes

    setTimeout(() => {
        // Simulate small variations in readings
        console.log('Data refreshed');
        simulateDataUpdate();
    }, updateInterval);
}

// Initialize data updates
// simulateDataUpdate(); // Uncomment when connected to backend

// Add keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Alt + E = Call Expert
    if (e.altKey && e.key === 'e') {
        e.preventDefault();
        document.getElementById('callExpertBtn').click();
    }

    // Alt + B = Book Service
    if (e.altKey && e.key === 'b') {
        e.preventDefault();
        document.getElementById('bookServiceBtn').click();
    }

    // Alt + L = Login
    if (e.altKey && e.key === 'l') {
        e.preventDefault();
        document.getElementById('loginBtn').click();
    }
});

// Print functionality for reports
function printDashboard() {
    window.print();
}

// Export data functionality (placeholder)
function exportData() {
    alert('📊 Export Functionality\n\nData can be exported in:\n• PDF Format\n• Excel Spreadsheet\n• CSV File\n\nThis feature will be available in the full version!');
}

// Console welcome message
console.log('%c🌱 Welcome to GrowNEX Dashboard', 'color: #4caf50; font-size: 20px; font-weight: bold;');
console.log('%cKeyboard Shortcuts:', 'color: #2e7d32; font-size: 14px; font-weight: bold;');
console.log('Alt + E : Call Expert');
console.log('Alt + B : Book Service');
console.log('Alt + L : Login/Sign Up');