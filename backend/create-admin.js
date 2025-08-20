const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');

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

// Run the function
const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    await createDefaultAdmin();
    
    console.log('✅ Admin account setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

run(); 