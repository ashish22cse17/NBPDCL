const bcrypt = require('bcryptjs');

const adminLogin = async (req, res) => {
  const { username, password, captchaInput, captchaServer } = req.body;

  if (captchaInput !== captchaServer) {
    return res.status(400).json({ message: 'Invalid captcha' });
  }

  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  res.status(200).json({ message: 'Admin login successful' });
};

module.exports = { adminLogin };
