import { useCallback, useEffect, useRef, useState } from "react";

type UseAudioReturnType = {
  playNewAudio: (audioBuffer: ArrayBuffer) => Promise<void>;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  isPlaying: boolean;
  hasAudio: boolean;
};

export const useAudio = (
  onAudioEnded?: () => Promise<ArrayBuffer>
): UseAudioReturnType => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  useEffect(() => {
    const audioCtx = new AudioContext();
    setAudioContext(audioCtx);
    return () => {
      audioCtx
        .close()
        .catch((error) =>
          console.error("Failed to close audio context:", error)
        );
    };
  }, []);

  const handleAudioEnded = useCallback(async () => {
    if (pauseTimeRef.current) {
      return;
    }
    if (onAudioEnded) {
      const nextBuffer = onAudioEnded();
      if (nextBuffer) {
        if (!audioContext) return;
        const buffer = await audioContext.decodeAudioData(await nextBuffer);
        if (!buffer) {
          console.error("Failed to decode audio data");
          return;
        }
        audioBufferRef.current = buffer;
        const src = audioContext.createBufferSource();
        src.buffer = buffer;
        src.connect(audioContext.destination);
        audioSourceRef.current = src;
        src.addEventListener("ended", handleAudioEnded);

        startTimeRef.current =
          audioContext.currentTime - (pauseTimeRef.current || 0);
        src.start(0, pauseTimeRef.current || 0);
        setIsPlaying(true);
        return;
      }
    }

    setIsPlaying(false);
    pauseTimeRef.current = 0;
    audioBufferRef.current = null;
  }, [audioContext, onAudioEnded]);

  const stopAudio = (pause: boolean = false) => {
    if (!audioSourceRef.current) {
      return;
    }

    audioSourceRef.current.removeEventListener("ended", handleAudioEnded);
    audioSourceRef.current.stop();
    audioSourceRef.current = null;
    setIsPlaying(false);

    if (pause) {
      pauseTimeRef.current = audioContext
        ? audioContext.currentTime - startTimeRef.current
        : 0;
    } else {
      pauseTimeRef.current = 0;
      audioBufferRef.current = null;
    }
  };

  const setupAudioSource = (buffer: AudioBuffer) => {
    if (!audioContext) return null;

    const src = audioContext.createBufferSource();
    src.buffer = buffer;
    src.connect(audioContext.destination);
    audioSourceRef.current = src;
    src.addEventListener("ended", handleAudioEnded);
    return src;
  };

  const playNewAudio = async (audioBuffer: ArrayBuffer): Promise<void> => {
    if (!audioContext) return;

    stopAudio();

    const buffer = await audioContext.decodeAudioData(audioBuffer);
    audioBufferRef.current = buffer;

    const src = setupAudioSource(buffer);
    if (!src) {
      console.error("Failed to setup audio source");
      return;
    }

    startTimeRef.current =
      audioContext.currentTime - (pauseTimeRef.current || 0);
    src.start(0, pauseTimeRef.current || 0);
    pauseTimeRef.current = 0;
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (!audioContext) return;

    stopAudio(true);
  };

  const resumeAudio = () => {
    if (!audioContext || !audioBufferRef.current) return;

    const src = setupAudioSource(audioBufferRef.current);
    if (!src) {
      console.error("Failed to setup audio source");
      return;
    }

    startTimeRef.current = audioContext.currentTime - pauseTimeRef.current;
    src.start(0, pauseTimeRef.current);
    pauseTimeRef.current = 0;
    setIsPlaying(true);
  };

  return {
    playNewAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    isPlaying,
    hasAudio: !!audioBufferRef.current,
  };
};
