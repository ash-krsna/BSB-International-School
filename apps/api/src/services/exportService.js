const ExcelJS = require("exceljs");

async function toExcelBuffer(title, rows) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  if (rows.length) {
    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key
    }));
    worksheet.addRows(rows);
  }

  return workbook.xlsx.writeBuffer();
}

function toCsv(rows) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))
  ];

  return lines.join("\n");
}

module.exports = {
  toExcelBuffer,
  toCsv
};
