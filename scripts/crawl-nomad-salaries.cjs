const axios = require('axios');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const DATA_FILE = path.join(__dirname, '../data/nomad-salaries.json');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const roles = [
  { id: 'software-engineer', name: 'Software Engineer', category: 'Engineering' },
  { id: 'frontend', name: 'Frontend Engineer', category: 'Engineering' },
  { id: 'backend', name: 'Backend Engineer', category: 'Engineering' },
  { id: 'fullstack', name: 'Full Stack Engineer', category: 'Engineering' },
  { id: 'devops', name: 'DevOps Engineer', category: 'Engineering' },
  { id: 'data-scientist', name: 'Data Scientist', category: 'Data' },
  { id: 'data-engineer', name: 'Data Engineer', category: 'Data' },
  { id: 'product-manager', name: 'Product Manager', category: 'Product' },
  { id: 'product-designer', name: 'Product Designer', category: 'Design' },
  { id: 'ux-researcher', name: 'UX Researcher', category: 'Design' },
  { id: 'marketing-manager', name: 'Marketing Manager', category: 'Marketing' },
  { id: 'seo', name: 'SEO Specialist', category: 'Marketing' },
  { id: 'sales', name: 'Sales Representative', category: 'Sales' },
  { id: 'customer-success', name: 'Customer Success Manager', category: 'Support' },
  { id: 'hr', name: 'HR Manager', category: 'HR & Ops' },
  { id: 'finance', name: 'Finance Manager', category: 'Finance' }
];

function extractSalaryFromText(text) {
  const match = text.match(/\$[\d,kK]+(\s*-\s*\$[\d,kK]+)?/g);
  if (!match) return null;

  let salaries = [];
  for (const m of match) {
    const parts = m.split('-').map(p => p.trim());
    for (const p of parts) {
      const isK = p.toLowerCase().includes('k');
      let num = parseFloat(p.replace(/[^\d.]/g, ''));
      if (isNaN(num)) continue;
      if (isK) num *= 1000;
      if (num >= 20000 && num <= 500000) {
        salaries.push(num);
      }
    }
  }

  if (salaries.length === 0) return null;

  const min = Math.min(...salaries);
  const max = Math.max(...salaries);
  return { min, max, avg: (min + max) / 2 };
}

