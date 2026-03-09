const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
  try {
    const res = await axios.get('https://www.bankrate.com/credit-cards/no-foreign-transaction-fee/');
    const $ = cheerio.load(res.data);
    const headings = $('h2, h3').map((i, el) => $(el).text().trim()).get();
    console.log(headings.slice(0, 30));
  } catch (err) {
    console.log(err.message);
  }
}
scrape();
