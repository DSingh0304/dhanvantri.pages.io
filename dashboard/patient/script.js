// API Configuration
const API_BASE_URL = 'https://api.ysinghc.me/v1';
let authToken = localStorage.getItem('authToken');

// API Request helper
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Add auth token if available
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Add body for non-GET requests
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        // Handle unauthorized responses
        if (response.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '../../login/';
            return null;
        }
        
        // Parse JSON response
        const result = await response.json();
        
        // Handle error responses
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        showNotification(error.message || 'Failed to connect to server', 'error');
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!authToken) {
        window.location.href = '../../login/';
        return;
    }
    
    // Initialize dashboard functionality
    initSidebar();
    initNotifications();
    initCharts();
    initTabNavigation();
    initEventListeners();
    initSearch();
    initEmergencyCard();
    
    // Fetch user data
    fetchUserData();
    
    // Show dashboard content (simulate loading)
    setTimeout(() => {
        document.querySelector('.loading-overlay')?.classList.add('hidden');
        document.querySelector('.content-wrapper')?.classList.add('page-active');
    }, 500);
});

/**
 * Initialize sidebar functionality
 */
function initSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Check for saved state
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            // Save state
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }
    
    // Handle nav items click
    const navItems = document.querySelectorAll('.sidebar-nav li a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // If it's a dropdown toggle, prevent default
            if (this.classList.contains('dropdown-toggle')) {
                this.parentElement.classList.toggle('expanded');
                return;
            }
            
            // Get the target page
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                showPage(targetPage);
            }
            
            // Update active state
            navItems.forEach(navItem => {
                navItem.parentElement.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // On mobile, auto collapse sidebar
            if (window.innerWidth < 992) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            }
        });
    });
    
    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
}

/**
 * Initialize notifications
 */
async function initNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    
    if (notificationBtn && notificationPanel) {
        // Load notifications
        await loadNotifications(notificationPanel);
        
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationPanel.classList.toggle('show');
            
            // Close other panels
            document.querySelectorAll('.dropdown-panel').forEach(panel => {
                if (panel !== notificationPanel) {
                    panel.classList.remove('show');
                }
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationPanel.contains(e.target) && e.target !== notificationBtn) {
                notificationPanel.classList.remove('show');
            }
        });
        
        // Mark all as read
        const markReadBtn = notificationPanel.querySelector('.mark-all-read');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', async function() {
                await apiRequest('/notifications/mark-all-read', 'PUT');
                loadNotifications(notificationPanel);
                
                // Update badge
                const badge = notificationBtn.querySelector('.badge');
                if (badge) {
                    badge.textContent = '0';
                    badge.classList.add('hidden');
                }
            });
        }
    }
}

/**
 * Load notifications from API
 */
async function loadNotifications(panel) {
    const notificationList = panel.querySelector('.notification-list');
    const badge = document.querySelector('.notification-btn .badge');
    
    if (notificationList) {
        notificationList.innerHTML = '<div class="loading">Loading notifications...</div>';
        
        const response = await apiRequest('/notifications?limit=5');
        
        if (response) {
            notificationList.innerHTML = '';
            
            if (response.notifications.length === 0) {
                notificationList.innerHTML = '<div class="no-records">No notifications</div>';
            } else {
                response.notifications.forEach(notification => {
                    const item = document.createElement('div');
                    item.className = `notification-item ${notification.isRead ? '' : 'unread'}`;
                    item.innerHTML = `
                        <div class="notification-icon">
                            <i class="fas fa-${notification.icon || 'bell'}"></i>
                        </div>
                        <div class="notification-content">
                            <p>${notification.message}</p>
                            <span class="notification-time">${formatTimeAgo(notification.createdAt)}</span>
                        </div>
                    `;
                    
                    // Add click handler to mark as read
                    item.addEventListener('click', async () => {
                        if (!notification.isRead) {
                            await apiRequest(`/notifications/${notification._id}`, 'PUT');
                            item.classList.remove('unread');
                        }
                    });
                    
                    notificationList.appendChild(item);
                });
            }
            
            // Update badge
            if (badge && response.unreadCount) {
                badge.textContent = response.unreadCount;
                badge.classList.remove('hidden');
            } else if (badge) {
                badge.textContent = '0';
                badge.classList.add('hidden');
            }
        } else {
            notificationList.innerHTML = '<div class="error">Failed to load notifications</div>';
        }
    }
}

