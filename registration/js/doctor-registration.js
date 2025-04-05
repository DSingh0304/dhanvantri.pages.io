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
const registrationForm = document.getElementById('doctorRegistrationForm');
const specializationSelect = document.getElementById('specialization');
const otherSpecialization = document.getElementById('otherSpecialization');
const otherSpecializationLabel = document.getElementById('otherSpecializationLabel');
const medicalCouncilSelect = document.getElementById('medicalCouncil');
const otherCouncil = document.getElementById('otherCouncil');
const otherCouncilLabel = document.getElementById('otherCouncilLabel');
const hospitalAffiliation = document.getElementById('hospitalAffiliation');
const hospitalIdGroup = document.getElementById('hospitalIdGroup');
const submitButton = document.querySelector('.submit-btn');

// Initialize form behavior
document.addEventListener('DOMContentLoaded', function() {
    initFormSteps();
    initPasswordToggle();
    initPasswordStrength();
    initConditionalFields();
    initFileUploads();
    
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

// Initialize conditional fields based on select values
function initConditionalFields() {
    // For specialization
    specializationSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            otherSpecialization.classList.remove('hidden');
            otherSpecializationLabel.classList.remove('hidden');
            otherSpecialization.setAttribute('required', true);
        } else {
            otherSpecialization.classList.add('hidden');
            otherSpecializationLabel.classList.add('hidden');
            otherSpecialization.removeAttribute('required');
        }
    });
    
    // For medical council
    medicalCouncilSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            otherCouncil.classList.remove('hidden');
            otherCouncilLabel.classList.remove('hidden');
            otherCouncil.setAttribute('required', true);
        } else {
            otherCouncil.classList.add('hidden');
            otherCouncilLabel.classList.add('hidden');
            otherCouncil.removeAttribute('required');
        }
    });
    
    // For hospital affiliation
    hospitalAffiliation.addEventListener('change', function() {
        if (this.checked) {
            hospitalIdGroup.style.display = 'block';
            document.getElementById('hospitalId').setAttribute('required', true);
        } else {
            hospitalIdGroup.style.display = 'none';
            document.getElementById('hospitalId').removeAttribute('required');
        }
    });
    
    // Initialize hospital ID field visibility
    hospitalIdGroup.style.display = hospitalAffiliation.checked ? 'block' : 'none';
}

// Initialize file upload styling
function initFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        const placeholder = input.nextElementSibling;
        
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                const fileName = this.files[0].name;
                placeholder.innerHTML = `<i class="fas fa-file-alt"></i> <span>${fileName}</span>`;
                placeholder.classList.add('has-file');
            } else {
                placeholder.innerHTML = `<i class="fas fa-upload"></i> <span>Click to select file or drag and drop</span>`;
                placeholder.classList.remove('has-file');
            }
        });
    });
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
        if (input.classList.contains('hidden') || 
            (input.id === 'hospitalId' && !hospitalAffiliation.checked)) {
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
                
            case 'medicalRegistrationNumber':
                if (input.value && input.value.length < 5) {
                    showValidationError(input, 'Please enter a valid registration number');
                    isValid = false;
                }
                break;
                
            case 'yearsOfExperience':
                if (input.value && (parseInt(input.value) < 0 || isNaN(parseInt(input.value)))) {
                    showValidationError(input, 'Please enter a valid number');
                    isValid = false;
                }
                break;
        }
    });
    
    // For stepNumber 4, validate file uploads
    if (stepNumber === 4) {
        const registrationCert = document.getElementById('registrationCertificate');
        const identityProof = document.getElementById('identityProof');
        
        if (registrationCert.files.length === 0) {
            showValidationError(registrationCert, 'Please upload your registration certificate');
            isValid = false;
        } else if (registrationCert.files[0].size > 5 * 1024 * 1024) { // 5MB limit
            showValidationError(registrationCert, 'File size exceeds 5MB limit');
            isValid = false;
        }
        
        if (identityProof.files.length === 0) {
            showValidationError(identityProof, 'Please upload your identity proof');
            isValid = false;
        } else if (identityProof.files[0].size > 5 * 1024 * 1024) { // 5MB limit
            showValidationError(identityProof, 'File size exceeds 5MB limit');
            isValid = false;
        }
        
        // Validate consent checkboxes
        const consentCheckboxes = document.querySelectorAll('.consent-checkboxes input[type="checkbox"]');
        consentCheckboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                showValidationError(checkbox, 'You must agree to this statement to continue');
                isValid = false;
            }
        });
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
    // For file inputs
    else if (input.type === 'file') {
        const parent = input.closest('.form-group');
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
        userType: 'doctor',
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value,
        
        // Additional doctor details
        doctor: {
            dateOfBirth: document.getElementById('dob').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            address: {
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                pincode: document.getElementById('pincode').value,
                country: document.getElementById('country').value
            },
            professionalDetails: {
                registrationNumber: document.getElementById('medicalRegistrationNumber').value,
                medicalCouncil: medicalCouncilSelect.value === 'other' ? 
                    document.getElementById('otherCouncil').value : 
                    medicalCouncilSelect.value,
                specialization: specializationSelect.value === 'other' ? 
                    document.getElementById('otherSpecialization').value : 
                    specializationSelect.value,
                qualifications: document.getElementById('medicalQualifications').value,
                yearsOfExperience: parseInt(document.getElementById('yearsOfExperience').value)
            }
        }
    };
    
    // Add hospital affiliation if selected
    if (document.getElementById('hospitalAffiliation').checked) {
        formData.doctor.hospitalId = document.getElementById('hospitalId').value;
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
        <p>Your account is pending verification. We'll review your credentials and notify you once approved.</p>
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