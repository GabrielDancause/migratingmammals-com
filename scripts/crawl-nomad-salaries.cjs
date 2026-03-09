const axios = require('axios');
const fs = require('fs');
const path = require('path');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRemoteOK() {
  try {
    console.log("Fetching RemoteOK data...");
    const { data } = await axios.get('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    return data.slice(1);
  } catch (error) {
    console.error("Error fetching RemoteOK:", error.message);
    return [];
  }
}

async function fetchRemotive() {
  try {
    console.log("Fetching Remotive data...");
    const { data } = await axios.get('https://remotive.com/api/remote-jobs?limit=500'); // Get more jobs
    return data.jobs;
  } catch (error) {
    console.error("Error fetching Remotive:", error.message);
    return [];
  }
}

async function fetchArbeitnow() {
    try {
        console.log("Fetching Arbeitnow data...");
        const { data } = await axios.get('https://www.arbeitnow.com/api/job-board-api');
        return data.data;
    } catch(error) {
        console.error("Error fetching Arbeitnow:", error.message);
        return [];
    }
}

function parseSalary(str) {
    if (!str) return null;
    const matches = str.replace(/,/g, '').match(/\$?(\d{2,3}k|\d{4,6})/gi);
    if (!matches) return null;
    let min = null;
    let max = null;

    const parseVal = (val) => {
        val = val.replace('$', '').toLowerCase();
        if (val.endsWith('k')) {
            return parseInt(val.slice(0, -1)) * 1000;
        }
        return parseInt(val);
    };

    if (matches.length >= 2) {
        min = parseVal(matches[0]);
        max = parseVal(matches[1]);
    } else if (matches.length === 1) {
        min = parseVal(matches[0]);
        max = min;
    }

    if (min < 10000 || max > 500000) return null; // Sanity check
    return { min, max };
}

function normalizeTitle(title) {
    const rawTitle = title;
    title = title.toLowerCase();

    // Engineering
    if (title.includes('fullstack') || title.includes('full stack')) return { role: 'Full Stack Engineer', category: 'Engineering' };
    if (title.includes('frontend') || title.includes('front-end') || title.includes('front end') || title.includes('react') || title.includes('vue')) return { role: 'Frontend Engineer', category: 'Engineering' };
    if (title.includes('backend') || title.includes('back-end') || title.includes('back end') || title.includes('node') || title.includes('python') || title.includes('ruby')) return { role: 'Backend Engineer', category: 'Engineering' };
    if (title.includes('devops') || title.includes('sre') || title.includes('site reliability') || title.includes('infrastructure')) return { role: 'DevOps / SRE', category: 'Engineering' };
    if (title.includes('mobile') || title.includes('ios') || title.includes('android') || title.includes('flutter')) return { role: 'Mobile Engineer', category: 'Engineering' };
    if (title.includes('data engineer')) return { role: 'Data Engineer', category: 'Engineering' };
    if (title.includes('machine learning') || title.includes('ml engineer') || title.includes('ai engineer')) return { role: 'Machine Learning Engineer', category: 'Engineering' };
    if (title.includes('software engineer') || title.includes('software developer') || title.includes('developer') || title.includes('engineer') || title.includes('programmer')) return { role: 'Software Engineer', category: 'Engineering' };
    if (title.includes('qa') || title.includes('quality assurance') || title.includes('test engineer') || title.includes('automation engineer')) return { role: 'QA Engineer', category: 'Engineering' };

    // Design
    if (title.includes('product designer')) return { role: 'Product Designer', category: 'Design' };
    if (title.includes('ui/ux') || title.includes('ux/ui') || title.includes('ux designer') || title.includes('ui designer') || title.includes('user experience') || title.includes('user interface')) return { role: 'UX/UI Designer', category: 'Design' };
    if (title.includes('graphic designer') || title.includes('visual designer') || title.includes('art director')) return { role: 'Graphic Designer', category: 'Design' };
    if (title.includes('designer')) return { role: 'Designer', category: 'Design' };

    // Product & Management
    if (title.includes('product manager') || title.includes('product owner')) return { role: 'Product Manager', category: 'Product' };
    if (title.includes('project manager') || title.includes('program manager')) return { role: 'Project Manager', category: 'Product' };
    if (title.includes('scrum master') || title.includes('agile coach')) return { role: 'Scrum Master', category: 'Product' };
    if (title.includes('engineering manager') || title.includes('director of engineering') || title.includes('vp of engineering')) return { role: 'Engineering Manager', category: 'Management' };

    // Marketing & Sales
    if (title.includes('marketing manager') || title.includes('digital marketing') || title.includes('growth marketer')) return { role: 'Marketing Manager', category: 'Marketing' };
    if (title.includes('seo')) return { role: 'SEO Specialist', category: 'Marketing' };
    if (title.includes('content') || title.includes('copywriter') || title.includes('writer')) return { role: 'Content Writer', category: 'Marketing' };
    if (title.includes('sales executive') || title.includes('account executive') || title.includes('sales manager')) return { role: 'Account Executive', category: 'Sales' };
    if (title.includes('account manager')) return { role: 'Account Manager', category: 'Sales' };
    if (title.includes('business development') || title.includes('bdr') || title.includes('sdr') || title.includes('sales representative')) return { role: 'Sales Representative', category: 'Sales' };

    // Data & Operations
    if (title.includes('data scientist') || title.includes('machine learning scientist')) return { role: 'Data Scientist', category: 'Data' };
    if (title.includes('data analyst') || title.includes('product analyst') || title.includes('business analyst')) return { role: 'Data Analyst', category: 'Data' };
    if (title.includes('operations manager') || title.includes('ops manager') || title.includes('chief operating officer') || title.includes('coo')) return { role: 'Operations Manager', category: 'Operations' };
    if (title.includes('hr') || title.includes('human resources') || title.includes('recruiter') || title.includes('talent') || title.includes('people ops')) return { role: 'HR / Talent Acquisition', category: 'Operations' };

    // Support
    if (title.includes('customer success') || title.includes('client success')) return { role: 'Customer Success Manager', category: 'Support' };
    if (title.includes('customer support') || title.includes('technical support') || title.includes('help desk') || title.includes('it support')) return { role: 'Customer Support Representative', category: 'Support' };

    // Finance
    if (title.includes('accountant') || title.includes('finance manager') || title.includes('financial analyst') || title.includes('controller')) return { role: 'Finance / Accounting', category: 'Finance' };

    return { role: null, category: null };
}

function getExperienceLevel(title) {
    title = title.toLowerCase();
    if (title.includes('senior') || title.includes('sr.') || title.includes('lead') || title.includes('principal') || title.includes('staff') || title.includes('director') || title.includes('head') || title.includes('vp') || title.includes('manager')) {
        return 'Senior';
    }
    if (title.includes('junior') || title.includes('jr.') || title.includes('entry level') || title.includes('intern') || title.includes('graduate') || title.includes('associate')) {
        return 'Junior';
    }
    return 'Mid-Level';
}

function calculatePercentile(values, p) {
    if (values.length === 0) return null;
    if (values.length === 1) return values[0];

    values.sort((a, b) => a - b);
    const index = (values.length - 1) * p;
    const lower = Math.floor(index);
    const upper = lower + 1;
    const weight = index % 1;

    if (upper >= values.length) return values[lower];
    return Math.round(values[lower] * (1 - weight) + values[upper] * weight);
}

async function collectData() {
  const jobs = [];

  // RemoteOK
  const remoteOkJobs = await fetchRemoteOK();
  await delay(500);

  for (const j of remoteOkJobs) {
      if (j.salary_min && j.salary_max && j.salary_min >= 10000 && j.salary_max <= 500000) {
          jobs.push({
              title: j.position,
              min: j.salary_min,
              max: j.salary_max,
              avg: (j.salary_min + j.salary_max) / 2
          });
      }
  }

  // Remotive
  const remotiveJobs = await fetchRemotive();
  await delay(500);

  for (const j of remotiveJobs) {
      const parsed = parseSalary(j.salary);
      if (parsed) {
          jobs.push({
              title: j.title,
              min: parsed.min,
              max: parsed.max,
              avg: (parsed.min + parsed.max) / 2
          });
      }
  }

  // Arbeitnow
  const arbeitnowJobs = await fetchArbeitnow();
  await delay(500);

  // Fallback / Supplementary Mock Data Generation
  // "null over fake data, always" - User specifically requested this.
  // We MUST NOT use mocked data for roles. If we don't have enough data points, we will just use what we have,
  // or add more data sources, but NEVER generate fake data. We'll stick to actual data from the APIs.
  // Let's print out what jobs we got.

  console.log(`Collected ${jobs.length} total valid job listings with salaries.`);

  const roleData = {};

  for (const job of jobs) {
      if (!job.title) continue;
      const { role, category } = normalizeTitle(job.title);
      if (!role) {
          // console.log("Unmapped title:", job.title);
          continue;
      }

      const exp = getExperienceLevel(job.title);

      if (!roleData[role]) {
          roleData[role] = {
              role: role,
              category: category,
              salaries: [],
              remoteListings: 0,
              expCounts: { 'Junior': 0, 'Mid-Level': 0, 'Senior': 0 }
          };
      }

      roleData[role].salaries.push(job.avg);
      roleData[role].remoteListings++;
      roleData[role].expCounts[exp]++;
  }

  const results = [];

  for (const role in roleData) {
      const data = roleData[role];
      // Include roles even with 1 data point since we have very limited API data,
      // but only if it's the only data we have. It's better than fake data.
      if (data.salaries.length < 1) continue;

      const p25 = data.salaries.length > 1 ? calculatePercentile(data.salaries, 0.25) : data.salaries[0];
      const median = calculatePercentile(data.salaries, 0.50);
      const p75 = data.salaries.length > 1 ? calculatePercentile(data.salaries, 0.75) : data.salaries[0];

      // Determine typical experience
      let typicalExp = 'Mid-Level';
      let maxCount = data.expCounts['Mid-Level'];
      if (data.expCounts['Senior'] > maxCount) {
          typicalExp = 'Senior';
          maxCount = data.expCounts['Senior'];
      }
      if (data.expCounts['Junior'] > maxCount) {
          typicalExp = 'Junior';
      }

      results.push({
          role: data.role,
          category: data.category,
          medianSalaryUSD: median,
          p25: p25,
          p75: p75,
          remoteListings: data.remoteListings,
          typicalExperience: typicalExp
      });
  }

  results.sort((a, b) => b.medianSalaryUSD - a.medianSalaryUSD);

  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, 'nomad-salaries.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Saved ${results.length} aggregated roles to ${outputPath}`);

  return results;
}

collectData();
