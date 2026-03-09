const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');

const CITIES = [
  { city: "Chiang Mai", country: "Thailand", region: "Southeast Asia" },
  { city: "Bangkok", country: "Thailand", region: "Southeast Asia" },
  { city: "Bali (Canggu)", country: "Indonesia", region: "Southeast Asia" },
  { city: "Lisbon", country: "Portugal", region: "Europe" },
  { city: "Porto", country: "Portugal", region: "Europe" },
  { city: "Barcelona", country: "Spain", region: "Europe" },
  { city: "Berlin", country: "Germany", region: "Europe" },
  { city: "Prague", country: "Czech Republic", region: "Europe" },
  { city: "Budapest", country: "Hungary", region: "Europe" },
  { city: "Tbilisi", country: "Georgia", region: "Europe" },
  { city: "Medellín", country: "Colombia", region: "Latin America" },
  { city: "Mexico City", country: "Mexico", region: "Latin America" },
  { city: "Playa del Carmen", country: "Mexico", region: "Latin America" },
  { city: "Buenos Aires", country: "Argentina", region: "Latin America" },
  { city: "Lima", country: "Peru", region: "Latin America" },
  { city: "Bogotá", country: "Colombia", region: "Latin America" },
  { city: "Ho Chi Minh City", country: "Vietnam", region: "Southeast Asia" },
  { city: "Da Nang", country: "Vietnam", region: "Southeast Asia" },
  { city: "Kuala Lumpur", country: "Malaysia", region: "Southeast Asia" },
  { city: "Seoul", country: "South Korea", region: "East Asia" },
  { city: "Tokyo", country: "Japan", region: "East Asia" },
  { city: "Taipei", country: "Taiwan", region: "East Asia" },
  { city: "Dubai", country: "United Arab Emirates", region: "Middle East" },
  { city: "Cape Town", country: "South Africa", region: "Africa" },
  { city: "Nairobi", country: "Kenya", region: "Africa" },
  { city: "Marrakech", country: "Morocco", region: "Africa" },
  { city: "Split", country: "Croatia", region: "Europe" },
  { city: "Athens", country: "Greece", region: "Europe" },
  { city: "Bucharest", country: "Romania", region: "Europe" },
  { city: "Sofia", country: "Bulgaria", region: "Europe" },
  { city: "Belgrade", country: "Serbia", region: "Europe" },
  { city: "Tirana", country: "Albania", region: "Europe" },
  { city: "Las Palmas", country: "Spain", region: "Europe" },
  { city: "Florianopolis", country: "Brazil", region: "Latin America" },
  { city: "Austin", country: "United States", region: "North America" },
  { city: "Denver", country: "United States", region: "North America" },
  { city: "Miami", country: "United States", region: "North America" },
  { city: "New York", country: "United States", region: "North America" },
  { city: "London", country: "United Kingdom", region: "Europe" },
  { city: "Amsterdam", country: "Netherlands", region: "Europe" },
  { city: "Paris", country: "France", region: "Europe" },
  { city: "Singapore", country: "Singapore", region: "Southeast Asia" }
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchHtml(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parsePrice(str) {
  const cleanStr = str.replace(/,/g, '');
  const match = cleanStr.match(/(\d+\.\d+)/) || cleanStr.match(/(\d+)/);
  return match ? parseFloat(match[0]) : null;
}

async function scrapeNumbeoCityUSD(city, country) {
  const formatName = (name) => {
    if (name === "Bali (Canggu)") return "Bali";
    if (name === "Las Palmas") return "Las-Palmas-de-Gran-Canaria";
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
  };

  const formattedCity = formatName(city);
  let url = `https://www.numbeo.com/cost-of-living/in/${formattedCity}?displayCurrency=USD`;

  try {
    let html = await fetchHtml(url);
    if (html.includes("Cannot find city")) {
       url = `https://www.numbeo.com/cost-of-living/in/${formattedCity}-${formatName(country)}?displayCurrency=USD`;
       try {
           html = await fetchHtml(url);
       } catch (e) {
           return null;
       }
    }

    const $ = cheerio.load(html);
    const data = {};
    $('tr').each((i, el) => {
      const text = $(el).text();
      if (text.includes('Meal at an Inexpensive Restaurant') || text.includes('Meal, Inexpensive Restaurant') || text.includes('Meal at Inexpensive Restaurant')) {
        const priceStr = $(el).find('td').last().text().trim();
        const price = parsePrice(priceStr);
        if (price !== null && price >= 1 && price <= 50) data.mealCheapUSD = price;
      }
      if (text.includes('Cappuccino (regular)') || text.includes('Cappuccino (Regular Size)')) {
        const priceStr = $(el).find('td').last().text().trim();
        const price = parsePrice(priceStr);
        if (price !== null && price >= 0.5 && price <= 10) data.coffeeUSD = price;
      }
      if (text.includes('Apartment (1 bedroom) in City Centre') || text.includes('1 Bedroom Apartment in City Centre') || text.includes('1 Bedroom') && text.includes('Centre')) {
        if (text.includes('Outside')) return;
        const priceStr = $(el).find('td').last().text().trim();
        const price = parsePrice(priceStr);
        if (price !== null && price >= 100 && price <= 5000) data.rentStudioUSD = price;
      }
    });
    return data;
  } catch (err) {
    console.error(`Failed to scrape Numbeo USD for ${city}: ${err.message}`);
    return null;
  }
}

async function scrapeNomadList(city) {
  const formatName = (name) => {
    if (name === "Bali (Canggu)") return "canggu";
    if (name === "Ho Chi Minh City") return "ho-chi-minh-city";
    if (name === "Las Palmas") return "las-palmas";
    if (name === "Playa del Carmen") return "playa-del-carmen";
    if (name === "Buenos Aires") return "buenos-aires";
    if (name === "Cape Town") return "cape-town";
    if (name === "Da Nang") return "da-nang";
    if (name === "Kuala Lumpur") return "kuala-lumpur";
    if (name === "Mexico City") return "mexico-city";
    if (name === "New York") return "new-york-city";
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-');
  };

  const formattedCity = formatName(city);
  const url = `https://nomadlist.com/${formattedCity}`;

  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const data = {};

    // Internet speed is tricky, looking for text matching "Internet speed"
    // e.g., <td>Internet speed</td><td class="value">20 <span class="tiny">Mbps</span></td>
    const internetMatch = html.match(/Internet speed[^<]*<\/span><\/td><td class="value">([0-9.]+)[^M]*Mbps/i);
    if (internetMatch && internetMatch[1]) {
       data.internetSpeedMbps = parseFloat(internetMatch[1]);
    }

    // Safety rating
    const safetyMatch = html.match(/Safety<\/td><td class="value"><div class="rating r([0-9]+)/i);
    if (safetyMatch && safetyMatch[1]) {
       data.safetyRating = parseInt(safetyMatch[1]) * 2; // Converting 1-5 scale to 1-10
    }

    // Nomad score
    const nomadMatch = html.match(/Nomad Score[^<]*<\/span><\/td><td class="value"><div class="rating r([0-9]+)/i);
    if (nomadMatch && nomadMatch[1]) {
       data.nomadScore = parseInt(nomadMatch[1]) * 2;
    }

    // Try to get Coworking price
    const coworkMatch = html.match(/Coworking<\/td><td class="value">.*?([0-9,]+)/i);
    if (coworkMatch && coworkMatch[1]) {
       data.coworkingMonthlyUSD = parsePrice(coworkMatch[1]);
    }

    // Climate
    const climateMatch = html.match(/Weather<\/td><td class="value">([^<]+)/i) || html.match(/Climate<\/td><td class="value">([^<]+)/i);
    if (climateMatch && climateMatch[1]) {
        data.climate = climateMatch[1].trim();
    } else {
        data.climate = "Varies"; // Fallback text
    }

    return data;
  } catch (err) {
    console.error(`Failed to scrape NomadList for ${city}: ${err.message}`);
    return null;
  }
}


async function generateData() {
  const results = [];

  for (const cityObj of CITIES) {
    console.log(`Processing ${cityObj.city}...`);

    let scrapedData = await scrapeNumbeoCityUSD(cityObj.city, cityObj.country);

    if ((!scrapedData || Object.keys(scrapedData).length === 0) && cityObj.country === "United States") {
       const usStates = {
           "Austin": "TX",
           "Denver": "CO",
           "Miami": "FL",
           "New York": "NY"
       };
       if (usStates[cityObj.city]) {
           const urlWithState = `https://www.numbeo.com/cost-of-living/in/${cityObj.city.replace(/\s+/g, '-')}-${usStates[cityObj.city]}?displayCurrency=USD`;
           try {
               const html = await fetchHtml(urlWithState);
               const $ = cheerio.load(html);
               scrapedData = {};
               $('tr').each((i, el) => {
                 const text = $(el).text();
                 if (text.includes('Meal at an Inexpensive Restaurant') || text.includes('Meal, Inexpensive Restaurant') || text.includes('Meal at Inexpensive Restaurant')) {
                   const priceStr = $(el).find('td').last().text().trim();
                   const price = parsePrice(priceStr);
                   if (price !== null && price >= 1 && price <= 50) scrapedData.mealCheapUSD = price;
                 }
                 if (text.includes('Cappuccino (regular)') || text.includes('Cappuccino (Regular Size)')) {
                   const priceStr = $(el).find('td').last().text().trim();
                   const price = parsePrice(priceStr);
                   if (price !== null && price >= 0.5 && price <= 10) scrapedData.coffeeUSD = price;
                 }
                 if (text.includes('Apartment (1 bedroom) in City Centre') || text.includes('1 Bedroom Apartment in City Centre') || text.includes('1 Bedroom') && text.includes('Centre')) {
                   if (text.includes('Outside')) return;
                   const priceStr = $(el).find('td').last().text().trim();
                   const price = parsePrice(priceStr);
                   if (price !== null && price >= 100 && price <= 5000) scrapedData.rentStudioUSD = price;
                 }
               });
           } catch(e) {}
       }
    }

    let nomadData = await scrapeNomadList(cityObj.city);

    const rent = scrapedData && scrapedData.rentStudioUSD ? scrapedData.rentStudioUSD : null;
    const meal = scrapedData && scrapedData.mealCheapUSD ? scrapedData.mealCheapUSD : null;
    const coffee = scrapedData && scrapedData.coffeeUSD ? scrapedData.coffeeUSD : null;

    let budget = null;
    if (rent !== null && meal !== null && coffee !== null) {
      budget = Math.round(rent + (meal * 60) + (coffee * 30) + 100);
      if (budget < 300 || budget > 8000) budget = null;
    }

    results.push({
      ...cityObj,
      monthlyBudgetUSD: budget,
      rentStudioUSD: rent,
      mealCheapUSD: meal,
      coffeeUSD: coffee,
      coworkingMonthlyUSD: nomadData && nomadData.coworkingMonthlyUSD ? nomadData.coworkingMonthlyUSD : null,
      internetSpeedMbps: nomadData && nomadData.internetSpeedMbps ? nomadData.internetSpeedMbps : null,
      safetyRating: nomadData && nomadData.safetyRating ? nomadData.safetyRating : null,
      nomadScore: nomadData && nomadData.nomadScore ? nomadData.nomadScore : null,
      climate: nomadData && nomadData.climate ? nomadData.climate : null
    });

    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}

const outputPath = path.join(__dirname, '..', 'data', 'cost-of-living-index.json');
const htmlPath = path.join(__dirname, '..', 'public', 'cost-of-living-index.html');

async function main() {
  console.log('Scraping Cost of Living Data...');
  const data = await generateData();

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Saved JSON data to ${outputPath}`);

  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const dataRegex = /const DATA = \[[\s\S]*?\];/m;
    const replacement = `const DATA = ${JSON.stringify(data, null, 2)};`;

    if (dataRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(dataRegex, replacement);
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`Updated DATA in ${htmlPath}`);
    } else {
      console.log(`Warning: Could not find 'const DATA =' block in ${htmlPath}`);
    }
  } else {
    console.log(`Warning: HTML file not found at ${htmlPath}`);
  }
}

main().catch(console.error);