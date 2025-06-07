const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function setupStripeProducts() {
  console.log('🏗️  Setting up Stripe products for PNW Sauna...\n')

  try {
    // 1. Community Sauna Session
    console.log('Creating Community Sauna Session product...')
    const communityProduct = await stripe.products.create({
      name: 'Community Sauna Session',
      description: 'Shared authentic Finnish sauna experience at Atlas Waterfront Park',
      images: [],
      metadata: {
        type: 'sauna_session',
        session_type: 'community',
        location: 'Atlas Waterfront Park, Coeur d\'Alene, Idaho'
      }
    })

    const communityPrice = await stripe.prices.create({
      unit_amount: 1500, // $15.00
      currency: 'usd',
      product: communityProduct.id,
      metadata: {
        session_type: 'community',
        per_person: 'true'
      }
    })

    console.log(`✅ Community Session: ${communityProduct.id} (Price: ${communityPrice.id})`)

    // 2. Monthly Membership
    console.log('Creating Monthly Membership...')
    const monthlyMembershipProduct = await stripe.products.create({
      name: 'PNW Sauna Monthly Membership',
      description: '30 days unlimited access with 50% off community sessions',
      images: [],
      metadata: {
        type: 'membership',
        duration: 'monthly',
        benefits: '30 days access, 50% off community sessions'
      }
    })

    const monthlyMembershipPrice = await stripe.prices.create({
      unit_amount: 10000, // $100.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      product: monthlyMembershipProduct.id,
      metadata: {
        membership_type: 'monthly'
      }
    })

    console.log(`✅ Monthly Membership: ${monthlyMembershipProduct.id} (Price: ${monthlyMembershipPrice.id})`)

    // Summary
    console.log('\n🎉 Stripe products created successfully!')
    console.log('\n📝 Add these to your .env.local file:')
    console.log(`STRIPE_PRICE_COMMUNITY_SESSION=${communityPrice.id}`)
    console.log(`STRIPE_PRICE_MONTHLY_MEMBERSHIP=${monthlyMembershipPrice.id}`)

    console.log('\n🔗 Stripe Dashboard Links:')
    console.log(`Products: https://dashboard.stripe.com/products`)
    console.log(`Prices: https://dashboard.stripe.com/prices`)

    console.log('\n💡 Future Features:')
    console.log('- Private sessions will be added later')
    console.log('- Family memberships coming soon')

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  setupStripeProducts()
}

module.exports = { setupStripeProducts } 