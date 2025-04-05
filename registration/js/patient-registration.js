// Base API URL
const API_BASE_URL = 'https://api.ysinghc.me/api/v1';

// DOM Elements
const progressSteps = document.querySelectorAll('.progress-step');
const formSteps = document.querySelectorAll('.form-step');
const nextButtons = document.querySelectorAll('.next-step');
const prevButtons = document.querySelectorAll('.prev-step');
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const strengthBar = document.querySelector('.strength-bar');
const registrationForm = document.getElementById('patientRegistrationForm');
const verificationType = document.querySelectorAll('input[name="verificationType"]');
const govtIdVerificationFields = document.getElementById('govtIdVerificationFields');
const mobileVerificationFields = document.getElementById('mobileVerificationFields');
const sendOtpButton = document.querySelector('.send-otp-button');
const verifyOtpButton = document.querySelector('.verify-otp-button');
const otpGroup = document.querySelector('.otp-group');
const otpInputs = document.querySelectorAll('.otp-input');
const submitButton = document.querySelector('.submit-btn');

// Initialize form behavior
document.addEventListener('DOMContentLoaded', function() {
    initFormSteps();
    initPasswordToggle();
    initPasswordStrength();
    initVerificationToggle();
    initOtpInputs();
    
    // Handle form submission
    registrationForm.addEventListener('submit', handleFormSubmit);
});

// Form steps navigation
function initFormSteps() {
    // Next buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.dataset.next) - 1;
            const nextStep = parseInt(this.dataset.next);
            
            if (validateStep(currentStep)) {
                goToStep(nextStep);
            }
        });
    });
    
    // Previous buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = parseInt(this.dataset.prev);
            goToStep(prevStep);
        });
    });
}

// Go to specified form step
function goToStep(stepNumber) {
    // Update form steps
    formSteps.forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`.form-step[data-step="${stepNumber}"]`).classList.add('active');
    
    // Update progress indicators
    progressSteps.forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum < stepNumber) {
            step.classList.add('completed');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
        }
    });
    
    // Scroll to top of form
    document.querySelector('.registration-section').scrollTo(0, 0);
}

// Toggle password visibility
function initPasswordToggle() {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}

// Password strength meter
function initPasswordStrength() {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Update strength bar
        strengthBar.style.width = `${strength}%`;
        
        // Change color based on strength
        if (strength < 33) {
            strengthBar.style.backgroundColor = '#ff4d4d'; // Red
        } else if (strength < 66) {
            strengthBar.style.backgroundColor = '#ffb84d'; // Orange
        } else {
            strengthBar.style.backgroundColor = '#4CAF50'; // Green
        }
    });
}

// Calculate password strength (0-100)
function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length contribution (up to 30%)
    strength += Math.min(30, Math.floor(password.length * 3));
    
    // Character variety contribution (up to 70%)
    if (/[A-Z]/.test(password)) strength += 15; // Uppercase
    if (/[a-z]/.test(password)) strength += 10; // Lowercase
    if (/[0-9]/.test(password)) strength += 20; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 25; // Special characters
    
    return Math.min(100, strength);
}

// Initialize verification method toggle
function initVerificationToggle() {
    verificationType.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'govtId') {
                govtIdVerificationFields.classList.remove('hidden');
                mobileVerificationFields.classList.add('hidden');
            } else if (this.value === 'mobile') {
                govtIdVerificationFields.classList.add('hidden');
                mobileVerificationFields.classList.remove('hidden');
                
                // Set the mobile number field value to match the phone number entered in step 2
                const phoneNumber = document.getElementById('phone').value;
                document.getElementById('mobileVerifyNumber').value = phoneNumber;
            }
        });
    });
    
    // Initialize OTP sending and verification
    if (sendOtpButton) {
        sendOtpButton.addEventListener('click', sendOTP);
    }
    
    if (verifyOtpButton) {
        verifyOtpButton.addEventListener('click', verifyOTP);
    }
}

// Initialize OTP input field behavior
function initOtpInputs() {
    otpInputs.forEach((input, index) => {
        // Handle input
        input.addEventListener('input', function() {
            if (this.value.length === 1) {
                // Auto-focus next input
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });
        
        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value) {
                // Focus previous input when backspace is pressed on empty input
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
        
        // Handle paste
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').trim();
            
            if (/^\d+$/.test(pasteData) && pasteData.length <= otpInputs.length) {
                // Fill OTP inputs with pasted digits
                for (let i = 0; i < pasteData.length; i++) {
                    if (index + i < otpInputs.length) {
                        otpInputs[index + i].value = pasteData[i];
                    }
                }
                
                // Focus the next empty input or the last input
                const nextIndex = Math.min(index + pasteData.length, otpInputs.length - 1);
                otpInputs[nextIndex].focus();
            }
        });
    });
}

