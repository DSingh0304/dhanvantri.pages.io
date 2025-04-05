#!/bin/bash

# Set up Dhanvantri Healthcare Platform Backend
# This script creates the complete backend structure with all necessary files

echo "Setting up Dhanvantri Healthcare Platform Backend..."

# Create root directories
mkdir -p backend/src/{config,controllers,middleware,models,routes,utils,data}

# Update package.json scripts
cd backend
npm pkg set main="src/server.js"
npm pkg set scripts.start="node src/server.js"
npm pkg set scripts.dev="nodemon src/server.js"
npm pkg set scripts.seed="node src/data/seeder.js"

# Install dependencies
echo "Installing dependencies..."
npm install express mongoose dotenv bcryptjs jsonwebtoken cors helmet morgan multer
npm install -D nodemon

# Create .env file
cat > .env << 'EOF'
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dhanvantri
JWT_SECRET=dhanvantri_super_secret_jwt_token_key
NODE_ENV=development
API_URL=https://api.ysinghc.me/v1
EOF

# Create config files
echo "Creating configuration files..."
cat > src/config/db.js << 'EOF'
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
EOF

# Create middleware files
echo "Creating middleware files..."
cat > src/middleware/errorMiddleware.js << 'EOF'
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
EOF

cat > src/middleware/authMiddleware.js << 'EOF'
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

const doctor = (req, res, next) => {
  if (req.user && req.user.userType === 'doctor') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a doctor');
  }
};

const hospital = (req, res, next) => {
  if (req.user && req.user.userType === 'hospital') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a hospital');
  }
};

const patient = (req, res, next) => {
  if (req.user && req.user.userType === 'patient') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a patient');
  }
};

module.exports = { protect, admin, doctor, hospital, patient };
EOF

# Create util files
echo "Creating utility files..."
cat > src/utils/generateToken.js << 'EOF'
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
EOF

# Create models
echo "Creating model files..."
cat > src/models/userModel.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    healthId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ['patient', 'doctor', 'hospital', 'admin'],
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userType',
    },
  },
  {
    timestamps: true,
  }
);

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
EOF

cat > src/models/patientModel.js << 'EOF'
const mongoose = require('mongoose');

const patientSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    contactNumber: {
      type: String,
      required: true,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    allergies: [String],
    chronicConditions: [String],
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    insuranceDetails: {
      provider: String,
      policyNumber: String,
      coverageDetails: String,
      validUntil: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
EOF

cat > src/models/doctorModel.js << 'EOF'
const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    qualifications: [String],
    experience: {
      type: Number,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    hospitalAffiliations: [
      {
        hospitalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Hospital',
        },
        name: String,
        from: Date,
        to: Date,
        current: Boolean,
      },
    ],
    availability: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }],
    },
    consultationFee: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
EOF

cat > src/models/hospitalModel.js << 'EOF'
const mongoose = require('mongoose');

const hospitalSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['government', 'private', 'multi-specialty', 'clinic'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    facilities: [String],
    departments: [String],
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;
EOF

cat > src/models/appointmentModel.js << 'EOF'
const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    type: {
      type: String,
      required: true,
      enum: ['in-person', 'telemedicine'],
    },
    reason: {
      type: String,
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
EOF

cat > src/models/medicalRecordModel.js << 'EOF'
const mongoose = require('mongoose');

const medicalRecordSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    recordType: {
      type: String,
      required: true,
      enum: ['consultation', 'diagnosis', 'treatment', 'surgery', 'vaccination', 'other'],
    },
    date: {
      type: Date,
      required: true,
    },
    diagnosis: String,
    symptoms: [String],
    treatment: String,
    notes: String,
    attachments: [
      {
        fileName: String,
        fileType: String,
        fileUrl: String,
        uploadDate: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
EOF

cat > src/models/prescriptionModel.js << 'EOF'
const mongoose = require('mongoose');

const prescriptionSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    medications: [
      {
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        instructions: String,
      },
    ],
    instructions: String,
    duration: Number,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
EOF

cat > src/models/labReportModel.js << 'EOF'
const mongoose = require('mongoose');

const labReportSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    date: {
      type: Date,
      required: true,
    },
    testType: {
      type: String,
      required: true,
    },
    results: {
      type: Object,
      required: true,
    },
    normalRanges: {
      type: Object,
      required: true,
    },
    notes: String,
    attachmentUrl: String,
  },
  {
    timestamps: true,
  }
);

const LabReport = mongoose.model('LabReport', labReportSchema);

module.exports = LabReport;
EOF

# Create controllers
echo "Creating controller files..."
cat > src/controllers/authController.js << 'EOF'
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const Hospital = require('../models/hospitalModel');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// Generate Health ID
const generateHealthId = () => {
  return 'DH' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, password, userType, name } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a unique health ID
    const healthId = generateHealthId();

    // Create user first
    const user = await User.create({
      healthId,
      email,
      password,
      userType,
    });

    // Based on user type, create respective profile
    let profileData = {};

    if (userType === 'patient') {
      const patient = await Patient.create({
        userId: user._id,
        name,
        dateOfBirth: req.body.dateOfBirth || new Date(),
        gender: req.body.gender || 'other',
        contactNumber: req.body.contactNumber || '',
        address: req.body.address || {},
      });
      user.profile = patient._id;
      profileData = patient;
    } else if (userType === 'doctor') {
      const doctor = await Doctor.create({
        userId: user._id,
        name,
        specialization: req.body.specialization || 'General',
        qualifications: req.body.qualifications || [],
        experience: req.body.experience || 0,
        licenseNumber: req.body.licenseNumber || `LIC${Date.now()}`,
        contactNumber: req.body.contactNumber || '',
        consultationFee: req.body.consultationFee || 0,
      });
      user.profile = doctor._id;
      profileData = doctor;
    } else if (userType === 'hospital') {
      const hospital = await Hospital.create({
        userId: user._id,
        name,
        type: req.body.type || 'private',
        address: req.body.address || {},
        contactNumber: req.body.contactNumber || '',
        email: req.body.email || email,
        facilities: req.body.facilities || [],
        departments: req.body.departments || [],
      });
      user.profile = hospital._id;
      profileData = hospital;
    }

    await user.save();

    res.status(201).json({
      _id: user._id,
      healthId: user.healthId,
      email: user.email,
      userType: user.userType,
      profile: profileData,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      let profileData = {};

      if (user.userType === 'patient') {
        profileData = await Patient.findById(user.profile);
      } else if (user.userType === 'doctor') {
        profileData = await Doctor.findById(user.profile);
      } else if (user.userType === 'hospital') {
        profileData = await Hospital.findById(user.profile);
      }

      res.json({
        _id: user._id,
        healthId: user.healthId,
        email: user.email,
        userType: user.userType,
        profile: profileData,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let profileData = {};

      if (user.userType === 'patient') {
        profileData = await Patient.findById(user.profile);
      } else if (user.userType === 'doctor') {
        profileData = await Doctor.findById(user.profile);
      } else if (user.userType === 'hospital') {
        profileData = await Hospital.findById(user.profile);
      }

      res.json({
        _id: user._id,
        healthId: user.healthId,
        email: user.email,
        userType: user.userType,
        profile: profileData,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      let profileData = {};
      let profileModel;

      if (user.userType === 'patient') {
        profileModel = Patient;
      } else if (user.userType === 'doctor') {
        profileModel = Doctor;
      } else if (user.userType === 'hospital') {
        profileModel = Hospital;
      }

      if (profileModel) {
        const profile = await profileModel.findById(user.profile);
        
        if (profile) {
          // Update profile fields
          Object.keys(req.body.profile || {}).forEach(key => {
            profile[key] = req.body.profile[key];
          });
          
          const updatedProfile = await profile.save();
          profileData = updatedProfile;
        }
      }

      res.json({
        _id: updatedUser._id,
        healthId: updatedUser.healthId,
        email: updatedUser.email,
        userType: updatedUser.userType,
        profile: profileData,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
EOF

cat > src/controllers/patientController.js << 'EOF'
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel');
const MedicalRecord = require('../models/medicalRecordModel');
const Prescription = require('../models/prescriptionModel');
const LabReport = require('../models/labReportModel');
const Doctor = require('../models/doctorModel');

// @desc    Get patient dashboard data
// @route   GET /api/v1/patients/dashboard
// @access  Private/Patient
const getPatientDashboard = async (req, res) => {
  try {
    const patientId = req.user.profile;

    // Get upcoming appointments
    const appointments = await Appointment.find({
      patientId,
      status: 'scheduled',
      date: { $gte: new Date() },
    })
      .sort({ date: 1, time: 1 })
      .limit(5)
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address');

    // Get active prescriptions
    const prescriptions = await Prescription.find({
      patientId,
      isActive: true,
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('doctorId', 'name specialization');

    // Get recent medical records
    const medicalRecords = await MedicalRecord.find({
      patientId,
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name');

    // Get recent lab reports
    const labReports = await LabReport.find({
      patientId,
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('doctorId', 'name specialization');

    res.json({
      appointments,
      prescriptions,
      medicalRecords,
      labReports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient appointments
// @route   GET /api/v1/patients/appointments
// @access  Private/Patient
const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.profile;
    const { status, from, to } = req.query;

    const query = { patientId };

    if (status) {
      query.status = status;
    }

    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = new Date(from);
      }
      if (to) {
        query.date.$lte = new Date(to);
      }
    }

    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: -1 })
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address');

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient medical records
// @route   GET /api/v1/patients/medical-records
// @access  Private/Patient
const getPatientMedicalRecords = async (req, res) => {
  try {
    const patientId = req.user.profile;
    const { recordType, from, to } = req.query;

    const query = { patientId };

    if (recordType) {
      query.recordType = recordType;
    }

    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = new Date(from);
      }
      if (to) {
        query.date.$lte = new Date(to);
      }
    }

    const medicalRecords = await MedicalRecord.find(query)
      .sort({ date: -1 })
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name');

    res.json(medicalRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient prescriptions
// @route   GET /api/v1/patients/prescriptions
// @access  Private/Patient
const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.profile;
    const { active, from, to } = req.query;

    const query = { patientId };

    if (active === 'true') {
      query.isActive = true;
    } else if (active === 'false') {
      query.isActive = false;
    }

    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = new Date(from);
      }
      if (to) {
        query.date.$lte = new Date(to);
      }
    }

    const prescriptions = await Prescription.find(query)
      .sort({ date: -1 })
      .populate('doctorId', 'name specialization');

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient lab reports
// @route   GET /api/v1/patients/lab-reports
// @access  Private/Patient
const getPatientLabReports = async (req, res) => {
  try {
    const patientId = req.user.profile;
    const { testType, from, to } = req.query;

    const query = { patientId };

    if (testType) {
      query.testType = testType;
    }

    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = new Date(from);
      }
      if (to) {
        query.date.$lte = new Date(to);
      }
    }

    const labReports = await LabReport.find(query)
      .sort({ date: -1 })
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name');

    res.json(labReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get available doctors
// @route   GET /api/v1/patients/doctors
// @access  Private/Patient
const getAvailableDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;

    const query = {};

    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await Doctor.find(query)
      .select('name specialization qualifications experience consultationFee hospitalAffiliations')
      .populate('hospitalAffiliations.hospitalId', 'name address');

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getPatientDashboard,
  getPatientAppointments,
  getPatientMedicalRecords,
  getPatientPrescriptions,
  getPatientLabReports,
  getAvailableDoctors,
};
EOF
# Continue the script.sh file with remaining components

# Create appointment controller
cat > src/controllers/appointmentController.js << 'EOF'
const Appointment = require('../models/appointmentModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');

// @desc    Create a new appointment
// @route   POST /api/v1/appointments
// @access  Private/Patient
const createAppointment = async (req, res) => {
  try {
    const { doctorId, hospitalId, date, time, type, reason } = req.body;
    const patientId = req.user.profile;

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      hospitalId,
      date,
      time,
      type,
      reason,
      status: 'scheduled',
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/v1/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name contactNumber')
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address');

    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      appointment.date = req.body.date || appointment.date;
      appointment.time = req.body.time || appointment.time;
      appointment.status = req.body.status || appointment.status;
      appointment.type = req.body.type || appointment.type;
      appointment.reason = req.body.reason || appointment.reason;
      appointment.notes = req.body.notes || appointment.notes;

      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      appointment.status = 'cancelled';
      await appointment.save();
      res.json({ message: 'Appointment cancelled' });
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
};
EOF

# Create doctor controller
cat > src/controllers/doctorController.js << 'EOF'
const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const MedicalRecord = require('../models/medicalRecordModel');
const Prescription = require('../models/prescriptionModel');
const LabReport = require('../models/labReportModel');
const Patient = require('../models/patientModel');

// @desc    Get doctor dashboard data
// @route   GET /api/v1/doctors/dashboard
// @access  Private/Doctor
const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.profile;

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId,
      status: 'scheduled',
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ time: 1 })
      .populate('patientId', 'name gender dateOfBirth contactNumber');

    // Get pending appointments count
    const pendingAppointmentsCount = await Appointment.countDocuments({
      doctorId,
      status: 'scheduled',
      date: { $gt: tomorrow },
    });

    // Get recent patients
    const recentPatients = await Appointment.find({
      doctorId,
      status: { $in: ['completed', 'scheduled'] },
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('patientId', 'name gender dateOfBirth contactNumber');

    // Get patient count
    const uniquePatientIds = await Appointment.distinct('patientId', {
      doctorId,
    });

    res.json({
      todayAppointments: appointments,
      pendingAppointmentsCount,
      recentPatients,
      patientsCount: uniquePatientIds.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get doctor appointments
// @route   GET /api/v1/doctors/appointments
// @access  Private/Doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.profile;
    const { status, date, patientName } = req.query;

    const query = { doctorId };

    if (status) {
      query.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: selectedDate, $lt: nextDay };
    }

    let appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 })
      .populate('patientId', 'name gender dateOfBirth contactNumber')
      .populate('hospitalId', 'name');

    // Filter by patient name if provided
    if (patientName) {
      appointments = appointments.filter(appointment => 
        appointment.patientId.name.toLowerCase().includes(patientName.toLowerCase())
      );
    }

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create medical record
// @route   POST /api/v1/doctors/medical-records
// @access  Private/Doctor
const createMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user.profile;
    const { patientId, hospitalId, recordType, date, diagnosis, symptoms, treatment, notes } = req.body;

    const medicalRecord = await MedicalRecord.create({
      patientId,
      doctorId,
      hospitalId,
      recordType,
      date: date || new Date(),
      diagnosis,
      symptoms,
      treatment,
      notes,
    });

    res.status(201).json(medicalRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create prescription
// @route   POST /api/v1/doctors/prescriptions
// @access  Private/Doctor
const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.profile;
    const { patientId, medications, instructions, duration } = req.body;

    const prescription = await Prescription.create({
      patientId,
      doctorId,
      date: new Date(),
      medications,
      instructions,
      duration,
      isActive: true,
    });

    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get doctor's patients
// @route   GET /api/v1/doctors/patients
// @access  Private/Doctor
const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.profile;

    // Get all unique patient IDs from appointments
    const patientIds = await Appointment.distinct('patientId', { doctorId });

    // Get patient details
    const patients = await Patient.find({ _id: { $in: patientIds } })
      .select('name gender dateOfBirth contactNumber bloodGroup allergies chronicConditions');

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/v1/doctors/availability
// @access  Private/Doctor
const updateAvailability = async (req, res) => {
  try {
    const doctorId = req.user.profile;
    const doctor = await Doctor.findById(doctorId);

    if (doctor) {
      doctor.availability = req.body.availability || doctor.availability;
      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor.availability);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getDoctorDashboard,
  getDoctorAppointments,
  createMedicalRecord,
  createPrescription,
  getDoctorPatients,
  updateAvailability,
};
EOF

# Create hospital controller
cat > src/controllers/hospitalController.js << 'EOF'
const Hospital = require('../models/hospitalModel');
const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const MedicalRecord = require('../models/medicalRecordModel');

// @desc    Get hospital dashboard data
// @route   GET /api/v1/hospitals/dashboard
// @access  Private/Hospital
const getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user.profile;

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      hospitalId,
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ time: 1 })
      .populate('patientId', 'name')
      .populate('doctorId', 'name specialization');

    // Get doctors count
    const doctorsCount = await Doctor.countDocuments({
      'hospitalAffiliations.hospitalId': hospitalId,
      'hospitalAffiliations.current': true,
    });

    // Get appointment statistics
    const totalAppointments = await Appointment.countDocuments({ hospitalId });
    const pendingAppointments = await Appointment.countDocuments({
      hospitalId,
      status: 'scheduled',
    });
    const completedAppointments = await Appointment.countDocuments({
      hospitalId,
      status: 'completed',
    });
    const cancelledAppointments = await Appointment.countDocuments({
      hospitalId,
      status: 'cancelled',
    });

    res.json({
      todayAppointments: appointments,
      doctorsCount,
      appointmentStats: {
        total: totalAppointments,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get hospital doctors
// @route   GET /api/v1/hospitals/doctors
// @access  Private/Hospital
const getHospitalDoctors = async (req, res) => {
  try {
    const hospitalId = req.user.profile;
    const { specialization } = req.query;

    const query = {
      'hospitalAffiliations.hospitalId': hospitalId,
      'hospitalAffiliations.current': true,
    };

    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await Doctor.find(query).select(
      'name specialization qualifications experience consultationFee availability'
    );

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get hospital appointments
// @route   GET /api/v1/hospitals/appointments
// @access  Private/Hospital
const getHospitalAppointments = async (req, res) => {
  try {
    const hospitalId = req.user.profile;
    const { status, date, doctorId } = req.query;

    const query = { hospitalId };

    if (status) {
      query.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: selectedDate, $lt: nextDay };
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 })
      .populate('patientId', 'name gender dateOfBirth contactNumber')
      .populate('doctorId', 'name specialization');

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add doctor to hospital
// @route   POST /api/v1/hospitals/doctors
// @access  Private/Hospital
const addDoctorToHospital = async (req, res) => {
  try {
    const hospitalId = req.user.profile;
    const { doctorId, from, to, current } = req.body;

    const doctor = await Doctor.findById(doctorId);
    const hospital = await Hospital.findById(hospitalId);

    if (!doctor || !hospital) {
      return res.status(404).json({ message: 'Doctor or Hospital not found' });
    }

    // Check if the doctor is already affiliated with this hospital
    const existingAffiliation = doctor.hospitalAffiliations.find(
      affiliation => affiliation.hospitalId.toString() === hospitalId.toString()
    );

    if (existingAffiliation) {
      return res.status(400).json({
        message: 'Doctor is already affiliated with this hospital',
      });
    }

    // Add hospital to doctor's affiliations
    doctor.hospitalAffiliations.push({
      hospitalId,
      name: hospital.name,
      from: from || new Date(),
      to,
      current: current !== undefined ? current : true,
    });

    await doctor.save();

    // Add doctor to hospital's doctors
    if (!hospital.doctors.includes(doctorId)) {
      hospital.doctors.push(doctorId);
      await hospital.save();
    }

    res.status(201).json({
      message: 'Doctor added to hospital successfully',
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getHospitalDashboard,
  getHospitalDoctors,
  getHospitalAppointments,
  addDoctorToHospital,
};
EOF

# Create medical record controller
cat > src/controllers/medicalRecordController.js << 'EOF'
const MedicalRecord = require('../models/medicalRecordModel');

// @desc    Get medical record by ID
// @route   GET /api/v1/medical-records/:id
// @access  Private
const getMedicalRecordById = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
      .populate('patientId', 'name gender dateOfBirth')
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address');

    if (medicalRecord) {
      res.json(medicalRecord);
    } else {
      res.status(404).json({ message: 'Medical record not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update medical record
// @route   PUT /api/v1/medical-records/:id
// @access  Private/Doctor
const updateMedicalRecord = async (req, res) => {
  try {
    const { diagnosis, symptoms, treatment, notes } = req.body;
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (medicalRecord) {
      medicalRecord.diagnosis = diagnosis || medicalRecord.diagnosis;
      medicalRecord.symptoms = symptoms || medicalRecord.symptoms;
      medicalRecord.treatment = treatment || medicalRecord.treatment;
      medicalRecord.notes = notes || medicalRecord.notes;

      const updatedMedicalRecord = await medicalRecord.save();
      res.json(updatedMedicalRecord);
    } else {
      res.status(404).json({ message: 'Medical record not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add attachment to medical record
// @route   PUT /api/v1/medical-records/:id/attachments
// @access  Private/Doctor
const addAttachment = async (req, res) => {
  try {
    const { fileName, fileType, fileUrl } = req.body;
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (medicalRecord) {
      medicalRecord.attachments.push({
        fileName,
        fileType,
        fileUrl,
        uploadDate: new Date(),
      });

      const updatedMedicalRecord = await medicalRecord.save();
      res.json(updatedMedicalRecord.attachments);
    } else {
      res.status(404).json({ message: 'Medical record not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete medical record
// @route   DELETE /api/v1/medical-records/:id
// @access  Private/Doctor
const deleteMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (medicalRecord) {
      await medicalRecord.remove();
      res.json({ message: 'Medical record removed' });
    } else {
      res.status(404).json({ message: 'Medical record not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getMedicalRecordById,
  updateMedicalRecord,
  addAttachment,
  deleteMedicalRecord,
};
EOF

# Create prescription controller
cat > src/controllers/prescriptionController.js << 'EOF'
const Prescription = require('../models/prescriptionModel');

// @desc    Get prescription by ID
// @route   GET /api/v1/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name gender dateOfBirth')
      .populate('doctorId', 'name specialization');

    if (prescription) {
      res.json(prescription);
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update prescription
// @route   PUT /api/v1/prescriptions/:id
// @access  Private/Doctor
const updatePrescription = async (req, res) => {
  try {
    const { medications, instructions, duration, isActive } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (prescription) {
      prescription.medications = medications || prescription.medications;
      prescription.instructions = instructions || prescription.instructions;
      prescription.duration = duration || prescription.duration;
      
      if (isActive !== undefined) {
        prescription.isActive = isActive;
      }

      const updatedPrescription = await prescription.save();
      res.json(updatedPrescription);
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/v1/prescriptions/:id
// @access  Private/Doctor
const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (prescription) {
      await prescription.remove();
      res.json({ message: 'Prescription removed' });
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};
EOF

# Create lab report controller
cat > src/controllers/labReportController.js << 'EOF'
const LabReport = require('../models/labReportModel');

// @desc    Create lab report
// @route   POST /api/v1/lab-reports
// @access  Private/Doctor
const createLabReport = async (req, res) => {
  try {
    const { patientId, hospitalId, testType, results, normalRanges, notes, attachmentUrl } = req.body;
    const doctorId = req.user.profile;

    const labReport = await LabReport.create({
      patientId,
      doctorId,
      hospitalId,
      date: new Date(),
      testType,
      results,
      normalRanges,
      notes,
      attachmentUrl,
    });

    res.status(201).json(labReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get lab report by ID
// @route   GET /api/v1/lab-reports/:id
// @access  Private
const getLabReportById = async (req, res) => {
  try {
    const labReport = await LabReport.findById(req.params.id)
      .populate('patientId', 'name gender dateOfBirth')
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address');

    if (labReport) {
      res.json(labReport);
    } else {
      res.status(404).json({ message: 'Lab report not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update lab report
// @route   PUT /api/v1/lab-reports/:id
// @access  Private/Doctor
const updateLabReport = async (req, res) => {
  try {
    const { results, normalRanges, notes, attachmentUrl } = req.body;
    const labReport = await LabReport.findById(req.params.id);

    if (labReport) {
      labReport.results = results || labReport.results;
      labReport.normalRanges = normalRanges || labReport.normalRanges;
      labReport.notes = notes || labReport.notes;
      labReport.attachmentUrl = attachmentUrl || labReport.attachmentUrl;

      const updatedLabReport = await labReport.save();
      res.json(updatedLabReport);
    } else {
      res.status(404).json({ message: 'Lab report not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete lab report
// @route   DELETE /api/v1/lab-reports/:id
// @access  Private/Doctor
const deleteLabReport = async (req, res) => {
  try {
    const labReport = await LabReport.findById(req.params.id);

    if (labReport) {
      await labReport.remove();
      res.json({ message: 'Lab report removed' });
    } else {
      res.status(404).json({ message: 'Lab report not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createLabReport,
  getLabReportById,
  updateLabReport,
  deleteLabReport,
};
EOF

# Create routes
echo "Creating route files..."

# Auth routes
cat > src/routes/authRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
EOF

# Patient routes
cat > src/routes/patientRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect, patient } = require('../middleware/authMiddleware');
const {
  getPatientDashboard,
  getPatientAppointments,
  getPatientMedicalRecords,
  getPatientPrescriptions,
  getPatientLabReports,
  getAvailableDoctors,
} = require('../controllers/patientController');

// All routes are protected and require patient role
router.use(protect);
router.use(patient);

router.get('/dashboard', getPatientDashboard);
router.get('/appointments', getPatientAppointments);
router.get('/medical-records', getPatientMedicalRecords);
router.get('/prescriptions', getPatientPrescriptions);
router.get('/lab-reports', getPatientLabReports);
router.get('/doctors', getAvailableDoctors);

module.exports = router;
EOF

# Doctor routes
cat > src/routes/doctorRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect, doctor } = require('../middleware/authMiddleware');
const {
  getDoctorDashboard,
  getDoctorAppointments,
  createMedicalRecord,
  createPrescription,
  getDoctorPatients,
  updateAvailability,
} = require('../controllers/doctorController');

// All routes are protected and require doctor role
router.use(protect);
router.use(doctor);

router.get('/dashboard', getDoctorDashboard);
router.get('/appointments', getDoctorAppointments);
router.post('/medical-records', createMedicalRecord);
router.post('/prescriptions', createPrescription);
router.get('/patients', getDoctorPatients);
router.put('/availability', updateAvailability);

module.exports = router;
EOF

# Hospital routes
cat > src/routes/hospitalRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect, hospital } = require('../middleware/authMiddleware');
const {
  getHospitalDashboard,
  getHospitalDoctors,
  getHospitalAppointments,
  addDoctorToHospital,
} = require('../controllers/hospitalController');

// All routes are protected and require hospital role
router.use(protect);
router.use(hospital);

router.get('/dashboard', getHospitalDashboard);
router.get('/doctors', getHospitalDoctors);
router.get('/appointments', getHospitalAppointments);
router.post('/doctors', addDoctorToHospital);

module.exports = router;
EOF

# Appointment routes
cat > src/routes/appointmentRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createAppointment);

router.route('/:id')
  .get(getAppointmentById)
  .put(updateAppointment)
  .delete(cancelAppointment);

module.exports = router;
EOF

# Medical record routes
cat > src/routes/medicalRecordRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMedicalRecord,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecordController');

# Complete the appointment routes
cat > src/routes/appointmentRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createAppointment);

router.route('/:id')
  .get(getAppointmentById)
  .put(updateAppointment)
  .delete(cancelAppointment);

module.exports = router;
EOF

# Create Medical Record routes
cat > src/routes/medicalRecordRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect, doctor } = require('../middleware/authMiddleware');
const {
  getMedicalRecordById,
  updateMedicalRecord,
  addAttachment,
  deleteMedicalRecord,
} = require('../controllers/medicalRecordController');

// All routes are protected
router.use(protect);

router.route('/:id')
  .get(getMedicalRecordById)
  .put(doctor, updateMedicalRecord)
  .delete(doctor, deleteMedicalRecord);

router.route('/:id/attachments')
  .put(doctor, addAttachment);

module.exports = router;
EOF

# Create Prescription routes
cat > src/routes/prescriptionRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect, doctor } = require('../middleware/authMiddleware');
const {
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} = require('../controllers/prescriptionController');

// All routes are protected
router.use(protect);

router.route('/:id')
  .get(getPrescriptionById)
  .put(doctor, updatePrescription)
  .delete(doctor, deletePrescription);

module.exports = router;
EOF

# Create Lab Report routes
cat > src/routes/labReportRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { protect, doctor } = require('../middleware/authMiddleware');
const {
  createLabReport,
  getLabReportById,
  updateLabReport,
  deleteLabReport,
} = require('../controllers/labReportController');

// All routes are protected
router.use(protect);

router.route('/')
  .post(doctor, createLabReport);

router.route('/:id')
  .get(getLabReportById)
  .put(doctor, updateLabReport)
  .delete(doctor, deleteLabReport);

module.exports = router;
EOF

# Complete app.js
cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const labReportRoutes = require('./routes/labReportRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/patients', patientRoutes);
app.use('/v1/doctors', doctorRoutes);
app.use('/v1/hospitals', hospitalRoutes);
app.use('/v1/appointments', appointmentRoutes);
app.use('/v1/medical-records', medicalRecordRoutes);
app.use('/v1/prescriptions', prescriptionRoutes);
app.use('/v1/lab-reports', labReportRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Dhanvantri Healthcare API',
    version: '1.0.0',
    status: 'active',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
EOF

# Complete server.js
cat > src/server.js << 'EOF'
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API URL: ${process.env.API_URL}`);
});
EOF

# Create file upload middleware
cat > src/middleware/uploadMiddleware.js << 'EOF'
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and DOC files are allowed!'));
  }
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
});

module.exports = upload;
EOF

# Create seeder for dummy data
cat > src/data/seeder.js << 'EOF'
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const Hospital = require('../models/hospitalModel');
const Appointment = require('../models/appointmentModel');
const MedicalRecord = require('../models/medicalRecordModel');
const Prescription = require('../models/prescriptionModel');
const LabReport = require('../models/labReportModel');

// Connect to DB
const connectDB = require('../config/db');
connectDB();

// Sample data
const patients = [
  {
    name: 'John Doe',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    contactNumber: '9876543210',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '9876543211',
    },
    address: {
      street: '123 Main St',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
    },
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Hypertension'],
    insuranceDetails: {
      provider: 'Health India',
      policyNumber: 'HI12345678',
      coverageDetails: 'Comprehensive',
      validUntil: '2025-12-31',
    },
  },
  {
    name: 'Jane Smith',
    dateOfBirth: '1985-05-22',
    gender: 'female',
    contactNumber: '9876543212',
    emergencyContact: {
      name: 'John Smith',
      relationship: 'Husband',
      phone: '9876543213',
    },
    address: {
      street: '456 Park Ave',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
    },
    bloodGroup: 'A+',
    allergies: ['Sulfa'],
    chronicConditions: ['Diabetes'],
    insuranceDetails: {
      provider: 'MediShield',
      policyNumber: 'MS87654321',
      coverageDetails: 'Basic',
      validUntil: '2024-10-15',
    },
  },
  {
    name: 'Rahul Kumar',
    dateOfBirth: '1995-09-10',
    gender: 'male',
    contactNumber: '9876543214',
    address: {
      street: '789 Ring Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    },
    bloodGroup: 'B+',
    allergies: [],
    chronicConditions: [],
  },
];

const doctors = [
  {
    name: 'Dr. Robert Smith',
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD', 'DM Cardiology'],
    experience: 15,
    licenseNumber: 'MCI12345',
    contactNumber: '9876543215',
    consultationFee: 1000,
    availability: {
      monday: [
        { start: '09:00', end: '13:00' },
        { start: '16:00', end: '19:00' },
      ],
      tuesday: [{ start: '09:00', end: '13:00' }],
      wednesday: [
        { start: '09:00', end: '13:00' },
        { start: '16:00', end: '19:00' },
      ],
      thursday: [{ start: '09:00', end: '13:00' }],
      friday: [
        { start: '09:00', end: '13:00' },
        { start: '16:00', end: '19:00' },
      ],
    },
  },
  {
    name: 'Dr. Sarah Johnson',
    specialization: 'Dermatology',
    qualifications: ['MBBS', 'MD', 'DNB Dermatology'],
    experience: 10,
    licenseNumber: 'MCI67890',
    contactNumber: '9876543216',
    consultationFee: 1200,
    availability: {
      monday: [{ start: '10:00', end: '16:00' }],
      wednesday: [{ start: '10:00', end: '16:00' }],
      friday: [{ start: '10:00', end: '16:00' }],
    },
  },
  {
    name: 'Dr. Priya Sharma',
    specialization: 'Gynecology',
    qualifications: ['MBBS', 'MS', 'DGO'],
    experience: 12,
    licenseNumber: 'MCI54321',
    contactNumber: '9876543217',
    consultationFee: 1500,
    availability: {
      tuesday: [{ start: '10:00', end: '17:00' }],
      thursday: [{ start: '10:00', end: '17:00' }],
      saturday: [{ start: '10:00', end: '14:00' }],
    },
  },
];

const hospitals = [
  {
    name: 'City Hospital',
    type: 'multi-specialty',
    address: {
      street: '10 Hospital Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560046',
      country: 'India',
    },
    contactNumber: '08012345678',
    email: 'info@cityhospital.com',
    facilities: [
      'Emergency',
      'ICU',
      'Laboratory',
      'Radiology',
      'Pharmacy',
      'Blood Bank',
    ],
    departments: [
      'Cardiology',
      'Dermatology',
      'Neurology',
      'Orthopedics',
      'Gynecology',
      'Pediatrics',
    ],
  },
  {
    name: 'Lifeline Medical Center',
    type: 'private',
    address: {
      street: '25 Health Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      country: 'India',
    },
    contactNumber: '02223456789',
    email: 'contact@lifelinemedical.com',
    facilities: ['Emergency', 'ICU', 'Laboratory', 'Radiology', 'Pharmacy'],
    departments: ['Cardiology', 'Orthopedics', 'Gynecology', 'Pediatrics'],
  },
];

// Import data
const importData = async () => {
  try {
    // Clear database
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Hospital.deleteMany();
    await Appointment.deleteMany();
    await MedicalRecord.deleteMany();
    await Prescription.deleteMany();
    await LabReport.deleteMany();

    console.log('Database cleared'.red.inverse);

    // Create users and their profiles
    const patientUsers = [];
    const doctorUsers = [];
    const hospitalUsers = [];
    const patientProfiles = [];
    const doctorProfiles = [];
    const hospitalProfiles = [];

    // Create patients
    for (let i = 0; i < patients.length; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const user = await User.create({
        healthId: `PAT${i + 1}${Date.now().toString().slice(-5)}`,
        email: `patient${i + 1}@example.com`,
        password: hashedPassword,
        userType: 'patient',
      });

      patientUsers.push(user);

      const patient = await Patient.create({
        userId: user._id,
        ...patients[i],
      });

      patientProfiles.push(patient);

      user.profile = patient._id;
      await user.save();
    }

    // Create doctors
    for (let i = 0; i < doctors.length; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const user = await User.create({
        healthId: `DOC${i + 1}${Date.now().toString().slice(-5)}`,
        email: `doctor${i + 1}@example.com`,
        password: hashedPassword,
        userType: 'doctor',
      });

      doctorUsers.push(user);

      const doctor = await Doctor.create({
        userId: user._id,
        ...doctors[i],
      });

      doctorProfiles.push(doctor);

      user.profile = doctor._id;
      await user.save();
    }

    // Create hospitals
    for (let i = 0; i < hospitals.length; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const user = await User.create({
        healthId: `HOS${i + 1}${Date.now().toString().slice(-5)}`,
        email: `hospital${i + 1}@example.com`,
        password: hashedPassword,
        userType: 'hospital',
      });

      hospitalUsers.push(user);

      const hospital = await Hospital.create({
        userId: user._id,
        ...hospitals[i],
      });

      hospitalProfiles.push(hospital);

      user.profile = hospital._id;
      await user.save();
    }

    // Associate doctors with hospitals
    doctorProfiles[0].hospitalAffiliations.push({
      hospitalId: hospitalProfiles[0]._id,
      name: hospitalProfiles[0].name,
      from: new Date('2020-01-01'),
      current: true,
    });
    await doctorProfiles[0].save();

    doctorProfiles[1].hospitalAffiliations.push({
      hospitalId: hospitalProfiles[1]._id,
      name: hospitalProfiles[1].name,
      from: new Date('2021-05-01'),
      current: true,
    });
    await doctorProfiles[1].save();

    doctorProfiles[2].hospitalAffiliations.push({
      hospitalId: hospitalProfiles[0]._id,
      name: hospitalProfiles[0].name,
      from: new Date('2019-03-01'),
      current: true,
    });
    await doctorProfiles[2].save();

    // Add doctors to hospitals
    hospitalProfiles[0].doctors.push(doctorProfiles[0]._id, doctorProfiles[2]._id);
    await hospitalProfiles[0].save();

    hospitalProfiles[1].doctors.push(doctorProfiles[1]._id);
    await hospitalProfiles[1].save();

    // Create appointments
    const appointments = [
      {
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[0]._id,
        hospitalId: hospitalProfiles[0]._id,
        date: new Date(),
        time: '10:00',
        status: 'scheduled',
        type: 'in-person',
        reason: 'Heart checkup',
      },
      {
        patientId: patientProfiles[1]._id,
        doctorId: doctorProfiles[1]._id,
        hospitalId: hospitalProfiles[1]._id,
        date: new Date(),
        time: '11:30',
        status: 'scheduled',
        type: 'in-person',
        reason: 'Skin condition',
      },
      {
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[2]._id,
        hospitalId: hospitalProfiles[0]._id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        time: '15:00',
        status: 'scheduled',
        type: 'telemedicine',
        reason: 'Follow-up consultation',
      },
    ];

    await Appointment.insertMany(appointments);

    // Create medical records
    const medicalRecords = [
      {
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[0]._id,
        hospitalId: hospitalProfiles[0]._id,
        recordType: 'consultation',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        diagnosis: 'Hypertension',
        symptoms: ['Headache', 'Dizziness', 'High blood pressure'],
        treatment: 'Prescribed medication and lifestyle changes',
        notes: 'Patient should monitor blood pressure daily',
      },
      {
        patientId: patientProfiles[1]._id,
        doctorId: doctorProfiles[1]._id,
        hospitalId: hospitalProfiles[1]._id,
        recordType: 'diagnosis',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        diagnosis: 'Eczema',
        symptoms: ['Skin rash', 'Itching', 'Dry skin'],
        treatment: 'Topical corticosteroids',
        notes: 'Avoid allergens and keep skin moisturized',
      },
    ];

    await MedicalRecord.insertMany(medicalRecords);

    // Create prescriptions
    const prescriptions = [
      {
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[0]._id,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        medications: [
          {
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take in the morning',
          },
          {
            name: 'Hydrochlorothiazide',
            dosage: '12.5mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take in the morning with Amlodipine',
          },
        ],
        instructions: 'Maintain low sodium diet, avoid alcohol',
        duration: 30,
        isActive: true,
      },
      {
        patientId: patientProfiles[1]._id,
        doctorId: doctorProfiles[1]._id,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        medications: [
          {
            name: 'Hydrocortisone Cream',
            dosage: '1%',
            frequency: 'Twice daily',
            duration: '14 days',
            instructions: 'Apply thin layer to affected areas',
          },
        ],
        instructions: 'Keep skin moisturized, avoid hot showers',
        duration: 14,
        isActive: true,
      },
    ];

    await Prescription.insertMany(prescriptions);

    // Create lab reports
    const labReports = [
      {
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[0]._id,
        hospitalId: hospitalProfiles[0]._id,
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        testType: 'Blood Pressure',
        results: {
          systolic: 145,
          diastolic: 95,
        },
        normalRanges: {
          systolic: '90-120',
          diastolic: '60-80',
        },
        notes: 'Blood pressure is elevated, monitoring required',
      },
      {
        patientId: patientProfiles[0]._id,
        doctorId: doctorProfiles[0]._id,
        hospitalId: hospitalProfiles[0]._id,
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        testType: 'Blood Sugar',
        results: {
          fasting: 102,
          postPrandial: 145,
        },
        normalRanges: {
          fasting: '70-100',
          postPrandial: '100-140',
        },
        notes: 'Blood sugar slightly elevated, diet control recommended',
      },
    ];

    await LabReport.insertMany(labReports);

    console.log('Data imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Hospital.deleteMany();
    await Appointment.deleteMany();
    await MedicalRecord.deleteMany();
    await Prescription.deleteMany();
    await LabReport.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Run import or destroy based on args
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
EOF

# Create Docker configuration
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

cat > docker-compose.yml << 'EOF'
version: '3'

services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/dhanvantri
      - JWT_SECRET=${JWT_SECRET}
      - API_URL=https://api.ysinghc.me/v1
    depends_on:
      - mongo
    volumes:
      - ./uploads:/usr/src/app/uploads
    restart: unless-stopped

  mongo:
    image: mongo
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
EOF

# Create Nginx configuration for the domain
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name api.ysinghc.me;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Create SSL setup script
cat > setup-ssl.sh << 'EOF'
#!/bin/bash

# Install Certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.ysinghc.me -m your-email@example.com --agree-tos --non-interactive --redirect

# Auto-renew
echo "0 12 * * * root /usr/bin/certbot renew --quiet" | sudo tee -a /etc/crontab
EOF

# Create a script to deploy the app
cat > deploy.sh << 'EOF'
#!/bin/bash

# Update script for the Dhanvantri Healthcare Platform API

# Stop and remove existing containers
docker-compose down

# Pull latest changes
git pull

# Build and start containers
docker-compose up -d

# Seed database with sample data (if needed)
# docker-compose exec api npm run seed

echo "Deployment complete! The API is running at https://api.ysinghc.me"
EOF

# Create API docs using Swagger
cat > src/swagger.js << 'EOF'
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dhanvantri Healthcare Platform API',
      version: '1.0.0',
      description: 'API documentation for the Dhanvantri Healthcare Platform',
    },
    servers: [
      {
        url: 'https://api.ysinghc.me/v1',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000/v1',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
EOF

# Update app.js to include Swagger documentation
cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { swaggerUi, specs } = require('./swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const labReportRoutes = require('./routes/labReportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

app.use('/api/v1/medical-records', medicalRecordRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/lab-reports', labReportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
EOF

# Create a script to deploy the app
cat > deploy.sh << 'EOF'    
#!/bin/bash

# Update script for the Dhanvantri Healthcare Platform API

# Stop and remove existing containers
docker-compose down

# Pull latest changes
git pull

# Build and start containers
docker-compose up -d

# Seed database with sample data (if needed)
# docker-compose exec api npm run seed

echo "Deployment complete! The API is running at https://api.ysinghc.me"
EOF