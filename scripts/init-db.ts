/**
 * Database Initialization Script
 * Run with: npm run db:init
 */

import { initializeSchema, closePool } from '../src/lib/db-postgres';

async function main() {
  console.log('🚀 Starting database initialization...\n');

  try {
    await initializeSchema();
    console.log('\n✅ Database initialization complete!');
    console.log('\n📋 Tables created:');
    console.log('   - listening_history');
    console.log('   - artist_plays');
    console.log('   - genre_trends');
    console.log('   - user_statistics');
    console.log('   - festivals');
    console.log('   - festival_lineups');
    console.log('   - artist_mappings');
    console.log('   - user_festival_interests');
    console.log('   - user_itineraries');
    console.log('   - api_cache');
    console.log('\n🎉 Your database is ready to use!');
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
