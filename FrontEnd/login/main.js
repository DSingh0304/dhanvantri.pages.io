// DOM Elements
const userTypeButtons = document.querySelectorAll('.user-type-btn');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.querySelector('.toggle-password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const forgotPasswordLink = document.querySelector('.forgot-password');
const loadingOverlay = document.querySelector('.loading-overlay');
const toastContainer = document.querySelector('.toast-container');

// User Type Selection
userTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
        userTypeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Toggle Password Visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.classList.toggle('fa-eye');
    togglePasswordBtn.classList.toggle('fa-eye-slash');
});

// Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!validateForm()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Show loading overlay
    showLoading();

    try {
        // Simulate API call
        await simulateLogin();
        
        // Show success message
        showToast('Login successful! Redirecting...', 'success');
        
        // Store remember me preference
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberEmail', emailInput.value);
        } else {
            localStorage.removeItem('rememberEmail');
        }

        // Redirect after successful login (replace with actual redirect)
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
});

// Forgot Password Handler
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    showLoading();
    
    try {
        // Simulate password reset request
        await simulatePasswordReset(email);
        showToast('Password reset instructions sent to your email', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
});

// Form Validation
function validateForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        return false;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }
    
    return true;
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Loading Overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// API Simulation
function simulateLogin() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Simulate authentication logic
            if (email === 'test@example.com' && password === 'password') {
                resolve();
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1000);
    });
}

function simulatePasswordReset(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

// Remember Me Functionality
document.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeCheckbox.checked = true;
    }
}); 