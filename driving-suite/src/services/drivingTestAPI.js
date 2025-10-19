import axios from 'axios';

const api = axios.create({
  baseURL: 'https://py-backend-docker-201964739461.europe-west1.run.app',
});

// --- Session endpoints ---
export const startSession = async (userId) => {
  const response = await api.post('/api/session/start', { user_id: userId });
  return response.data;
};

export const submitAnswer = async (sessionId, answer) => {
  const response = await api.post(`/api/session/${sessionId}/answer`, { answer });
  return response.data;
};

export const getProgress = async (sessionId) => {
  const response = await api.get(`/api/session/${sessionId}/progress`);
  return response.data;
};

// ✅ NEW: End (or delete) session — fully resets the test
export const endSession = async (sessionId) => {
  try {
    // Try POST /end first
    await api.post(`/api/session/${sessionId}/end`);
  } catch {
    // If not supported, fall back to DELETE
    await api.delete(`/api/session/${sessionId}`);
  }
};

// --- Driving analysis endpoint ---
export const analyzeVideos = async (data) => {
  const response = await api.post('/api/analyze-driving', data);
  return response.data;
};
