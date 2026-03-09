const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const cities = [
  { name: 'Chiang Mai', id: 'Chiang-Mai', country: 'Thailand', region: 'Southeast Asia' },
  { name: 'Bangkok', id: 'Bangkok', country: 'Thailand', region: 'Southeast Asia' },
  { name: 'Bali (Canggu)', id: 'Bali', country: 'Indonesia', region: 'Southeast Asia' },
  { name: 'Lisbon', id: 'Lisbon', country: 'Portugal', region: 'Europe' },
  { name: 'Porto', id: 'Porto', country: 'Portugal', region: 'Europe' },
  { name: 'Barcelona', id: 'Barcelona', country: 'Spain', region: 'Europe' },
  { name: 'Berlin', id: 'Berlin', country: 'Germany', region: 'Europe' },
  { name: 'Prague', id: 'Prague', country: 'Czech Republic', region: 'Europe' },
  { name: 'Budapest', id: 'Budapest', country: 'Hungary', region: 'Europe' },
  { name: 'Tbilisi', id: 'Tbilisi', country: 'Georgia', region: 'Europe' },
  { name: 'Medellín', id: 'Medellin', country: 'Colombia', region: 'Latin America' },
  { name: 'Mexico City', id: 'Mexico-City', country: 'Mexico', region: 'Latin America' },
  { name: 'Playa del Carmen', id: 'Playa-del-Carmen', country: 'Mexico', region: 'Latin America' },
  { name: 'Buenos Aires', id: 'Buenos-Aires', country: 'Argentina', region: 'Latin America' },
  { name: 'Lima', id: 'Lima', country: 'Peru', region: 'Latin America' },
  { name: 'Bogotá', id: 'Bogota', country: 'Colombia', region: 'Latin America' },
  { name: 'Ho Chi Minh City', id: 'Ho-Chi-Minh-City', country: 'Vietnam', region: 'Southeast Asia' },
  { name: 'Da Nang', id: 'Da-Nang', country: 'Vietnam', region: 'Southeast Asia' },
  { name: 'Kuala Lumpur', id: 'Kuala-Lumpur', country: 'Malaysia', region: 'Southeast Asia' },
  { name: 'Seoul', id: 'Seoul', country: 'South Korea', region: 'East Asia' },
  { name: 'Tokyo', id: 'Tokyo', country: 'Japan', region: 'East Asia' },
  { name: 'Taipei', id: 'Taipei', country: 'Taiwan', region: 'East Asia' },
  { name: 'Dubai', id: 'Dubai', country: 'United Arab Emirates', region: 'Middle East' },
  { name: 'Cape Town', id: 'Cape-Town', country: 'South Africa', region: 'Africa' },
  { name: 'Nairobi', id: 'Nairobi', country: 'Kenya', region: 'Africa' },
  { name: 'Marrakech', id: 'Marrakech', country: 'Morocco', region: 'Africa' },
  { name: 'Split', id: 'Split', country: 'Croatia', region: 'Europe' },
  { name: 'Athens', id: 'Athens', country: 'Greece', region: 'Europe' },
  { name: 'Bucharest', id: 'Bucharest', country: 'Romania', region: 'Europe' },
  { name: 'Sofia', id: 'Sofia', country: 'Bulgaria', region: 'Europe' },
  { name: 'Belgrade', id: 'Belgrade', country: 'Serbia', region: 'Europe' },
  { name: 'Tirana', id: 'Tirana', country: 'Albania', region: 'Europe' },
  { name: 'Las Palmas', id: 'Las-Palmas', country: 'Spain', region: 'Europe' },
  { name: 'Florianopolis', id: 'Florianopolis', country: 'Brazil', region: 'Latin America' },
  { name: 'Austin', id: 'Austin', country: 'United States', region: 'North America' },
  { name: 'Denver', id: 'Denver', country: 'United States', region: 'North America' },
  { name: 'Miami', id: 'Miami', country: 'United States', region: 'North America' },
  { name: 'New York', id: 'New-York', country: 'United States', region: 'North America' },
  { name: 'London', id: 'London', country: 'United Kingdom', region: 'Europe' },
  { name: 'Amsterdam', id: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
  { name: 'Paris', id: 'Paris', country: 'France', region: 'Europe' },
  { name: 'Singapore', id: 'Singapore', country: 'Singapore', region: 'Southeast Asia' }
];

const climates = {
  "Chiang Mai": "Tropical savanna, smoky season Mar-Apr",
  "Bangkok": "Tropical monsoon, hot and humid year-round",
  "Bali (Canggu)": "Tropical monsoon, wet season Nov-Mar",
  "Lisbon": "Mediterranean, mild winters and warm summers",
  "Porto": "Mediterranean, cooler and wetter than Lisbon",
  "Barcelona": "Mediterranean, warm summers and mild winters",
  "Berlin": "Temperate seasonal, cold winters and pleasant summers",
  "Prague": "Oceanic/Humid continental, cold winters",
  "Budapest": "Humid continental, warm summers and cold winters",
  "Tbilisi": "Humid subtropical, warm summers and mild winters",
  "Medellín": "Tropical rainforest, 'City of Eternal Spring'",
  "Mexico City": "Subtropical highland, mild year-round",
  "Playa del Carmen": "Tropical savanna, hot and humid",
  "Buenos Aires": "Humid subtropical, hot summers and mild winters",
  "Lima": "Mild desert, high humidity but little rain",
  "Bogotá": "Oceanic, cool year-round due to high altitude",
  "Ho Chi Minh City": "Tropical savanna, distinct wet/dry seasons",
  "Da Nang": "Tropical monsoon, warm year-round",
  "Kuala Lumpur": "Tropical rainforest, hot and humid year-round",
  "Seoul": "Humid continental, hot summers and freezing winters",
  "Tokyo": "Humid subtropical, hot summers and mild winters",
  "Taipei": "Humid subtropical, hot and humid with typhoons",
  "Dubai": "Hot desert, extremely hot summers and mild winters",
  "Cape Town": "Mediterranean, mild wet winters and warm dry summers",
  "Nairobi": "Subtropical highland, mild year-round",
  "Marrakech": "Hot semi-arid, hot summers and cool winters",
  "Split": "Mediterranean, hot summers and mild winters",
  "Athens": "Mediterranean, hot dry summers and mild winters",
  "Bucharest": "Humid continental, hot summers and cold winters",
  "Sofia": "Humid continental, cold winters and warm summers",
  "Belgrade": "Humid continental, warm summers and cold winters",
  "Tirana": "Mediterranean, hot dry summers and mild wet winters",
  "Las Palmas": "Hot desert, very mild to warm year-round",
  "Florianopolis": "Humid subtropical, warm summers and mild winters",
  "Austin": "Humid subtropical, very hot summers",
  "Denver": "Semi-arid, cold snowy winters and warm summers",
  "Miami": "Tropical monsoon, hot and humid year-round",
  "New York": "Humid subtropical, hot summers and cold winters",
  "London": "Temperate oceanic, mild with frequent rain",
  "Amsterdam": "Oceanic, mild summers and cool winters",
  "Paris": "Oceanic, mild summers and cool winters",
  "Singapore": "Tropical rainforest, hot and humid year-round"
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const parseNum = str => {
  if (!str) return null;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
};

async function crawl() {
  const results = [];

  for (const city of cities) {
    console.log(`Crawling ${city.name}...`);
    try {
      const res = await axios.get(`https://www.numbeo.com/cost-of-living/in/${city.id}?displayCurrency=USD`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(res.data);

      let rent = null;
      let meal = null;
      let coffee = null;

      const rows = $('table.data_wide_table tr');
      rows.each((i, row) => {
        const title = $(row).find('td').eq(0).text().trim();
        const value = $(row).find('td').eq(1).text().trim();
        if (title.includes('1 Bedroom Apartment in City Centre')) rent = parseNum(value);
        if (title.includes('Meal at an Inexpensive Restaurant')) meal = parseNum(value);
        if (title.includes('Cappuccino (Regular Size)')) coffee = parseNum(value);
      });

      const monthlyBudget = rent ? Math.round(rent + (meal ? meal * 60 : 600) + 300) : null;

      results.push({
        city: city.name,
        country: city.country,
        region: city.region,
        monthlyBudgetUSD: monthlyBudget,
        rentStudioUSD: rent,
        mealCheapUSD: meal,
        coffeeUSD: coffee,
        coworkingMonthlyUSD: null,
        internetSpeedMbps: null,
        safetyRating: null,
        nomadScore: null,
        climate: climates[city.name] || null
      });

      await sleep(1000);
    } catch (e) {
      console.error(`Failed ${city.name}:`, e.message);
      results.push({
        city: city.name,
        country: city.country,
        region: city.region,
        monthlyBudgetUSD: null,
        rentStudioUSD: null,
        mealCheapUSD: null,
        coffeeUSD: null,
        coworkingMonthlyUSD: null,
        internetSpeedMbps: null,
        safetyRating: null,
        nomadScore: null,
        climate: climates[city.name] || null
      });
    }
  }

  fs.writeFileSync(path.join(__dirname, '../data/cost-of-living-index.json'), JSON.stringify(results, null, 2));
  console.log('Done!');
}

crawl();
