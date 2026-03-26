import fs from 'fs';
import { openai } from '../../lib/openai';

export async function transcribeVideo(audioPath: string): Promise<{ text: string; segments: Array<{ start: number; end: number; text: string }> }> {
  const audioStream = fs.createReadStream(audioPath);
  const transcription = await openai.audio.transcriptions.create({
    file: audioStream,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });
  return {
    text: transcription.text,
    segments: (transcription.segments ?? []).map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text,
    })),
  };
}
