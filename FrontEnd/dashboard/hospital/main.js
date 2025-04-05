// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
    initializeNotifications();
    initializeDepartments();
    initializeDoctors();
    initializePatients();
    initializeAppointments();
    initializeInventory();
    initializeReports();
    initializeSearch();
});

// Sidebar functionality
function initializeSidebar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    }, 250));
}

// Notifications system
function initializeNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    const closeBtn = notificationPanel.querySelector('.btn-icon');

    // Sample notifications data
    const notifications = [
        {
            type: 'warning',
            message: 'Low stock alert: Atorvastatin needs to be reordered',
            time: '10 minutes ago'
        },
        {
            type: 'info',
            message: 'New patient registration: John Doe',
            time: '30 minutes ago'
        },
        {
            type: 'success',
            message: 'Appointment completed: Dr. Sarah Johnson',
            time: '1 hour ago'
        }
    ];

    // Toggle notification panel
    notificationBtn.addEventListener('click', () => {
        notificationPanel.classList.toggle('active');
        updateNotifications();
    });

    // Close notification panel
    closeBtn.addEventListener('click', () => {
        notificationPanel.classList.remove('active');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationPanel.contains(e.target) && 
            !notificationBtn.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });

    // Update notifications list
    function updateNotifications() {
        const notificationsList = document.querySelector('.notifications-list');
        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.type}">
                <div class="notification-icon">
                    <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <p>${notification.message}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
            </div>
        `).join('');
    }

    // Get appropriate icon for notification type
    function getNotificationIcon(type) {
        switch (type) {
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            case 'success': return 'check-circle';
            default: return 'bell';
        }
    }
}

// Department management
function initializeDepartments() {
    const departmentsGrid = document.querySelector('.departments-grid');
    
    // Sample departments data
    const departments = [
        {
            name: 'Cardiology',
            status: 'active',
            doctors: 12,
            beds: 25,
            patients: 45
        },
        {
            name: 'Neurology',
            status: 'active',
            doctors: 8,
            beds: 20,
            patients: 35
        }
    ];

    // Update departments grid
    function updateDepartments() {
        departmentsGrid.innerHTML = departments.map(dept => `
            <div class="department-card">
                <div class="card-header">
                    <h3>${dept.name}</h3>
                    <span class="status ${dept.status}">${dept.status}</span>
                </div>
                <div class="card-details">
                    <p><i class="fas fa-user-md"></i> ${dept.doctors} Doctors</p>
                    <p><i class="fas fa-procedures"></i> ${dept.beds} Beds</p>
                    <p><i class="fas fa-user-injured"></i> ${dept.patients} Patients</p>
                </div>
                <div class="card-actions">
                    <button class="btn-outline">View Details</button>
                    <button class="btn-outline">Manage Staff</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to department actions
        document.querySelectorAll('.card-actions button').forEach(button => {
            button.addEventListener('click', handleDepartmentAction);
        });
    }

    function handleDepartmentAction(e) {
        const action = e.target.textContent.trim();
        const department = e.target.closest('.department-card').querySelector('h3').textContent;
        
        switch (action) {
            case 'View Details':
                showToast(`Viewing details for ${department}`, 'info');
                break;
            case 'Manage Staff':
                showToast(`Managing staff for ${department}`, 'info');
                break;
        }
    }

    updateDepartments();
}

