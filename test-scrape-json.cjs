const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
  try {
    const res = await axios.get('https://www.nerdwallet.com/best/credit-cards/no-foreign-transaction-fee', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(res.data);

    // NerdWallet usually has ld+json or window.__INITIAL_STATE__
    $('script').each((i, el) => {
      const content = $(el).html();
      if (content && content.includes('Chase Sapphire Preferred')) {
        console.log("Found in script tag:", $(el).attr('type') || "no type", "length:", content.length);
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}
scrape();
