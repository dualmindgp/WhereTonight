import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

// Datos de venues de Madrid
const MADRID_VENUES = [
  {
    name: 'Teatro Kapital',
    type: 'club',
    lat: 40.4069,
    lng: -3.6993,
    address: 'Calle de Atocha, 125, 28012 Madrid',
    avg_price_text: 'Entry: 20-30€, Drinks: 12-18€',
    tickets_url: 'https://example.com/tickets/kapital',
    maps_url: 'https://maps.google.com/?q=40.4069,-3.6993'
  },
  {
    name: 'Fabrik',
    type: 'club',
    lat: 40.3118,
    lng: -3.8047,
    address: 'Av. de la Industria, 82, 28970 Humanes de Madrid',
    avg_price_text: 'Entry: 25-40€, Drinks: 15-20€',
    tickets_url: 'https://example.com/tickets/fabrik',
    maps_url: 'https://maps.google.com/?q=40.3118,-3.8047'
  },
  {
    name: 'Joy Eslava',
    type: 'club',
    lat: 40.4179,
    lng: -3.7065,
    address: 'Calle de Arenal, 11, 28013 Madrid',
    avg_price_text: 'Entry: 15-25€, Drinks: 10-15€',
    tickets_url: 'https://example.com/tickets/joyeslava',
    maps_url: 'https://maps.google.com/?q=40.4179,-3.7065'
  },
  {
    name: 'Goya Social Club',
    type: 'club',
    lat: 40.4237,
    lng: -3.6827,
    address: 'Calle de Jorge Juan, 19, 28001 Madrid',
    avg_price_text: 'Entry: 15-20€, Drinks: 12-16€',
    tickets_url: 'https://example.com/tickets/goya',
    maps_url: 'https://maps.google.com/?q=40.4237,-3.6827'
  },
  {
    name: 'Barceló Teatro',
    type: 'club',
    lat: 40.4248,
    lng: -3.6952,
    address: 'Calle de Barceló, 11, 28004 Madrid',
    avg_price_text: 'Entry: 18-25€, Drinks: 12-18€',
    tickets_url: 'https://example.com/tickets/barcelo',
    maps_url: 'https://maps.google.com/?q=40.4248,-3.6952'
  },
  {
    name: 'Mondo Disco',
    type: 'club',
    lat: 40.4215,
    lng: -3.7018,
    address: 'Calle de la Reina, 16, 28004 Madrid',
    avg_price_text: 'Entry: 12-20€, Drinks: 10-14€',
    tickets_url: 'https://example.com/tickets/mondo',
    maps_url: 'https://maps.google.com/?q=40.4215,-3.7018'
  },
  {
    name: 'Sala Cool',
    type: 'club',
    lat: 40.4261,
    lng: -3.7087,
    address: 'Calle de Isabel la Católica, 6, 28013 Madrid',
    avg_price_text: 'Entry: 10-15€, Drinks: 8-12€',
    tickets_url: 'https://example.com/tickets/cool',
    maps_url: 'https://maps.google.com/?q=40.4261,-3.7087'
  },
  {
    name: 'El Sol',
    type: 'club',
    lat: 40.4203,
    lng: -3.7032,
    address: 'Calle de los Jardines, 3, 28013 Madrid',
    avg_price_text: 'Entry: 12-18€, Drinks: 10-15€',
    tickets_url: 'https://example.com/tickets/elsol',
    maps_url: 'https://maps.google.com/?q=40.4203,-3.7032'
  },
  {
    name: 'Kapital Sunday',
    type: 'club',
    lat: 40.4069,
    lng: -3.6993,
    address: 'Calle de Atocha, 125, 28012 Madrid',
    avg_price_text: 'Entry: 15-20€, Drinks: 12-16€',
    tickets_url: 'https://example.com/tickets/kapitalsunday',
    maps_url: 'https://maps.google.com/?q=40.4069,-3.6993'
  },
  {
    name: 'Stardust',
    type: 'club',
    lat: 40.4256,
    lng: -3.7079,
    address: 'Calle del Marqués de Valdeiglesias, 3, 28004 Madrid',
    avg_price_text: 'Entry: 10-15€, Drinks: 8-12€',
    tickets_url: 'https://example.com/tickets/stardust',
    maps_url: 'https://maps.google.com/?q=40.4256,-3.7079'
  }
]

async function seedMadridVenues() {
  console.log('🚀 Starting Madrid venues seeding process...\n')

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('❌ Missing Supabase credentials in environment variables')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('✅ Supabase client initialized\n')

  let inserted = 0
  let failed = 0

  for (const venue of MADRID_VENUES) {
    try {
      console.log(`📍 Inserting: ${venue.name}`)
      
      const { data, error } = await supabase
        .from('venues')
        .insert({
          ...venue,
          is_active: true
        })
        .select()

      if (error) {
        console.error(`❌ Error inserting ${venue.name}:`, error.message)
        failed++
      } else {
        console.log(`✅ Inserted: ${venue.name}`)
        inserted++
      }

      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`❌ Error processing ${venue.name}:`, error)
      failed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 MADRID VENUES SEEDING COMPLETED!')
  console.log('='.repeat(50))
  console.log(`📊 SUMMARY:`)
  console.log(`   ✅ Inserted: ${inserted}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`\n🔗 Total Madrid venues in database: ${inserted}`)

  process.exit(0)
}

seedMadridVenues().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
