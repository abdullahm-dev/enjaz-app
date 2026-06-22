async function test() {
  const res = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client@platform.com', password: 'client123' })
  });
  const cookie = res.headers.get('set-cookie');
  
  const statsRes = await fetch('http://localhost:3000/api/stats', {
    headers: { 'Cookie': cookie }
  });
  const data = await statsRes.text();
  console.log(data);
}

test();
