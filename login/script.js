document.addEventListener('DOMContentLoaded', function() {
    // User Type Selector
    const userTypeButtons = document.querySelectorAll('.user-type-btn');
    const patientLink = document.querySelector('.patient-link');
    const doctorLink = document.querySelector('.doctor-link');
    const hospitalLink = document.querySelector('.hospital-link');
    const loginForm = document.getElementById('loginForm');
    
    userTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            userTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show/hide appropriate registration links based on selected user type
            const userType = this.getAttribute('data-type');
            
            // Hide all registration links
            patientLink.classList.add('hidden');
            doctorLink.classList.add('hidden');
            hospitalLink.classList.add('hidden');
            
            // Show the appropriate registration link
            if (userType === 'patient') {
                patientLink.classList.remove('hidden');
            } else if (userType === 'doctor') {
                doctorLink.classList.remove('hidden');
            } else if (userType === 'hospital') {
                hospitalLink.classList.remove('hidden');
            }
            
            // Update form action or other attributes if needed
            loginForm.setAttribute('data-user-type', userType);
        });
    });
    
    // Toggle Password Visibility
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            // Toggle password visibility
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle the eye icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Form Validation and Submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const userType = this.getAttribute('data-user-type') || 'patient';
            const rememberMe = document.getElementById('remember').checked;
            
            // Simple validation
            if (!email || !password) {
                showMessage('Please enter both email and password', 'error');
                return;
            }
            
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }
            
            // In a real application, you would send this data to the server
            // For demonstration, we'll simulate login and redirect
            
            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Signing in...';
            submitButton.disabled = true;
            
            // Simulate API call with timeout
            setTimeout(function() {
                // Store user info in sessionStorage or localStorage based on remember me
                const storage = rememberMe ? localStorage : sessionStorage;
                const userInfo = {
                    email: email,
                    userType: userType,
                    isLoggedIn: true
                };
                
                storage.setItem('userInfo', JSON.stringify(userInfo));
                
                // Redirect to appropriate dashboard
                redirectToDashboard(userType);
                
                // Reset button state (though page will redirect)
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500); // 1.5 seconds delay to simulate server request
        });
    }
    
    // Government ID Login Button
    const govtIdButton = document.querySelector('.govt-id-btn');
    
    if (govtIdButton) {
        govtIdButton.addEventListener('click', function() {
            // In a real application, this would trigger a modal or redirect to a govt ID verification page
            showMessage('Government ID login feature coming soon', 'info');
        });
    }
    
    // Forgot Password Link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real application, this would show a password reset form or redirect to a reset page
            showMessage('Password reset feature coming soon', 'info');
        });
    }
    
    // Helper Functions
    function showMessage(message, type = 'info') {
        // Check if a message container already exists
        let messageContainer = document.querySelector('.message-container');
        
        // If not, create one
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';
            document.querySelector('.login-form').prepend(messageContainer);
        }
        
        // Create the message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-message';
        closeBtn.onclick = function() {
            messageElement.remove();
        };
        messageElement.appendChild(closeBtn);
        
        // Add the message to the container
        messageContainer.appendChild(messageElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
        
        // Add styles for messages if not already present
        if (!document.getElementById('message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                .message-container {
                    margin-bottom: 20px;
                }
                .message {
                    padding: 10px 15px;
                    margin-bottom: 10px;
                    border-radius: var(--border-radius-sm);
                    position: relative;
                    animation: slideIn 0.3s ease forwards;
                }
                @keyframes slideIn {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .message.error {
                    background-color: #FFEBEE;
                    color: var(--error-color);
                    border-left: 3px solid var(--error-color);
                }
                .message.info {
                    background-color: #E3F2FD;
                    color: var(--info-color);
                    border-left: 3px solid var(--info-color);
                }
                .message.success {
                    background-color: #E8F5E9;
                    color: var(--success-color);
                    border-left: 3px solid var(--success-color);
                }
                .close-message {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    font-size: 16px;
                    opacity: 0.7;
                }
                .close-message:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function redirectToDashboard(userType) {
        // Redirect to appropriate dashboard based on user type
        switch(userType) {
            case 'patient':
                window.location.href = '../dashboard/patient/index.html';
                break;
            case 'doctor':
                window.location.href = '../dashboard/doctor/index.html';
                break;
            case 'hospital':
                window.location.href = '../dashboard/hospital/index.html';
                break;
            default:
                window.location.href = '../dashboard/patient/index.html';
        }
    }
    
    // Check if user is already logged in
    function checkLoginStatus() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        
        if (userInfo.isLoggedIn) {
            // User is already logged in, redirect to their dashboard
            redirectToDashboard(userInfo.userType);
        }
    }
    
    // Check login status on page load
    checkLoginStatus();
}); 