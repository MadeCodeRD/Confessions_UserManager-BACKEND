import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userModel = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: 3,
    maxlength: 20,
  },

  email: {
    type: String,
    required: [true, 'Please provide your email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email',
    },
    unique: true,
  },

  password: {
    type: String,
    required: [true, 'Please provide your password]'],
    validate: {
      validator: validator.isStrongPassword,
      message: 'Please provide a valid password',
    },
    select: false,
  },

  verificationCode: {
    type: String,
  },

  verificationCodeExpDate: Date,

  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },

  verified: Date,

  role:{
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }

});

userModel.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userModel.methods.createJWT = function () {
  return jwt.sign({ userId: this._id, verificationCode: this.verificationCode }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

userModel.methods.comparePassword = async function(userPassword){
  return await bcrypt.compare(userPassword, this.password);
}

export default mongoose.model('User', userModel);
