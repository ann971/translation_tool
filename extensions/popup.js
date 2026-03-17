function createParamRow(key = '', value = '', included = true) {
  const row = document.createElement('div');
  row.className = 'param-row';
  row.innerHTML = `
    <input type="text" placeholder="名稱" value="${key}" class="key" />
    <input type="text" placeholder="內容" value="${value}" class="value" />
    <input type="checkbox" class="include" ${included ? 'checked' : ''} />
    <button class="remove">✕</button>
  `;
  row.querySelector('.remove').onclick = () => row.remove();
  return row;
}

document.getElementById('add').onclick = () => {
  document.getElementById('params').appendChild(createParamRow());
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('params').appendChild(createParamRow());
});

document.getElementById('submit').onclick = () => {
  const rows = document.querySelectorAll('#params .param-row');
  const secret = document.getElementById('secret').value;
  const secretKeyName = document.getElementById('secretKey').value || 'api_secret';
  const method = document.querySelector('input[name=signMethod]:checked').value;

  const paramList = [];
  const payloadObj = {};

  rows.forEach(row => {
    const key = row.querySelector('.key').value;
    const value = row.querySelector('.value').value;
    const include = row.querySelector('.include').checked;
    if (key) {
      payloadObj[key] = value;
      if (include) paramList.push({ key, value });
    }
  });

  let signStr = '';
  let fullPayload = {};

  if (method === 'sha1') {
    paramList.push({ key: secretKeyName, value: secret });
    paramList.sort((a, b) => a.key.localeCompare(b.key));
    signStr = paramList.map(p => `${p.key}=${p.value}`).join('&');
    sha1(signStr).then(sig => {
      fullPayload = Object.assign({}, payloadObj);
      fullPayload.signature = sig;
      renderResult(signStr, sig, fullPayload);
    });
  } else {
    const jsonStr = JSON.stringify(payloadObj);
    signStr = jsonStr;
    hmac_sha256(secret, jsonStr).then(sig => {
      fullPayload = Object.assign({}, payloadObj);
      fullPayload.signature = sig;
      renderResult(signStr, sig, fullPayload);
    });
  }
};

function renderResult(signStr, sig, payload) {
  document.getElementById('signStr').textContent = signStr;
  document.getElementById('signature').textContent = sig;
  document.getElementById('payload').textContent = JSON.stringify(payload, null, 2);
}

function sha1(msg) {
  const encoder = new TextEncoder();
  const data = encoder.encode(msg);
  return crypto.subtle.digest('SHA-1', data).then(buf => hex(buf));
}

function hmac_sha256(key, msg) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(msg);
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(cryptoKey => crypto.subtle.sign('HMAC', cryptoKey, msgData))
    .then(buf => hex(buf));
}

function hex(buffer) {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}