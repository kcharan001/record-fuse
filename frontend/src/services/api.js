import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export const fetchHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch backend health status:', error);
    throw error;
  }
};

export const fetchRecords = async () => {
  try {
    const response = await apiClient.get('/api/records');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch patient records:', error);
    throw error;
  }
};

export const executeReconciliation = async (patientAId = 'REC-A', patientBId = 'REC-B') => {
  try {
    const response = await apiClient.post('/api/reconcile', null, {
      params: { patient_a_id: patientAId, patient_b_id: patientBId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to execute reconciliation engine:', error);
    throw error;
  }
};
