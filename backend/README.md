# Dhanvantri Healthcare Platform Backend

This repository contains the backend API for the Dhanvantri Healthcare Platform, a comprehensive healthcare management system.

## Technology Stack

- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Documentation**: Swagger/OpenAPI
- **Validation**: Express Validator
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dhanvantri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
API_URL=http://localhost:3000/api/v1
```

### Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### Seeding the Database

To seed the database with sample data:

```bash
npm run seed
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user (patient/doctor/hospital)
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Patients

- `GET /api/v1/patients/dashboard` - Get patient dashboard data
- `GET /api/v1/patients/appointments` - List patient appointments
- `GET /api/v1/patients/medical-records` - Get medical records
- `GET /api/v1/patients/prescriptions` - List prescriptions
- `GET /api/v1/patients/lab-reports` - List lab reports

### Doctors

- `GET /api/v1/doctors/dashboard` - Get doctor dashboard data
- `GET /api/v1/doctors/appointments` - List doctor appointments
- `GET /api/v1/doctors/patients` - List doctor's patients
- `POST /api/v1/doctors/medical-records` - Create medical record
- `POST /api/v1/doctors/prescriptions` - Create prescription

### Hospitals

- `GET /api/v1/hospitals/dashboard` - Get hospital dashboard data
- `GET /api/v1/hospitals/doctors` - List hospital doctors
- `GET /api/v1/hospitals/appointments` - List hospital appointments
- `POST /api/v1/hospitals/doctors` - Add doctor to hospital

### Appointments

- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/:id` - Get appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

### Medical Records

- `GET /api/v1/medical-records/:id` - Get medical record
- `PUT /api/v1/medical-records/:id` - Update medical record
- `DELETE /api/v1/medical-records/:id` - Delete medical record

### Prescriptions

- `GET /api/v1/prescriptions/:id` - Get prescription
- `PUT /api/v1/prescriptions/:id` - Update prescription
- `DELETE /api/v1/prescriptions/:id` - Delete prescription

### Lab Reports

- `POST /api/v1/lab-reports` - Create lab report
- `GET /api/v1/lab-reports/:id` - Get lab report
- `PUT /api/v1/lab-reports/:id` - Update lab report
- `DELETE /api/v1/lab-reports/:id` - Delete lab report

## Deployment

The API can be deployed using Docker:

```bash
docker-compose up -d
```

## License

This project is licensed under the MIT License. 