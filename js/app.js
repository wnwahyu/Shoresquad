// ============================================
// ShoreSquad - JavaScript Application
// Enhanced interactivity and performance features
// ============================================

// ============================================
// Configuration & Constants
// ============================================
const CONFIG = {
    animationDuration: 300,
    scrollThreshold: 100,
    counterSpeed: 2000,
    // NEA Singapore APIs from data.gov.sg
    neaWeatherApi: 'https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast',
    neaAirTempApi: 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature',
    weatherUpdateInterval: 1800000, // Update every 30 minutes
};

// ============================================
// DOM Elements
// ============================================
const DOM = {
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    backToTop: document.getElementById('backToTop'),
    heroCtaBtn: document.getElementById('heroCtaBtn'),
    joinForm: document.getElementById('joinForm'),
    emailInput: document.getElementById('emailInput'),
    successMessage: document.getElementById('successMessage'),
    eventsContainer: document.getElementById('eventsContainer'),
    eventsLoader: document.getElementById('eventsLoader'),
    currentConditions: document.getElementById('currentConditions'),
    forecastContainer: document.getElementById('forecastContainer'),
};

// ============================================
// State Management
// ============================================
const state = {
    isMenuOpen: false,
    countersAnimated: false,
    userLocation: null,
};

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Animate number counter
 * @param {HTMLElement} element - Element to animate
 * @param {number} target - Target number
 * @param {number} duration - Animation duration
 */
function animateCounter(element, target, duration) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

/**
 * Intersection Observer for scroll animations
 */
const observeElements = () => {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate counters when they come into view
                if (entry.target.hasAttribute('data-count') && !state.countersAnimated) {
                    const target = parseInt(entry.target.getAttribute('data-count'));
                    animateCounter(entry.target, target, CONFIG.counterSpeed);
                }
            }
        });
    }, options);
    
    // Observe all counter elements
    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
    
    // Observe cards for fade-in animations
    document.querySelectorAll('.about-card, .feature-item, .event-card').forEach(el => {
        observer.observe(el);
    });
};

// ============================================
// Navigation Functions
// ============================================

/**
 * Toggle mobile navigation menu
 */
function toggleNavMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    DOM.navMenu.classList.toggle('active');
    DOM.navToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    
    // Animate hamburger icon
    const hamburgers = DOM.navToggle.querySelectorAll('.hamburger');
    if (state.isMenuOpen) {
        hamburgers[0].style.transform = 'rotate(45deg) translateY(8px)';
        hamburgers[1].style.opacity = '0';
        hamburgers[2].style.transform = 'rotate(-45deg) translateY(-8px)';
    } else {
        hamburgers[0].style.transform = '';
        hamburgers[1].style.opacity = '1';
        hamburgers[2].style.transform = '';
    }
}

/**
 * Handle smooth scroll to sections
 * @param {Event} e - Click event
 */
function handleNavLinkClick(e) {
    const href = e.currentTarget.getAttribute('href');
    
    if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const navHeight = DOM.navbar.offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (state.isMenuOpen) {
                toggleNavMenu();
            }
            
            // Update active link
            updateActiveNavLink(href);
        }
    }
}

/**
 * Update active navigation link based on scroll position
 * @param {string} activeHref - Active link href
 */
function updateActiveNavLink(activeHref) {
    DOM.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === activeHref) {
            link.classList.add('active');
        }
    });
}

/**
 * Handle scroll events for navbar and back-to-top button
 */
const handleScroll = throttle(() => {
    const scrollPosition = window.scrollY;
    
    // Add shadow to navbar on scroll
    if (scrollPosition > 50) {
        DOM.navbar.classList.add('scrolled');
    } else {
        DOM.navbar.classList.remove('scrolled');
    }
    
    // Show/hide back-to-top button
    if (scrollPosition > CONFIG.scrollThreshold) {
        DOM.backToTop.classList.add('show');
    } else {
        DOM.backToTop.classList.remove('show');
    }
    
    // Update active nav link based on scroll position
    updateActiveNavOnScroll();
}, 100);

/**
 * Update active navigation based on scroll position
 */
