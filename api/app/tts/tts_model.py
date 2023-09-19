from abc import ABC, abstractmethod


class TTSModel(ABC):
    @abstractmethod
    async def generate_audio(self, text: str, **kwargs) -> bytes:
        """
        Generate audio from text.

        Returns bytes of a .wav file.
        """
        ...
