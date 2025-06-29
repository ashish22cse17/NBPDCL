const express = require('express');
const router = express.Router();
const { registerUser,
  getAllUsers,
  updateUserStatus,
  deleteUser, } = require('../controllers/userController');
const { loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');


router.post('/signup', registerUser);
router.post('/login', loginUser); 
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', protect, async (req, res) => {
  const user = req.user;

  if (user.role === "admin" || user.userType === "admin") {
    return res.json({
      userType: "admin",
      username: user.username || "Admin"
    });
  }

  // Normal DB user
  const { _id, fullName, email, status, role, centerId, designation } = user;
  return res.json({
    _id,
    fullName,
    email,
    status,
    centerId,
    designation,
    userType: role || "user"
  });
});



router.get('/', getAllUsers);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;