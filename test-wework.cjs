const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://www.wework.com/api/v4/buildings?market_slug=bangkok', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log(res.status);
    console.log(res.data);
  } catch (e) {
    console.error(e.message);
  }
}
test();
