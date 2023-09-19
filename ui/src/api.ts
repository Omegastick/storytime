import axios from "axios";

export const postToTTS = async (text: string): Promise<ArrayBuffer> => {
  const rawApiUrl = localStorage.getItem("apiUrl");
  if (!rawApiUrl) {
    throw new Error("No API URL set");
  }
  const apiUrl = JSON.parse(rawApiUrl);
  try {
    const response = await axios.post(
      `http://${apiUrl}/tts`,
      {
        text: text,
      },
      {
        responseType: "arraybuffer",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting text to TTS:", error);
    throw error;
  }
};
