/* Raw spice article references shared by the ingredient reviews. */
(function (root) {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));

  function validRows(rows) {
    const expected = [
      ['Lead', 10, 'mg/kg', 20, 'On dry matter basis.'],
      ['Arsenic', 5, 'mg/kg', 24, ''],
      ['Total aflatoxins', 30, 'µg/kg', 29, ''],
      ['Aflatoxin B1', 15, 'µg/kg', 29, '']
    ];
    return Array.isArray(rows) && rows.length === expected.length && rows.every((row, i) => {
      if (!row || typeof row.article !== 'string') return false;
      const [name, maximum, unit, page, basis] = expected[i];
      const article = ['dried herbs and spices', 'solid pectin all grades, spices', 'Spices/Spice Mix', 'Spices/Spice Mix'][i];
      return row.name === name && row.maximum === maximum && row.unit === unit &&
        row.pdfPage === page && row.basis === basis && row.article.includes(article);
    });
  }

  function table(rows, gazette, tableClass, rowClass) {
    const body = rows.map(row => '<tr class="' + escape(rowClass) + '"><th scope="row">' + escape(row.name) +
      '</th><td>Maximum ' + escape(row.maximum) + ' ' + escape(row.unit) + (row.basis ? ' · dry matter' : '') +
      '<br><a class="source-ref" href="' + escape(gazette.url + '#page=' + row.pdfPage) +
      '" target="_blank" rel="noopener noreferrer">Gazette p. ' + escape(row.pdfPage) + ' ↗</a></td></tr>').join('');
    return '<table class="methodtable ' + escape(tableClass) + '"><caption>FSSAI contaminant references for the raw spice</caption>' +
      '<thead><tr><th scope="col">Analyte</th><th scope="col">Spice article maximum</th></tr></thead><tbody>' + body + '</tbody></table>';
  }

  const api = Object.freeze({validRows, table});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVSpiceContaminants = api;
})(typeof globalThis === 'object' ? globalThis : this);
