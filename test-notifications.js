/**
 * Test Notifications Script
 * Creates notifications for all types and priorities for user: cc4f7fcb-c92d-4bfd-a69e-30bb87923898
 * 
 * Usage:
 *   node test-notifications.js
 * 
 * Or with custom API URL:
 *   API_URL=https://your-api.com node test-notifications.js
 */

const USER_ID = 'cc4f7fcb-c92d-4bfd-a69e-30bb87923898';
const API_URL = process.env.API_URL || 'http://localhost:8000';

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ or install node-fetch');
  console.log('   Alternatively, use the bash script: ./test-notifications.sh');
  process.exit(1);
}

async function createTestNotifications() {
  console.log('🚀 Creating test notifications for user:', USER_ID);
  console.log('📡 API URL:', API_URL);
  console.log('');

  try {
    const response = await fetch(`${API_URL}/api/notifications/test/${USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Success!');
    console.log(`📊 Created ${data.data.total_created} notifications`);
    console.log('');
    console.log('📋 Notification breakdown:');
    console.log(`   - Type/Priority combinations: ${9 * 4} = 36`);
    console.log(`   - Additional test scenarios: ${8}`);
    console.log(`   - Total: ${data.data.total_created}`);
    console.log('');
    console.log('🔍 Check your notifications in the database or app!');
    
    return data;
  } catch (error) {
    console.error('❌ Error creating test notifications:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTestNotifications();
}

module.exports = { createTestNotifications };

