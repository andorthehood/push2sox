import { AssemblyAI } from "assemblyai";

type TranscriberOptions = {
  apiKey: string | undefined;
};

export function createTranscriber({ apiKey }: TranscriberOptions) {
  let transcribing = false;

  const transcribe = async (filePath: string) => {
    if (transcribing) {
      console.log("Transcription already in progress.");
      return;
    }

    if (!apiKey) {
      console.log("ASSEMBLYAI_API_KEY not set; skipping transcription.");
      return;
    }

    transcribing = true;
    try {
      const client = new AssemblyAI({ apiKey });
      const params = {
        audio: filePath,
        speech_models: ["universal"],
      };

      console.log(`Transcribing ${filePath}...`);
      const transcript = await client.transcripts.transcribe(params);

      if (transcript && transcript.text) {
        console.log(`Transcript: ${transcript.text}`);
      } else {
        console.log("Transcript empty.");
      }
    } finally {
      transcribing = false;
    }
  };

  const isTranscribing = () => transcribing;

  return { transcribe, isTranscribing };
}
