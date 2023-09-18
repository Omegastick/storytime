import axios from 'axios';

export const postToTTS = async (text: string): Promise<ArrayBuffer> => {
  try {
    const response = await axios.post('http://localhost:8000/tts', {
      text,
    }, {
      responseType: 'arraybuffer',
    });
    return response.data;
  } catch (error) {
    console.error('Error posting text to TTS:', error);
    throw error;
  }
};
