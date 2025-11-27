// Health Score Animation
document.addEventListener('DOMContentLoaded', function() {
    animateHealthScore();
    setupEventListeners();
});

// Animate the circular progress bar
function animateHealthScore() {
    const score = 7.8;
    const maxScore = 10;
    const percentage = (score / maxScore) * 100;
    
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 80; // radius is 80
    const offset = circumference - (percentage / 100) * circumference;
    
    // Animate the circle
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
    
    // Update color based on score
    if (score >= 8) {
        circle.style.stroke = '#2e7d32'; // Excellent - Dark Green
        document.getElementById('statusBadge').textContent = 'Excellent';
        document.getElementById('statusBadge').className = 'status-badge excellent';
    } else if (score >= 6) {
        circle.style.stroke = '#4caf50'; // Good - Green
        document.getElementById('statusBadge').textContent = 'Good';
        document.getElementById('statusBadge').className = 'status-badge good';
    } else {
        circle.style.stroke = '#ff9800'; // Fair - Orange
        document.getElementById('statusBadge').textContent = 'Needs Improvement';
        document.getElementById('statusBadge').className = 'status-badge fair';
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Mode Switch
    const modeSwitch = document.getElementById('modeSwitch');
    const modeLabel = document.getElementById('modeLabel');
    
    modeSwitch.addEventListener('change', function() {
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
    
    loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Login Form Submit
    const loginForm = document.querySelector('.login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Login functionality will be implemented with backend integration!');
        loginModal.style.display = 'none';
    });
    
    // Call Expert Button
    const callExpertBtn = document.getElementById('callExpertBtn');
    callExpertBtn.addEventListener('click', function() {
        showExpertDialog();
    });
    
    // Book Service Button
    const bookServiceBtn = document.getElementById('bookServiceBtn');
    bookServiceBtn.addEventListener('click', function() {
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
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    });
});

// Add animation to recommendation items on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
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
document.addEventListener('keydown', function(e) {
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