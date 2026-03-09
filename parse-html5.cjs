const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('nerdwallet.html', 'utf8');
const $ = cheerio.load(html);

const mainText = $('body').text();
const cardRegex = /(Chase Sapphire Preferred® Card|Wells Fargo Autograph® Card|Capital One Savor Cash Rewards Credit Card|Capital One Venture Rewards Credit Card|Capital One Quicksilver Cash Rewards Credit Card|Bank of America® Travel Rewards credit card|Capital One QuicksilverOne Cash Rewards Credit Card|Capital One Quicksilver Student Cash Rewards Credit Card|Ink Business Preferred® Credit Card|Chase Sapphire Reserve®|Capital One Venture X Rewards Credit Card|The Platinum Card® from American Express|American Express® Gold Card|Discover it® Miles|Bank of America® Premium Rewards® credit card|Citi Premier® Card|Citi Strata Premier℠ Card|Bilt World Elite Mastercard®|Marriott Bonvoy Boundless® Credit Card|United℠ Explorer Card)/g;

const foundCards = new Set([...mainText.matchAll(cardRegex)].map(m => m[0]));
console.log("Cards found in text:");
console.log(Array.from(foundCards));
