const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Sign JWT and return response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'jwt_secret_default_key_123456',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // User object without password
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    googleId: user.googleId,
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userResponse,
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: 'Google authentication details missing' });
    }

    // Find if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update googleId and avatar if not present
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user (password is not required for Google users)
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatar: avatar || '',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    await user.save();

    // Create reset URL
    const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '2525', 10),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'AI Code Explainer'}" <${process.env.EMAIL_USER || 'no-reply@aicodeexplainer.com'}>`,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
             <p>Please click the link below to reset your password (valid for 10 minutes):</p>
             <a href="${resetUrl}" target="_blank">${resetUrl}</a>
             <p>If you did not request this, please ignore this email.</p>`,
    };

    // Log the link in console for local testing
    console.log(`[TESTING ONLY] Reset Password link: ${resetUrl}`);

    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('SMTP credentials (EMAIL_USER & EMAIL_PASS) are not configured in the backend .env file.');
      }
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Password reset link sent to email.' });
    } catch (err) {
      console.error('Mail sending error:', err.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: `Email could not be sent: ${err.message}` });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Register/Login temporary guest user
// @route   POST /api/auth/guest
// @access  Public
exports.guestLogin = async (req, res, next) => {
  try {
    const guestId = crypto.randomBytes(6).toString('hex');
    const guestEmail = `guest_${guestId}@decodeai.com`;
    const guestName = `Guest ${guestId.toUpperCase()}`;
    
    const user = await User.create({
      name: guestName,
      email: guestEmail,
      password: crypto.randomBytes(16).toString('hex'),
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
