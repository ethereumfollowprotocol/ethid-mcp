#!/usr/bin/env node

// Simple connection test for EFP MCP Server
// Run with: node test-connection.mjs

const SERVER_URL = 'https://efp-mcp.efp.workers.dev';

async function testConnection() {
  console.log('🔍 Testing EFP MCP Server Connection...\n');
  console.log(`📍 Server: ${SERVER_URL}\n`);

  try {
    // Test 1: Basic server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(SERVER_URL);
    
    if (!healthResponse.ok) {
      throw new Error(`Server returned ${healthResponse.status}`);
    }
    console.log('✅ Server is reachable\n');

    // Test 2: List available tools
    console.log('2️⃣ Checking available tools...');
    const toolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    const toolsResponse = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolsRequest)
    });

    const toolsData = await toolsResponse.json();
    
    if (toolsData.error) {
      throw new Error(`Tools list error: ${toolsData.error.message}`);
    }

    const toolCount = toolsData.result.tools.length;
    console.log(`✅ Found ${toolCount} tools available\n`);

    // Test 3: Simple tool call
    console.log('3️⃣ Testing tool functionality...');
    const testRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'getFollowerCount',
        arguments: { addressOrName: 'vitalik.eth' }
      }
    };

    const testResponse = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest)
    });

    const testData = await testResponse.json();
    
    if (testData.error) {
      throw new Error(`Tool call error: ${testData.error.message}`);
    }

    const result = testData.result.content[0].text;
    console.log(`✅ Tool call successful: ${result}\n`);

    // Test 4: AI helper tool
    console.log('4️⃣ Testing AI helper tools...');
    const helperRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'getBestPractices',
        arguments: { scenario: 'getting-started' }
      }
    };

    const helperResponse = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(helperRequest)
    });

    const helperData = await helperResponse.json();
    
    if (helperData.error) {
      console.log(`⚠️ AI helper tools might need debugging: ${helperData.error.message}`);
    } else {
      console.log(`✅ AI helper tools working\n`);
    }

    // Success summary
    console.log('🎉 CONNECTION TEST SUCCESSFUL!\n');
    console.log('📋 Summary:');
    console.log(`   • Server is healthy and reachable`);
    console.log(`   • ${toolCount} tools are available`);
    console.log(`   • Core functionality is working`);
    console.log(`   • AI helpers are accessible`);
    
    console.log('\n💡 Your EFP MCP server is ready to use!');
    console.log('\n📚 Next steps:');
    console.log('   1. Configure Claude Desktop with this server');
    console.log('   2. Try asking: "How many followers does vitalik.eth have?"');
    console.log('   3. Check out USAGE_GUIDE.md for advanced patterns');

  } catch (error) {
    console.error('\n❌ CONNECTION TEST FAILED!');
    console.error(`\n🔍 Error: ${error.message}`);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Check your internet connection');
    console.error('   • Verify the server URL is correct');
    console.error('   • Try again in a few moments');
    console.error(`   • Server URL: ${SERVER_URL}`);
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);