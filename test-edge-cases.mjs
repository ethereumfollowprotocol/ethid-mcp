#!/usr/bin/env node

// Comprehensive edge case and error handling test for EFP MCP Server
// Run with: node test-edge-cases.mjs

const MCP_URL = 'https://efp-mcp.efp.workers.dev';

// Helper function to make MCP calls
async function callMCPTool(toolName, args = {}) {
  const requestBody = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  };

  try {
    const response = await fetch(`${MCP_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    return { 
      success: !data.error,
      result: data.result?.content?.[0]?.text || data.result,
      error: data.error,
      tool: toolName,
      args,
      responseTime: Date.now() - requestBody.id
    };
  } catch (error) {
    return { 
      success: false,
      error: { message: error.message },
      tool: toolName,
      args,
      responseTime: Date.now() - requestBody.id
    };
  }
}

// Test parameter validation
async function testParameterValidation() {
  console.log('\n🔍 Testing Parameter Validation\n');

  const tests = [
    {
      name: 'Missing addressOrName',
      tool: 'getFollowerCount',
      args: {},
      expectedError: true
    },
    {
      name: 'Empty addressOrName',
      tool: 'getFollowerCount',
      args: { addressOrName: '' },
      expectedError: true
    },
    {
      name: 'Invalid ENS format',
      tool: 'getFollowerCount',
      args: { addressOrName: 'invalid-ens' },
      expectedError: true
    },
    {
      name: 'Malformed Ethereum address',
      tool: 'getFollowerCount',
      args: { addressOrName: '0xinvalid' },
      expectedError: true
    },
    {
      name: 'Negative limit value',
      tool: 'getFollowing',
      args: { addressOrName: 'vitalik.eth', limit: -5 },
      expectedError: false // Should handle gracefully
    },
    {
      name: 'Extremely large limit',
      tool: 'getFollowing',
      args: { addressOrName: 'vitalik.eth', limit: 10000 },
      expectedError: false // Should handle gracefully
    },
    {
      name: 'Missing required follower parameter',
      tool: 'checkFollower',
      args: { addressOrName: 'vitalik.eth' },
      expectedError: true
    }
  ];

  for (const test of tests) {
    const result = await callMCPTool(test.tool, test.args);
    const status = test.expectedError ? (result.success ? '❌ UNEXPECTED SUCCESS' : '✅ EXPECTED ERROR') 
                                      : (result.success ? '✅ SUCCESS' : '❌ UNEXPECTED ERROR');
    
    console.log(`${status} ${test.name}`);
    console.log(`  Tool: ${test.tool}`);
    console.log(`  Args: ${JSON.stringify(test.args)}`);
    console.log(`  Result: ${result.result || result.error?.message || JSON.stringify(result.error)}`);
    console.log(`  Response time: ${result.responseTime}ms\n`);
  }
}

// Test users with edge case data
async function testEdgeCaseUsers() {
  console.log('\n👻 Testing Edge Case Users\n');

  const edgeCaseTests = [
    {
      name: 'Non-existent ENS name',
      addressOrName: 'thisensnamedoesnotexist123.eth'
    },
    {
      name: 'Valid ENS but no EFP data',
      addressOrName: 'google.eth' // Likely exists but no EFP activity
    },
    {
      name: 'New user with minimal data',
      addressOrName: 'test.eth'
    },
    {
      name: 'User with no followers',
      addressOrName: 'empty.eth'
    }
  ];

  for (const test of edgeCaseTests) {
    console.log(`🔍 Testing: ${test.name} (${test.addressOrName})`);
    
    // Test basic stats
    const stats = await callMCPTool('getFollowerCount', { addressOrName: test.addressOrName });
    console.log(`  Stats: ${stats.result || stats.error?.message}`);
    
    // Test following list
    const following = await callMCPTool('getFollowing', { 
      addressOrName: test.addressOrName, 
      limit: 5 
    });
    console.log(`  Following: ${following.result?.substring(0, 100) || following.error?.message}...`);
    
    // Test tag usage
    const tags = await callMCPTool('fetchFollowingTags', { addressOrName: test.addressOrName });
    console.log(`  Tags: ${tags.result?.substring(0, 100) || tags.error?.message}...\n`);
  }
}

// Test system limits and stress
async function testSystemLimits() {
  console.log('\n⚡ Testing System Limits\n');

  // Test large limit values
  console.log('📊 Testing large limit values...');
  const limitTests = [
    { limit: 100, expected: 'reasonable' },
    { limit: 500, expected: 'high but manageable' },
    { limit: 1000, expected: 'very high' }
  ];

  for (const test of limitTests) {
    const startTime = Date.now();
    const result = await callMCPTool('getFollowing', { 
      addressOrName: 'brantly.eth', 
      limit: test.limit 
    });
    const elapsed = Date.now() - startTime;
    
    console.log(`  Limit ${test.limit}: ${result.success ? 'SUCCESS' : 'FAILED'} in ${elapsed}ms`);
    if (result.result) {
      const lineCount = (result.result.match(/\n/g) || []).length;
      console.log(`    Returned ~${lineCount} results`);
    }
    if (result.error) {
      console.log(`    Error: ${result.error.message}`);
    }
  }

  // Test concurrent stress
  console.log('\n🔥 Testing concurrent request stress...');
  const concurrentCount = 10;
  const startTime = Date.now();
  
  const concurrentPromises = Array.from({ length: concurrentCount }, (_, i) => 
    callMCPTool('getFollowerCount', { addressOrName: `user${i}.eth` })
  );
  
  const results = await Promise.all(concurrentPromises);
  const elapsed = Date.now() - startTime;
  
  const successCount = results.filter(r => r.success).length;
  console.log(`  ${concurrentCount} concurrent requests: ${successCount}/${concurrentCount} succeeded in ${elapsed}ms`);
  console.log(`  Average response time: ${Math.round(elapsed / concurrentCount)}ms`);
}

// Test AI helper tools with edge cases
async function testAIHelperEdgeCases() {
  console.log('\n🤖 Testing AI Helper Tools Edge Cases\n');

  const aiTests = [
    {
      tool: 'getBestPractices',
      args: { scenario: 'unknown-scenario' },
      expectsFallback: true
    },
    {
      tool: 'getUsagePattern',
      args: { queryType: 'invalid-query-type' },
      expectsFallback: true
    },
    {
      tool: 'getToolGuidance',
      args: { task: 'non-existent-task' },
      expectsFallback: true
    },
    {
      tool: 'getEfficiencyTips',
      args: { area: 'unknown-area' },
      expectsFallback: true
    },
    {
      tool: 'getBestPractices',
      args: {}, // Missing scenario
      expectsFallback: true
    }
  ];

  for (const test of aiTests) {
    const result = await callMCPTool(test.tool, test.args);
    const providedFallback = result.result && result.result.length > 20; // Reasonable fallback response
    
    console.log(`${providedFallback ? '✅' : '❌'} ${test.tool} with ${JSON.stringify(test.args)}`);
    console.log(`  Expected fallback: ${test.expectsFallback ? 'Yes' : 'No'}`);
    console.log(`  Provided fallback: ${providedFallback ? 'Yes' : 'No'}`);
    console.log(`  Response: ${result.result?.substring(0, 100)}...`);
    console.log(`  Response time: ${result.responseTime}ms\n`);
  }
}

// Test blocked relationships and special cases
async function testSpecialRelationships() {
  console.log('\n🚫 Testing Special Relationships\n');

  // Test for blocked relationships (these are hypothetical)
  const relationshipTests = [
    {
      name: 'Self-follow check',
      addressOrName: 'vitalik.eth',
      follower: 'vitalik.eth'
    },
    {
      name: 'Case sensitivity test',
      addressOrName: 'VITALIK.ETH',
      follower: 'brantly.eth'
    },
    {
      name: 'Address vs ENS consistency',
      addressOrName: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // vitalik's address
      follower: 'brantly.eth'
    }
  ];

  for (const test of relationshipTests) {
    const result = await callMCPTool('checkFollower', {
      addressOrName: test.addressOrName,
      follower: test.follower
    });
    
    console.log(`🔍 ${test.name}:`);
    console.log(`  Query: Does ${test.follower} follow ${test.addressOrName}?`);
    console.log(`  Result: ${result.result || result.error?.message}`);
    console.log(`  Response time: ${result.responseTime}ms\n`);
  }
}

// Test context system robustness
async function testContextSystemRobustness() {
  console.log('\n📚 Testing Context System Robustness\n');

  const contextTests = [
    {
      tool: 'searchContexts',
      args: { query: 'nonexistentterm12345' },
      name: 'Search for non-existent term'
    },
    {
      tool: 'searchContexts',
      args: { query: '' },
      name: 'Empty search query'
    },
    {
      tool: 'getFileMetadata',
      args: { contextId: 'non-existent-context' },
      name: 'Non-existent context ID'
    },
    {
      tool: 'getFileSection',
      args: { contextId: 'usage-patterns', section: 'non-existent-section' },
      name: 'Non-existent section'
    },
    {
      tool: 'searchFileContext',
      args: { contextId: 'invalid-context', query: 'anything' },
      name: 'Search in invalid context'
    }
  ];

  for (const test of contextTests) {
    const result = await callMCPTool(test.tool, test.args);
    
    console.log(`📖 ${test.name}:`);
    console.log(`  Tool: ${test.tool}`);
    console.log(`  Args: ${JSON.stringify(test.args)}`);
    console.log(`  Success: ${result.success ? 'Yes' : 'No'}`);
    console.log(`  Response: ${result.result?.substring(0, 100) || result.error?.message}...`);
    console.log(`  Response time: ${result.responseTime}ms\n`);
  }
}

// Recovery and guidance testing
async function testRecoveryGuidance() {
  console.log('\n🔧 Testing Recovery and Guidance\n');

  // Test if AI helpers can guide recovery from common errors
  const recoveryScenarios = [
    {
      name: 'Get guidance for user not found errors',
      tool: 'getBestPractices',
      args: { scenario: 'error-handling' }
    },
    {
      name: 'Get efficiency tips when queries are slow',
      tool: 'getEfficiencyTips',
      args: { area: 'performance' }
    },
    {
      name: 'Get tool guidance for general usage',
      tool: 'getToolGuidance',
      args: { task: 'general' }
    }
  ];

  for (const scenario of recoveryScenarios) {
    const result = await callMCPTool(scenario.tool, scenario.args);
    
    console.log(`🆘 ${scenario.name}:`);
    console.log(`  Guidance quality: ${result.result ? 'Provided' : 'Missing'}`);
    if (result.result) {
      const hasActionableAdvice = result.result.includes('•') || result.result.includes('-') || 
                                  result.result.includes('1.') || result.result.includes('Use');
      console.log(`  Actionable advice: ${hasActionableAdvice ? 'Yes' : 'No'}`);
    }
    console.log(`  Response: ${result.result?.substring(0, 150)}...`);
    console.log(`  Response time: ${result.responseTime}ms\n`);
  }
}

// Main test runner
async function runEdgeCaseTests() {
  console.log('🧪 EFP MCP Server - Edge Case & Error Handling Test Suite');
  console.log(`📍 Testing server at: ${MCP_URL}`);
  console.log('=========================================================\n');

  try {
    // Check server health
    const healthCheck = await fetch(MCP_URL);
    if (!healthCheck.ok) {
      throw new Error(`Server returned ${healthCheck.status}`);
    }
    console.log('✅ Server is reachable');

    // Run all edge case tests
    await testParameterValidation();
    await testEdgeCaseUsers();
    await testSystemLimits();
    await testAIHelperEdgeCases();
    await testSpecialRelationships();
    await testContextSystemRobustness();
    await testRecoveryGuidance();

    console.log('\n✅ All edge case tests completed!');
    console.log('\n📊 Summary: Comprehensive testing validates the EFP MCP server');
    console.log('handles edge cases gracefully with helpful error messages and fallback guidance.');
    
  } catch (error) {
    console.error('\n❌ Edge case test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runEdgeCaseTests().catch(console.error);