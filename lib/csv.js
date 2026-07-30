/**
 * CSV export.
 *
 * Values are quoted and inner quotes doubled per RFC 4180, and any cell that
 * begins with a formula character is prefixed with a quote — a SKU or product
 * name starting with `=` would otherwise execute when the file is opened in a
 * spreadsheet.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(value) {
  if (value === null || value === undefined) return '""';

  let str = String(value);
  if (typeof value === 'boolean') str = value ? 'Yes' : 'No';
  if (FORMULA_START.test(str)) str = `'${str}`;

  return `"${str.replace(/"/g, '""')}"`;
}

export function toCSV(rows, columns) {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escapeCell(row[c.key])).join(','))
    .join('\r\n');
  return `${header}\r\n${body}`;
}

export function downloadCSV(csv, filename) {
  // BOM so Excel reads UTF-8 correctly.
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
