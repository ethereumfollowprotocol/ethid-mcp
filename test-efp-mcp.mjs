#!/usr/bin/env node

// Test script for EFP MCP Server
// Run with: node test-efp-mcp.mjs

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
    
    if (data.error) {
      return { error: data.error, tool: toolName, args };
    }
    
    return { 
      result: data.result?.content?.[0]?.text || data.result,
      tool: toolName,
      args 
    };
  } catch (error) {
    return { error: error.message, tool: toolName, args };
  }
}

// Test suite for basic functionality
async function testBasicFunctionality() {
  console.log('\n🧪 Testing Basic Functionality\n');
  
  // Test follower counts
  console.log('📊 Testing follower counts...');
  const followerCounts = await Promise.all([
    callMCPTool('getFollowerCount', { addressOrName: 'vitalik.eth' }),
    callMCPTool('getFollowerCount', { addressOrName: 'brantly.eth' }),
    callMCPTool('getFollowerCount', { addressOrName: 'efp.eth' })
  ]);
  
  followerCounts.forEach(result => {
    console.log(`  ${result.args.addressOrName}: ${result.result || result.error}`);
  });

  // Test relationship checks
  console.log('\n🔗 Testing relationship checks...');
  const relationships = await Promise.all([
    callMCPTool('checkFollower', { addressOrName: 'brantly.eth', follower: 'vitalik.eth' }),
    callMCPTool('checkFollower', { addressOrName: 'vitalik.eth', follower: 'brantly.eth' }),
    callMCPTool('checkFollower', { addressOrName: 'efp.eth', follower: 'vitalik.eth' })
  ]);

  relationships.forEach(result => {
    const [target, follower] = [result.args.addressOrName, result.args.follower];
    console.log(`  Does ${follower} follow ${target}? ${result.result || result.error}`);
  });
}

// Test efficient tag pattern
async function testEfficientTagPattern() {
  console.log('\n🏷️  Testing Efficient Tag Pattern\n');

  const users = ['brantly.eth', 'efp.encrypteddegen.eth'];
  
  for (const user of users) {
    console.log(`\n📌 Analyzing tags for ${user}:`);
    
    // Step 1: Get available tags
    const startTime = Date.now();
    const tagsResult = await callMCPTool('fetchFollowingTags', { addressOrName: user });
    console.log(`  Tags found: ${tagsResult.result}`);
    
    // Extract tag names from the result (parse the text response)
    const tagMatches = tagsResult.result?.match(/(\w+):\s*\d+/g) || [];
    const tagNames = tagMatches.map(match => match.split(':')[0]);
    
    if (tagNames.length > 0) {
      // Step 2: Get all tagged users efficiently
      const taggedUsersResult = await callMCPTool('getFollowing', { 
        addressOrName: user, 
        tags: tagNames,
        limit: 50 
      });
      
      const elapsed = Date.now() - startTime;
      console.log(`  Tagged users retrieved in ${elapsed}ms`);
      console.log(`  Result preview: ${taggedUsersResult.result?.substring(0, 200)}...`);
    }
  }
}

// Test AI helper tools
async function testAIHelperTools() {
  console.log('\n🤖 Testing AI Helper Tools\n');

  const tests = [
    { tool: 'getBestPractices', args: { scenario: 'tagged-users' } },
    { tool: 'getUsagePattern', args: { queryType: 'tagged-users' } },
    { tool: 'getToolGuidance', args: { task: 'tagged-users' } },
    { tool: 'getEfficiencyTips', args: { area: 'queries' } }
  ];

  for (const test of tests) {
    const result = await callMCPTool(test.tool, test.args);
    console.log(`\n📚 ${test.tool}(${JSON.stringify(test.args)}):`);
    console.log(`  ${result.result?.substring(0, 150)}...`);
  }
}

// Test context system
async function testContextSystem() {
  console.log('\n📖 Testing Context System\n');

  // Search for efficiency patterns
  console.log('🔍 Searching for efficiency patterns...');
  const searchResult = await callMCPTool('searchContexts', { 
    query: 'efficiency',
    category: 'ai-guidelines'
  });
  console.log(`  Found contexts: ${searchResult.result}`);

  // Test file metadata
  console.log('\n📄 Testing file metadata access...');
  const metadataResult = await callMCPTool('getFileMetadata', { 
    contextId: 'usage-patterns' 
  });
  console.log(`  Metadata result: ${metadataResult.result || metadataResult.error}`);
}