/**
 * Format time ago
 */
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
        return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
        return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMin > 0) {
        return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else {
        return 'Just now';
    }
}

/**
 * Initialize charts
 */
async function initCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not available. Charts will not be rendered.');
        return;
    }
    
    // Fetch health metrics data
    const metrics = await apiRequest('/health-metrics/summary');
    
    if (!metrics) {
        console.warn('Failed to load health metrics data');
        return;
    }
    
    // Blood Pressure Chart
    const bpChartEl = document.getElementById('bloodPressureChart');
    if (bpChartEl && metrics.bloodPressure) {
        const bpChart = new Chart(bpChartEl, {
            type: 'line',
            data: {
                labels: metrics.bloodPressure.labels || [],
                datasets: [
                    {
                        label: 'Systolic',
                        data: metrics.bloodPressure.values?.map(v => v.systolic) || [],
                        borderColor: '#1976D2',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: 'Diastolic',
                        data: metrics.bloodPressure.values?.map(v => v.diastolic) || [],
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.3,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        title: {
                            display: true,
                            text: 'mmHg'
                        }
                    }
                }
            }
        });
    }
    
    // Weight Chart
    const weightChartEl = document.getElementById('weightChart');
    if (weightChartEl && metrics.weight) {
        const weightChart = new Chart(weightChartEl, {
            type: 'line',
            data: {
                labels: metrics.weight.labels || [],
                datasets: [{
                    label: `Weight (${metrics.weight.unit || 'kg'})`,
                    data: metrics.weight.values || [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: metrics.weight.unit || 'kg'
                        }
                    }
                }
            }
        });
    }
    
    // Blood Sugar Chart
    const sugarChartEl = document.getElementById('bloodSugarChart');
    if (sugarChartEl && metrics.bloodSugar) {
        const sugarChart = new Chart(sugarChartEl, {
            type: 'line',
            data: {
                labels: metrics.bloodSugar.labels || [],
                datasets: [{
                    label: `Blood Sugar (${metrics.bloodSugar.unit || 'mg/dL'})`,
                    data: metrics.bloodSugar.values || [],
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: metrics.bloodSugar.unit || 'mg/dL'
                        }
                    }
                }
            }
        });
    }
    
    // Time range select event
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', async function() {
            const timespan = this.value;
            const updatedMetrics = await apiRequest(`/health-metrics/summary?timespan=${timespan}`);
            
            if (updatedMetrics) {
                // You would update all charts here with the new data
                showNotification(`Data updated for ${this.options[this.selectedIndex].text}`, 'info');
            }
        });
    }
}

/**
 * Initialize tab navigation
 */
function initTabNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav li a');
    const viewAllLinks = document.querySelectorAll('.view-all[data-page]');
    
    // Add click events to "View All" links
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                showPage(targetPage);
                
                // Update sidebar active state
                navLinks.forEach(navLink => {
                    const linkPage = navLink.getAttribute('data-page');
                    if (linkPage === targetPage) {
                        navLink.parentElement.classList.add('active');
                    } else {
                        navLink.parentElement.classList.remove('active');
                    }
                });
            }
        });
    });
}

/**
 * Initialize event listeners for buttons and actions
 */
