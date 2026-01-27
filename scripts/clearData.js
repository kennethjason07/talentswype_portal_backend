import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function clearAllData() {
    try {
        console.log('\n⚠️  WARNING: This will LITERALLY DELETE ALL DATA from the database! ⚠️');
        console.log('📍 MongoDB URI:', process.env.MONGO_URI || 'Not found in .env');
        
        const answer = await new Promise((resolve) => {
            rl.question('\nAre you absolutely sure you want to proceed? (type "yes, delete everything" to confirm): ', resolve);
        });

        if (answer !== 'yes, delete everything') {
            console.log('\n❌ Operation cancelled. No data was deleted.\n');
            process.exit(0);
        }

        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB successfully!');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`\nFound ${collectionNames.length} collections: ${collectionNames.join(', ')}`);

        for (const name of collectionNames) {
            console.log(`🗑️  Clearing collection: ${name}...`);
            await mongoose.connection.db.collection(name).deleteMany({});
            console.log(`✅ ${name} cleared.`);
        }

        console.log('\n✨ Database cleared successfully! ✨');

    } catch (error) {
        console.error('\n❌ Error clearing database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.');
        rl.close();
        process.exit(0);
    }
}

// Run the script
console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║        TalentSwype Database Cleaner Script         ║');
console.log('╚════════════════════════════════════════════════════╝\n');

clearAllData();
