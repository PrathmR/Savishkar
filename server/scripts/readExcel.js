import ExcelJS from 'exceljs';

async function readExcel() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('D:\\code3\\Savishkar_events_detail.xlsx');
    
    const worksheet = workbook.worksheets[0];
    console.log('Sheet name:', worksheet.name);
    console.log('Row count:', worksheet.rowCount);
    
    // Get headers
    const headers = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers.push(cell.value);
    });
    
    console.log('\nColumn headers:', headers);
    
    // Read data rows
    const data = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        rowData[header] = cell.value;
      });
      data.push(rowData);
    });
    
    console.log(`\nFound ${data.length} data rows`);
    console.log('\nFirst 3 rows:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
    
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

readExcel();
