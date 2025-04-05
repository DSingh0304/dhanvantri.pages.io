#!/bin/bash

# Dhanvantri Healthcare Platform Backend Setup Script
echo "Setting up Dhanvantri Healthcare Platform Backend..."

# Create backend directory structure
mkdir -p backend/src/{config,controllers,middleware,models,routes,utils,data,public}

# Create .env file
cat > backend/.env << 'EOF'
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dhanvantri
JWT_SECRET=dhanvantriSecretKey2023
NODE_ENV=development
API_URL=http://localhost:3000/api/v1
EOF

# Create package.json
cat > backend/package.json << 'EOF'
{
  "name": "dhanvantri-backend",
  "version": "1.0.0",
  "description": "Backend for Dhanvantri Healthcare Platform",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "seed": "node src/data/seeder.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.6.3",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "qrcode": "^1.5.3",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Install dependencies
echo "Installing dependencies..."
cd backend && npm install
cd ..

# Copy all the backend files from GitHub repository
echo "Downloading backend files from GitHub..."
git clone https://github.com/ysinghc/dhanvantri-backend.git temp
cp -r temp/src/* backend/src/
rm -rf temp

# If GitHub repository doesn't exist, we're creating essential files manually
if [ ! -d "backend/src/config" ] || [ ! -f "backend/src/app.js" ]; then
  echo "Creating essential backend files manually..."
  
  # Create server.js
  cat > backend/src/server.js << 'EOF'
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

  # Create app.js
  cat > backend/src/app.js << 'EOF'
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
const notificationRoutes = require('./routes/notificationRoutes');
const healthMetricRoutes = require('./routes/healthMetricRoutes');
const emergencyCardRoutes = require('./routes/emergencyCardRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/medical-records', medicalRecordRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/lab-reports', labReportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/health-metrics', healthMetricRoutes);
app.use('/api/v1/emergency-card', emergencyCardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Dhanvantri Healthcare API',
    version: '1.0.0',
    status: 'active',
    documentation: `${process.env.API_URL}/api-docs`
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
EOF

  # Create database connection file
  cat > backend/src/config/db.js << 'EOF'
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

  # Create error middleware
  cat > backend/src/middleware/errorMiddleware.js << 'EOF'
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

  # Create auth middleware
  cat > backend/src/middleware/authMiddleware.js << 'EOF'
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
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

const doctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a doctor');
  }
};

const hospital = (req, res, next) => {
  if (req.user && req.user.role === 'hospital') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a hospital');
  }
};

const patient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a patient');
  }
};

module.exports = { protect, admin, doctor, hospital, patient };
EOF

  # Create swagger.js
  cat > backend/src/swagger.js << 'EOF'
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
EOF

  # Create token generation utility
  cat > backend/src/utils/generateToken.js << 'EOF'
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
EOF

fi

echo "Backend setup complete!"
echo "To start the server in development mode, run:"
echo "cd backend && npm run dev" 