function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            updateActiveNavLink(`#${sectionId}`);
        }
    });
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// Form Handling
// ============================================

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const email = DOM.emailInput.value.trim();
    
    // Basic email validation
    if (!isValidEmail(email)) {
        showFormError('Please enter a valid email address');
        return;
    }
    
    try {
        // Simulate API call - Replace with actual backend endpoint
        await submitEmail(email);
        
        // Show success message
        DOM.joinForm.style.display = 'none';
        DOM.successMessage.classList.add('show');
        
        // Reset form
        DOM.emailInput.value = '';
        
        // Track conversion (if analytics integrated)
        trackEvent('form_submit', 'join_squad', email);
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormError('Something went wrong. Please try again.');
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Submit email to backend (placeholder)
 * @param {string} email - Email to submit
 * @returns {Promise} - Promise that resolves after submission
 */
function submitEmail(email) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            console.log('Email submitted:', email);
            // Store in localStorage as fallback
            const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
            subscribers.push({ email, timestamp: new Date().toISOString() });
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
            resolve();
        }, 1000);
    });
}

/**
 * Show form error message
 * @param {string} message - Error message
 */
function showFormError(message) {
    // Create error element if it doesn't exist
    let errorEl = document.querySelector('.form-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.style.cssText = 'color: #FEF3C7; margin-top: 0.5rem; font-size: 0.875rem;';
        DOM.joinForm.appendChild(errorEl);
    }
    errorEl.textContent = message;
    
    // Shake animation
    DOM.emailInput.style.animation = 'shake 0.3s';
    setTimeout(() => {
        DOM.emailInput.style.animation = '';
    }, 300);
}

// ============================================
// Weather Functions - NEA Singapore API
// ============================================

/**
 * Get weather icon based on forecast
 * @param {string} forecast - Forecast description
 * @returns {string} - Emoji icon
 */
function getWeatherIcon(forecast) {
    const forecastLower = forecast.toLowerCase();
    if (forecastLower.includes('thunder') || forecastLower.includes('storm')) return '⛈️';
    if (forecastLower.includes('rain') || forecastLower.includes('shower')) return '🌧️';
    if (forecastLower.includes('cloudy')) return '☁️';
    if (forecastLower.includes('partly cloudy') || forecastLower.includes('fair')) return '⛅';
    if (forecastLower.includes('hazy')) return '🌫️';
    if (forecastLower.includes('windy')) return '💨';
    return '☀️'; // Default sunny
}

/**
 * Fetch current air temperature from NEA
 * @returns {Promise<Object>} - Temperature data
 */
