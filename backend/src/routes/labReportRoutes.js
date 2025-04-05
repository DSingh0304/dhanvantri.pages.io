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
