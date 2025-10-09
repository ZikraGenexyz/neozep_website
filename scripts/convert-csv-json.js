import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'public/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Convert provinces
function convertProvinces() {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream('public/csv/provinces.csv')
      .pipe(csv())
      .on('data', (data) => results.push({
        id: parseInt(data.id),
        name: data.name
      }))
      .on('end', () => {
        fs.writeFileSync('public/data/provinces.json', JSON.stringify(results, null, 2));
        console.log(`✅ Converted ${results.length} provinces`);
        resolve();
      });
  });
}

// Convert cities
function convertCities() {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream('public/csv/cities.csv')
      .pipe(csv())
      .on('data', (data) => results.push({
        id: parseInt(data.id),
        provinceId: parseInt(data.provinceId),
        name: data.name
      }))
      .on('end', () => {
        fs.writeFileSync('public/data/cities.json', JSON.stringify(results, null, 2));
        console.log(`✅ Converted ${results.length} cities`);
        resolve();
      });
  });
}

// Convert districts
function convertDistricts() {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream('public/csv/districts.csv')
      .pipe(csv())
      .on('data', (data) => results.push({
        id: parseInt(data.id),
        cityId: parseInt(data.cityId),
        name: data.name
      }))
      .on('end', () => {
        fs.writeFileSync('public/data/districts.json', JSON.stringify(results, null, 2));
        console.log(`✅ Converted ${results.length} districts`);
        resolve();
      });
  });
}

// Convert villages
function convertVillages() {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream('public/csv/villages.csv')
      .pipe(csv())
      .on('data', (data) => results.push({
        id: parseInt(data.id),
        districtId: parseInt(data.districtId),
        name: data.name
      }))
      .on('end', () => {
        fs.writeFileSync('public/data/villages.json', JSON.stringify(results, null, 2));
        console.log(`✅ Converted ${results.length} villages`);
        resolve();
      });
  });
}

// Run all conversions
async function convertAll() {
  console.log('🚀 Starting CSV to JSON conversion...');
  
  try {
    await convertProvinces();
    await convertCities();
    await convertDistricts();
    await convertVillages();
    
    console.log('🎉 All files converted successfully!');
    console.log('📁 JSON files saved to: public/data/');
  } catch (error) {
    console.error('❌ Error during conversion:', error);
  }
}

convertAll();