// Test error handling
async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling\n');

  const errorTests = [
    { 
      name: 'Missing required parameter',
      tool: 'getFollowerCount',
      args: {} // Missing addressOrName
    },
    { 
      name: 'Invalid ENS name',
      tool: 'getFollowerCount',
      args: { addressOrName: 'notvalidens' }
    },
    { 
      name: 'Non-existent user',
      tool: 'checkFollower',
      args: { addressOrName: 'doesnotexist.eth', follower: 'vitalik.eth' }
    },
    { 
      name: 'Invalid tool guidance',
      tool: 'getToolGuidance',
      args: { task: 'invalid-task-type' }
    }
  ];

  for (const test of errorTests) {
    const result = await callMCPTool(test.tool, test.args);
    console.log(`\n❌ ${test.name}:`);
    console.log(`  Tool: ${test.tool}`);
    console.log(`  Args: ${JSON.stringify(test.args)}`);
    console.log(`  Result: ${result.result || result.error?.message || JSON.stringify(result.error)}`);
  }
}

// Test complex workflows
async function testComplexWorkflows() {
  console.log('\n🔄 Testing Complex Workflows\n');

  // Workflow 1: Top users analysis
  console.log('📈 Analyzing top users...');
  const leaderboard = await callMCPTool('fetchLeaderboard', { limit: 5 });
  console.log(`  Top users: ${leaderboard.result?.substring(0, 200)}...`);

  // Workflow 2: Discover network overlap
  console.log('\n🌐 Discovering network overlap...');
  const users = ['vitalik.eth', 'brantly.eth'];
  const followingLists = await Promise.all(
    users.map(user => callMCPTool('getFollowing', { addressOrName: user, limit: 20 }))
  );
  
  console.log(`  Retrieved following lists for analysis`);
  // In a real implementation, we'd parse and compare the lists

  // Workflow 3: Tag-based discovery
  console.log('\n🏷️  Tag-based discovery...');
  const taggedUsers = await callMCPTool('getFollowing', { 
    addressOrName: 'brantly.eth',
    tags: ['top8'],
    limit: 10
  });
  console.log(`  Users tagged with 'top8': ${taggedUsers.result}`);
}

// Test performance
async function testPerformance() {
  console.log('\n⚡ Testing Performance\n');

  // Test concurrent requests
  console.log('🔀 Testing concurrent requests...');
  const startTime = Date.now();
  
  const concurrentTests = await Promise.all([
    callMCPTool('getFollowerCount', { addressOrName: 'vitalik.eth' }),
    callMCPTool('getFollowerCount', { addressOrName: 'brantly.eth' }),
    callMCPTool('getFollowerCount', { addressOrName: 'efp.eth' }),
    callMCPTool('fetchLeaderboard', { limit: 5 })
  ]);
  
  const elapsed = Date.now() - startTime;
  console.log(`  4 concurrent requests completed in ${elapsed}ms`);
  console.log(`  Average time per request: ${Math.round(elapsed / 4)}ms`);

  // Compare efficient vs naive patterns
  console.log('\n⏱️  Comparing efficient vs naive patterns...');
  
  // Efficient pattern
  const efficientStart = Date.now();
  const tags = await callMCPTool('fetchFollowingTags', { addressOrName: 'brantly.eth' });
  const taggedOnly = await callMCPTool('getFollowing', { 
    addressOrName: 'brantly.eth',
    tags: ['top8'],
    limit: 50
  });
  const efficientTime = Date.now() - efficientStart;
  
  // Naive pattern
  const naiveStart = Date.now();
  const allFollowing = await callMCPTool('getFollowing', { 
    addressOrName: 'brantly.eth',
    limit: 300
  });
  const naiveTime = Date.now() - naiveStart;
  
  console.log(`  Efficient pattern (2 focused calls): ${efficientTime}ms`);
  console.log(`  Naive pattern (1 large call): ${naiveTime}ms`);
  console.log(`  Efficiency improvement: ${Math.round(((naiveTime - efficientTime) / naiveTime) * 100)}%`);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting EFP MCP Server Comprehensive Test Suite');
  console.log(`📍 Testing server at: ${MCP_URL}`);
  console.log('================================================\n');

  try {
    // First check if server is reachable
    const healthCheck = await fetch(MCP_URL);
    if (!healthCheck.ok) {
      throw new Error(`Server returned ${healthCheck.status}`);
    }
    console.log('✅ Server is reachable\n');

    // Run all test suites
    await testBasicFunctionality();
    await testEfficientTagPattern();
    await testAIHelperTools();
    await testContextSystem();
    await testErrorHandling();
    await testComplexWorkflows();
    await testPerformance();

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(console.error);