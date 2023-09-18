import { Box, IconButton, Textarea } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { postToTTS } from "../api";
import { useAudio } from "../hooks/useAudio";
import { useTextChunker } from "../hooks/useTextChunker";

type TTSPageProps = {};

const TTSPage: React.FC<TTSPageProps> = () => {
  const [currentChunk, setCurrentChunk] = useState<number>(0);
  const { setText, chunks } = useTextChunker();

  const onAudioEnded = useCallback(async () => {
    setCurrentChunk((prevChunk) => prevChunk + 1);
    const text = chunks.at(currentChunk + 1);
    if (!text) {
      throw new Error("No text to play");
    }
    let audioBuffer = await postToTTS(text);
    return audioBuffer;
  }, [chunks, currentChunk]);

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

    let audioBuffer: ArrayBuffer;
    try {
      const text = chunks.at(currentChunk);
      if (!text) {
        console.error("No text to play");
        return;
      }
      audioBuffer = await postToTTS(text);
    } catch (error) {
      console.error("Failed to post to TTS:", error);
      return;
    }

    await playAudio(audioBuffer);
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
