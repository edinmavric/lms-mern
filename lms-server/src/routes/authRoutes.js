const express = require('express');
const router = express.Router();
const {
  login,
  register,
  tenantSignup,
  forgotPassword,
  resetPassword,
  searchTenants,
  refreshToken,
} = require('../controllers/authController');
const {
  authLimiter,
  passwordResetLimiter,
  tenantSignupLimiter,
} = require('../middleware/rateLimit');

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/tenant-signup', tenantSignupLimiter, tenantSignup);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/refresh-token', refreshToken);

router.get('/search-tenants', searchTenants);

module.exports = router;