function initEventListeners() {
    // Download Records button
    const downloadBtn = document.getElementById('downloadRecordsBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            showNotification('Preparing your records for download...', 'info');
            
            // Simulate download process
            setTimeout(() => {
                showNotification('Your records are ready for download', 'success');
                
                // In a real app, this would trigger a file download
                const link = document.createElement('a');
                link.href = '#'; // Would be a real file URL
                link.download = 'medical_records.pdf';
                // link.click(); // Commented out for demo
            }, 1500);
        });
    }
    
    // Save Appointment button
    const saveAppointmentBtn = document.getElementById('saveAppointmentBtn');
    if (saveAppointmentBtn) {
        saveAppointmentBtn.addEventListener('click', function() {
            const form = document.getElementById('appointmentForm');
            if (form) {
                // Simple validation
                const specialty = document.getElementById('specialtySelect').value;
                const doctor = document.getElementById('doctorSelect').value;
                const date = document.getElementById('appointmentDate').value;
                const time = document.getElementById('appointmentTime').value;
                
                if (!specialty || !doctor || !date || !time) {
                    showNotification('Please fill in all required fields', 'error');
                    return;
                }
                
                // Show loading
                this.disabled = true;
                this.textContent = 'Scheduling...';
                
                // Simulate API call
                setTimeout(() => {
                    showNotification('Appointment scheduled successfully!', 'success');
                    closeModal('appointmentModal');
                    
                    // Reset form and button
                    form.reset();
                    this.disabled = false;
                    this.textContent = 'Schedule Appointment';
                    
                    // Reload the page to show new appointment
                    // In a real app, you would update the UI directly
                    // location.reload();
                }, 1500);
            }
        });
    }
    
    // Specialty select to populate doctors
    const specialtySelect = document.getElementById('specialtySelect');
    const doctorSelect = document.getElementById('doctorSelect');
    
    if (specialtySelect && doctorSelect) {
        specialtySelect.addEventListener('change', function() {
            // Clear existing options
            doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
            
            // If no specialty selected, return
            if (!this.value) return;
            
            // Add doctors based on selected specialty
            const doctors = {
                cardiology: [
                    { id: 'c1', name: 'Dr. Robert Smith' },
                    { id: 'c2', name: 'Dr. Laura Chen' }
                ],
                dermatology: [
                    { id: 'd1', name: 'Dr. Sarah Johnson' },
                    { id: 'd2', name: 'Dr. Michael Brown' }
                ],
                neurology: [
                    { id: 'n1', name: 'Dr. David Wilson' },
                    { id: 'n2', name: 'Dr. Emily Davis' }
                ],
                orthopedics: [
                    { id: 'o1', name: 'Dr. James Miller' },
                    { id: 'o2', name: 'Dr. Patricia Clark' }
                ],
                pediatrics: [
                    { id: 'p1', name: 'Dr. Jessica Lee' },
                    { id: 'p2', name: 'Dr. John Anderson' }
                ],
                psychiatry: [
                    { id: 'ps1', name: 'Dr. Susan White' },
                    { id: 'ps2', name: 'Dr. Richard Moore' }
                ]
            };
            
            const selectedDoctors = doctors[this.value] || [];
            
            // Add doctor options
            selectedDoctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = doctor.name;
                doctorSelect.appendChild(option);
            });
        });
    }
    
    // Doctor select to populate available times
    const appointmentDate = document.getElementById('appointmentDate');
    const appointmentTime = document.getElementById('appointmentTime');
    
    if (appointmentDate && appointmentTime) {
        appointmentDate.addEventListener('change', function() {
            // Clear existing options
            appointmentTime.innerHTML = '<option value="">Select Time</option>';
            
            // If no date selected, return
            if (!this.value) return;
            
            // Add sample available times
            const times = [
                '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
                '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
                '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
            ];
            
            // In a real app, these would be fetched from the server based on the doctor's availability
            
            // Add time options
            times.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                appointmentTime.appendChild(option);
            });
        });
    }
    
    // Modal close buttons
    const closeBtns = document.querySelectorAll('.modal-close, .btn-cancel');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Check if a notification container exists
    let container = document.querySelector('.notification-container');
    
    // If not, create one
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('removing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Add to container
    container.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('removing');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Handle appointment actions
 */
function handleAppointment(action, id) {
    if (action === 'reschedule') {
        openModal('appointmentModal');
        showNotification('Please select a new date and time for your appointment', 'info');
    } else if (action === 'cancel') {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            showNotification('Your appointment has been cancelled', 'success');
            
            // In a real app, you would make an API call to cancel the appointment
            // and update the UI accordingly
        }
    }
}

