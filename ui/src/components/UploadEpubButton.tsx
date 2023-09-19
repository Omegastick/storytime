import ePub, { Book } from "epubjs";
import Section from "epubjs/types/section";
import React, { ChangeEvent, FC } from "react";

interface UploadEpubButtonProps {
  onTextExtracted: (text: string) => void;
}

const UploadEpubButton: FC<UploadEpubButtonProps> = ({ onTextExtracted }) => {
  const readEpubFile = async (file: File) => {
    const book: Book = ePub();
    const reader = new FileReader();
    const serializer = new XMLSerializer();
    let accumulatedText: string[] = [];

    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        await book.open(arrayBuffer);
      }
    };

    const sectionPromises: Promise<{ text: string; section: Section }>[] = [];

    reader.readAsArrayBuffer(file);

    await book.ready;
    book.spine.each(async (item: Section) => {
      const promise = new Promise<{ text: string; section: Section }>(
        async (resolve) => {
          const doc = await item.load(book.load.bind(book));
          const serializedText = serializer.serializeToString(doc);
          const plainText = serializedText.replace(/<\/?[^>]+(>|$)/g, "");
          resolve({ text: plainText, section: item });
        }
      );
      sectionPromises.push(promise);
    });

    const sections = await Promise.all(sectionPromises);
    sections.sort((a, b) => {
      if (a.section.index < b.section.index) {
        return -1;
      }
      if (a.section.index > b.section.index) {
        return 1;
      }
      return 0;
    });

    for (const section of sections) {
      accumulatedText.push(section.text);
    }

    onTextExtracted(accumulatedText.join(" "));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readEpubFile(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".epub" onChange={handleFileChange} />
    </div>
  );
};

export default UploadEpubButton;
