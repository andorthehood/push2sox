import "dotenv/config";

import { createTranscriber } from "./transcribe.ts";
import { createRecorder } from "./recording.ts";
import { createSerialController } from "./serial.ts";
import { createAction } from "./action.ts";
import os from "os";

const PORT_PATH = process.env.SERIAL_PORT || "/dev/cu.usbmodem2102";
const BAUD_RATE = Number(process.env.BAUD_RATE || 9600);
const SAMPLE_RATE = Number(process.env.SAMPLE_RATE || 44100);
const TRANSCRIPT_COMMAND_TEMPLATE = process.env.TRANSCRIPT_COMMAND_TEMPLATE;

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const transcriber = createTranscriber({ apiKey: ASSEMBLYAI_API_KEY });
const action = createAction({
  commandTemplate: TRANSCRIPT_COMMAND_TEMPLATE,
});
const recorder = createRecorder({
  sampleRate: SAMPLE_RATE,
  outputDir: os.tmpdir(),
});

function onRecordingStart() {
  serial.send("ON");
}

function onRecordingStop(filePath: string | null) {
  serial.send("OFF");
  if (filePath) {
    handleRecordingStop(filePath);
  }
}

async function handleRecordingStop(filePath: string) {
  try {
    const text = await transcriber.transcribe(filePath);
    if (text) {
      const ok = await action(text);
      if (ok) {
        await recorder.cleanup(filePath);
      }
    }
  } catch (err) {
    console.error("Transcription error:", err instanceof Error ? err.message : err);
  }
}

const serial = createSerialController({
  portPath: PORT_PATH,
  baudRate: BAUD_RATE,
  onStart: () => {
    recorder.start({ onStart: onRecordingStart, onStop: onRecordingStop });
  },
  onStop: () => {
    recorder.stop();
  },
});

process.on("SIGINT", () => {
  if (recorder.isRecording()) {
    recorder.stop();
  }
  serial.close();
  process.exit(0);
});
