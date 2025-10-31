import fs from 'fs';
import csv from 'csv-parser';

const testCSV = async () => {
  console.log('Starting CSV test...');
  
  const csvFilePath = 'D:\\code3\\Savishkar detail final submission form (Responses).csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('CSV file not found!');
    return;
  }
  
  console.log('CSV file found, reading...');
  
  const events = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      if (row['Event name'] && !row['Event name'].toLowerCase().includes('event name')) {
        events.push({
          name: row['Event name'],
          department: row['Event department '],
          category: row['Event Category']
        });
      }
    })
    .on('end', () => {
      console.log(`\nTotal events found: ${events.length}`);
      console.log('\nFirst 5 events:');
      events.slice(0, 5).forEach((event, index) => {
        console.log(`${index + 1}. ${event.name} (${event.department} - ${event.category})`);
      });
    })
    .on('error', (error) => {
      console.error('Error reading CSV:', error);
    });
};

testCSV();
