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

