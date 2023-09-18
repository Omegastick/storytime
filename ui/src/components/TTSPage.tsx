import { Box, IconButton, Textarea } from "@chakra-ui/react";
import React, { useState } from "react";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { postToTTS } from "../api";
import { useAudio } from "../hooks/useAudio";

type TTSPageProps = {};

const TTSPage: React.FC<TTSPageProps> = () => {
  const [text, setText] = useState<string>("");
  const {
    playNewAudio: playAudio,
    resumeAudio,
    pauseAudio,
    isPlaying,
    hasAudio,
  } = useAudio();

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
        value={text}
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
