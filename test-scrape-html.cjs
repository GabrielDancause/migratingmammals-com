const axios = require('axios');
const fs = require('fs');

async function scrape() {
  try {
    const res = await axios.get('https://www.nerdwallet.com/best/credit-cards/no-foreign-transaction-fee', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      }
    });
    fs.writeFileSync('nerdwallet.html', res.data);
    console.log("Written to nerdwallet.html");
  } catch (err) {
    console.log(err.message);
  }
}
scrape();
