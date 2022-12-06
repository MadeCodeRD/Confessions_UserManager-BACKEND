import { StatusCodes } from 'http-status-codes';
import {
  BadRequestError,
  UnauthorizedError,
  UnauthenticatedError,
} from '../errors/index.js';
import User from '../models/user.js';
import {
  verifyEmailTemplate,
  sendEmail,
  forgotPasswordEmailTemplate,
  createHash,
} from '../utils/index.js';
import crypto from 'crypto';

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError('Please provide all values!');
  }

  let user = await User.findOne({ email });

  if (user) {
    throw new BadRequestError('Email already in use');
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const verificationCode = crypto.randomBytes(40).toString('hex');

  user = await User.create({ name, email, password, verificationCode, role });

  const token = user.createJWT();
  const template = verifyEmailTemplate(name, verificationCode, email);
  await sendEmail(email, 'Please activate your account!', template);

  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: 'Success, please check your email to verify the account',
    data: {
      name: user.name,
      email: user.email,
    },
    token,
  });
};

const confirmAccount = async (req, res) => {
  const { token: verificationCode } = req.params;
  const { email } = req.query;

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthorizedError('Verification failed');
  }

  if (verificationCode !== user.verificationCode) {
    throw new UnauthorizedError('Verification failed');
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationCode = null;

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    msg: 'Account Verified!',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide all values!');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials!');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials!');
  }

  if (!user.isVerified) {
    throw new UnauthenticatedError('Please verify your email to log in');
  }

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      name: user.name,
      email: user.email,
    },
    token,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError('Please provide all values!');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const verificationCode = crypto.randomBytes(70).toString('hex');
  const template = forgotPasswordEmailTemplate(
    user.name,
    verificationCode,
    email
  );
  await sendEmail(email, 'Please, reset your password!', template);

  const tenMinutes = 1000 * 60 * 10;
  const verificationCodeExpDate = new Date(Date.now() + tenMinutes);
  user.verificationCode = createHash(verificationCode);
  user.verificationCodeExpDate = verificationCodeExpDate;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link!' });
};

const resetPassword = async (req, res) => {
  const { token: verificationCode, email } = req.query;
  const { password } = req.body;


  if (!verificationCode || !email || !password) {
    throw new UnauthorizedError('Reset Password Failed!');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials!');
  }

  const currentDate = new Date();

  if (
    user.verificationCode === createHash(verificationCode) &&
    user.verificationCodeExpDate > currentDate
  ) {
    user.password = password;
    user.verificationCode = null;
    user.verificationCodeExpDate = null;
    await user.save();
  }

  res.status(StatusCodes.OK).json({
    success: true,
    msg: 'Reset Password Completed!',
  });
};

export { signup, confirmAccount, login, forgotPassword, resetPassword };
