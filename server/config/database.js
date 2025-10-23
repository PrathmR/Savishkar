import mongoose from 'mongoose';

const connectDB = async () => {
  console.log('\n🗄️  Connecting to MongoDB...');
  console.log('─'.repeat(50));
  
  try {
    // Production-optimized connection settings
    const options = {
      maxPoolSize: 10,          // Maximum number of connections in the pool
      minPoolSize: 2,           // Minimum number of connections to maintain
      serverSelectionTimeoutMS: 5000,  // Timeout for selecting a server (5s)
      socketTimeoutMS: 45000,   // Socket timeout (45s)
      family: 4                 // Use IPv4, skip trying IPv6
    };
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`📡 Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Unknown'}`);
    console.log('─'.repeat(50));
  } catch (error) {
    console.log('❌ MongoDB Connection FAILED!');
    console.log(`📛 Error: ${error.message}`);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   1. Check MONGODB_URI is correct');
    console.log('   2. Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for all)');
    console.log('   3. Check database user credentials');
    console.log('   4. Ensure network access is configured');
    console.log('─'.repeat(50));
    process.exit(1);
  }
};

export default connectDB;
