import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const askQuestion = async (query) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ask`, { query });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to get response. Please try again."
    );
  }
};

export const submitFeedback = async (queryId, helpful) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/feedback`, {
      queryId,
      helpful,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/ask/stats`);
    return response.data;
  } catch (error) {
    console.error("Failed to get stats:", error);
    throw error;
  }
};
