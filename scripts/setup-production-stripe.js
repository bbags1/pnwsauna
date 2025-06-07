const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupProductionStripe() {
  try {
    console.log('🚀 Setting up Stripe for PRODUCTION...');
    
    // Check if we're in live mode
    const account = await stripe.accounts.retrieve();
    console.log(`📊 Account: ${account.display_name}`);
    console.log(`🔴 Live mode: ${!process.env.STRIPE_SECRET_KEY.includes('sk_test')}`);
    
    if (process.env.STRIPE_SECRET_KEY.includes('sk_test')) {
      console.log('⚠️  WARNING: You are using TEST keys. Use live keys for production.');
      console.log('Set STRIPE_SECRET_KEY to your live secret key (sk_live_...)');
      return;
    }

    // Create Community Session product
    console.log('📦 Creating Community Session product...');
    const communityProduct = await stripe.products.create({
      name: 'Community Sauna Session',
      description: 'Shared sauna experience with other community members',
      type: 'service',
      metadata: {
        type: 'community_session'
      }
    });

    const communityPrice = await stripe.prices.create({
      product: communityProduct.id,
      unit_amount: 1500, // $15.00
      currency: 'usd',
      nickname: 'Community Session'
    });

    // Create Membership products
    console.log('📦 Creating Membership products...');
    const membershipProduct = await stripe.products.create({
      name: 'PNW Sauna Membership',
      description: 'Monthly membership with unlimited community sessions',
      type: 'service',
      metadata: {
        type: 'membership'
      }
    });

    const monthlyPrice = await stripe.prices.create({
      product: membershipProduct.id,
      unit_amount: 5000, // $50.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      nickname: 'Monthly Membership'
    });

    const annualPrice = await stripe.prices.create({
      product: membershipProduct.id,
      unit_amount: 50000, // $500.00 (saves $100/year)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      nickname: 'Annual Membership'
    });

    console.log('✅ Production Stripe setup complete!');
    console.log('\n📋 Product IDs (save these):');
    console.log(`Community Product: ${communityProduct.id}`);
    console.log(`Community Price: ${communityPrice.id}`);
    console.log(`Membership Product: ${membershipProduct.id}`);
    console.log(`Monthly Price: ${monthlyPrice.id}`);
    console.log(`Annual Price: ${annualPrice.id}`);

    console.log('\n🔧 Next steps:');
    console.log('1. Update your environment variables with live keys');
    console.log('2. Set up webhooks for your production domain');
    console.log('3. Complete business profile in Stripe dashboard');
    console.log('4. Add bank account for payouts');
    console.log('5. Test with a small real payment');

  } catch (error) {
    console.error('❌ Error setting up production Stripe:', error.message);
  }
}

// Check if STRIPE_SECRET_KEY is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.log('❌ Please set STRIPE_SECRET_KEY environment variable');
  console.log('For production, use: STRIPE_SECRET_KEY=sk_live_... node scripts/setup-production-stripe.js');
  process.exit(1);
}

setupProductionStripe(); 