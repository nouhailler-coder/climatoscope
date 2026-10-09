/**
 * ClimatOSCOPE — Scientific Export Utility
 * Exports datasets or synchronized series as standard CSV or JSON.
 */

import { DatasetMetadata, TimeSeriesPoint } from '../types/dataset';

export function exportDatasetToCSV(metadata: DatasetMetadata, data: TimeSeriesPoint[]) {
  const headerLines = [
    `# ClimatOSCOPE Data Export`,
    `# Dataset: ${metadata.name}`,
    `# Organization: ${metadata.organization}`,
    `# Source URL: ${metadata.sourceUrl}`,
    `# Variable: ${metadata.variable} (${metadata.variableSymbol})`,
    `# Unit: ${metadata.unit} (${metadata.unitSymbol})`,
    `# Export Date: ${new Date().toISOString()}`,
    `timestamp,value,qualityFlag`,
  ];

  const dataLines = data.map((d) => `${d.timestamp},${d.value},${d.qualityFlag || 'valid'}`);
  const csvContent = [...headerLines, ...dataLines].join('\n');

  downloadBlob(csvContent, `${metadata.id}_export.csv`, 'text/csv;charset=utf-8;');
}

export function exportDatasetToJSON(metadata: DatasetMetadata, data: TimeSeriesPoint[]) {
  const payload = {
    metadata,
    exportedAt: new Date().toISOString(),
    pointsCount: data.length,
    data,
  };

  const jsonContent = JSON.stringify(payload, null, 2);
  downloadBlob(jsonContent, `${metadata.id}_export.json`, 'application/json');
}

export function exportMultiSeriesToCSV(
  seriesList: Array<{ metadata: DatasetMetadata; data: TimeSeriesPoint[] }>,
  filename: string = 'climatoscope_comparison.csv'
) {
  // Collect all unique timestamps sorted
  const timestamps = Array.from(
    new Set(seriesList.flatMap((s) => s.data.map((p) => p.timestamp.substring(0, 4))))
  ).sort();

  const headers = ['year', ...seriesList.map((s) => `"${s.metadata.shortName} (${s.metadata.unitSymbol})"`)]
    .join(',');

  const rows = timestamps.map((year) => {
    const vals = seriesList.map((s) => {
      const match = s.data.find((p) => p.timestamp.substring(0, 4) === year);
      return match !== undefined ? match.value : '';
    });
    return [year, ...vals].join(',');
  });

  const content = [
    '# ClimatOSCOPE Synchronized Multi-Series Export',
    `# Export Date: ${new Date().toISOString()}`,
    headers,
    ...rows,
  ].join('\n');

  downloadBlob(content, filename, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
