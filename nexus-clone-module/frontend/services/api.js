const API_BASE_URL = 'http://10.0.2.2:8080'; // Android emulator localhost alias

export const startCloneJob = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}/clone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, options })
  });
  if (!response.ok) {
    throw new Error('Gagal memulai proses kloning');
  }
  return response.json();
};

export const getJobStatus = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/status/${projectId}`);
  if (!response.ok) {
    throw new Error('Gagal mengambil status pekerjaan');
  }
  return response.json();
};

export const getJobResult = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/result/${projectId}`);
  if (!response.ok) {
    throw new Error('Gagal mengambil hasil pekerjaan');
  }
  return response.json();
};

export const getPreviewUrl = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/preview/${projectId}`);
  if (!response.ok) {
    throw new Error('Gagal mengambil tautan preview');
  }
  return response.json();
};

export const getDownloadUrl = (projectId) => {
  return `${API_BASE_URL}/download/${projectId}`;
};