// Doctor management
function initializeDoctors() {
    const doctorsGrid = document.querySelector('.doctors-grid');
    
    // Sample doctors data
    const doctors = [
        {
            name: 'Dr. Sarah Johnson',
            status: 'available',
            specialty: 'General Physician',
            department: 'Cardiology',
            appointments: 8
        },
        {
            name: 'Dr. Michael Chen',
            status: 'available',
            specialty: 'Neurologist',
            department: 'Neurology',
            appointments: 6
        }
    ];

    // Update doctors grid
    function updateDoctors() {
        doctorsGrid.innerHTML = doctors.map(doc => `
            <div class="doctor-card">
                <div class="doctor-header">
                    <h3>${doc.name}</h3>
                    <span class="status ${doc.status}">${doc.status}</span>
                </div>
                <div class="doctor-details">
                    <p><i class="fas fa-stethoscope"></i> ${doc.specialty}</p>
                    <p><i class="fas fa-hospital"></i> ${doc.department}</p>
                    <p><i class="fas fa-calendar-check"></i> ${doc.appointments} Appointments Today</p>
                </div>
                <div class="doctor-actions">
                    <button class="btn-outline">View Profile</button>
                    <button class="btn-outline">Schedule</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to doctor actions
        document.querySelectorAll('.doctor-actions button').forEach(button => {
            button.addEventListener('click', handleDoctorAction);
        });
    }

    function handleDoctorAction(e) {
        const action = e.target.textContent.trim();
        const doctor = e.target.closest('.doctor-card').querySelector('h3').textContent;
        
        switch (action) {
            case 'View Profile':
                showToast(`Viewing profile for ${doctor}`, 'info');
                break;
            case 'Schedule':
                showToast(`Viewing schedule for ${doctor}`, 'info');
                break;
        }
    }

    updateDoctors();
}

// Patient management
function initializePatients() {
    const patientsGrid = document.querySelector('.patients-grid');
    
    // Sample patients data
    const patients = [
        {
            name: 'John Doe',
            status: 'active',
            id: 'P12345',
            department: 'Cardiology',
            doctor: 'Dr. Sarah Johnson'
        },
        {
            name: 'Jane Smith',
            status: 'active',
            id: 'P12346',
            department: 'Neurology',
            doctor: 'Dr. Michael Chen'
        }
    ];

    // Update patients grid
    function updatePatients() {
        patientsGrid.innerHTML = patients.map(patient => `
            <div class="patient-card">
                <div class="patient-header">
                    <h3>${patient.name}</h3>
                    <span class="status ${patient.status}">${patient.status}</span>
                </div>
                <div class="patient-details">
                    <p><i class="fas fa-id-card"></i> ID: ${patient.id}</p>
                    <p><i class="fas fa-hospital"></i> ${patient.department}</p>
                    <p><i class="fas fa-user-md"></i> ${patient.doctor}</p>
                </div>
                <div class="patient-actions">
                    <button class="btn-outline">View Profile</button>
                    <button class="btn-outline">Medical History</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to patient actions
        document.querySelectorAll('.patient-actions button').forEach(button => {
            button.addEventListener('click', handlePatientAction);
        });
    }

    function handlePatientAction(e) {
        const action = e.target.textContent.trim();
        const patient = e.target.closest('.patient-card').querySelector('h3').textContent;
        
        switch (action) {
            case 'View Profile':
                showToast(`Viewing profile for ${patient}`, 'info');
                break;
            case 'Medical History':
                showToast(`Viewing medical history for ${patient}`, 'info');
                break;
        }
    }

    updatePatients();
}

// Appointment management
function initializeAppointments() {
    const appointmentsGrid = document.querySelector('.appointments-grid');
    
    // Sample appointments data
    const appointments = [
        {
            patient: 'John Doe',
            status: 'upcoming',
            time: '10:30 AM - 11:00 AM',
            doctor: 'Dr. Sarah Johnson',
            department: 'Cardiology'
        },
        {
            patient: 'Jane Smith',
            status: 'upcoming',
            time: '2:00 PM - 2:30 PM',
            doctor: 'Dr. Michael Chen',
            department: 'Neurology'
        }
    ];

    // Update appointments grid
    function updateAppointments() {
        appointmentsGrid.innerHTML = appointments.map(appointment => `
            <div class="appointment-card">
                <div class="appointment-header">
                    <h3>${appointment.patient}</h3>
                    <span class="status ${appointment.status}">${appointment.status}</span>
                </div>
                <div class="appointment-details">
                    <p><i class="fas fa-clock"></i> ${appointment.time}</p>
                    <p><i class="fas fa-user-md"></i> ${appointment.doctor}</p>
                    <p><i class="fas fa-hospital"></i> ${appointment.department}</p>
                </div>
                <div class="appointment-actions">
                    <button class="btn-outline">View Details</button>
                    <button class="btn-outline">Reschedule</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to appointment actions
        document.querySelectorAll('.appointment-actions button').forEach(button => {
            button.addEventListener('click', handleAppointmentAction);
        });
    }

    function handleAppointmentAction(e) {
        const action = e.target.textContent.trim();
        const patient = e.target.closest('.appointment-card').querySelector('h3').textContent;
        
        switch (action) {
            case 'View Details':
                showToast(`Viewing appointment details for ${patient}`, 'info');
                break;
            case 'Reschedule':
                showToast(`Rescheduling appointment for ${patient}`, 'info');
                break;
        }
    }

    updateAppointments();
}

// Inventory management
function initializeInventory() {
    const inventoryGrid = document.querySelector('.inventory-grid');
    
    // Sample inventory data
    const inventory = [
        {
            name: 'Atorvastatin',
            status: 'low',
            quantity: 50,
            reorder: 100,
            lastRestock: 'March 15'
        },
        {
            name: 'Amoxicillin',
            status: 'active',
            quantity: 200,
            reorder: 150,
            lastRestock: 'March 20'
        }
    ];

    // Update inventory grid
    function updateInventory() {
        inventoryGrid.innerHTML = inventory.map(item => `
            <div class="inventory-card">
                <div class="inventory-header">
                    <h3>${item.name}</h3>
                    <span class="status ${item.status}">${item.status}</span>
                </div>
                <div class="inventory-details">
                    <p><i class="fas fa-box"></i> ${item.quantity} units</p>
                    <p><i class="fas fa-exclamation-triangle"></i> Reorder at ${item.reorder}</p>
                    <p><i class="fas fa-calendar"></i> Last restocked: ${item.lastRestock}</p>
                </div>
                <div class="inventory-actions">
                    <button class="btn-outline">Order More</button>
                    <button class="btn-outline">View History</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to inventory actions
        document.querySelectorAll('.inventory-actions button').forEach(button => {
            button.addEventListener('click', handleInventoryAction);
        });
    }

    function handleInventoryAction(e) {
        const action = e.target.textContent.trim();
        const item = e.target.closest('.inventory-card').querySelector('h3').textContent;
        
        switch (action) {
            case 'Order More':
                showToast(`Ordering more ${item}`, 'info');
                break;
            case 'View History':
                showToast(`Viewing history for ${item}`, 'info');
                break;
        }
    }

    updateInventory();
}

// Reports management
function initializeReports() {
    const reportsGrid = document.querySelector('.reports-grid');
    
    // Sample reports data
    const reports = [
        {
            title: 'Monthly Patient Admissions',
            status: 'completed',
            period: 'March 2024',
            change: '15% increase',
            type: 'PDF Report'
        },
        {
            title: 'Department Performance',
            status: 'completed',
            period: 'Q1 2024',
            change: '8% improvement',
            type: 'PDF Report'
        }
    ];

    // Update reports grid
    function updateReports() {
        reportsGrid.innerHTML = reports.map(report => `
            <div class="report-card">
                <div class="report-header">
                    <h3>${report.title}</h3>
                    <span class="status ${report.status}">${report.status}</span>
                </div>
                <div class="report-details">
                    <p><i class="fas fa-calendar"></i> ${report.period}</p>
                    <p><i class="fas fa-chart-line"></i> ${report.change}</p>
                    <p><i class="fas fa-file-pdf"></i> ${report.type}</p>
                </div>
                <div class="report-actions">
                    <button class="btn-outline">View Report</button>
                    <button class="btn-outline">Download</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to report actions
        document.querySelectorAll('.report-actions button').forEach(button => {
            button.addEventListener('click', handleReportAction);
        });
    }

    function handleReportAction(e) {
        const action = e.target.textContent.trim();
        const report = e.target.closest('.report-card').querySelector('h3').textContent;
        
        switch (action) {
            case 'View Report':
                showToast(`Viewing ${report}`, 'info');
                break;
            case 'Download':
                showToast(`Downloading ${report}`, 'info');
                break;
        }
    }

    updateReports();
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-bar input');
    
    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) return;

        // Search across all sections
        const sections = [
            '.departments-grid',
            '.doctors-grid',
            '.patients-grid',
            '.appointments-grid',
            '.inventory-grid',
            '.reports-grid'
        ];

        sections.forEach(section => {
            const cards = document.querySelectorAll(`${section} .card`);
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
    }, 300));
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
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