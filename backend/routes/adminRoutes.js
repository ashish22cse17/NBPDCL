const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminController');


router.post('/adminLogin', adminLogin);

module.exports = router;
