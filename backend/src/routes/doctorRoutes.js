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
