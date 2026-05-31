import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const clearDocuments = async () => {
  const response = await axios.delete(`${API_URL}/clear`);
  return response.data;
};

export const sendChatMessage = async (message, mode, history) => {
  const response = await axios.post(`${API_URL}/chat`, {
    message,
    mode,
    history
  });
  return response.data;
};
