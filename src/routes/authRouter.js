const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const config = require('../config/index.js');
const authController = require('../controllers/authController.js');
const payloadValidator = require('../middleware/payloadValidator.js');
const { OTPRequestSchema, loginSchema } = require('../middleware/payloadSchemas/authSchema.js');

const router = express.Router();

router.post('/otp',
payloadValidator({ schema: OTPRequestSchema, key: 'body' }),
(req, res, next) => (req.body.email) ? next() : authValidator(req, res, next),
OTPCreationHandler,
);

router.post('/login',
payloadValidator({ schema: loginSchema, key: 'body' }),
passport.authenticate('local', { session: false }),
loginHandler,
);

function authValidator(req, res, next) {
  passport.authenticate('jwt', { session: false })(req, res, next)
}

function OTPCreationHandler(req, res, next) {
  const payload = {
    email: req.body.email || req.user.email,
    emailShouldBeStored: req.body.emailShouldBeStored
  };
  authController.sendOTP(payload)
    .then(() => res.send('A code was sent to the provided email. Please use it to complete the action.'))
    .catch((error) => next(error))
}

function loginHandler(req, res, next) {
  const payload = { ...req.user };
  authController.login(payload)
    .then((data) => {
      res.json(data)})
    .catch((error) => next(error));
}

module.exports = router;
