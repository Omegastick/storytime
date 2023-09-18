import { useCallback, useEffect, useRef } from "react";
import { postToTTS } from "../api";

type UseAudioBufferQueueReturnType = {
  currentChunkIndex: number;
  nextAudioBuffer: () => Promise<ArrayBuffer>;
  clearQueue: () => void;
};

export const useAudioBufferQueue = (
  textChunks: string[],
  maxQueueLength: number = 3
): UseAudioBufferQueueReturnType => {
  const queueRef = useRef<ArrayBuffer[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const fetchingAudioRef = useRef<boolean>(false);

  const fetchNextAudioBuffer = useCallback(async () => {
    if (
      fetchingAudioRef.current ||
      currentChunkIndexRef.current >= textChunks.length
    ) {
      console.log("Not fetching audio");
      return;
    }
    fetchingAudioRef.current = true;
    try {
      console.log(`Fetching audio for chunk ${currentChunkIndexRef.current}`);
      const audioBuffer = await postToTTS(
        textChunks[currentChunkIndexRef.current]
      );
      queueRef.current.push(audioBuffer);
    } catch (error) {
      console.error("Failed to post to TTS:", error);
    }
    currentChunkIndexRef.current++;
    fetchingAudioRef.current = false;
  }, [textChunks]);

  useEffect(() => {
    async function fillAudioQueueLoop() {
      while (true) {
        if (queueRef.current.length < maxQueueLength) {
          fetchNextAudioBuffer();
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    fillAudioQueueLoop();
  }, [fetchNextAudioBuffer, maxQueueLength]);

  const nextAudioBuffer = useCallback(async () => {
    while (queueRef.current.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("Returning next audio buffer");
    return queueRef.current.shift()!;
  }, []);

  const clearQueue = useCallback(() => {
    queueRef.current = [];
  }, []);

  return {
    currentChunkIndex: currentChunkIndexRef.current,
    nextAudioBuffer,
    clearQueue,
  };
};
