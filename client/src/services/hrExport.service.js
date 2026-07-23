import api from './api';

export async function downloadExportFile(type, format = 'excel') {
  // Endpoints: /hr/export/shortlist, /hr/export/evaluation-reports, /hr/export/hiring-stats
  const endpointMap = {
    shortlist:          '/hr/export/shortlist',
    evaluation_reports: '/hr/export/evaluation-reports',
    hiring_stats:       '/hr/export/hiring-stats'
  };

  const url = `${endpointMap[type] || endpointMap.shortlist}?format=${format}`;

  const response = await api.get(url, {
    responseType: 'blob'
  });

  const ext = format === 'csv' ? 'csv' : 'xlsx';
  const filename = `${type}_export_${Date.now()}.${ext}`;

  // Trigger browser download
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
