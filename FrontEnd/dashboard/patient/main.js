// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive elements
    initializeSidebar();
    initializeNotifications();
    initializeCharts();
    initializeAppointments();
    initializePrescriptions();
    initializeTreatmentPlans();
    initializeReminders();
    initializeSearchFunctionality();
});

// Sidebar Functionality
function initializeSidebar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('expanded');
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
}

// Charts and Analytics
function initializeCharts() {
    // Health Metrics Chart
    const healthCtx = document.getElementById('healthChart');
    if (healthCtx) {
        new Chart(healthCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Heart Rate',
                    data: [72, 75, 70, 68, 73, 71, 69],
                    borderColor: '#DC3545',
                    tension: 0.4
                }, {
                    label: 'Blood Pressure',
                    data: [120, 118, 122, 119, 121, 120, 119],
                    borderColor: '#28A745',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Medication Adherence Chart
    const medicationCtx = document.getElementById('medicationChart');
    if (medicationCtx) {
        new Chart(medicationCtx, {
            type: 'doughnut',
            data: {
                labels: ['Taken', 'Missed', 'Scheduled'],
                datasets: [{
                    data: [85, 10, 5],
                    backgroundColor: ['#28A745', '#DC3545', '#FFC107']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Notifications System
function initializeNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPanel.classList.toggle('active');
            updateNotifications();
        });

        // Close notifications panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationPanel.contains(e.target)) {
                notificationPanel.classList.remove('active');
            }
        });
    }
}

// Update notifications with real-time data
function updateNotifications() {
    const notifications = [
        {
            type: 'info',
            title: 'Appointment Reminder',
            message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM',
            time: '2 hours ago'
        },
        {
            type: 'success',
            title: 'Prescription Ready',
            message: 'Your prescription for Atorvastatin is ready for pickup',
            time: '1 day ago'
        },
        {
            type: 'alert',
            title: 'Test Results Available',
            message: 'Your recent blood test results are now available',
            time: '2 days ago'
        }
    ];

    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.type}">
                <div class="notification-icon">
                    <i class="fas ${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="time">${notification.time}</span>
                </div>
            </div>
        `).join('');
    }
}

// Get appropriate icon for notification type
function getNotificationIcon(type) {
    const icons = {
        alert: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-bell';
}

// Appointments Management
function initializeAppointments() {
    const appointmentCards = document.querySelectorAll('.appointment-card');
    
    appointmentCards.forEach(card => {
        const rescheduleBtn = card.querySelector('.btn-outline:first-child');
        const cancelBtn = card.querySelector('.btn-outline:last-child');

        if (rescheduleBtn) {
            rescheduleBtn.addEventListener('click', () => {
                showRescheduleModal(card.dataset.appointmentId);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                showCancelModal(card.dataset.appointmentId);
            });
        }
    });
}

// Show reschedule modal
function showRescheduleModal(appointmentId) {
    // Implementation for reschedule modal
    showToast('Reschedule request initiated', 'info');
}

// Show cancel modal
function showCancelModal(appointmentId) {
    // Implementation for cancel modal
    showToast('Cancel request initiated', 'warning');
}

// Prescriptions Management
function initializePrescriptions() {
    const prescriptionCards = document.querySelectorAll('.prescription-card');
    
    prescriptionCards.forEach(card => {
        const viewBtn = card.querySelector('.btn-outline:first-child');
        const refillBtn = card.querySelector('.btn-outline:last-child');

        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                showPrescriptionDetails(card.dataset.prescriptionId);
            });
        }

        if (refillBtn) {
            refillBtn.addEventListener('click', () => {
                requestRefill(card.dataset.prescriptionId);
            });
        }
    });
}

// Show prescription details
function showPrescriptionDetails(prescriptionId) {
    // Implementation for prescription details
    console.log(`Showing details for prescription ${prescriptionId}`);
}

// Request prescription refill
function requestRefill(prescriptionId) {
    // Implementation for refill request
    showToast('Refill request submitted', 'success');
}

// Treatment Plans Management
function initializeTreatmentPlans() {
    const planCards = document.querySelectorAll('.treatment-plan-card');
    
    planCards.forEach(card => {
        const viewBtn = card.querySelector('.btn-outline');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                showPlanDetails(card.dataset.planId);
            });
        }
    });
}

// Show treatment plan details
function showPlanDetails(planId) {
    // Implementation for plan details
    console.log(`Showing details for plan ${planId}`);
}

// Reminders Management
function initializeReminders() {
    const reminderCards = document.querySelectorAll('.reminder-card');
    
    reminderCards.forEach(card => {
        const completeBtn = card.querySelector('.btn-outline:first-child');
        const snoozeBtn = card.querySelector('.btn-outline:last-child');

        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                markReminderComplete(card.dataset.reminderId);
            });
        }

        if (snoozeBtn) {
            snoozeBtn.addEventListener('click', () => {
                snoozeReminder(card.dataset.reminderId);
            });
        }
    });
}

// Mark reminder as complete
function markReminderComplete(reminderId) {
    // Implementation for marking reminder complete
    showToast('Reminder marked as complete', 'success');
}

// Snooze reminder
function snoozeReminder(reminderId) {
    // Implementation for snoozing reminder
    showToast('Reminder snoozed for 1 hour', 'info');
}

// Search Functionality
function initializeSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.toLowerCase();
            performSearch(searchTerm);
        }, 300));
    }
}

// Perform search across dashboard
function performSearch(searchTerm) {
    // Implementation for search functionality
    console.log(`Searching for: ${searchTerm}`);
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Get appropriate icon for toast type
function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Utility function for debouncing
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

// Handle window resize events
window.addEventListener('resize', debounce(() => {
    // Adjust layout for different screen sizes
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth > 768) {
        sidebar?.classList.remove('active');
        mainContent?.classList.remove('expanded');
    }
}, 250)); 