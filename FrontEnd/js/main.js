// Mobile Menu Toggle
let isMobileMenuOpen = false;

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const navButtons = document.querySelector('.nav-buttons');
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (isMobileMenuOpen) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.backgroundColor = 'var(--white)';
        navLinks.style.padding = '1rem';
        navLinks.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        
        navButtons.style.display = 'flex';
        navButtons.style.flexDirection = 'column';
        navButtons.style.gap = '0.5rem';
        navButtons.style.padding = '1rem';
        navButtons.style.backgroundColor = 'var(--white)';
    } else {
        navLinks.style.display = '';
        navButtons.style.display = '';
    }
}

// Modal Handling
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function openRegistrationModal(userType) {
    const modal = document.getElementById('registrationModal');
    const userTypeSpan = document.getElementById('regUserType');
    userTypeSpan.textContent = userType.charAt(0).toUpperCase() + userType.slice(1);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Form Handling
function handleLogin(event) {
    event.preventDefault();
    const userType = document.getElementById('userType').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Here you would typically make an API call to your backend
    console.log('Login attempt:', { userType, email, password });
    
    // Simulate successful login
    alert('Login successful! Redirecting to dashboard...');
    closeLoginModal();
}

function handleRegistration(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const userType = document.getElementById('regUserType').textContent.toLowerCase();

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Here you would typically make an API call to your backend
    console.log('Registration attempt:', { userType, name, email, password });
    
    // Simulate successful registration
    alert('Registration successful! Please check your email for verification.');
    closeRegistrationModal();
}

function handleForgotPassword() {
    const email = document.getElementById('email').value;
    if (!email) {
        alert('Please enter your email address first.');
        return;
    }

    // Here you would typically make an API call to your backend
    console.log('Password reset requested for:', email);
    
    // Simulate successful request
    alert('If an account exists with this email, you will receive password reset instructions.');
}

// Smooth Scrolling
function scrollToRegistration() {
    const registrationSection = document.getElementById('registration');
    registrationSection.scrollIntoView({ behavior: 'smooth' });
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registrationModal = document.getElementById('registrationModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === registrationModal) {
        closeRegistrationModal();
    }
}

// Handle mobile menu on resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isMobileMenuOpen) {
        const navLinks = document.querySelector('.nav-links');
        const navButtons = document.querySelector('.nav-buttons');
        
        navLinks.style.display = '';
        navButtons.style.display = '';
        isMobileMenuOpen = false;
    }
}); 