const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');

async function runDiagnostics() {
  console.log('====================================================');
  console.log('       QueS.M design Pre-Deployment Health Check     ');
  console.log('====================================================\n');

  const report = {
    database: { passed: false },
    apiHealth: { passed: false },
    publicEndpoints: { passed: false },
    adminAuth: { passed: false },
    imageUpload: { passed: false },
    smtpMail: { passed: false }
  };

  // 1. DATABASE CHECK
  console.log('1. Checking Database (MongoDB)...');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ques_m_design';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const colNames = collections.map(c => c.name);

    const counts = {};
    for (const name of colNames) {
      counts[name] = await db.collection(name).countDocuments();
    }

    report.database.passed = true;
    console.log('   ✅ MongoDB connected successfully!');
    console.log('   📊 Collections & counts:');
    for (const [k, v] of Object.entries(counts)) {
      console.log(`      - ${k.padEnd(16)} : ${v} items`);
    }
  } catch (err) {
    report.database.passed = false;
    console.error('   ❌ MongoDB Connection Failed:', err.message);
  }

  // 2. BACKEND API HEALTH CHECK
  console.log('\n2. Checking Backend Server (/api/health)...');
  try {
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    if (healthRes.ok && healthData.status === 'online') {
      report.apiHealth.passed = true;
      console.log('   ✅ Backend is ONLINE! Brand:', healthData.brand, '| Server Time:', healthData.time);
    } else {
      throw new Error(`Unexpected response: ${JSON.stringify(healthData)}`);
    }
  } catch (err) {
    report.apiHealth.passed = false;
    console.error('   ❌ API Health Check Failed:', err.message);
  }

  // 3. PUBLIC API ENDPOINTS
  console.log('\n3. Checking Public Endpoints (/api/products, /api/categories, /api/banners, /api/settings)...');
  try {
    const [prodRes, catRes, banRes, setRes] = await Promise.all([
      fetch('http://localhost:5000/api/products'),
      fetch('http://localhost:5000/api/categories'),
      fetch('http://localhost:5000/api/banners'),
      fetch('http://localhost:5000/api/settings/public')
    ]);

    const prodData = await prodRes.json();
    const catData = await catRes.json();
    const banData = await banRes.json();
    const setData = await setRes.json();

    const ok = prodRes.ok && catRes.ok && banRes.ok && setRes.ok;
    report.publicEndpoints.passed = ok;

    console.log(`   ✅ Products API:   ${prodData.products?.length || 0} active products in catalog`);
    console.log(`   ✅ Categories API: ${catData.categories?.length || 0} collections configured`);
    console.log(`   ✅ Banners API:    ${banData.banners?.length || 0} active hero banners`);
    console.log(`   ✅ Settings API:   Store Email is "${setData.settings?.storeEmail}"`);
  } catch (err) {
    report.publicEndpoints.passed = false;
    console.error('   ❌ Public APIs Check Failed:', err.message);
  }

  // 4. ADMIN AUTHENTICATION
  let adminToken = null;
  console.log('\n4. Checking Admin Authentication (/api/auth/login)...');
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner',
        password: process.env.OWNER_PASSWORD || 'Owner@QueSM2026!'
      })
    });

    const loginData = await loginRes.json();
    if (loginData.success && loginData.token) {
      adminToken = loginData.token;
      // Test /api/auth/me
      const meRes = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const meData = await meRes.json();

      report.adminAuth.passed = meRes.ok && meData.success;
      console.log(`   ✅ Owner Login & Token: Valid for "${meData.admin?.name}" (${meData.admin?.email})`);
    } else {
      throw new Error(loginData.message || 'Login failed');
    }
  } catch (err) {
    report.adminAuth.passed = false;
    console.error('   ❌ Admin Auth Failed:', err.message);
  }

  // 5. IMAGE UPLOAD API (MULTER)
  console.log('\n5. Checking Direct File Upload API (/api/upload/single)...');
  try {
    if (!adminToken) throw new Error('No admin token available to test upload');

    // Create a 1x1 PNG in memory
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(pngBase64, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });
    const formData = new FormData();
    formData.append('image', blob, 'probe_diagnostic.png');

    const uploadRes = await fetch('http://localhost:5000/api/upload/single', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      body: formData
    });

    const uploadData = await uploadRes.json();
    if (uploadData.success && uploadData.url) {
      report.imageUpload.passed = true;
      console.log(`   ✅ File Upload Succeeded! Stored at: ${uploadData.url}`);

      // Verify file is served statically
      const checkRes = await fetch(`http://localhost:5000${uploadData.url}`);
      console.log(`   ✅ Static Serving: HTTP ${checkRes.status} (${checkRes.headers.get('content-type')})`);

      // Clean up the probe test file
      const localFilePath = path.join(__dirname, '../public', uploadData.url);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } else {
      throw new Error(uploadData.message || 'Upload failed');
    }
  } catch (err) {
    report.imageUpload.passed = false;
    console.error('   ❌ Image Upload Failed:', err.message);
  }

  // 6. SMTP MAIL CONNECTION
  console.log('\n6. Checking Google SMTP Connection (smtp.gmail.com:587)...');
  try {
    const cleanUser = (process.env.SMTP_USER || '').trim();
    const cleanPass = (process.env.SMTP_PASS || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: cleanUser,
        pass: cleanPass
      }
    });

    await transporter.verify();
    report.smtpMail.passed = true;
    console.log(`   ✅ Google SMTP Verified! Connected as "${cleanUser}"`);
  } catch (err) {
    report.smtpMail.passed = false;
    console.error('   ❌ SMTP Connection Failed:', err.message);
  }

  console.log('\n====================================================');
  const allPassed = Object.values(report).every(r => r.passed);
  if (allPassed) {
    console.log('🎉 ALL SYSTEMS ARE 100% OPERATIONAL & READY TO DEPLOY!');
  } else {
    console.log('⚠️ Some systems reported warnings.');
  }
  console.log('====================================================\n');

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(allPassed ? 0 : 1);
}

runDiagnostics();
