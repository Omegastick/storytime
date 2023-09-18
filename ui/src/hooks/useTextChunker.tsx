import { useState } from "react";

type UseTextChunkerReturnType = {
  setText: (text: string) => void;
  chunks: string[];
};

function chunkText(text: string, sentencesPerChunk: number): string[] {
  const sentenceEnd = /[.!?]/;
  const chunks: string[] = [];
  let chunk = "";
  let sentenceCount = 0;

  const words = text.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const addSpace = i !== words.length - 1 ? " " : "";

    chunk += word + addSpace;

    if (sentenceEnd.test(word)) {
      sentenceCount++;

      if (sentenceCount >= sentencesPerChunk) {
        chunks.push(chunk);
        chunk = "";
        sentenceCount = 0;
      }
    }
  }

  if (chunk !== "") {
    chunks.push(chunk);
  }

  return chunks;
}

export const useTextChunker = (): UseTextChunkerReturnType => {
  const [chunks, setChunks] = useState<string[]>([]);

  const handleTextChange = (text: string) => {
    setChunks(chunkText(text, 5));
  };

  return {
    setText: handleTextChange,
    chunks,
  };
};
