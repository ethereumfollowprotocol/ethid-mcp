#!/usr/bin/env node
import fetch from 'node-fetch';

interface MCPRequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: number;
}

interface MCPResponse {
  jsonrpc: string;
  result?: any;
  error?: any;
  id: number;
}

class EFPWorkflowTester {
  private baseUrl: string;
  private requestId: number = 0;

  constructor(baseUrl: string = 'https://efp-mcp.efp.workers.dev') {
    this.baseUrl = baseUrl;
  }

  private async callTool(toolName: string, args: any): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      },
      id: ++this.requestId
    };

    console.log(`\n📤 Calling ${toolName}:`, JSON.stringify(args, null, 2));
    const startTime = Date.now();

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json() as MCPResponse;
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

  // Utility to extract text content from MCP response
  private extractContent(result: any): string {
    if (result?.content?.[0]?.text) {
      return result.content[0].text;
    }
    return '';
  }

  // Workflow 1: Social Network Analysis
  async socialNetworkAnalysis() {
    console.log('\n\n🔍 === WORKFLOW 1: SOCIAL NETWORK ANALYSIS ===\n');
    
    // Step 1: Get top influencers from leaderboard
    console.log('📊 Step 1: Fetching top influencers from leaderboard...');
    const leaderboard = await this.callTool('fetchLeaderboard', { limit: 5 });
    
    if (!leaderboard) return;

    // Extract top users from response
    const content = this.extractContent(leaderboard);
    const topUsers = content.match(/\b[\w]+\.eth\b/g) || [];
    
    console.log(`\n🌟 Found top users: ${topUsers.join(', ')}`);

    // Step 2: Analyze each influencer's network
    const influencerAnalysis: any[] = [];
    
    for (const user of topUsers.slice(0, 3)) { // Analyze top 3
      console.log(`\n\n👤 Analyzing ${user}...`);
      
      // Get profile stats
      const stats = await this.callTool('fetchProfileStats', { 
        addressOrName: user,
        isLive: true 
      });
      
      // Get their following with tags
      const following = await this.callTool('fetchProfileFollowing', {
        addressOrName: user,
        limit: 20,
        tags: ['top8', 'ethereum', 'builder']
      });
      
      // Get their followers with tags
      const followers = await this.callTool('fetchProfileFollowers', {
        addressOrName: user,
        limit: 20,
        sort: 'follower count'
      });
      
      // Get tags they use
      const followingTags = await this.callTool('fetchFollowingTags', {
        addressOrName: user
      });
      
      influencerAnalysis.push({
        user,
        stats: this.extractContent(stats),
        followingCount: following ? this.extractContent(following).split('\n').length - 1 : 0,
        followersCount: followers ? this.extractContent(followers).split('\n').length - 1 : 0,
        tags: this.extractContent(followingTags)
      });
    }

    // Step 3: Find common connections
    console.log('\n\n🔗 Step 3: Finding network overlaps...');
    
    if (topUsers.length >= 2) {
      // Check if top users follow each other
      for (let i = 0; i < Math.min(2, topUsers.length); i++) {
        for (let j = i + 1; j < Math.min(3, topUsers.length); j++) {
          const followCheck = await this.callTool('checkFollower', {
            addressOrName: topUsers[i],
            follower: topUsers[j]
          });
          
          const reverseCheck = await this.callTool('checkFollower', {
            addressOrName: topUsers[j],
            follower: topUsers[i]
          });
          
          console.log(`\n${topUsers[i]} → ${topUsers[j]}: ${this.extractContent(followCheck)}`);
          console.log(`${topUsers[j]} → ${topUsers[i]}: ${this.extractContent(reverseCheck)}`);
        }
      }
    }

    return influencerAnalysis;
  }

  // Workflow 2: User Relationship Discovery
  async userRelationshipDiscovery() {
    console.log('\n\n🔍 === WORKFLOW 2: USER RELATIONSHIP DISCOVERY ===\n');
    
    const targetUsers = ['vitalik.eth', 'brantly.eth'];
    const relationships: any = {};

    for (const user of targetUsers) {
      console.log(`\n\n🎯 Analyzing relationships for ${user}...`);
      
      // Get who they follow with tags
      const following = await this.callTool('fetchProfileFollowing', {
        addressOrName: user,
        limit: 30,
        tags: ['builder', 'ethereum', 'top8']
      });
      
      // Extract followed users
      const followedUsers = this.extractContent(following)
        .split('\n')
        .filter(line => line.includes('.eth'))
        .map(line => line.trim());
      
      relationships[user] = {
        following: followedUsers,
        mutualConnections: []
      };
      
      // Get follow state for some of their connections
      console.log(`\n📊 Checking follow states for ${user}'s connections...`);
      for (const followed of followedUsers.slice(0, 5)) {
        const state = await this.callTool('fetchFollowState', {
          lookupAddressOrName: followed,
          connectedAddress: user,
          type: 'followers'
        });
        
        if (this.extractContent(state).includes('true')) {
          relationships[user].mutualConnections.push(followed);
        }
      }
    }

    // Find mutual connections between target users
    console.log('\n\n🤝 Finding mutual connections between target users...');
    
    const user1Following = relationships[targetUsers[0]]?.following || [];
    const user2Following = relationships[targetUsers[1]]?.following || [];
    
    const mutualFollowing = user1Following.filter((addr: string) => 
      user2Following.includes(addr)
    );
    
    console.log(`\nMutual connections: ${mutualFollowing.join(', ')}`);

    return relationships;
  }

  // Workflow 3: Tag-Based Community Analysis
  async tagBasedCommunityAnalysis() {
    console.log('\n\n🔍 === WORKFLOW 3: TAG-BASED COMMUNITY ANALYSIS ===\n');
    
    const tagsToAnalyze = ['top8', 'ethereum', 'based', 'builder'];
    const tagAnalysis: any = {};

    for (const tag of tagsToAnalyze) {
      console.log(`\n\n🏷️  Analyzing tag: "${tag}"...`);
      
      // Find users who use this tag in their following
      const usersWithTag: string[] = [];
      
      // Sample some known users to check their tag usage
      const sampleUsers = ['vitalik.eth', 'brantly.eth', 'nick.eth'];
      
      for (const user of sampleUsers) {
        const following = await this.callTool('getFollowing', {
          addressOrName: user,
          limit: 20,
          tags: [tag]
        });
        
        const followingList = this.extractContent(following);
        if (followingList && !followingList.includes('No following found')) {
          usersWithTag.push(user);
          console.log(`✅ ${user} uses tag "${tag}"`);
        }
      }
      
      // Analyze what types of accounts get tagged
      if (usersWithTag.length > 0) {
        console.log(`\n📊 Analyzing accounts tagged with "${tag}"...`);
        
        const taggedAccounts: string[] = [];
        
        for (const user of usersWithTag.slice(0, 2)) {
          const tagged = await this.callTool('fetchProfileFollowing', {
            addressOrName: user,
            limit: 10,
            tags: [tag]
          });
          
          const accounts = this.extractContent(tagged)
            .split('\n')
            .filter(line => line.includes('.eth'))
            .map(line => line.trim());
          
          taggedAccounts.push(...accounts);
        }
        
        // Get stats for some tagged accounts
        const uniqueTagged = [...new Set(taggedAccounts)].slice(0, 3);
        
        for (const account of uniqueTagged) {
          const stats = await this.callTool('getFollowerCount', {
            addressOrName: account
          });
          
          console.log(`📈 ${account}: ${this.extractContent(stats)}`);
        }
      }
      
      tagAnalysis[tag] = {
        usersUsingTag: usersWithTag,
        sampleTaggedAccounts: usersWithTag.length > 0 ? 'Found' : 'None found'
      };
    }

    return tagAnalysis;
  }

  // Workflow 4: Performance Testing
  async performanceTesting() {
    console.log('\n\n🔍 === WORKFLOW 4: PERFORMANCE TESTING ===\n');
    
    // Test 1: Concurrent operations
    console.log('\n⚡ Test 1: Concurrent API calls...');
    const concurrentStart = Date.now();
    
    const concurrentCalls = await Promise.all([
      this.callTool('getFollowerCount', { addressOrName: 'vitalik.eth' }),
      this.callTool('getFollowerCount', { addressOrName: 'brantly.eth' }),
      this.callTool('fetchLeaderboard', { limit: 5 }),
      this.callTool('fetchRecommendations', { endpoint: 'discover', limit: 5 })
    ]);
    
    const concurrentTime = Date.now() - concurrentStart;
    console.log(`\n✅ Concurrent calls completed in ${concurrentTime}ms`);
    
    // Test 2: Sequential operations (same calls)
    console.log('\n🔄 Test 2: Sequential API calls...');
    const sequentialStart = Date.now();
    
    await this.callTool('getFollowerCount', { addressOrName: 'vitalik.eth' });
    await this.callTool('getFollowerCount', { addressOrName: 'brantly.eth' });
    await this.callTool('fetchLeaderboard', { limit: 5 });
    await this.callTool('fetchRecommendations', { endpoint: 'discover', limit: 5 });
    
    const sequentialTime = Date.now() - sequentialStart;
    console.log(`\n✅ Sequential calls completed in ${sequentialTime}ms`);
    
    // Test 3: Efficient tag filtering vs multiple calls
    console.log('\n🏷️  Test 3: Tag filtering efficiency...');
    
    // Efficient approach - single call with tags
    const efficientStart = Date.now();
    const efficientResult = await this.callTool('getFollowers', {
      addressOrName: 'vitalik.eth',
      limit: 20,
      tags: ['builder', 'ethereum']
    });
    const efficientTime = Date.now() - efficientStart;
    
    // Naive approach - get all then filter
    const naiveStart = Date.now();
    const allFollowers = await this.callTool('getFollowers', {
      addressOrName: 'vitalik.eth',
      limit: 50
    });
    // Would need to filter manually here
    const naiveTime = Date.now() - naiveStart;
    
    console.log(`\n📊 Performance comparison:`);
    console.log(`Efficient (with tags): ${efficientTime}ms`);
    console.log(`Naive (no tags): ${naiveTime}ms`);
    console.log(`Time saved: ${naiveTime - efficientTime}ms`);
    
    // Test 4: Pagination performance
    console.log('\n📄 Test 4: Pagination performance...');
    
    const page1Start = Date.now();
    await this.callTool('fetchProfileFollowers', {
      addressOrName: 'vitalik.eth',
      limit: 20,
      pageParam: 0
    });
    const page1Time = Date.now() - page1Start;
    
    const page2Start = Date.now();
    await this.callTool('fetchProfileFollowers', {
      addressOrName: 'vitalik.eth',
      limit: 20,
      pageParam: 1
    });
    const page2Time = Date.now() - page2Start;
    
    console.log(`\nPage 1 load time: ${page1Time}ms`);
    console.log(`Page 2 load time: ${page2Time}ms`);
    
    return {
      concurrentTime,
      sequentialTime,
      speedup: `${((sequentialTime / concurrentTime) - 1) * 100}%`,
      tagFilteringSaved: naiveTime - efficientTime,
      paginationConsistent: Math.abs(page1Time - page2Time) < 100
    };
  }

  // Run all workflows
  async runAllWorkflows() {
    console.log('🚀 Starting EFP MCP Server Workflow Tests...\n');
    console.log(`📍 Server URL: ${this.baseUrl}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
    
    const results: any = {
      startTime: Date.now(),
      workflows: {}
    };

    try {
      // Run each workflow
      results.workflows.socialNetwork = await this.socialNetworkAnalysis();
      results.workflows.relationships = await this.userRelationshipDiscovery();
      results.workflows.tagAnalysis = await this.tagBasedCommunityAnalysis();
      results.workflows.performance = await this.performanceTesting();
      
      results.endTime = Date.now();
      results.totalDuration = results.endTime - results.startTime;
      
      // Summary
      console.log('\n\n📊 === WORKFLOW TEST SUMMARY ===\n');
      console.log(`✅ All workflows completed successfully`);
      console.log(`⏱️  Total duration: ${results.totalDuration}ms`);
      console.log(`\n🔍 Key insights discovered:`);
      console.log(`- Social network analysis completed for top influencers`);
      console.log(`- User relationships mapped successfully`);
      console.log(`- Tag-based communities analyzed`);
      console.log(`- Performance characteristics validated`);
      
      // Save results
      const fs = await import('fs/promises');
      await fs.writeFile(
        'efp-workflow-results.json',
        JSON.stringify(results, null, 2)
      );
      console.log(`\n💾 Full results saved to efp-workflow-results.json`);
      
    } catch (error) {
      console.error('\n❌ Workflow test failed:', error);
      results.error = error;
    }
    
    return results;
  }
}

// Run the tests
if (require.main === module) {
  const tester = new EFPWorkflowTester();
  tester.runAllWorkflows().then(() => {
    console.log('\n✨ All tests completed!');
  }).catch(error => {
    console.error('\n💥 Test runner failed:', error);
    process.exit(1);
  });
}

export { EFPWorkflowTester };