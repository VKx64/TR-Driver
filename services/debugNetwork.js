// Debug utility to test network connectivity
export const testNetworkConnectivity = async () => {
  const testUrls = [
    'https://pb-tr.rimuru.win/',
    'https://google.com',
    'https://jsonplaceholder.typicode.com/posts/1'
  ];

  console.log('🔍 Testing network connectivity...');

  for (const url of testUrls) {
    try {
      console.log(`🌐 Testing: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        timeout: 10000,
      });
      console.log(`✅ ${url}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`❌ ${url}: ${error.message}`);
    }
  }

  console.log('🏁 Network connectivity test completed');
};

// Test PocketBase health
export const testPocketBaseHealth = async () => {
  const baseUrl = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'https://pb-tr.rimuru.win/';
  const healthUrl = `${baseUrl}api/health`;

  console.log('🏥 Testing PocketBase health...');
  console.log('🔗 Health URL:', healthUrl);

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('✅ PocketBase Health Response:', data);
    return data;
  } catch (error) {
    console.error('❌ PocketBase Health Check Failed:', error);
    throw error;
  }
};
