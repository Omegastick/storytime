import { TriangleUpIcon } from '@chakra-ui/icons';
import { Box, IconButton, Textarea } from '@chakra-ui/react';
import React, { useState } from 'react';
import { postToTTS } from '../api';

type TTSPageProps = {
};

const TTSPage: React.FC<TTSPageProps> = () => {
  const [text, setText] = useState<string>('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handlePlayClick = async () => {
    try {
      const audioBuffer: ArrayBuffer = await postToTTS(text);

      const audioContext = new AudioContext();
      audioContext.decodeAudioData(audioBuffer, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
      });

    } catch (error) {
      console.error('Failed to post to TTS:', error);
    }
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
        icon={<TriangleUpIcon transform="rotate(90deg)" />}
        size="lg"
        alignSelf="center"
        mt={4}
        onClick={handlePlayClick}
      />
    </Box>
  );
};

export default TTSPage;
