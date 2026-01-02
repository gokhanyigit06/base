const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
// Manual env parser
const content = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
const envConfig = content.split('\n').reduce((acc, line) => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        acc[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
    }
    return acc;
}, {});
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log('🔍 Testing connection to:', supabaseUrl);

    // 1. Try to fetch from a TABLE WE KNOW EXISTS (e.g., site_settings or projects)
    console.log('\n--- Test 1: Checking "site_settings" table (Should exist) ---');
    const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1);

    if (settingsError) {
        console.error('❌ Failed to connect to site_settings:', settingsError.message);
    } else {
        console.log('✅ Connected to site_settings! DB is reachable.');
    }

    // 2. Try to fetch from "brands" table
    console.log('\n--- Test 2: Checking "brands" table (The problem) ---');
    const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .limit(1);

    if (brandsError) {
        console.error('❌ Failed to query "brands":', brandsError.message);
        console.log('👉 Diagnosis: The table definitely does NOT exist in this database project.');
        console.log('👉 Solution: Run the CREATE TABLE SQL in the SQL Editor of THIS project.');
    } else {
        console.log('✅ Success! "brands" table exists and is readable.');
        console.log('👉 Diagnosis: The table exists. If app fails, try restarting the dev server.');
    }
}

checkConnection();
