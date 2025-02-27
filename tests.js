// Unit Tests for Smart Bookmark Organizer
// Using console.assert() for simplicity

// Mock chrome API for testing
const chrome = {
  bookmarks: {
    getTree: async () => ({
      children: Array(150).fill().map((_, i) => ({
        id: `id${i}`,
        title: `Bookmark ${i}`,
        url: `https://example.com/${i}`
      }))
    })
  },
  storage: {
    local: {
      set: async () => {}
    }
  }
};

// Test fetchBookmarks()
async function testFetchBookmarks() {
  console.log('Testing fetchBookmarks()...');
  const bookmarks = await fetchBookmarks();
  console.assert(bookmarks.length <= 100, 'Bookmark count should not exceed 100');
  console.assert(bookmarks.length > 0, 'Should return at least one bookmark');
  console.assert(bookmarks[0].id && bookmarks[0].title && bookmarks[0].url, 'Bookmarks should have required properties');
  console.log('✓ fetchBookmarks tests passed!');
}

// Test analyzeContent()
async function testAnalyzeContent() {
  console.log('\nTesting analyzeContent()...');
  const testCases = [
    { input: 'Latest programming news for developers', expected: 'Tech' },
    { input: 'Best vacation destinations in Europe', expected: 'Travel' },
    { input: 'Breaking news: World headlines', expected: 'News' },
    { input: 'Online shopping deals and discounts', expected: 'Shopping' },
    { input: 'Social network for professionals', expected: 'Social' },
    { input: 'Free online course: Learn Python', expected: 'Education' },
    { input: 'New movie releases this week', expected: 'Entertainment' },
    { input: 'Random unrelated content', expected: 'Other' }
  ];

  for (const test of testCases) {
    const category = await analyzeContent(test.input);
    console.assert(category === test.expected, 
      `"${test.input}" should be categorized as ${test.expected}, got ${category}`);
  }
  console.log('✓ analyzeContent tests passed!');
}

// Test encryptData()
async function testEncryptData() {
  console.log('\nTesting encryptData()...');
  const testData = {
    Tech: [{ id: '1', title: 'Test', url: 'https://test.com' }]
  };

  // Test encryption
  const encrypted = await encryptData(testData);
  console.assert(encrypted.encrypted instanceof Array, 'Encrypted data should be an array');
  console.assert(encrypted.iv instanceof Array, 'IV should be an array');
  console.assert(encrypted.key && encrypted.key.k, 'Should have a valid JWK key');

  // Test data integrity
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'jwk',
    encrypted.key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(encrypted.iv) },
    key,
    new Uint8Array(encrypted.encrypted)
  );

  const decryptedData = JSON.parse(new TextDecoder().decode(decrypted));
  console.assert(
    JSON.stringify(decryptedData) === JSON.stringify(testData),
    'Decrypted data should match original'
  );
  console.log('✓ encryptData tests passed!');
}

// Run all tests
async function runTests() {
  console.log('Running unit tests...\n');
  try {
    await testFetchBookmarks();
    await testAnalyzeContent();
    await testEncryptData();
    console.log('\n✓ All tests passed successfully!');
  } catch (error) {
    console.error('\n✗ Test failed:', error);
  }
}

// Execute tests
runTests();