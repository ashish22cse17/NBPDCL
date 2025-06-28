const express = require('express');
const router = express.Router();
const {
  submitComplaint,
  getComplaints,
  getAllComplaints,
  resolveComplaint,
} = require('../controllers/complaintController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', submitComplaint);
router.get('/', getComplaints);
router.get('/all', getAllComplaints);
router.put('/:complaintId/resolve', upload.single('proof'), resolveComplaint);

module.exports = router;
