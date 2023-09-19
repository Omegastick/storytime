import { Box, IconButton, Input, Textarea } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import useLocalStorage from "use-local-storage";
import { useAudio } from "../hooks/useAudio";
import { useAudioBufferQueue } from "../hooks/useAudioBufferQueue";
import { useTextChunker } from "../hooks/useTextChunker";
import UploadEpubButton from "./UploadEpubButton";

type TTSPageProps = {};

const TTSPage: React.FC<TTSPageProps> = () => {
  const { setText, chunks } = useTextChunker();
  const { nextAudioBuffer, clearQueue } = useAudioBufferQueue(chunks);
  const [apiUrl, setApiUrl] = useLocalStorage("apiUrl", "localhost:8000");

  const onAudioEnded = useCallback(async () => {
    return nextAudioBuffer();
  }, [nextAudioBuffer]);

  const {
    playNewAudio,
    resumeAudio,
    pauseAudio,
    stopAudio,
    isPlaying,
    hasAudio,
  } = useAudio(onAudioEnded);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    stopAudio();
    clearQueue();
  };

  const handlePlayClick = async () => {
    if (isPlaying) {
      pauseAudio();
      return;
    }
    if (!isPlaying && hasAudio) {
      resumeAudio();
      return;
    }

    await playNewAudio(await nextAudioBuffer());
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
      <UploadEpubButton onTextExtracted={setText} />
      <Textarea
        flexGrow={1}
        placeholder="Write something..."
        value={chunks.join("")}
        onChange={handleTextChange}
      />
      <IconButton
        aria-label="Play"
        icon={isPlaying ? <BsFillPauseFill /> : <BsFillPlayFill />}
        size="lg"
        alignSelf="center"
        mt={4}
        onClick={handlePlayClick}
      />
    </Box>
  );
};

export default TTSPage;
