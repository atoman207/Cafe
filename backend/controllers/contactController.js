const Joi = require('joi');
const dotenv = require('dotenv');
dotenv.config();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendMail = async (req, res) => {  
  const { to, subject, message } = req.body;
  console.log("=>0", to, subject, message);
  
  // Validation schema
  const schema = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(5000).required(),
  });
  console.log("=>1", schema);
  // Validate request
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // Prepare email
  const msg = {
    to: to,
    from: process.env.SENDGRID_FROM_EMAIL || 'goodsman207@gmail.com', // Use env variable
    subject: subject,
    text: message, // Changed from 'message' to 'text'
    html: `<p>${message}</p>`, // Optional HTML version
  };
  console.log("=>3", msg);  
  try {
    await sgMail.send(msg);
    res.json({ message: 'メールが送信されました。' });
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    res.status(500).json({ 
      message: 'メール送信に失敗しました。', 
      error: error.message 
    });
  }
};