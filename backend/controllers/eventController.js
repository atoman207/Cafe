const Event = require('../models').Event;
const EventApplication = require('../models').EventApplication;
const User = require('../models').User;
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');
const Joi = require('joi');

// Get all events with pagination and filtering
exports.getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause = {};
    
    // Location filter
    if (req.query.location) {
      whereClause.location = req.query.location;
    }
    
    // Date filter
    if (req.query.date) {
      whereClause.date = {
        [Op.gte]: req.query.date
      };
    }
    
    // Search filter
    if (req.query.search) {
      whereClause[Op.or] = [
        {
          name: {
            [Op.like]: `%${req.query.search}%`
          }
        },
        {
          description: {
            [Op.like]: `%${req.query.search}%`
          }
        },
        {
          location: {
            [Op.like]: `%${req.query.search}%`
          }
        }
      ];
    }
    
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['date', 'ASC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      events,
      totalPages,
      currentPage: page,
      totalEvents: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply for an event
exports.applyForEvent = async (req, res) => {
  const schema = Joi.object({
    eventId: Joi.number().required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const { eventId } = req.body;
    const userId = req.user.id; // From auth middleware

    sendEmail("zumado.jp0527@gmail.com", "Welcome!", "Thanks for signing up.")
        .then((id) => {
          if (id) {
            console.log("Email sent, ID:", id);
          } else {
            console.log("Failed to send email.");
          }
        });
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'イベントが見つかりません' });
    }
    
    // Check if user already applied
    const existingApplication = await EventApplication.findOne({
      where: { userId, eventId }
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'すでにこのイベントに申し込んでいます' });
    }
    
    // Check if event is still accepting applications
    const now = new Date();
    const applyDeadline = new Date(event.applyDeadline);
    
    if (now > applyDeadline) {
      return res.status(400).json({ message: '申込期間が終了しています' });
    }
    
    // Create application
    const application = await EventApplication.create({
      userId,
      eventId,
      status: 'pending'
    });
    
    res.status(201).json({
      message: 'イベントへの申し込みが完了しました',
      application
    });
  } catch (error) {
    console.error('Event application error:', error);
    res.status(500).json({ message: '申し込みに失敗しました' });
  }
};

// Get user's event applications
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const applications = await EventApplication.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: 'event'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel event application
exports.cancelApplication = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    const application = await EventApplication.findOne({
      where: { userId, eventId }
    });
    
    if (!application) {
      return res.status(404).json({ message: '申し込みが見つかりません' });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({ message: '承認済みまたは拒否された申し込みはキャンセルできません' });
    }
    
    await application.destroy();
    
    res.json({ message: '申し込みをキャンセルしました' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all applications for an event
exports.getEventApplications = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const applications = await EventApplication.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '無効なステータスです' });
    }
    
    const application = await EventApplication.findByPk(applicationId, {
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Event,
          as: 'event'
        }
      ]
    });
    
    if (!application) {
      return res.status(404).json({ message: '申し込みが見つかりません' });
    }
    
    application.status = status;
    await application.save();
    
    res.json({
      message: '申し込みステータスを更新しました',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 

// Get events by city and date range
exports.getEventsByCityAndDate = async (req, res) => {
  try {
    const { cityId, page = 1, limit = 20, name, location, startDate, endDate } = req.query;
    const whereClause = {};
    if (cityId) {
      whereClause.cityId = cityId;
    }
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereClause.date = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.date = { [Op.lte]: endDate };
    }
    // Add race type filters if present
    [
      'fiveKm', 'tenKm', 'half', 'full', 'ultra', 'elementary', 'parent', 'timed', 'relay', 'trail'
    ].forEach(type => {
      if (req.query[type]) {
        whereClause[type] = true;
      }
    });
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [{ model: require('../models').City }],
      order: [['date', 'ASC']],
      limit: parseInt(limit),
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.json({ events, totalPages, currentPage: parseInt(page), totalEvents: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
