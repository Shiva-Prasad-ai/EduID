import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

// Force Google DNS to bypass Windows ECONNREFUSED on MongoDB Atlas SRV lookup
dns.setServers(['8.8.8.8', '8.8.4.4']);

const testConnections = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':<hidden>@')); // Hide password in logs

  try {
    console.log('\n--- Test 1: Standard Connection with Custom DNS ---');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connection Successful!');
    await mongoose.disconnect();
  } catch (e) {
    console.error('❌ Connection Failed:', e.message);
  }
};

testConnections();
