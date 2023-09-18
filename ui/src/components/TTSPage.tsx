import { Box, IconButton, Textarea } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { useAudio } from "../hooks/useAudio";
import { useAudioBufferQueue } from "../hooks/useAudioBufferQueue";
import { useTextChunker } from "../hooks/useTextChunker";

type TTSPageProps = {};

const TTSPage: React.FC<TTSPageProps> = () => {
  const { setText, chunks } = useTextChunker();
  const { nextAudioBuffer } = useAudioBufferQueue(chunks);

  const onAudioEnded = useCallback(async () => {
    return nextAudioBuffer();
  }, [nextAudioBuffer]);

  const {
    playNewAudio: playAudio,
    resumeAudio,
    pauseAudio,
    isPlaying,
    hasAudio,
  } = useAudio(onAudioEnded);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
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

    await playAudio(await nextAudioBuffer());
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
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
