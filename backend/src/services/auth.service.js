const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { generateToken } = require('../utils/jwt');

// centralied error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// auth logic

const signUp = async (userData) => {
  const { email, password, name, phone } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) throw new AppError('An account with this email already exists.', 400);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name: name || null,
      phone: phone || null
    },
    select: { id: true, email: true, name: true, phone: true, createdAt: true }
  });

  return { user, token: generateToken(user.id) };
};

const logIn = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid email or password.', 401);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      profilePhoto: user.profilePhoto
    },
    token: generateToken(user.id)
  };
};

// profile logic

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true, email: true, name: true, phone: true, 
      about: true, profilePhoto: true, createdAt: true 
    }
  });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const { name, phone, about, profilePhoto } = updateData;

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (phone !== undefined) dataToUpdate.phone = phone;
  if (about !== undefined) dataToUpdate.about = about;
  if (profilePhoto !== undefined) dataToUpdate.profilePhoto = profilePhoto;

  const user = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: { 
      id: true, email: true, name: true, phone: true, 
      about: true, profilePhoto: true, updatedAt: true 
    }
  });

  return user;
};

// reset pass logic

const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (user) {
    // mock email service 
    console.log(`[MOCK EMAIL SERVICE] Sending password reset to ${email}`);
  }
  
  // always return true to prevent email enumeration attacks
  return true;
};

module.exports = {
  signUp,
  logIn,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  AppError
};