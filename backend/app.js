const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize, User } = require('./models');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const contactRoutes = require('./routes/contact');
// require('./cron/eventReminders');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();
// Function to create default admin account
const createDefaultAdmin = async () => {
  try {
    console.log('🔍 Checking for existing admin account...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: {
        email: 'admin@gmail.com'
      }
    });

    if (!existingAdmin) {
      console.log('📝 Creating default admin account...');
      
      // Create admin account
      const hashedPassword = await bcrypt.hash('12345678', 10);
      await User.create({
        username: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        membershipStatus: 'admin',
        notificationEnabled: true,
        phone: '',
        address: ''
      });
      
      console.log('✅ Default admin account created successfully!');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: 12345678');
      console.log('⚠️  Please change the password after first login for security!');
    } else {
      console.log('ℹ️  Admin account already exists - skipping creation');
    }
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Raw body middleware for Stripe webhooks
app.use('/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRoutes);
app.use('/contact', contactRoutes);

sequelize.sync().then(() => {
  createDefaultAdmin(); // Call the function here
  app.listen(5000, () => console.log('Server is running on port 5000'));
});