/**
 * Show a specific page
 */
function showPage(pageId) {
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace('-', ' ');
    }
    
    // For now, we just ensure the dashboard page is active
    // In a full implementation, we would have multiple page divs and toggle them
    const contentWrapper = document.getElementById(pageId);
    if (contentWrapper) {
        document.querySelectorAll('.content-wrapper').forEach(wrapper => {
            wrapper.classList.remove('page-active');
        });
        contentWrapper.classList.add('page-active');
    } else {
        // If the page doesn't exist yet, show a message
        showNotification(`The ${pageId} page is under development`, 'info');
    }
}

/**
 * Open a modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }
}

/**
 * Close a modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
}

/**
 * Logout user
 */
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logging you out...', 'info');
        
        // Clear authentication data
        localStorage.removeItem('authToken');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '../../login/';
        }, 1000);
    }
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            // Check if Enter key was pressed
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });
    }
}

/**
 * Perform search across patient data
 */
function performSearch(query) {
    showNotification(`Searching for "${query}"...`, 'info');
    
    // Simulate search loading
    setTimeout(() => {
        // In a real app, this would search through actual data
        // For demo, we'll show a results modal
        showSearchResults(query);
    }, 500);
}

/**
 * Show search results in a modal
 */
function showSearchResults(query) {
    // Create modal if it doesn't exist
    if (!document.getElementById('searchResultsModal')) {
        const modal = document.createElement('div');
        modal.id = 'searchResultsModal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Search Results</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="search-info">
                        <p>Showing results for: <strong id="searchQuery"></strong></p>
                    </div>
                    <div id="searchResultsContainer" class="search-results-container">
                        <!-- Results will be inserted here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline btn-cancel">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to close buttons
        const closeBtns = modal.querySelectorAll('.modal-close, .btn-cancel');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                closeModal('searchResultsModal');
            });
        });
    }
    
    // Update search query display
    document.getElementById('searchQuery').textContent = query;
    
    // Generate sample results
    const resultsContainer = document.getElementById('searchResultsContainer');
    if (resultsContainer) {
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Example results - in a real app, these would be actual search results
        const sampleResults = [
            {
                type: 'medical-record',
                title: 'Annual Physical Examination',
                date: 'Jan 15, 2023',
                provider: 'Dr. Robert Smith',
                icon: 'fa-file-medical'
            },
            {
                type: 'prescription',
                title: 'Atorvastatin 20mg',
                date: 'Jan 15, 2023',
                provider: 'Dr. Robert Smith',
                icon: 'fa-prescription'
            },
            {
                type: 'lab-report',
                title: 'Complete Blood Count',
                date: 'Apr 10, 2023',
                provider: 'City Hospital',
                icon: 'fa-flask'
            },
            {
                type: 'appointment',
                title: 'Cardiology Follow-up',
                date: 'May 15, 2023',
                provider: 'Dr. Robert Smith',
                icon: 'fa-calendar-check'
            }
        ];
        
        // Filter results that might match the query (case insensitive)
        const filteredResults = sampleResults.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) || 
            result.provider.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filteredResults.length > 0) {
            // Create result items
            filteredResults.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div class="result-icon bg-${result.type === 'medical-record' ? 'info' : 
                                         result.type === 'prescription' ? 'success' : 
                                         result.type === 'lab-report' ? 'warning' : 'primary'}">
                        <i class="fas ${result.icon}"></i>
                    </div>
                    <div class="result-content">
                        <h4>${result.title}</h4>
                        <p>${result.date} | ${result.provider}</p>
                    </div>
                    <div class="result-action">
                        <button class="btn btn-sm btn-outline">View</button>
                    </div>
                `;
                
                resultsContainer.appendChild(resultItem);
                
                // Add click event to view button
                const viewBtn = resultItem.querySelector('.result-action button');
                viewBtn.addEventListener('click', function() {
                    closeModal('searchResultsModal');
                    showNotification(`Viewing ${result.title}`, 'info');
                    
                    // In a real app, this would navigate to the specific record
                    if (result.type === 'appointment') {
                        showPage('appointments');
                    } else if (result.type === 'prescription') {
                        showPage('prescriptions');
                    } else if (result.type === 'lab-report') {
                        showPage('lab-reports');
                    } else if (result.type === 'medical-record') {
                        showPage('medical-records');
                    }
                });
            });
        } else {
            // No results found
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x"></i>
                    <p>No results found for "${query}"</p>
                    <p class="suggestion">Try using different keywords or check for spelling errors.</p>
                </div>
            `;
        }
    }
    
    // Open the modal
    openModal('searchResultsModal');
}

