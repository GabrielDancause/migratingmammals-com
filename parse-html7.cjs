const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeTPG() {
  try {
    const res = await axios.get('https://thepointsguy.com/credit-cards/best-no-foreign-transaction-fee/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"'
      }
    });
    console.log("TPG success:", res.status);
    const $ = cheerio.load(res.data);
    const mainText = $('body').text();
    const cardRegex = /(Chase Sapphire Preferred|Wells Fargo Autograph|Capital One Savor|Capital One Venture|Capital One Quicksilver|Bank of America Travel|Bank of America Premium|Ink Business|Chase Sapphire Reserve|Platinum Card from American Express|American Express Gold|Discover it Miles|Citi Strata Premier|Bilt World Elite Mastercard|Marriott Bonvoy Boundless|United Explorer|IHG One Rewards Premier|Southwest Rapid Rewards Priority)/gi;

    const foundCards = new Set([...mainText.matchAll(cardRegex)].map(m => m[0]));
    console.log("Cards found in TPG:", Array.from(foundCards));
  } catch (err) {
    console.log("TPG failed:", err.message);
  }
}

scrapeTPG();
