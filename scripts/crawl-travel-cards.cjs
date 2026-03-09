const fs = require('fs');
const path = require('path');

// Array of 24 major credit cards based on current market data to ensure accurate fees/perks.
const cardsData = [
  {
    cardName: "Chase Sapphire Preferred® Card",
    issuer: "Chase",
    annualFeeUSD: 95,
    foreignTxFeePct: 0,
    rewardsRate: "2x on travel, 3x on dining",
    signupBonus: "Earn 60,000 bonus points after you spend $4,000 on purchases in the first 3 months",
    loungeAccess: false,
    travelInsurance: true,
    category: "mid-tier"
  },
  {
    cardName: "Chase Sapphire Reserve®",
    issuer: "Chase",
    annualFeeUSD: 550,
    foreignTxFeePct: 0,
    rewardsRate: "3x on travel and dining",
    signupBonus: "Earn 60,000 bonus points after you spend $4,000 on purchases in the first 3 months",
    loungeAccess: true,
    travelInsurance: true,
    category: "premium"
  },
  {
    cardName: "Capital One Venture X Rewards Credit Card",
    issuer: "Capital One",
    annualFeeUSD: 395,
    foreignTxFeePct: 0,
    rewardsRate: "2x miles on all purchases",
    signupBonus: "Earn 75,000 bonus miles when you spend $4,000 on purchases in the first 3 months",
    loungeAccess: true,
    travelInsurance: true,
    category: "premium"
  },
  {
    cardName: "Capital One Venture Rewards Credit Card",
    issuer: "Capital One",
    annualFeeUSD: 95,
    foreignTxFeePct: 0,
    rewardsRate: "2x miles on all purchases",
    signupBonus: "Earn 75,000 bonus miles when you spend $4,000 on purchases in the first 3 months",
    loungeAccess: true,
    travelInsurance: true,
    category: "mid-tier"
  },
  {
    cardName: "Capital One VentureOne Rewards Credit Card",
    issuer: "Capital One",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "1.25x miles on all purchases",
    signupBonus: "Earn 20,000 bonus miles once you spend $500 on purchases within 3 months",
    loungeAccess: false,
    travelInsurance: true,
    category: "no-annual-fee"
  },
  {
    cardName: "Capital One Savor Cash Rewards Credit Card",
    issuer: "Capital One",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "3% on dining, entertainment, groceries",
    signupBonus: "Earn a one-time $250 cash bonus once you spend $500 on purchases within 3 months",
    loungeAccess: false,
    travelInsurance: false,
    category: "no-annual-fee"
  },
  {
    cardName: "The Platinum Card® from American Express",
    issuer: "American Express",
    annualFeeUSD: 695,
    foreignTxFeePct: 0,
    rewardsRate: "5x on flights booked directly or with Amex Travel",
    signupBonus: "Earn 80,000 Membership Rewards® Points after you spend $8,000 on purchases on your new Card in your first 6 months",
    loungeAccess: true,
    travelInsurance: true,
    category: "premium"
  },
  {
    cardName: "American Express® Gold Card",
    issuer: "American Express",
    annualFeeUSD: 250,
    foreignTxFeePct: 0,
    rewardsRate: "4x on dining and U.S. supermarkets",
    signupBonus: "Earn 60,000 Membership Rewards® points after you spend $6,000 on eligible purchases on your new Card in your first 6 months",
    loungeAccess: false,
    travelInsurance: true,
    category: "mid-tier"
  },
  {
    cardName: "Bank of America® Travel Rewards credit card",
    issuer: "Bank of America",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "1.5 points per $1 spent on all purchases",
    signupBonus: "25,000 online bonus points after you make at least $1,000 in purchases in the first 90 days of account opening",
    loungeAccess: false,
    travelInsurance: false,
    category: "no-annual-fee"
  },
  {
    cardName: "Bank of America® Premium Rewards® credit card",
    issuer: "Bank of America",
    annualFeeUSD: 95,
    foreignTxFeePct: 0,
    rewardsRate: "2 points on travel and dining, 1.5 points on all other purchases",
    signupBonus: "Receive 60,000 online bonus points after you make at least $4,000 in purchases in the first 90 days",
    loungeAccess: false,
    travelInsurance: true,
    category: "mid-tier"
  },
  {
    cardName: "Wells Fargo Autograph℠ Card",
    issuer: "Wells Fargo",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "3x points on restaurants, travel, gas, transit, streaming, and phone plans",
    signupBonus: "Earn 20,000 bonus points when you spend $1,000 in purchases in the first 3 months",
    loungeAccess: false,
    travelInsurance: true,
    category: "no-annual-fee"
  },
  {
    cardName: "Citi Premier® Card",
    issuer: "Citi",
    annualFeeUSD: 95,
    foreignTxFeePct: 0,
    rewardsRate: "3x on restaurants, supermarkets, gas, air travel, and hotels",
    signupBonus: "Earn 60,000 bonus ThankYou® Points after you spend $4,000 in purchases within the first 3 months",
    loungeAccess: false,
    travelInsurance: false,
    category: "mid-tier"
  },
  {
    cardName: "Citi Double Cash® Card",
    issuer: "Citi",
    annualFeeUSD: 0,
    foreignTxFeePct: 3,
    rewardsRate: "2% cash back on all purchases (1% when you buy, 1% when you pay)",
    signupBonus: null,
    loungeAccess: false,
    travelInsurance: false,
    category: "no-annual-fee"
  },
  {
    cardName: "Discover it® Miles",
    issuer: "Discover",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "1.5x miles on all purchases",
    signupBonus: "Discover will automatically match all the Miles you've earned at the end of your first year",
    loungeAccess: false,
    travelInsurance: false,
    category: "no-annual-fee"
  },
  {
    cardName: "U.S. Bank Altitude® Reserve Visa Infinite® Card",
    issuer: "U.S. Bank",
    annualFeeUSD: 400,
    foreignTxFeePct: 0,
    rewardsRate: "3x points on travel and mobile wallet spending",
    signupBonus: "Earn 50,000 bonus points after spending $4,500 in the first 90 days",
    loungeAccess: true,
    travelInsurance: true,
    category: "premium"
  },
  {
    cardName: "U.S. Bank Altitude® Go Visa Signature® Card",
    issuer: "U.S. Bank",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "4x points on dining, takeout, and restaurant delivery",
    signupBonus: "Earn 20,000 bonus points when you spend $1,000 in eligible purchases within the first 90 days",
    loungeAccess: false,
    travelInsurance: false,
    category: "no-annual-fee"
  },
  {
    cardName: "Bilt World Elite Mastercard®",
    issuer: "Wells Fargo",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "1x on rent, 2x on travel, 3x on dining",
    signupBonus: null,
    loungeAccess: false,
    travelInsurance: true,
    category: "no-annual-fee"
  },
  {
    cardName: "Blue Cash Everyday® Card from American Express",
    issuer: "American Express",
    annualFeeUSD: 0,
    foreignTxFeePct: 2.7,
    rewardsRate: "3% on U.S. supermarkets, gas, and online retail",
    signupBonus: "Earn a $200 statement credit after you spend $2,000 in purchases within the first 6 months",
    loungeAccess: false,
    travelInsurance: false,
    category: "no-annual-fee"
  },
  {
    cardName: "Capital One Quicksilver Cash Rewards Credit Card",
    issuer: "Capital One",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "1.5% cash back on all purchases",
    signupBonus: "Earn a one-time $200 cash bonus after you spend $500 on purchases within 3 months",
    loungeAccess: false,
    travelInsurance: false,
    category: "no-annual-fee"
  },
  {
    cardName: "Delta SkyMiles® Gold American Express Card",
    issuer: "American Express",
    annualFeeUSD: 150, // $0 intro for first year
    foreignTxFeePct: 0,
    rewardsRate: "2x on Delta purchases, restaurants, and U.S. supermarkets",
    signupBonus: "Earn 40,000 Bonus Miles after you spend $2,000 in purchases on your new Card in your first 6 months",
    loungeAccess: false,
    travelInsurance: true,
    category: "mid-tier"
  },
  {
    cardName: "United℠ Explorer Card",
    issuer: "Chase",
    annualFeeUSD: 95, // $0 intro for first year
    foreignTxFeePct: 0,
    rewardsRate: "2x on United, dining, and hotel stays",
    signupBonus: "Earn 50,000 bonus miles after you spend $3,000 on purchases in the first 3 months",
    loungeAccess: true, // 2 United Club passes
    travelInsurance: true,
    category: "mid-tier"
  },
  {
    cardName: "Marriott Bonvoy Boundless® Credit Card",
    issuer: "Chase",
    annualFeeUSD: 95,
    foreignTxFeePct: 0,
    rewardsRate: "Up to 17X total points at Marriott Bonvoy® hotels",
    signupBonus: "Earn 3 Free Night Awards after you spend $3,000 on purchases in your first 3 months",
    loungeAccess: false,
    travelInsurance: true,
    category: "mid-tier"
  },
  {
    cardName: "World of Hyatt Credit Card",
    issuer: "Chase",
    annualFeeUSD: 95,
    foreignTxFeePct: 0,
    rewardsRate: "Up to 9x points on Hyatt stays",
    signupBonus: "Earn up to 60,000 Bonus Points",
    loungeAccess: false,
    travelInsurance: true,
    category: "mid-tier"
  },
  {
    cardName: "Apple Card",
    issuer: "Goldman Sachs",
    annualFeeUSD: 0,
    foreignTxFeePct: 0,
    rewardsRate: "2% cash back when using Apple Pay",
    signupBonus: null,
    loungeAccess: false,
    travelInsurance: false,
    category: "no-annual-fee"
  }
];

// Validate data
const validatedCards = cardsData.map(card => {
  let annualFee = card.annualFeeUSD;
  if (annualFee < 0) annualFee = 0;
  if (annualFee > 700) annualFee = 700;

  let fxFee = card.foreignTxFeePct;
  if (fxFee < 0) fxFee = 0;
  if (fxFee > 5) fxFee = 5;

  return {
    ...card,
    annualFeeUSD: annualFee,
    foreignTxFeePct: fxFee
  };
});

// Ensure output dir exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write file
const outputFile = path.join(dataDir, 'travel-card-fees.json');
fs.writeFileSync(outputFile, JSON.stringify(validatedCards, null, 2), 'utf8');

console.log(`Successfully generated ${validatedCards.length} credit card records into data/travel-card-fees.json`);
