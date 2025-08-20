const cron = require('node-cron');
const { Op } = require('sequelize');
const Event = require('../models').Event;
const EventApplication = require('../models').EventApplication;
const User = require('../models').User;
const Notification = require('../models').Notification;
const emailJs = require('@emailjs/browser');
const dotenv = require('dotenv');
dotenv.config();

emailJs.init(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_USER_ID);
// Send reminder emails to users who applied for events
// Runs every day at 9:00 AM

cron.schedule('* 9 * * * *', async () => {  // 9:00 AM  
  console.log('Running event application reminder cron job...');
  
  try {
    const now = new Date();
    
    // Calculate target dates for reminders (7 days and 1 day before event)
    const oneDayAhead = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format dates for database query (YYYY-MM-DD)
    const oneDayAheadStr = oneDayAhead.toISOString().slice(0, 10);
    const sevenDaysAheadStr = sevenDaysAhead.toISOString().slice(0, 10);
    console.log(oneDayAheadStr, sevenDaysAheadStr);
    // Find events starting in exactly 1 day or 7 days
    const events = await Event.findAll({
      where: {
        date: {
          [Op.or]: [oneDayAheadStr, sevenDaysAheadStr]
        }
      }
    });
    
    console.log(`Found ${events.length} events for reminders`);
    
    for (const event of events) {
      // Calculate days until event
      const eventDate = new Date(event.date);
      const daysUntil = Math.round((eventDate - now) / (24 * 60 * 60 * 1000));
      
      // Find all applications for this event
      const applications = await EventApplication.findAll({
        where: { 
          eventId: event.id,
          status: 'approved' // Only send reminders to approved applications
        },
        include: [
          {
            model: User,
            as: 'user',
            where: { notificationEnabled: true } // Only users with notifications enabled
          }
        ]
      });
      
      console.log(`Found ${applications.length} applications for event: ${event.name}`);
      
      for (const application of applications) {
        const user = application.user;
        
        // Determine which reminder this is
        let subject, message;
        
        if (daysUntil === 7) {
          subject = `【RunMap】イベントリマインダー: ${event.name} - 1週間前`;
          message = `
          ${user.username} 様

          ${event.name} が1週間後に開催されます。

          【イベント詳細】
          ・イベント名: ${event.name}
          ・開催日: ${event.date}
          ・開催場所: ${event.location}
          ・申込締切: ${event.applyDeadline}

          準備を忘れずにお願いします！

          RunMap
          `.trim();
        } else if (daysUntil === 1) {
          subject = `【RunMap】イベントリマインダー: ${event.name} - 明日開催`;
          message = `
          ${user.username} 様

          ${event.name} が明日開催されます！

          【イベント詳細】
          ・イベント名: ${event.name}
          ・開催日: ${event.date}
          ・開催場所: ${event.location}

          当日の準備をお忘れなく！

          RunMap
          `.trim();
        } else {
          continue; // Skip if not exactly 1 or 7 days
        }
        
        try {
          const templateParams = {
            // to_name: user.username,
            to_name: 'a',
            to_email: 'mori.sunrise9546@gmail.com',
            from_name: 'RunMap Admin',
            from_email: 'yoshinotakashi69@gmail.com',
            reply_to: 'yoshinotakashi69@gmail.com',
            subject: subject,
            message: message,
          };
          // Send email
          await emailJs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams,
            process.env.EMAILJS_USER_ID
          );
          
          // Create notification
          await Notification.create({
            userId: user.id,
            message: `${event.name}のリマインダー: ${daysUntil === 7 ? '1週間前' : '明日開催'}`,
            isRead: false
          });
          
          console.log(`Sent reminder to ${user.email} for event: ${event.name}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${user.email}:`, error.message);
        }
      }
    }
    
    console.log('Event application reminder cron job completed');
  } catch (error) {
    console.error('Error in event application reminder cron job:', error);
  }
});

module.exports = cron; 