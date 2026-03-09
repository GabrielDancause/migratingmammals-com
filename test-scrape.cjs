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
    const headings = $('h2, h3').map((i, el) => $(el).text().trim()).get();
    console.log(headings.slice(0, 30));
  } catch (err) {
    console.log(err.message);
  }
}
scrape();
