async function callFunction() {
  const res = await fetch('/.netlify/functions/hello');
  const data = await res.json();
  document.getElementById('result').textContent = JSON.stringify(data, null, 2);
}
