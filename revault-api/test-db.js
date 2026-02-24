const { Client } = require('pg');
const urls = [
  "postgresql://postgres:Sar16_Sid31@db.dbyktxihhxbjttknzykt.supabase.co:5432/postgres",
  "postgresql://postgres.dbyktxihhxbjttknzykt:Sar16_Sid31@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  "postgresql://postgres.dbyktxihhxbjttknzykt:Sar16_Sid31@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres",
  "postgresql://postgres.dbyktxihhxbjttknzykt:Sar16_Sid31@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
];

async function testURLs() {
  for (const url of urls) {
    console.log("Testing:", url);
    const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
    try {
      await client.connect();
      console.log("SUCCESS:", url);
      await client.end();
    } catch (e) {
      console.log("FAILED:", e.message);
    }
  }
}
testURLs();
