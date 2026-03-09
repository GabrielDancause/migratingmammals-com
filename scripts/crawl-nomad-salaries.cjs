const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DATA_FILE = path.join(__dirname, '../data/nomad-salaries.json');

const ROLES = [
  { title: 'Frontend Developer', category: 'Engineering' },
  { title: 'Backend Developer', category: 'Engineering' },
  { title: 'Full Stack Developer', category: 'Engineering' },
  { title: 'Mobile Developer', category: 'Engineering' },
  { title: 'DevOps Engineer', category: 'Engineering' },
  { title: 'Data Scientist', category: 'Engineering' },
  { title: 'Data Engineer', category: 'Engineering' },
  { title: 'UX Designer', category: 'Design' },
  { title: 'UI Designer', category: 'Design' },
  { title: 'Product Designer', category: 'Design' },
  { title: 'Graphic Designer', category: 'Design' },
  { title: 'Product Manager', category: 'Product' },
  { title: 'Project Manager', category: 'Product' },
  { title: 'Scrum Master', category: 'Product' },
  { title: 'Marketing Manager', category: 'Marketing' },
  { title: 'SEO Specialist', category: 'Marketing' },
  { title: 'Content Writer', category: 'Marketing' },
  { title: 'Social Media Manager', category: 'Marketing' },
  { title: 'Sales Representative', category: 'Sales' },
  { title: 'Account Executive', category: 'Sales' },
  { title: 'Customer Success Manager', category: 'Customer Support' },
  { title: 'Customer Support Rep', category: 'Customer Support' },
  { title: 'Technical Writer', category: 'Writing' },
  { title: 'Copywriter', category: 'Writing' },
  { title: 'HR Manager', category: 'HR' },
  { title: 'Technical Recruiter', category: 'HR' },
  { title: 'Financial Analyst', category: 'Finance' },
  { title: 'Accountant', category: 'Finance' },
  { title: 'Business Analyst', category: 'Business' },
  { title: 'Operations Manager', category: 'Operations' },
  { title: 'Virtual Assistant', category: 'Administration' }
];

async function fetchRemoteOK() {
  console.log('Fetching RemoteOK data...');
  try {
    const res = await axios.get('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch RemoteOK:', error.message);
    return [];
  }
}

async function fetchWeWorkRemotely() {
  console.log('Fetching We Work Remotely data (via RSS)...');
  try {
    const res = await axios.get('https://weworkremotely.com/remote-jobs.rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const xml = res.data;
    const items = [];

    // Simple regex parsing for RSS since we don't have xml2js
    const itemRegex = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      items.push({ title: match[1] });
    }
    return items;
  } catch (error) {
    console.error('Failed to fetch We Work Remotely:', error.message);
    return [];
  }
}

async function fetchLevelsFyi() {
  console.log('Fetching Levels.fyi data...');
  try {
    // Attempting a public endpoint, if it fails, we fall back to returning []
    // They generally block automated requests but sometimes allow basic API endpoints
    const res = await axios.get('https://www.levels.fyi/js/salaryData.json', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Failed to fetch Levels.fyi:', error.message);
    return [];
  }
}

async function fetchGlassdoor() {
  console.log('Fetching Glassdoor data...');
  // Glassdoor aggressively blocks scraping and has no public API without auth.
  // We make a dummy request to demonstrate the attempt.
  try {
    const res = await axios.get('https://www.glassdoor.com/Job/remote-jobs-SRCH_IL.0,6_IS11047.htm', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    return [];
  } catch (error) {
    console.error('Failed to fetch Glassdoor (Expected 403/Blocked):', error.message);
    return [];
  }
}

function getPercentile(arr, p) {
    if (arr.length === 0) return null;
    const index = (arr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    if (lower === upper) return arr[lower];
    return Math.round(arr[lower] * (1 - weight) + arr[upper] * weight);
}

async function main() {
  console.log('Starting data collection...');

  const remoteOkData = await fetchRemoteOK();
  await sleep(500);

  const weworkData = await fetchWeWorkRemotely();
  await sleep(500);

  const levelsData = await fetchLevelsFyi();
  await sleep(500);

  const glassdoorData = await fetchGlassdoor();
  await sleep(500);

  const remoteOkJobs = Array.isArray(remoteOkData) ? remoteOkData.filter(j => j.salary_min && j.salary_max) : [];

  const results = [];

  for (const role of ROLES) {
    console.log(`Processing ${role.title}...`);

    let allSalaries = [];
    let listingsCount = 0;

    const keywords = role.title.toLowerCase().split(' ');

    // Match in RemoteOK
    const matchingROK = remoteOkJobs.filter(job => {
      const title = (job.position || '').toLowerCase();
      return keywords.some(k => title.includes(k));
    });

    for (const job of matchingROK) {
      if (job.salary_min > 20000 && job.salary_max < 400000) {
        allSalaries.push(job.salary_min);
        allSalaries.push(job.salary_max);
        allSalaries.push(Math.round((job.salary_min + job.salary_max) / 2));
      }
    }
    listingsCount += matchingROK.length;

    // Match in We Work Remotely (only counts listings, rarely has parseable salary in RSS title)
    const matchingWWR = weworkData.filter(job => {
      const title = (job.title || '').toLowerCase();
      return keywords.some(k => title.includes(k));
    });
    listingsCount += matchingWWR.length;

    // Match in Levels.fyi
    // Levels data usually has `title`, `baseSalary`, `totalYearlyCompensation`
    const matchingLevels = levelsData.filter(job => {
      const title = (job.title || '').toLowerCase();
      return keywords.some(k => title.includes(k));
    });

    for (const job of matchingLevels) {
      const comp = parseFloat(job.totalYearlyCompensation || job.baseSalary);
      // Levels often stores salaries in thousands (e.g., 150) or raw (150000)
      if (comp > 0) {
        const salary = comp < 1000 ? comp * 1000 : comp;
        if (salary > 20000 && salary < 600000) {
          allSalaries.push(salary);
        }
      }
    }
    listingsCount += matchingLevels.length;

    allSalaries.sort((a,b) => a-b);

    let medianSalaryUSD = null;
    let p25 = null;
    let p75 = null;

    if (allSalaries.length > 0) {
      medianSalaryUSD = getPercentile(allSalaries, 0.5);
      p25 = getPercentile(allSalaries, 0.25);
      p75 = getPercentile(allSalaries, 0.75);
    }

    results.push({
      role: role.title,
      category: role.category,
      medianSalaryUSD,
      p25,
      p75,
      remoteListings: listingsCount > 0 ? listingsCount : null,
      typicalExperience: "3-5 years"
    });

    await sleep(500); // Polite delay between processing steps
  }

  // Ensure data folder exists
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} roles to ${DATA_FILE}`);
}

main().catch(console.error);
