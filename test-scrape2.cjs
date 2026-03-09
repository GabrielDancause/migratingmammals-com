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

    // Attempt to extract specific info for the first card
    const firstCard = $('h3').first().text();
    console.log("First card:", firstCard);

    // Look for elements that might contain fee/reward info
    const ps = $('p').map((i, el) => $(el).text().trim()).get();
    console.log(ps.slice(0, 10));

    const divs = $('div').map((i, el) => $(el).text().trim()).get();
    // try to find structured data or class names for fees

    // Dump some HTML structure to understand classes
    console.log("Structure of first h3 parent:");
    console.log($('h3').first().parent().parent().parent().html().substring(0, 500));

  } catch (err) {
    console.log(err.message);
  }
}
scrape();