async function fetchCurrentTemperature() {
    try {
        const response = await fetch(CONFIG.neaAirTempApi);
        if (!response.ok) throw new Error('Failed to fetch temperature');
        const data = await response.json();
        
        // Get readings from stations (average them)
        const readings = data.data.readings;
        if (readings && readings.length > 0) {
            const temps = readings.map(r => r.value);
            const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
            return {
                temperature: avgTemp.toFixed(1),
                timestamp: data.data.timestamp
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching temperature:', error);
        return null;
    }
}

/**
 * Fetch 24-hour weather forecast from NEA
 * @returns {Promise<Object>} - Forecast data
 */
async function fetchWeatherForecast() {
    try {
        const response = await fetch(CONFIG.neaWeatherApi);
        if (!response.ok) throw new Error('Failed to fetch forecast');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        return null;
    }
}

/**
 * Load and display weather data
 */
async function loadWeather() {
    try {
        // Fetch both temperature and forecast
        const [tempData, forecastData] = await Promise.all([
            fetchCurrentTemperature(),
            fetchWeatherForecast()
        ]);

        if (forecastData) {
            renderCurrentConditions(tempData, forecastData);
            renderForecast(forecastData);
        } else {
            showWeatherError();
        }
    } catch (error) {
        console.error('Error loading weather:', error);
        showWeatherError();
    }
}

/**
 * Render current weather conditions
 * @param {Object} tempData - Temperature data
 * @param {Object} forecastData - Forecast data
 */
function renderCurrentConditions(tempData, forecastData) {
    if (!DOM.currentConditions) return;

    const periods = forecastData.records[0].periods;
    const currentPeriod = periods[0]; // Get first period (usually current/today)
    
    const temp = tempData ? tempData.temperature : '--';
    const forecast = currentPeriod.regions.national || currentPeriod.text || 'Fair';
    
    const html = `
        <div class="current-location">Singapore</div>
        <div class="forecast-icon">${getWeatherIcon(forecast)}</div>
        <div class="current-temp">${temp}°C</div>
        <div class="current-description">${forecast}</div>
        <div class="weather-details">
            <div class="weather-detail-item">
                <span class="weather-detail-label">Humidity</span>
                <span class="weather-detail-value">${currentPeriod.regions.humidity?.high || '--'}%</span>
            </div>
            <div class="weather-detail-item">
                <span class="weather-detail-label">Wind</span>
                <span class="weather-detail-value">${currentPeriod.wind?.direction || 'Variable'}</span>
            </div>
        </div>
    `;
    
    DOM.currentConditions.innerHTML = html;
}

/**
 * Render 4-day forecast
 * @param {Object} forecastData - Forecast data from NEA
 */
function renderForecast(forecastData) {
    if (!DOM.forecastContainer) return;

    const records = forecastData.records[0];
    const periods = records.periods;
    
    // Create 4-day forecast by grouping periods
    const forecastDays = createForecastDays(periods);
    
    const forecastHTML = forecastDays.map((day, index) => {
        const isToday = index === 0;
        return `
            <div class="forecast-card ${isToday ? 'today' : ''}">
                <div class="forecast-day">${day.dayName}</div>
                <div class="forecast-date">${day.date}</div>
                <div class="forecast-icon">${getWeatherIcon(day.forecast)}</div>
                <div class="forecast-temp">${day.tempHigh}°C</div>
                <div class="forecast-temp-range">${day.tempLow}°C - ${day.tempHigh}°C</div>
                <div class="forecast-description">${day.forecast}</div>
                <div class="forecast-details">
                    <div class="forecast-detail">
                        <span class="forecast-detail-icon">💧</span>
                        <span class="forecast-detail-value">${day.humidity}%</span>
                    </div>
                    <div class="forecast-detail">
                        <span class="forecast-detail-icon">💨</span>
                        <span class="forecast-detail-value">${day.wind}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    DOM.forecastContainer.innerHTML = forecastHTML;
}

/**
 * Create 4-day forecast from periods
 * @param {Array} periods - Forecast periods
 * @returns {Array} - Array of daily forecasts
 */
function createForecastDays(periods) {
    const days = [];
    const today = new Date();
    
    // Get 4 days of forecast
    for (let i = 0; i < 4; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Find matching period or use general forecast
        const period = periods[i] || periods[0];
        const forecast = period.regions?.national || period.text || 'Fair';
        
        days.push({
            dayName: i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' }),
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            forecast: forecast,
            tempLow: period.temperature?.low || 24,
            tempHigh: period.temperature?.high || 32,
            humidity: period.regions?.humidity?.high || 85,
            wind: period.wind?.direction || 'Light'
        });
    }
    
    return days;
}

/**
 * Show weather error message
 */
function showWeatherError() {
    if (DOM.currentConditions) {
        DOM.currentConditions.innerHTML = `
            <div class="weather-alert">
                <div class="weather-alert-title">⚠️ Unable to load weather data</div>
                <div class="weather-alert-text">Please check your connection and try again later.</div>
            </div>
        `;
    }
    if (DOM.forecastContainer) {
        DOM.forecastContainer.innerHTML = '';
    }
}

// ============================================
// Events Data & Loading
// ============================================

/**
 * Mock events data
 */
const mockEvents = [
    {
        id: 1,
        title: 'Sunset Beach Cleanup',
        date: '2025-12-05',
        location: 'Santa Monica Beach, CA',
        attendees: 24,
        weather: 'sunny'
    },
    {
        id: 2,
        title: 'Weekend Wave Warriors',
        date: '2025-12-07',
        location: 'Bondi Beach, Australia',
        attendees: 18,
        weather: 'partly-cloudy'
    },
    {
        id: 3,
        title: 'Coastal Cleanup Crew',
        date: '2025-12-08',
        location: 'Miami Beach, FL',
        attendees: 32,
        weather: 'sunny'
    }
];

/**
 * Load and display events
 */
async function loadEvents() {
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In production, fetch from actual API:
        // const response = await fetch('/api/events');
        // const events = await response.json();
        
        const events = mockEvents;
        
        // Hide loader
        DOM.eventsLoader.style.display = 'none';
        
        // Render events
        renderEvents(events);
        
    } catch (error) {
        console.error('Error loading events:', error);
        DOM.eventsLoader.innerHTML = '<p>Unable to load events. Please try again later.</p>';
    }
}

/**
 * Render events to DOM
 * @param {Array} events - Array of event objects
 */
function renderEvents(events) {
    const eventsHTML = events.map(event => `
        <div class="event-card">
            <div class="event-image"></div>
            <div class="event-content">
                <span class="event-date">${formatDate(event.date)}</span>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-location">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C5.2 0 3 2.2 3 5c0 3.9 5 11 5 11s5-7.1 5-11c0-2.8-2.2-5-5-5zm0 7.5c-1.4 0-2.5-1.1-2.5-2.5S6.6 2.5 8 2.5s2.5 1.1 2.5 2.5S9.4 7.5 8 7.5z"/>
                    </svg>
                    <span>${event.location}</span>
                </div>
                <div class="event-attendees">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 8c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/>
                    </svg>
                    <span>${event.attendees} attending</span>
                </div>
            </div>
        </div>
    `).join('');
    
    DOM.eventsContainer.innerHTML = eventsHTML;
}

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ============================================
// Analytics & Tracking
// ============================================

/**
 * Track events for analytics
 * @param {string} action - Event action
 * @param {string} category - Event category
 * @param {string} label - Event label
 */
function trackEvent(action, category, label) {
    // Google Analytics 4 example
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
    
    // Console log for development
    console.log('Event tracked:', { action, category, label });
}

// ============================================
// Local Storage Management
// ============================================

/**
 * Save user preferences to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(`shoresquad_${key}`, JSON.stringify(value));
    } catch (error) {
        console.error('localStorage error:', error);
    }
}

/**
 * Get user preferences from localStorage
 * @param {string} key - Storage key
 * @returns {any} - Stored value
 */
function getFromStorage(key) {
    try {
        const item = localStorage.getItem(`shoresquad_${key}`);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('localStorage error:', error);
        return null;
    }
}

// ============================================
// Performance Optimization
// ============================================

/**
 * Lazy load images using Intersection Observer
 */
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

/**
 * Preload critical resources
 */
function preloadResources() {
    // Preload critical fonts
    const fonts = [
        'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap'
    ];
    
    fonts.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = fontUrl;
        document.head.appendChild(link);
    });
}

// ============================================
// Event Listeners
// ============================================

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Navigation
    DOM.navToggle?.addEventListener('click', toggleNavMenu);
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
    });
    
    // Scroll events
    window.addEventListener('scroll', handleScroll);
    DOM.backToTop?.addEventListener('click', scrollToTop);
    
    // Form submission
    DOM.joinForm?.addEventListener('submit', handleFormSubmit);
    
    // Hero CTA
    DOM.heroCtaBtn?.addEventListener('click', () => {
        document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
        trackEvent('click', 'cta', 'hero_find_cleanup');
    });
    
    // Track button clicks
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnText = e.currentTarget.textContent.trim();
            trackEvent('click', 'button', btnText);
        });
    });
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize application
 */
function init() {
    console.log('🌊 ShoreSquad initialized!');
    
    // Setup event listeners
    initEventListeners();
    
    // Initialize Intersection Observer for animations
    observeElements();
    
    // Load weather data
    loadWeather();
    
    // Update weather periodically
    setInterval(loadWeather, CONFIG.weatherUpdateInterval);
    
    // Load events
    loadEvents();
    
    // Lazy load images
    lazyLoadImages();
    
    // Check for saved user preferences
    const savedPreferences = getFromStorage('preferences');
    if (savedPreferences) {
        console.log('User preferences loaded:', savedPreferences);
    }
    
    // Track page view
    trackEvent('page_view', 'engagement', 'home');
}

// ============================================
// DOM Content Loaded
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================
// Service Worker Registration (PWA Support)
// ============================================

/**
 * Register service worker for PWA functionality
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// ============================================
// Export for testing (if using modules)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        formatDate,
        debounce,
        throttle,
        saveToStorage,
        getFromStorage
    };
}
