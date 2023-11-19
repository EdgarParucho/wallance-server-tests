const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');
const payloadValidator = require('../middleware/payloadValidator.js');
const { createUserSchema, updateUserSchema } = require('../thirdParty/joi/userSchema.js');

const router = express.Router();

router.post('/',
  payloadValidator({ schema: createUserSchema, key: 'body' }),
  OTPValidator,
  createUser,
)

router.patch('/',
  payloadValidator({ schema: updateUserSchema, key: 'body' }),
  authenticator,
  OTPValidator,
  patchUserHandler,
);

router.patch('/reset',
  payloadValidator({ schema: createUserSchema, key: 'body' }),
  OTPValidator,
  resetPasswordHandler,
);

router.delete('/',
  authenticator,
  OTPValidator,
  deleteUserHandler,
);

function authenticator(req, res, next) {
  passport.authenticate('jwt', { session: false })(req, res, next)
}

function OTPValidator(req, res, next) {
  if (req.body.preferences && !req.body.email && !req.body.password) return next()
  const OTP = req.header('OTP');
  const email = req.body.email || req.user.email;
  const payload = { code: OTP, sub: email };
  authController.validateOTP(payload)
    .then(() => next())
    .catch((error) => next(error))
}

function createUser(req, res, next) {
  const payload = req.body;
  userController.createUser(payload)
    .then((data) => res.status(201).send(data))
    .catch((error) => next(error))
}

function patchUserHandler(req, res, next) {
  const payload = { updateEntries: req.body, id: req.user.sub };
  userController.patchUser(payload)
    .then((data) => res.status(200).json(data))
    .catch((error) => next(error))
}

function deleteUserHandler(req, res, next) {
  const payload = req.user.sub;
  userController.deleteUser(payload)
    .then((data) => res.json(data))
    .catch((error) => next(error))
}

function resetPasswordHandler(req, res, next) {
  const payload = { email: req.body.email, password: req.body.password };
  userController.resetPassword(payload)
    .then((data) => res.json(data))
    .catch((error) => next(error))
}

module.exports = router;