/**
 * Initialize emergency card functionality
 */
function initEmergencyCard() {
    // Initialize card elements
    const regenerateBtn = document.getElementById('regenerateCardBtn');
    const downloadBtn = document.getElementById('downloadCardBtn');
    const accessLevelSelect = document.getElementById('accessLevelSelect');
    const cardActiveToggle = document.getElementById('cardActiveToggle');
    const cardActiveStatus = document.getElementById('cardActiveStatus');
    
    // Load emergency card data
    loadEmergencyCard();
    
    // Load access logs
    loadAccessLogs();
    
    // Setup event listeners
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', regenerateEmergencyCard);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadEmergencyCard);
    }
    
    if (accessLevelSelect) {
        accessLevelSelect.addEventListener('change', function() {
            updateCardSettings({
                accessLevel: this.value
            });
        });
    }
    
    if (cardActiveToggle) {
        cardActiveToggle.addEventListener('change', function() {
            const isActive = this.checked;
            cardActiveStatus.textContent = isActive ? 'Active' : 'Inactive';
            
            updateCardSettings({
                isActive: isActive
            });
        });
    }
}

/**
 * Load emergency card data from the API
 */
async function loadEmergencyCard() {
    // Show loading state
    const qrCodeContainer = document.getElementById('qrCode');
    if (qrCodeContainer) {
        qrCodeContainer.innerHTML = '<div class="loading-spinner"></div>';
    }
    
    // Fetch emergency card data from API
    const response = await apiRequest('/emergency-card');
    
    if (response && response.emergencyInfo) {
        // Update UI with data
        updateEmergencyCardUI({
            patientName: response.emergencyInfo.patientName,
            healthId: response.emergencyInfo.healthId,
            bloodGroup: response.emergencyInfo.bloodGroup,
            emergencyContact: response.emergencyInfo.emergencyContact,
            accessCode: response.emergencyInfo.accessCode,
            expiresAt: response.emergencyCard.expiresAt,
            qrCode: response.emergencyInfo.qrCode,
            accessLevel: response.emergencyCard.accessLevel,
            isActive: response.emergencyCard.isActive
        });
    } else {
        // Show error in QR code area
        if (qrCodeContainer) {
            qrCodeContainer.innerHTML = '<div class="error-message">Failed to load emergency card</div>';
        }
    }
}

/**
 * Update the emergency card UI with data
 */
function updateEmergencyCardUI(cardData) {
    // Update patient info
    document.getElementById('patientName').textContent = cardData.patientName;
    document.getElementById('healthId').textContent = cardData.healthId;
    document.getElementById('bloodGroup').textContent = cardData.bloodGroup;
    document.getElementById('emergencyContact').textContent = cardData.emergencyContact;
    
    // Format expiry date
    const expiryDate = new Date(cardData.expiresAt);
    document.getElementById('expiryDate').textContent = expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update QR code
    const qrCodeContainer = document.getElementById('qrCode');
    if (qrCodeContainer) {
        qrCodeContainer.innerHTML = `<img src="${cardData.qrCode}" alt="Emergency QR Code">`;
    }
    
    // Update settings
    document.getElementById('accessLevelSelect').value = cardData.accessLevel;
    document.getElementById('cardActiveToggle').checked = cardData.isActive;
    document.getElementById('cardActiveStatus').textContent = cardData.isActive ? 'Active' : 'Inactive';
    
    // Update card status
    const cardStatus = document.getElementById('cardStatus');
    if (cardStatus) {
        cardStatus.textContent = cardData.isActive ? 'Active' : 'Inactive';
        cardStatus.className = `status ${cardData.isActive ? 'active' : 'inactive'}`;
    }
}

