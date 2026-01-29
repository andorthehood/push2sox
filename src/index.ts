import "dotenv/config";

import { createTranscriber } from "./transcribe.ts";
import { createRecorder } from "./recording.ts";
import { createSerialController } from "./serial.ts";

const PORT_PATH = process.env.SERIAL_PORT || "/dev/cu.usbmodem2102";
const BAUD_RATE = Number(process.env.BAUD_RATE || 9600);
const SAMPLE_RATE = Number(process.env.SAMPLE_RATE || 44100);
const OUTPUT_DIR = process.env.OUTPUT_DIR || "recordings";

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const transcriber = createTranscriber({ apiKey: ASSEMBLYAI_API_KEY });
const recorder = createRecorder({
  sampleRate: SAMPLE_RATE,
  outputDir: OUTPUT_DIR,
});

function onRecordingStart() {
  serial.send("ON");
}

function onRecordingStop(filePath: string | null) {
  serial.send("OFF");
  if (filePath) {
    transcriber.transcribe(filePath).catch((err) => {
      console.error("Transcription error:", err.message);
    });
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
