'use client';

import { useCallback, useState } from 'react';

import { CHUNK_DELAY_MAX, CHUNK_DELAY_MIN, SAMPLE_TEXT } from '../constants';
import type { StreamChunk } from '../types';

export function useStreamSplicing() {
  const [chunks, setChunks] = useState<StreamChunk[]>([]);
  const [assembled, setAssembled] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const assembleChunks = useCallback((chunksArr: StreamChunk[]): string => {
    return chunksArr
      .slice()
      .sort((a, b) => a.sequence - b.sequence)
      .map((c) => c.data)
      .join('');
  }, []);

  const startStream = useCallback(() => {
    setChunks([]);
    setAssembled('');
    setIsStreaming(true);

    // 分割文本
    const chunkSize = 5;
    const textChunks: string[] = [];
    for (let i = 0; i < SAMPLE_TEXT.length; i += chunkSize) {
      textChunks.push(SAMPLE_TEXT.slice(i, i + chunkSize));
    }

    // 乱序发送
    const shuffled = textChunks
      .map((data, sequence) => ({ data, sequence }))
      .sort(() => Math.random() - 0.5);

    let index = 0;
    const sendNext = () => {
      if (index >= shuffled.length) {
        setIsStreaming(false);
        return;
      }
      const { data, sequence } = shuffled[index];
      const chunk: StreamChunk = { id: Date.now() + index, data, sequence, timestamp: Date.now() };

      setChunks((prev) => {
        const next = [...prev, chunk];
        setAssembled(assembleChunks(next));
        return next;
      });

      index++;
      const delay = CHUNK_DELAY_MIN + Math.random() * (CHUNK_DELAY_MAX - CHUNK_DELAY_MIN);
      setTimeout(sendNext, delay);
    };

    sendNext();
  }, [assembleChunks]);

  const reset = useCallback(() => {
    setChunks([]);
    setAssembled('');
    setIsStreaming(false);
  }, []);

  return { chunks, assembled, isStreaming, startStream, reset };
}
