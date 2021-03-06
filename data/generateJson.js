const excel = require('exceljs');
const fs = require('fs/promises');

const workbook = new excel.Workbook();

const getValue = val => {
	if (typeof val === 'object') {
		return val.richText[0].text;
	}
	return val;
};

const run = async () => {
	await workbook.xlsx.readFile('./courses.xlsx');

	const sheet = workbook.worksheets[0];

	const table = sheet.getSheetValues().map(row => row.map(getValue));
	const lastRow = sheet.rowCount;

	const data = [];

	for (let row = 4; row <= lastRow; row++) {
		data.push({
			code: table[row][2],
			name: table[row][3],
			credits: table[row][4],
			lecture: table[row][5],
			link: table[row][7],
			instructor: table[row][8],
		});
	}

	await fs.writeFile('../src/data/courses.json', JSON.stringify(data, null, 2));
	console.log('Written to data/courses.json');
};

run();
