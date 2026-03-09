const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const res = await axios.get('https://www.coworker.com/search/thailand/bangkok', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log(res.status);
    console.log(res.data.substring(0, 500));
  } catch (e) {
    console.error(e.message);
  }
}
test();
