const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

let centerCounter = 100;

const registerUser = async (req, res) => {
  try {
    const { fullName, mobile, email, password, confirmPassword, captchaInput, captchaServer } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (captchaInput !== captchaServer) {
      return res.status(400).json({ message: 'Invalid captcha' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (userExists) {
      return res.status(400).json({ message: 'Email or Mobile already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      mobile,
      email,
      passwordHash,
      status: 'held',
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'fullName email status');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status, designation } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    if (designation) user.designation = designation;

    // Auto-generate centerId if status is 'accepted' and centerId is not already assigned
    if (status === 'accepted' && !user.centerId) {
      centerCounter++;
      user.centerId = `CTR${centerCounter}`;
    }

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};




module.exports = { registerUser, getAllUsers, updateUserStatus, deleteUser };
