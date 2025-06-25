# EthFollow API Integration Guide

## API Endpoints

Replace the placeholder API endpoints in `src/index.ts` with your actual ethfollow.xyz API endpoints:

### 1. Get Follower Count
```
GET /followers/count/{ensName}
Response: { count: number }
```

### 2. Check Following Relationship
```
GET /following/check?follower={follower}&following={following}
Response: { isFollowing: boolean }
```

### 3. Get Followers List
```
GET /followers/{ensName}?limit={limit}
Response: { followers: string[] }
```

### 4. Get Following List
```
GET /following/{ensName}?limit={limit}
Response: { following: string[] }
```

## Configuration

Set the `ETHFOLLOW_API_URL` environment variable in your `wrangler.jsonc`:

```json
{
  "vars": {
    "ETHFOLLOW_API_URL": "https://api.ethfollow.xyz"
  }
}
```

## Authentication

If your API requires authentication, add the necessary headers in the fetch calls:

```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${this.env.API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

## Error Handling

Consider adding error handling for:
- Invalid ENS names
- Rate limiting
- Network errors
- API downtime

## Response Format

Ensure your API responses match the expected format or update the response parsing in the MCP server accordingly.