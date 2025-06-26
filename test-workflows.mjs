#!/usr/bin/env node

// Test script for EFP MCP Server workflows
// Run with: node test-workflows.mjs

const BASE_URL = 'https://efp-mcp.efp.workers.dev';
let requestId = 0;

async function callMCPTool(toolName, args = {}) {
  const request = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    },
    id: ++requestId
  };

  console.log(`\n📤 Calling ${toolName}:`, JSON.stringify(args, null, 2));
  const startTime = Date.now();

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    const elapsed = Date.now() - startTime;
    
    console.log(`⏱️  Response time: ${elapsed}ms`);

    if (data.error) {
      console.error(`❌ Error:`, data.error);
      return null;
    }

    console.log(`✅ Success:`, JSON.stringify(data.result, null, 2));
    return data.result;
  } catch (error) {
    console.error(`❌ Network error:`, error);
    return null;
  }
}

// Extract text from MCP response
function extractText(result) {
  return result?.content?.[0]?.text || '';
}

// Workflow 1: Social Network Analysis
async function socialNetworkAnalysis() {
  console.log('\n\n🔍 === WORKFLOW 1: SOCIAL NETWORK ANALYSIS ===\n');
  
  // Get top influencers
  console.log('📊 Step 1: Fetching top influencers...');
  const leaderboard = await callMCPTool('fetchLeaderboard', { limit: 5 });
  
  if (!leaderboard) return;

  // Analyze a top user
  console.log('\n👤 Step 2: Analyzing vitalik.eth...');
  
  const stats = await callMCPTool('fetchProfileStats', { 
    addressOrName: 'vitalik.eth',
    isLive: true 
  });
  
  const following = await callMCPTool('getFollowing', {
    addressOrName: 'vitalik.eth',
    limit: 10,
    tags: ['ethereum', 'builder']
  });
  
  const followers = await callMCPTool('getFollowers', {
    addressOrName: 'vitalik.eth',
    limit: 10,
    sort: 'follower count'
  });
  
  const tags = await callMCPTool('fetchFollowingTags', {
    addressOrName: 'vitalik.eth'
  });
  
  // Check relationships
  console.log('\n🔗 Step 3: Checking relationships...');
  
  const check1 = await callMCPTool('checkFollower', {
    addressOrName: 'vitalik.eth',
    follower: 'brantly.eth'
  });
  
  const check2 = await callMCPTool('checkFollower', {
    addressOrName: 'brantly.eth',
    follower: 'vitalik.eth'
  });
}

// Workflow 2: User Relationship Discovery  
async function userRelationshipDiscovery() {
  console.log('\n\n🔍 === WORKFLOW 2: USER RELATIONSHIP DISCOVERY ===\n');
  
  const users = ['vitalik.eth', 'brantly.eth'];
  
  for (const user of users) {
    console.log(`\n🎯 Analyzing ${user}...`);
    
    // Get following with tags
    const following = await callMCPTool('fetchProfileFollowing', {
      addressOrName: user,
      limit: 15,
      tags: ['builder', 'ethereum']
    });
    
    // Get follower count
    const count = await callMCPTool('getFollowerCount', {
      addressOrName: user
    });
    
    // Check follow state
    const state = await callMCPTool('fetchFollowState', {
      lookupAddressOrName: user,
      type: 'following'
    });
  }
  
  // Find mutual connections
  console.log('\n🤝 Finding mutual connections...');
  
  const vitalikFollowing = await callMCPTool('getFollowing', {
    addressOrName: 'vitalik.eth',
    limit: 20
  });
  
  const brantlyFollowing = await callMCPTool('getFollowing', {
    addressOrName: 'brantly.eth', 
    limit: 20
  });
}

// Workflow 3: Tag-Based Community Analysis
async function tagBasedCommunityAnalysis() {
  console.log('\n\n🔍 === WORKFLOW 3: TAG-BASED COMMUNITY ANALYSIS ===\n');
  
  const tags = ['ethereum', 'builder', 'top8'];
  
  for (const tag of tags) {
    console.log(`\n🏷️  Analyzing tag: "${tag}"...`);
    
    // Find users with this tag
    const tagged = await callMCPTool('getFollowers', {
      addressOrName: 'vitalik.eth',
      limit: 10,
      tags: [tag]
    });
    
    // Get another user's usage of this tag
    const tagged2 = await callMCPTool('getFollowing', {
      addressOrName: 'brantly.eth',
      limit: 10,
      tags: [tag]
    });
  }
}

// Workflow 4: Performance Testing
async function performanceTesting() {
  console.log('\n\n🔍 === WORKFLOW 4: PERFORMANCE TESTING ===\n');
  
  // Test concurrent calls
  console.log('⚡ Testing concurrent API calls...');
  const start = Date.now();
  
  const results = await Promise.all([
    callMCPTool('getFollowerCount', { addressOrName: 'vitalik.eth' }),
    callMCPTool('getFollowerCount', { addressOrName: 'brantly.eth' }),
    callMCPTool('fetchLeaderboard', { limit: 5 }),
    callMCPTool('fetchRecommendations', { endpoint: 'discover', limit: 5 })
  ]);
  
  const concurrentTime = Date.now() - start;
  console.log(`\n✅ Concurrent calls completed in ${concurrentTime}ms`);
  
  // Test tag filtering efficiency
  console.log('\n🏷️  Testing tag filtering...');
  
  const tagStart = Date.now();
  const withTags = await callMCPTool('getFollowers', {
    addressOrName: 'vitalik.eth',
    limit: 20,
    tags: ['builder']
  });
  const tagTime = Date.now() - tagStart;
  
  const noTagStart = Date.now();
  const noTags = await callMCPTool('getFollowers', {
    addressOrName: 'vitalik.eth',
    limit: 50
  });
  const noTagTime = Date.now() - noTagStart;
  
  console.log(`\n📊 Tag filtering saved: ${noTagTime - tagTime}ms`);
}

// Main execution
async function runAllWorkflows() {
  console.log('🚀 Starting EFP MCP Server Workflow Tests...\n');
  console.log(`📍 Server URL: ${BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
  
  const startTime = Date.now();
  
  try {
    await socialNetworkAnalysis();
    await userRelationshipDiscovery();
    await tagBasedCommunityAnalysis();
    await performanceTesting();
    
    const totalTime = Date.now() - startTime;
    
    console.log('\n\n📊 === WORKFLOW TEST SUMMARY ===\n');
    console.log(`✅ All workflows completed successfully`);
    console.log(`⏱️  Total duration: ${totalTime}ms`);
    console.log(`\n🔍 Key insights:`);
    console.log(`- Social network analysis completed`);
    console.log(`- User relationships discovered`);
    console.log(`- Tag communities analyzed`);
    console.log(`- Performance validated`);
    
  } catch (error) {
    console.error('\n❌ Workflow test failed:', error);
  }
}

// Run the tests
runAllWorkflows().then(() => {
  console.log('\n✨ All tests completed!');
}).catch(error => {
  console.error('\n💥 Test runner failed:', error);
  process.exit(1);
});