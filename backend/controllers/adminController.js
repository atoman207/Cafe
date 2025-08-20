const User = require('../models').User;
const Event = require('../models').Event;
const EventApplication = require('../models').EventApplication;
const Favorite = require('../models').Favorite;
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Joi = require('joi');
dotenv.config();

// USERS
exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      data: users,
      totalItems: count,
      totalPages,
      currentPage: page,
      itemsPerPage: limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch users.' });
  }
};

exports.getUser = async (req, res) => {
  const user = await User.findByPk(req.body.id, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

exports.createUser = async (req, res) => {
  const userSchema = Joi.object({
    username: Joi.string().min(2).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
    membershipStatus: Joi.string().valid('free', 'paid', 'admin').optional(),
    phone: Joi.string().min(10).max(15).optional(),
    address: Joi.string().min(3).max(100).optional()
  });
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    // Check for duplicate email or username
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already in use.' });
    }
    const user = await User.create({
      username, email, membershipStatus, phone, address,
      password: await bcrypt.hash(password, 10), notificationEnabled: true
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create user.' });
  }
};

exports.updateUser = async (req, res) => {
  const userSchema = Joi.object({
    id: Joi.number().required(),
    username: Joi.string().min(2).max(20).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).max(30).optional(),
    membershipStatus: Joi.string().valid('free', 'paid', 'admin').optional(),
    phone: Joi.string().min(10).max(15).optional(),
    address: Joi.string().min(3).max(100).optional()
  });
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const user = await User.findByPk(req.body.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const { username, email, isAdmin, membershipStatus } = req.body;
  await user.update({ username, email, isAdmin, membershipStatus });
  const { password, ...userData } = user.toJSON();
  res.json({ message: 'User updated.', user: userData });
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.body.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    // Delete related records first
    await EventApplication.destroy({ where: { userId: req.body.id } });
    await Favorite.destroy({ where: { userId: req.body.id } });
    
    // Now delete the user
    await user.destroy();
    res.json({ message: 'User deleted.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete user.' });
  }
};

// EVENTS
exports.listEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows: events } = await Event.findAndCountAll({
      limit,
      offset,
      order: [['date', 'ASC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      data: events,
      totalItems: count,
      totalPages,
      currentPage: page,
      itemsPerPage: limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch events.' });
  }
};

exports.createEvent = async (req, res) => {
  const eventSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).optional(),
    date: Joi.date().required(),
    applyDeadline: Joi.date().required(),
    location: Joi.string().min(2).max(100).required(),
    imageUrl: Joi.string().uri().optional().allow('')
  });
  const { error } = eventSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const event = await Event.create({ name, description, date, applyDeadline, location, imageUrl });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create event.' });
  }
};

exports.updateEvent = async (req, res) => {
  const eventSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(1000).optional(),
    date: Joi.date().optional(),
    applyDeadline: Joi.date().optional(),
    location: Joi.string().min(2).max(100).optional(),
    imageUrl: Joi.string().uri().optional().allow('')
  });
  const { error } = eventSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const event = await Event.findByPk(req.body.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  const { name, description, date, location, imageUrl } = req.body;
  await event.update({ name, description, date, location, imageUrl });
  res.json(event);
};

exports.deleteEvent = async (req, res) => {
  const event = await Event.findByPk(req.body.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  await event.destroy();
  res.json({ message: 'Event deleted.' });
};

// Get all cities grouped by region
exports.getCitiesGroupedByRegion = async (req, res) => {
  try {
    const City = require('../models').City;
    const cities = await City.findAll();
    const grouped = {};
    cities.forEach(city => {
      if (!grouped[city.region]) grouped[city.region] = [];
      grouped[city.region].push(city);
    });
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 

// exports.sendDailyReminders = async (req, res) => {
//   // Security: check secret token
//   if (req.headers['x-reminder-secret'] !== process.env.REMINDER_SECRET) {
//     return res.status(403).json({ message: 'Forbidden' });
//   }
//   try {
//     const { Op } = require('sequelize');
//     const Event = require('../models').Event;
//     const EventApplication = require('../models').EventApplication;
//     const User = require('../models').User;
//     const Notification = require('../models').Notification;
//     const emailJs = require('@emailjs/browser');
//     emailJs.init(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_USER_ID);
//     const now = new Date();
//     const oneDayAhead = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
//     const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
//     const oneDayAheadStr = oneDayAhead.toISOString().slice(0, 10);
//     const sevenDaysAheadStr = sevenDaysAhead.toISOString().slice(0, 10);
//     const events = await Event.findAll({
//       where: {
//         date: {
//           [Op.or]: [oneDayAheadStr, sevenDaysAheadStr]
//         }
//       }
//     });
//     let totalReminders = 0;
//     for (const event of events) {
//       const eventDate = new Date(event.date);
//       const daysUntil = Math.round((eventDate - now) / (24 * 60 * 60 * 1000));
//       const applications = await EventApplication.findAll({
//         where: { eventId: event.id, status: 'approved' },
//         include: [
//           { model: User, as: 'user', where: { notificationEnabled: true } }
//         ]
//       });
//       for (const application of applications) {
//         const user = application.user;
//         let subject, message;
//         if (daysUntil === 7) {
//           subject = `【RunMap】イベントリマインダー: ${event.name} - 1週間前`;
//           message = `${user.username} 様\n\n${event.name} が1週間後に開催されます。\n\n【イベント詳細】\n・イベント名: ${event.name}\n・開催日: ${event.date}\n・開催場所: ${event.location}\n・申込締切: ${event.applyDeadline}\n\n準備を忘れずにお願いします！\n\nRunMap`;
//         } else if (daysUntil === 1) {
//           subject = `【RunMap】イベントリマインダー: ${event.name} - 明日開催`;
//           message = `${user.username} 様\n\n${event.name} が明日開催されます！\n\n【イベント詳細】\n・イベント名: ${event.name}\n・開催日: ${event.date}\n・開催場所: ${event.location}\n\n当日の準備をお忘れなく！\n\nRunMap`;
//         } else {
//           continue;
//         }
//         try {
//           const templateParams = {
//             to_name: user.username,
//             to_email: user.email,
//             from_name: 'RunMap Admin',
//             from_email: 'yoshinotakashi69@gmail.com',
//             reply_to: 'yoshinotakashi69@gmail.com',
//             subject: subject,
//             message: message,
//           };
//           await emailJs.send(
//             process.env.EMAILJS_SERVICE_ID,
//             process.env.EMAILJS_TEMPLATE_ID,
//             templateParams,
//             process.env.EMAILJS_USER_ID
//           );
//           await Notification.create({
//             userId: user.id,
//             message: `${event.name}のリマインダー: ${daysUntil === 7 ? '1週間前' : '明日開催'}`,
//             isRead: false
//           });
//           totalReminders++;
//         } catch (error) {
//           console.error(`Failed to send reminder to ${user.email}:`, error.message);
//         }
//       }
//     }
//     res.json({ message: `Reminders sent! (${totalReminders})` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }; 