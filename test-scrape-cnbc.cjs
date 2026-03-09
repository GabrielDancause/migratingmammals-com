const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
  try {
    const res = await axios.get('https://www.cnbc.com/select/best-no-foreign-transaction-fee-credit-cards/');
    const $ = cheerio.load(res.data);
    const headings = $('h2, h3').map((i, el) => $(el).text().trim()).get();
    console.log(headings.slice(0, 30));
  } catch (err) {
    console.log(err.message);
  }
}
scrape();