// Send OTP for mobile verification
function sendOTP() {
    const phoneNumber = document.getElementById('mobileVerifyNumber').value;
    
    if (!phoneNumber || !validatePhone(phoneNumber)) {
        showValidationError(document.getElementById('mobileVerifyNumber'), 'Please enter a valid phone number');
        return;
    }
    
    // Show loading state
    sendOtpButton.disabled = true;
    sendOtpButton.textContent = 'Sending...';
    
    // Simulate API call to send OTP (replace with actual API call)
    setTimeout(() => {
        // Show OTP input fields
        otpGroup.classList.remove('hidden');
        
        // Start OTP timer
        startOtpTimer();
        
        // Reset button
        sendOtpButton.disabled = false;
        sendOtpButton.textContent = 'Resend OTP';
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'verification-success';
        successMessage.innerHTML = '<i class="fas fa-check-circle"></i> OTP sent successfully!';
        
        const container = document.getElementById('mobileVerificationFields');
        const existingMessage = container.querySelector('.verification-success');
        if (existingMessage) existingMessage.remove();
        
        container.insertBefore(successMessage, otpGroup);
        
        // Focus the first OTP input
        otpInputs[0].focus();
    }, 1500);
}

// Start OTP timer countdown
function startOtpTimer() {
    const timerElement = document.getElementById('otpTimer');
    let timeLeft = 60;
    
    timerElement.textContent = timeLeft;
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            sendOtpButton.disabled = false;
        } else {
            sendOtpButton.disabled = true;
        }
    }, 1000);
}

// Verify entered OTP
function verifyOTP() {
    let otpValue = '';
    
    // Collect OTP from inputs
    otpInputs.forEach(input => {
        otpValue += input.value;
    });
    
    if (otpValue.length !== 6 || !/^\d+$/.test(otpValue)) {
        showValidationError(otpInputs[0], 'Please enter a valid 6-digit OTP');
        return;
    }
    
    // Show loading state
    verifyOtpButton.disabled = true;
    verifyOtpButton.textContent = 'Verifying...';
    
    // Simulate API call to verify OTP (replace with actual API call)
    setTimeout(() => {
        // For this demo, consider OTP 123456 as valid
        if (otpValue === '123456') {
            // Show success
            const successMessage = document.createElement('div');
            successMessage.className = 'verification-success';
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Mobile verified successfully!';
            
            const container = document.getElementById('mobileVerificationFields');
            container.innerHTML = '';
            container.appendChild(successMessage);
            
            // Enable submit button
            document.querySelector('.submit-btn').disabled = false;
        } else {
            // Show error
            showValidationError(otpInputs[0], 'Invalid OTP. Please try again.');
            
            // Reset button
            verifyOtpButton.disabled = false;
            verifyOtpButton.textContent = 'Verify OTP';
            
            // Clear OTP fields
            otpInputs.forEach(input => {
                input.value = '';
            });
            otpInputs[0].focus();
        }
    }, 1500);
}

// Validate form step
function validateStep(stepNumber) {
    const currentStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    const inputs = currentStep.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    // Remove existing validation messages
    document.querySelectorAll('.validation-error').forEach(el => el.remove());
    
    // Check each input in the current step
    inputs.forEach(input => {
        // Skip validation for hidden fields
        if (input.classList.contains('hidden')) {
            return;
        }
        
        input.classList.remove('input-error');
        
        // Check required fields
        if (input.hasAttribute('required') && !input.value.trim()) {
            showValidationError(input, 'This field is required');
            isValid = false;
            return;
        }
        
        // Specific validations based on field type
        switch(input.id) {
            case 'email':
                if (input.value && !validateEmail(input.value)) {
                    showValidationError(input, 'Please enter a valid email address');
                    isValid = false;
                }
                break;
                
            case 'password':
                if (input.value && input.value.length < 8) {
                    showValidationError(input, 'Password must be at least 8 characters');
                    isValid = false;
                }
                break;
                
            case 'confirmPassword':
                const password = document.getElementById('password').value;
                if (input.value !== password) {
                    showValidationError(input, 'Passwords do not match');
                    isValid = false;
                }
                break;
                
            case 'phone':
            case 'emergencyPhone':
                if (input.value && !validatePhone(input.value)) {
                    showValidationError(input, 'Please enter a valid phone number');
                    isValid = false;
                }
                break;
                
            case 'pincode':
                if (input.value && !validatePincode(input.value)) {
                    showValidationError(input, 'Please enter a valid 6-digit PIN code');
                    isValid = false;
                }
                break;
                
            case 'height':
                if (input.value && (parseInt(input.value) < 50 || parseInt(input.value) > 250 || isNaN(parseInt(input.value)))) {
                    showValidationError(input, 'Please enter a valid height (50-250 cm)');
                    isValid = false;
                }
                break;
                
            case 'weight':
                if (input.value && (parseInt(input.value) < 1 || parseInt(input.value) > 500 || isNaN(parseInt(input.value)))) {
                    showValidationError(input, 'Please enter a valid weight (1-500 kg)');
                    isValid = false;
                }
                break;
                
            case 'idNumber':
                if (stepNumber === 4 && document.getElementById('govtIdVerification').checked && !input.value) {
                    showValidationError(input, 'Please enter your ID number');
                    isValid = false;
                }
                break;
        }
    });
    
    // For stepNumber 4, validate consent checkboxes
    if (stepNumber === 4) {
        const consentCheckboxes = document.querySelectorAll('.consent-checkboxes input[type="checkbox"]');
        consentCheckboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                showValidationError(checkbox, 'You must agree to this statement to continue');
                isValid = false;
            }
        });
        
        // Validate verification method
        const selectedVerification = document.querySelector('input[name="verificationType"]:checked');
        if (selectedVerification.value === 'mobile') {
            // Check if mobile verification was completed
            const verificationSuccess = document.getElementById('mobileVerificationFields').querySelector('.verification-success');
            if (!verificationSuccess) {
                showValidationError(document.getElementById('mobileVerificationFields'), 'Please complete mobile verification');
                isValid = false;
            }
        }
    }
    
    return isValid;
}

