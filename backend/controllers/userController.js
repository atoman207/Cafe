const User = require('../models').User;
const Favorite = require('../models').Favorite;
const Event = require('../models').Event;
const Notification = require('../models').Notification;
const bcrypt = require('bcrypt');
const Joi = require('joi');

exports.getFavorites = async (req, res) => {
  const { id } = req.user;
  const favorites = await Favorite.findAll({
    where: { userId: id },
    include: [{ model: Event }]
  });
  res.json(favorites);
};

const updateProfileSchema = Joi.object({
  username: Joi.string().min(2).max(20).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).max(30).optional(),
  phone: Joi.string().min(10).max(15).optional(),
  address: Joi.string().min(10).max(100).optional()
});

exports.addFavorite = async (req, res) => {
  const { id } = req.user;
  const { eventId } = req.body;
  
  // Check if event exists
  const event = await Event.findByPk(eventId);
  if (!event) {
    return res.status(404).json({ message: 'イベントが見つかりません' });
  }
  
  // Check if favorite already exists
  const existing = await Favorite.findOne({ where: { userId: id, eventId } });
  if (existing) {
    return res.status(409).json({ message: 'すでにお気に入りに追加されています' });
  }
  
  const favorite = await Favorite.create({ userId: id, eventId });
  res.json(favorite);
};

exports.removeFavorite = async (req, res) => {
  const { id } = req.user;
  const { eventId } = req.params;
  const deleted = await Favorite.destroy({ where: { userId: id, eventId } });
  if (deleted === 0) {
    return res.status(404).json({ message: 'お気に入りが見つかりません' });
  }
  res.json({ message: 'お気に入りから削除しました' });
};

exports.getProfile = async (req, res) => {
  const { id } = req.user;
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const { id } = req.user;
  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { username, email, password, phone, address } = req.body;
  if (!username && !email && !password && !phone && !address) {
    return res.status(400).json({ message: 'At least one field (username, email, password) is required.' });
  }
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const updateData = {};
  if (username && username !== user.username) {
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username is already taken.' });
    }
    updateData.username = username;
  }
  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already taken.' });
    }
    updateData.email = email;
  }
  if (password) {
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    updateData.password = await bcrypt.hash(password, 10);
  }
  if (phone && phone !== user.phone) {
    updateData.phone = phone;
  }
  if (address && address !== user.address) {
    updateData.address = address;
  }
  await user.update(updateData);
  const { password: _, ...userData } = user.toJSON();
  res.json({ message: 'Profile updated successfully.', user: userData });
};

exports.getNotifications = async (req, res) => {
  const { id } = req.user;
  const user = await User.findByPk(id);
  //check if user membership is active (allow admin users)
  if (user.membershipStatus === 'free') {
    return res.status(403).json({ message: 'User membership is not active.' });
  }
  //check if notification is enabled (admin users can bypass this check)
  if (!user.notificationEnabled && user.membershipStatus !== 'admin') {
    return res.status(403).json({ message: 'Notification is not enabled.' });
  }
  const notifications = await Notification.findAll({
    where: {
      userId: id,
    }
  });
  res.json(notifications);
};

exports.getUnreadNotifications = async (req, res) => {
  const { id } = req.user;
  const user = await User.findByPk(id);
  //check if user membership is active (allow admin users)
  if (user.membershipStatus === 'free') {
    return res.status(403).json({ message: 'User membership is not active.' });
  }
  //check if notification is enabled (admin users can bypass this check)
  if (!user.notificationEnabled && user.membershipStatus !== 'admin') {
    return res.status(403).json({ message: 'Notification is not enabled.' });
  }
  const notifications = await Notification.findAll({
    where: {
      userId: id,
      isRead: false
    }
  });
  res.json(notifications);
};

exports.updateNotifications = async (req, res) => {
  const { id } = req.user;
  const { notifications } = req.body;
  const user = await User.findByPk(id);
  //check if user membership is active (allow admin users)
  if (user.membershipStatus === 'free') {
    return res.status(403).json({ message: 'User membership is not active.' });
  }
  await Notification.update({ message: notifications }, { where: { userId: id } });
  res.json({ message: 'Notifications updated successfully.' });
};

exports.toggleNotificationEnabled = async (req, res) => {
  const { id } = req.user;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.membershipStatus !== 'paid' && user.membershipStatus !== 'admin') {
    return res.status(403).json({ message: 'Only paid members and admin can change notification settings.' });
  }
  // Toggle or set explicitly if provided
  let newValue;
  if (typeof req.body.enabled === 'boolean') {
    newValue = req.body.enabled;
  } else {
    newValue = !user.notificationEnabled;
  }
  await user.update({ notificationEnabled: newValue });
  res.json({ message: 'Notification setting updated.', notificationEnabled: newValue });
};

// This method is deprecated - use Stripe payment instead
exports.upgradeMembership = async (req, res) => {
  res.status(400).json({ 
    message: 'Please use the payment system to upgrade your membership.',
    redirectTo: '/payment'
  });
}; 