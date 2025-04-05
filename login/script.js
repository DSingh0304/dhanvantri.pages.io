document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const API_BASE_URL = 'https://api.ysinghc.me/v1';
    
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
        loginForm.addEventListener('submit', async function(e) {
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
            
            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Signing in...';
            submitButton.disabled = true;
            
            try {
                // Make API call to login
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        userType
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed. Please check your credentials.');
                }
                
                // Store auth token in localStorage
                localStorage.setItem('authToken', data.token);
                
                // Store user info
                const storage = rememberMe ? localStorage : sessionStorage;
                const userInfo = {
                    email: email,
                    userType: userType,
                    userId: data.user._id,
                    name: data.user.name,
                    healthId: data.user.healthId,
                    isLoggedIn: true
                };
                
                storage.setItem('userInfo', JSON.stringify(userInfo));
                
                // Show success message
                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to appropriate dashboard
                setTimeout(() => {
                    redirectToDashboard(userType);
                }, 1000);
            } catch (error) {
                console.error('Login error:', error);
                showMessage(error.message || 'Login failed. Please try again.', 'error');
                
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
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
            const email = document.getElementById('email').value;
            
            if (!email) {
                showMessage('Please enter your email address first', 'error');
                return;
            }
            
            // Show loading/pending message
            showMessage('Processing your password reset request...', 'info');
            
            // Make API call to request password reset
            fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Password reset email sent. Please check your inbox.', 'success');
                } else {
                    showMessage(data.message || 'Failed to send reset email. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Password reset error:', error);
                showMessage('Failed to process reset request. Please try again later.', 'error');
            });
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
        const authToken = localStorage.getItem('authToken');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        
        if (authToken && userInfo.isLoggedIn) {
            // Verify token validity with the server
            fetch(`${API_BASE_URL}/auth/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
            .then(response => {
                if (response.ok) {
                    // Token is valid, redirect to dashboard
                    redirectToDashboard(userInfo.userType);
                } else {
                    // Token is invalid, clear storage
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userInfo');
                    sessionStorage.removeItem('userInfo');
                }
            })
            .catch(error => {
                console.error('Token verification error:', error);
                // On network error, we'll still try to use the cached session
                // This allows offline login if previously logged in
                redirectToDashboard(userInfo.userType);
            });
        }
    }
    
    // Check login status on page load
    checkLoginStatus();
}); 