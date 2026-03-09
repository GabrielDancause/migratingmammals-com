const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const res = await axios.get('https://www.numbeo.com/cost-of-living/in/Lisbon', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(res.data);
    const rows = $('table.data_wide_table tr');
    rows.each((i, row) => {
        const title = $(row).find('td').eq(0).text().trim();
        const value = $(row).find('td').eq(1).text().trim();
        if (title) console.log(title, value);
    });
  } catch (e) {
    console.error(e.message);
  }
}
test();