// Display validation error message
function showValidationError(input, message) {
    input.classList.add('input-error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'validation-error';
    errorElement.textContent = message;
    
    // For checkboxes and radio buttons
    if (input.type === 'checkbox' || input.type === 'radio') {
        const parent = input.closest('.checkbox-group, .radio-group');
        parent.appendChild(errorElement);
    } 
    // For mobile verification fields
    else if (input.id === 'mobileVerificationFields') {
        input.appendChild(errorElement);
    }
    // For OTP inputs
    else if (input.classList.contains('otp-input')) {
        const parent = input.closest('.otp-group');
        parent.appendChild(errorElement);
    }
    // For regular inputs
    else {
        input.parentNode.appendChild(errorElement);
    }
    
    // Remove error on input
    input.addEventListener('input', function() {
        this.classList.remove('input-error');
        const error = this.parentNode.querySelector('.validation-error');
        if (error) error.remove();
    }, { once: true });
}

// Validation helpers
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ''));
}

function validatePincode(pincode) {
    return /^[0-9]{6}$/.test(pincode);
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate final step
    if (!validateStep(4)) {
        return;
    }
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';
    submitButton.classList.add('loading');
    
    try {
        const formData = collectFormData();
        
        // Send registration data to API
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            showSuccessMessage();
            
            // Redirect to login page after a delay
            setTimeout(() => {
                window.location.href = '../login/?registered=success';
            }, 2000);
        } else {
            // Show error message
            showErrorMessage(data.message || 'Registration failed. Please try again.');
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
            submitButton.classList.remove('loading');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showErrorMessage('Network error. Please check your connection and try again.');
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
        submitButton.classList.remove('loading');
    }
}

// Collect all form data
function collectFormData() {
    const formData = {
        userType: 'patient',
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value,
        
        // Additional patient details
        patient: {
            dateOfBirth: document.getElementById('dob').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            bloodType: document.getElementById('bloodType').value,
            address: {
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                pincode: document.getElementById('pincode').value,
                country: document.getElementById('country').value
            },
            medicalHistory: {
                height: document.getElementById('height').value ? parseInt(document.getElementById('height').value) : null,
                weight: document.getElementById('weight').value ? parseInt(document.getElementById('weight').value) : null,
                allergies: document.getElementById('allergies').value,
                preExistingConditions: document.getElementById('preExistingConditions').value,
                currentMedications: document.getElementById('currentMedications').value
            },
            emergencyContact: {
                name: document.getElementById('emergencyName').value,
                relationship: document.getElementById('emergencyRelation').value,
                phone: document.getElementById('emergencyPhone').value
            }
        }
    };
    
    // Add verification method
    const verificationMethod = document.querySelector('input[name="verificationType"]:checked').value;
    formData.verificationMethod = verificationMethod;
    
    if (verificationMethod === 'govtId') {
        formData.govtId = {
            type: document.getElementById('idType').value,
            number: document.getElementById('idNumber').value
        };
    }
    
    return formData;
}

// Show success message
function showSuccessMessage() {
    const formContainer = document.querySelector('.registration-section');
    const successMessage = document.createElement('div');
    successMessage.className = 'registration-success';
    successMessage.innerHTML = `
        <div class="success-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <h3>Registration Successful!</h3>
        <p>Your account has been created. You can now log in to access your health services.</p>
    `;
    
    // Replace form with success message
    formContainer.innerHTML = '';
    formContainer.appendChild(successMessage);
}

// Show error message
function showErrorMessage(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.form-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create and show new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const formContainer = document.querySelector('.form-step[data-step="4"]');
    formContainer.insertBefore(errorDiv, formContainer.firstChild);
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
} 