/**
 * Load access logs from the API
 */
async function loadAccessLogs() {
    const logsBody = document.getElementById('accessLogsBody');
    if (!logsBody) return;
    
    // Show loading state
    logsBody.innerHTML = '<tr><td colspan="4" class="loading">Loading logs...</td></tr>';
    
    // Fetch access logs from API
    const logs = await apiRequest('/emergency-card/logs');
    
    if (logs && Array.isArray(logs)) {
        if (logs.length === 0) {
            logsBody.innerHTML = '<tr><td colspan="4" class="no-records">No access records found</td></tr>';
        } else {
            // Clear and populate logs
            logsBody.innerHTML = '';
            logs.forEach(log => {
                const date = new Date(log.accessedAt);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</td>
                    <td>${log.accessedBy}</td>
                    <td>${log.accessIp}</td>
                    <td>${log.notes}</td>
                `;
                logsBody.appendChild(row);
            });
        }
    } else {
        logsBody.innerHTML = '<tr><td colspan="4" class="error">Failed to load access logs</td></tr>';
    }
}

/**
 * Regenerate emergency card
 */
async function regenerateEmergencyCard() {
    if (confirm('Are you sure you want to regenerate your emergency card? This will invalidate the current card and create a new one.')) {
        // Show loading spinner
        const qrCodeContainer = document.getElementById('qrCode');
        if (qrCodeContainer) {
            qrCodeContainer.innerHTML = '<div class="loading-spinner"></div>';
        }
        
        showNotification('Regenerating your emergency card...', 'info');
        
        const response = await apiRequest('/emergency-card/regenerate', 'POST');
        
        if (response) {
            showNotification('Your emergency card has been regenerated', 'success');
            // Reload the emergency card data
            loadEmergencyCard();
        }
    }
}

/**
 * Update card settings
 */
async function updateCardSettings(settings) {
    showNotification('Updating card settings...', 'info');
    
    const response = await apiRequest('/emergency-card', 'PUT', settings);
    
    if (response) {
        showNotification('Card settings updated successfully', 'success');
        
        // Update UI status if card is deactivated/activated
        if (settings.isActive !== undefined) {
            const cardStatus = document.getElementById('cardStatus');
            if (cardStatus) {
                cardStatus.textContent = settings.isActive ? 'Active' : 'Inactive';
                cardStatus.className = `status ${settings.isActive ? 'active' : 'inactive'}`;
            }
        }
    }
}

/**
 * Download emergency card as a PDF
 */
async function downloadEmergencyCard() {
    showNotification('Preparing your emergency card for download...', 'info');
    
    // In a real implementation, we would call an API endpoint that returns a PDF
    try {
        // Simulate an API call that returns a PDF file
        const response = await fetch(`${API_BASE_URL}/emergency-card/download`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            // Convert response to blob
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'emergency_card.pdf';
            
            // Add to DOM and trigger download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Your emergency card has been downloaded', 'success');
        } else {
            throw new Error('Failed to download emergency card');
        }
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Could not download emergency card. Please try again later.', 'error');
    }
}

/**
 * Fetch user profile data
 */
async function fetchUserData() {
    const userData = await apiRequest('/auth/profile');
    if (userData) {
        // Update user info in sidebar
        document.querySelector('.user-name').textContent = userData.name || 'User';
        document.querySelector('.user-id').textContent = `Health ID: ${userData.healthId || 'N/A'}`;
        
        // Update welcome message
        const welcomeMessage = document.querySelector('.welcome-message h3');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${userData.name?.split(' ')[0] || 'User'}!`;
        }
    }
} 