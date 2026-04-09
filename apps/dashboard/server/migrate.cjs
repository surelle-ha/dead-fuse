const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function migrate() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file')
    console.error('')
    console.error('📁 For manual migration, see the SQL files in server/migrations/')
    console.error('Run them in order: 001_initial_projects.sql → 002_custom_users_table.sql → 003_project_metadata.sql')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔄 Checking database connection...')

  try {
    const { error } = await supabase
      .from('projects')
      .select('id')
      .limit(1)

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      console.error('❌ Database connection failed:', error.message)
      console.error('')
      console.error('📁 For manual migration, see the SQL files in server/migrations/')
      process.exit(1)
    }

    console.log('✅ Database connection successful!')
    console.log('')
    console.log('📁 Migration files are available in server/migrations/')
    console.log('Run them manually in your Supabase SQL Editor in this order:')
    console.log('  1. 001_initial_projects.sql')
    console.log('  2. 002_custom_users_table.sql')
    console.log('  3. 003_project_metadata.sql')
    console.log('')
    console.log('This script currently only validates the connection.')
    console.log('Manual execution ensures proper migration order and error handling.')

  } catch (err) {
    console.error('❌ Migration check error:', err.message)
    console.error('')
    console.error('📁 For manual migration, see the SQL files in server/migrations/')
    process.exit(1)
  }
}

migrate()