document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard functionality
    initSidebar();
    initNotifications();
    initCharts();
    initTabNavigation();
    initEventListeners();
    initSearch();
    initEmergencyCard();
    
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
function initNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    
    if (notificationBtn && notificationPanel) {
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
            markReadBtn.addEventListener('click', function() {
                notificationPanel.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                });
                
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
 * Initialize charts
 */
function initCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not available. Charts will not be rendered.');
        return;
    }
    
    // Blood Pressure Chart
    const bpChartEl = document.getElementById('bloodPressureChart');
    if (bpChartEl) {
        const bpChart = new Chart(bpChartEl, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Systolic',
                        data: [120, 125, 118, 129, 122, 120],
                        borderColor: '#1976D2',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: 'Diastolic',
                        data: [80, 85, 78, 82, 81, 79],
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
    if (weightChartEl) {
        const weightChart = new Chart(weightChartEl, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [75, 74, 73.5, 72, 71.5, 72],
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
                            text: 'kg'
                        }
                    }
                }
            }
        });
    }
    
    // Blood Sugar Chart
    const sugarChartEl = document.getElementById('bloodSugarChart');
    if (sugarChartEl) {
        const sugarChart = new Chart(sugarChartEl, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Blood Sugar (mg/dL)',
                    data: [95, 105, 98, 92, 97, 94],
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
                            text: 'mg/dL'
                        }
                    }
                }
            }
        });
    }
    
    // Time range select event
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            // Here you would fetch new data based on the selected time range
            // For demo purposes, we'll just show a notification
            showNotification(`Data updated for ${this.options[this.selectedIndex].text}`, 'info');
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
        
        // Simulate logout process
        setTimeout(() => {
            // In a real app, this would clear the session/token and redirect
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
function loadEmergencyCard() {
    // Show loading state
    const qrCodeContainer = document.getElementById('qrCode');
    if (qrCodeContainer) {
        qrCodeContainer.innerHTML = '<div class="loading-spinner"></div>';
    }
    
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate the API response
    setTimeout(() => {
        // Simulate API response
        const cardData = {
            patientName: 'John Doe',
            healthId: 'ABCD1234',
            bloodGroup: 'O+',
            emergencyContact: '+1 (555) 123-4567',
            accessCode: 'EM-12345678',
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
            qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAXNSR0IArs4c6QAACJtJREFUeF7t3dFy2zgMBWB0nTRNmr3//7+26d54OvJEG4IgQMqyKexL7RjEBXBISbGd169fv359+SMCJyHwIqCcRHIXv4CAcnwnIiCgTkTyG7cgoJzfiQgIqBOR/MYtCCjndyICAupEJL9xC4+b358/f37J93pOE3h7e7tdC1++fNnO49On/z9PU6Du9gT+AuqT6u3t7cvr6+vXrQB+//79E7Pbrv8XUCcF3Zyof//+vVn1/Py8Cfrp6el2HH/gZ0t/KjeiylOZRCB3PL8JqAmqDAL+5GKyN0Wx7uSIGv3JAfWKbYe/AuokzCqUEZ5YTCaXi3+yjDL+BFQJTQkc0mQZlvQjwlNuiQSohYgRns/Pz+cCKgIKiLhEYo6UE2ZOWL0bz8X5VJRPpqB0SbVKm5nKbdYFVDSicvJb1RAL8gXQ3ONf5VKAKUBF4XJ13mLVZd5UgiSgIpRV03RHrADIZTNXaXMQ9o6/gIrDXZ+qeXnrEY9lWVxQxfCTc0HVq1QVVLLx0fIIyPJPFEIZz+W/J0DFiqKi7C2P0JD4jlD5dBqTn4uYyykTpb6AKipNFThJ7wW/SqQiPCWnQigvNZKA2hmhAhYXTZVEOcr1EuhcAjnYnVw5e+1cXK+A2pFHRVdAZeHbQTDknyQoLSO66lsujfCYgKrWvQKqWqSMCAGE0HFRA3gVP84rAuojdDuVnksjRDNrjnNX55zLLn4VRE1AJZUeB0J8HmcCqopF1R9FsYmyB1SuABH3V9Xa+5/zTtPmNiBJglwV1LgPUM6vFNXq79LxKUcNMQJKQazbqvZ+nEXbEI+FVCqD2NHF4QOgcsWGP/x9FNUCauOUChwEUE53AhL/JIIBEOLvcX47VQEVq0MA5fJrIzrEnzmYsWiJvHo0p5VTOXFGRHXFtGwbQZGLuA1/WI4g+F5HS3kmoDZCqLphcUvBFBA5mrhsJkc4ioECcLVBtvpnrjt+ZK6Aigi2gyQPLApU2SrAWiqnM+uNcSg6E4hZ1bQyoEMnHE0gVXZGHhDcACgcRGnkCZeHU3NDJM0Cg1A/FiAeN+xJQM0EynLOsq5cQ3EBQimiKcB8dGkLuErHpxyVF0DFKvFoSaPTCqh5u5PVFQGoIjOhkXkEaCYAQ67Ck3ELorF9/AooBhBUlJHLtQ1HVCEAlKcUJD+3Pp9Jju6tRE1AFSuXNVLiJy2Y5H7Uwrms8t65JxBJGX7EPTF0/UqlqYBK7sSlE0o5gooQLa8c/7wUslQBypwMPnFtBakJqHQxmvJT4rMO7Oe/BYDNaQyQKjcsCyJrVPuZ9bLG5Oeo8AkR7dzuYQ7uAorTW5pULTlwJ4AQMquBXvZkb5yBKo47oIrnGk2+gCpoUckBFJZn5LgcEXKvwEmYQi6vURFGg3BqvfGvgCruW1FGucnGFU5ixzm8sMXgPDNHpdSGGJmgFYVPQG1Qyk50vshc/Ys+zt0IIw2Z1KAOEARGnvjc1bCxN6CWTYA0s60o89UcBJMXUxZheTRRY0yPgGp6qwYnYZ5Gdc87fwFV3KXCbAJWb8RYuucK62hOTY7/7EAuFDf8xcfVCRU3A/hZQCUpqVJVaQD8gkhyApXjkQiGkq/xjNQmZfgw5E6nnMVdcQu+AqrYWMPpdnXDggtI+jxChFG1/2XOZPyMT55HiDMAIbSQQ0AldcaGO5YnuQRB9eaeUDZmIeeFVDUt77V7iJ/qqVB7PXP0/QKq2A4Y7o9LpuQe3EYwNsjO91cQQvCYl+bQ/KrGXD0blq8TQr3mAqraN1OIFGVXnDRQUHJ4CwDCKM+O+/gFVFFuWCzJwmLnIHQ7xITSc/nj7k1CqKK6sU1AJRJfLRsQJQGDUMkVWY5sAYBzqvUCqiXlOZ4UFu7JBawcofgZVXQKHFR5qPqq2a/uJ6CGMM3aeYSn3mhnk+lx1rTyFOVWF1AwE1AdOvK+KLxqUa3Qs/N1AoGiRkC1gHpHXrnL6V1GXS/iNE5cQJ2JLrUmBZYz4CwI+IzIrjLzs4v4G8k8uY7aE1CJiACSbsBhG9Mh8yPyq5aAHbMH8+Hv2Sc9CqgWvZkT2ZH3s3wEVAZClfcJTI2yXp3zVeQF1D8+o1PZebyq6uKdlQKqSp0e9xNQPfh1zCqgOoLXsSug8nX4iU3pezZ+2WNmXcXP7D0dL/PgZ95rZ89/O0BF5YQyOcKyI7KGUNUJeX9OWP4DjM8dL9q9w4lngFcO5fF+7s93nO/tXD4aULLZrjU4qqg6z7rRIvn1HXYcVEpA7Yx0Bxw5v66/8r4Bl3PqLcv69OvE+v/H/HUDlMrNd7iRvLNUufLtbLx0zFsn+S7+R59Vz/E+Yzj3S4qj4z38/PVvTqhEiY5+8h2hzc/4X45cAZUu+bqvKt9Zvvt/VxBknoVYnEP/v3zfAWr+yyRnF9XdRbmK5e5Rh5FYnG/3Pd+i0gNQZzzJgQJ1lj7Pws+3Wgmo/69XwkR+aqBZQubLwNbzfCPbw0U8t8VIg94+z6+DfbiqDyMqcYGTUu/t8y3x8TBBWVU1iszOEv8xgQIijCAqK3lh3W8BZaRjpEmevGJJQ3xmyXV6oGJeqXLJqm8hEr9ZCDCYIjDkX+YzfdXXMzHPdG7FgfOZ5kxJzGZA3KtXOpkxTgcU4bCqGZ/8sMD/8WPeE6Eu/yJDDvrQxezwqzM38iQ1rlK1TgkUE9Nt83qOj8KmT1LzexsgF7zfE6SzwBsNKILCGMlbUPeQY5t3FYiuDHI2uNMB5eQjN4LdAckEYFRw7voFdJe3bEQ9AlvtKcOzdnkEJL0doCYEfOwJAqc+ocWbM15PQXgEQH8AGAUJFwDW0zAAAAAASUVORK5CYII=',
            accessLevel: 'basic',
            isActive: true
        };
        
        // Update UI with data
        updateEmergencyCardUI(cardData);
    }, 1000);
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
function loadAccessLogs() {
    const logsBody = document.getElementById('accessLogsBody');
    if (!logsBody) return;
    
    // Show loading state
    logsBody.innerHTML = '<tr><td colspan="4" class="loading">Loading logs...</td></tr>';
    
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate the API response
    setTimeout(() => {
        // Sample logs data
        const logs = [
            {
                accessedAt: '2023-05-01T14:23:15Z',
                accessedBy: 'Emergency Medical Services',
                accessIp: '192.168.1.10',
                notes: 'Emergency situation assessment'
            },
            {
                accessedAt: '2023-04-15T09:10:45Z',
                accessedBy: 'Dr. Sarah Johnson',
                accessIp: '10.0.0.155',
                notes: 'Pre-operative verification'
            }
        ];
        
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
    }, 1500);
}

/**
 * Regenerate emergency card
 */
function regenerateEmergencyCard() {
    if (confirm('Are you sure you want to regenerate your emergency card? This will invalidate the current card and create a new one.')) {
        // Show loading spinner
        const qrCodeContainer = document.getElementById('qrCode');
        if (qrCodeContainer) {
            qrCodeContainer.innerHTML = '<div class="loading-spinner"></div>';
        }
        
        showNotification('Regenerating your emergency card...', 'info');
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate the API response
        setTimeout(() => {
            // Load the new card data
            loadEmergencyCard();
            showNotification('Your emergency card has been regenerated', 'success');
        }, 1500);
    }
}

/**
 * Update card settings
 */
function updateCardSettings(settings) {
    showNotification('Updating card settings...', 'info');
    
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate the API response
    setTimeout(() => {
        showNotification('Card settings updated successfully', 'success');
        
        // Update UI status if card is deactivated/activated
        if (settings.isActive !== undefined) {
            const cardStatus = document.getElementById('cardStatus');
            if (cardStatus) {
                cardStatus.textContent = settings.isActive ? 'Active' : 'Inactive';
                cardStatus.className = `status ${settings.isActive ? 'active' : 'inactive'}`;
            }
        }
    }, 800);
}

/**
 * Download emergency card as a PDF
 */
function downloadEmergencyCard() {
    showNotification('Preparing your emergency card for download...', 'info');
    
    // In a real app, this would generate and download a PDF
    // For demo purposes, we'll just simulate the process
    setTimeout(() => {
        showNotification('Your emergency card is ready for download', 'success');
    }, 1200);
} 