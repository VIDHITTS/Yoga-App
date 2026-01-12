require('dotenv').config();
const axios = require('axios');

/**
 * Test script to verify the API is working correctly
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

const testQueries = [
  {
    name: 'Normal Query',
    query: 'What are the benefits of Surya Namaskar?',
    expectUnsafe: false
  },
  {
    name: 'Safety Query - Pregnancy',
    query: 'Is headstand safe during pregnancy?',
    expectUnsafe: true
  },
  {
    name: 'Safety Query - Heart Condition',
    query: 'Can I practice yoga if I have high blood pressure?',
    expectUnsafe: true
  },
  {
    name: 'Meditation Query',
    query: 'How do I start meditation practice?',
    expectUnsafe: false
  }
];

async function testQuery(query, expectUnsafe) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ask`, { query });
    const data = response.data;

    console.log(`Query: "${query}"`);
    console.log(`Safety Status: ${data.safety.isUnsafe ? '⚠️ UNSAFE' : '✅ SAFE'}`);
    console.log(`Expected: ${expectUnsafe ? 'UNSAFE' : 'SAFE'}`);
    console.log(`Match: ${data.safety.isUnsafe === expectUnsafe ? '✓' : '✗'}`);
    console.log(`Sources Retrieved: ${data.sources.length}`);
    console.log(`Response Time: ${data.metadata.responseTime}ms`);
    console.log(`Answer Preview: ${data.answer.substring(0, 150)}...`);
    console.log('-'.repeat(80) + '\n');

    return data.safety.isUnsafe === expectUnsafe;
  } catch (error) {
    console.error(`❌ Error testing query: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 YOGA RAG API TEST SUITE');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let failed = 0;

  for (const test of testQueries) {
    console.log(`Test: ${test.name}`);
    const result = await testQuery(test.query, test.expectUnsafe);
    
    if (result) {
      passed++;
      console.log('✅ PASSED\n');
    } else {
      failed++;
      console.log('❌ FAILED\n');
    }

    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('='.repeat(80));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${testQueries.length} tests`);
  console.log('='.repeat(80) + '\n');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testQuery, runTests };
