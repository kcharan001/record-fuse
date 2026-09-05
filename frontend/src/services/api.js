import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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

export const fetchRecords = async (scenarioId = 'DEMO') => {
  try {
    const response = await apiClient.get('/api/records', {
      params: { scenario_id: scenarioId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch patient records:', error);
    throw error;
  }
};

export const executeReconciliation = async (scenarioId = 'DEMO', forceFallback = false) => {
  try {
    const response = await apiClient.post('/api/reconcile', null, {
      params: { scenario_id: scenarioId, force_ai_fallback: forceFallback }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to execute reconciliation engine:', error);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    const response = await apiClient.post('/api/records/seed');
    return response.data;
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
};

export const fetchAIAnalysis = async (scenarioId = 'DEMO', forceFallback = false) => {
  try {
    const response = await apiClient.post('/api/ai/analyze', null, {
      params: { scenario_id: scenarioId, force_fallback: forceFallback }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch AI analysis:', error);
    throw error;
  }
};

export const createOrUpdatePatient = async (patientData) => {
  try {
    const response = await apiClient.post('/api/records/patient', patientData);
    return response.data;
  } catch (error) {
    console.error('Failed to create/update patient:', error);
    throw error;
  }
};

export const addClinicalEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/api/records/event', eventData);
    return response.data;
  } catch (error) {
    console.error('Failed to add clinical event:', error);
    throw error;
  }
};

export const fetchMasterDatabase = async () => {
  try {
    const response = await apiClient.get('/api/records/database');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch master database directory:', error);
    throw error;
  }
};

export const clearMasterDatabase = async () => {
  try {
    const response = await apiClient.delete('/api/records/database/clear');
    return response.data;
  } catch (error) {
    console.error('Failed to clear master database:', error);
    throw error;
  }
};

export const fetchPairRecords = async (patientAId, patientBId) => {
  try {
    const response = await apiClient.get('/api/records', {
      params: { patient_a_id: patientAId, patient_b_id: patientBId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pair records:', error);
    throw error;
  }
};

export const executePairReconciliation = async (patientAId, patientBId) => {
  try {
    const response = await apiClient.post('/api/reconcile', null, {
      params: { patient_a_id: patientAId, patient_b_id: patientBId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to execute pair reconciliation:', error);
    throw error;
  }
};