async function fetchRemoteOK() {
  console.log('Fetching from RemoteOK...');
  try {
    const res = await axios.get('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const jobs = res.data.slice(1).filter(j => j.salary_min > 0 && j.salary_max > 0);
    return jobs.map(j => ({
      title: j.position,
      salaryMin: j.salary_min,
      salaryMax: j.salary_max,
      salaryAvg: (j.salary_min + j.salary_max) / 2,
      source: 'RemoteOK'
    }));
  } catch (err) {
    console.error('RemoteOK failed:', err.message);
    return [];
  }
}

async function fetchWWR() {
  console.log('Fetching from We Work Remotely...');
  const urls = [
    'https://weworkremotely.com/categories/remote-programming-jobs.rss',
    'https://weworkremotely.com/categories/remote-design-jobs.rss',
    'https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss',
    'https://weworkremotely.com/categories/remote-product-jobs.rss',
    'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss',
    'https://weworkremotely.com/categories/remote-customer-support-jobs.rss',
  ];
  let jobs = [];
  for (const url of urls) {
    let retries = 3;
    while(retries > 0) {
        try {
          const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const result = await xml2js.parseStringPromise(res.data);
          const items = result.rss?.channel[0]?.item || [];
          for (const item of items) {
            const title = item.title[0];
            const desc = item.description[0].replace(/<[^>]+>/g, ' ');
            const salary = extractSalaryFromText(desc);
            if (salary) {
              jobs.push({
                title,
                salaryMin: salary.min,
                salaryMax: salary.max,
                salaryAvg: salary.avg,
                source: 'We Work Remotely'
              });
            }
          }
          break; // success
        } catch (err) {
          retries--;
          console.error(`WWR failed for ${url} (retries left ${retries}):`, err.message);
          await delay(2000);
        }
    }
    await delay(500);
  }
  return jobs;
}

async function fetchRemotive() {
  console.log('Fetching from Remotive...');
  try {
    const res = await axios.get('https://remotive.com/api/remote-jobs');
    const jobs = res.data.jobs.filter(j => j.salary);
    const parsedJobs = [];
    for (const j of jobs) {
      const salary = extractSalaryFromText(j.salary);
      if (salary) {
        parsedJobs.push({
          title: j.title,
          salaryMin: salary.min,
          salaryMax: salary.max,
          salaryAvg: salary.avg,
          source: 'Remotive'
        });
      }
    }
    return parsedJobs;
  } catch (err) {
    console.error('Remotive failed:', err.message);
    return [];
  }
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  arr.sort((a, b) => a - b);
  const index = (arr.length - 1) * p;
  const lower = Math.floor(index);
  const upper = lower + 1;
  const weight = index % 1;
  if (upper >= arr.length) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
}

function matchRole(title, role) {
  title = title.toLowerCase();

  if (role.id === 'software-engineer') {
    return (title.includes('software') && title.includes('engineer')) || title.includes('developer') || title.includes('programmer');
  } else if (role.id === 'frontend') {
    return title.includes('frontend') || title.includes('front-end') || title.includes('front end') || title.includes('react') || title.includes('vue');
  } else if (role.id === 'backend') {
    return title.includes('backend') || title.includes('back-end') || title.includes('back end') || title.includes('node') || title.includes('python') || title.includes('java ') || title.includes('ruby');
  } else if (role.id === 'fullstack') {
    return title.includes('fullstack') || title.includes('full-stack') || title.includes('full stack') || (title.includes('full') && title.includes('stack'));
  } else if (role.id === 'devops') {
    return title.includes('devops') || title.includes('sre') || title.includes('reliability') || title.includes('infrastructure');
  } else if (role.id === 'data-scientist') {
    return title.includes('data scientist') || title.includes('machine learning') || title.includes('ai');
  } else if (role.id === 'data-engineer') {
    return title.includes('data engineer') || title.includes('data architecture');
  } else if (role.id === 'product-manager') {
    return title.includes('product manager') || title.includes('pm') || title.includes('product owner');
  } else if (role.id === 'product-designer') {
    return title.includes('product designer') || title.includes('ui/ux') || title.includes('ux/ui') || title.includes('ui designer');
  } else if (role.id === 'ux-researcher') {
    return title.includes('ux research') || title.includes('user research');
  } else if (role.id === 'marketing-manager') {
    return title.includes('marketing') || title.includes('growth');
  } else if (role.id === 'seo') {
    return title.includes('seo') || title.includes('search engine');
  } else if (role.id === 'sales') {
    return title.includes('sales') || title.includes('account executive') || title.includes('sdr') || title.includes('bdr');
  } else if (role.id === 'customer-success') {
    return title.includes('customer success') || title.includes('csm') || title.includes('support');
  } else if (role.id === 'hr') {
    return title.includes('hr') || title.includes('human resources') || title.includes('recruiter') || title.includes('talent');
  } else if (role.id === 'finance') {
    return title.includes('finance') || title.includes('accounting') || title.includes('financial');
  }

  return false;
}

async function run() {
  const [okJobs, wwrJobs, remotiveJobs] = await Promise.all([
    fetchRemoteOK(),
    fetchWWR(),
    fetchRemotive()
  ]);

  const allJobs = [...okJobs, ...wwrJobs, ...remotiveJobs];
  console.log(`Total jobs with salary collected: ${allJobs.length}`);

  const results = [];

  for (const role of roles) {
    const matched = allJobs.filter(j => matchRole(j.title, role));
    const salaries = matched.map(j => j.salaryAvg);

    if (salaries.length > 0) {
      // Calculate metrics
      const median = Math.round(percentile(salaries, 0.5));
      const p25 = Math.round(percentile(salaries, 0.25));
      const p75 = Math.round(percentile(salaries, 0.75));

      results.push({
        role: role.name,
        category: role.category,
        medianSalaryUSD: median,
        p25,
        p75,
        remoteListings: matched.length,
        typicalExperience: "Mid-Senior Level"
      });
    }
  }

  results.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return b.medianSalaryUSD - a.medianSalaryUSD;
  });

  console.log(`Successfully mapped data for ${results.length} roles.`);

  fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2));
  console.log(`Data saved to ${DATA_FILE}`);
}

run();
