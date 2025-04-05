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
