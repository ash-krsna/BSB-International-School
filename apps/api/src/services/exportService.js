const ExcelJS = require("exceljs");

async function toExcelBuffer(title, rows) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  if (rows.length) {
    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      key,
      width: Math.min(Math.max(key.length + 6, 14), 34)
    }));
    worksheet.addRows(rows);
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B625A" }
    };
    worksheet.getRow(1).alignment = { vertical: "middle", wrapText: true };
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "top", wrapText: true };
      });
    });
    worksheet.autoFilter = {
      from: "A1",
      to: `${worksheet.getColumn(worksheet.columnCount).letter}1`
    };
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
