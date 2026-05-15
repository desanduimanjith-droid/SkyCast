import fetch from 'node-fetch';

const url = process.env.API_URL || 'http://localhost:4001/api/health';

async function main() {
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log('health:', json);
  } catch (err) {
    console.error('failed to reach backend:', err.message || err);
    process.exit(1);
  }
}

main();
