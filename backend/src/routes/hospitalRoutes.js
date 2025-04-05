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
