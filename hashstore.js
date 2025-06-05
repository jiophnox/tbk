const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'hashdata.json');

// Ensure file exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

function saveHash(slicedId) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!data.includes(slicedId)) {
    data.push(slicedId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}

function getAllHashes() {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { saveHash, getAllHashes };
