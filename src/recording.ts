import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

function ensureOutputDir(outputDir: string) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "_" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

type RecorderOptions = {
  sampleRate: number;
  outputDir: string;
};

export function createRecorder({ sampleRate, outputDir }: RecorderOptions) {
  let currentProcess: ChildProcess | null = null;
  let lastRecordingPath: string | null = null;

  const isRecording = () => Boolean(currentProcess);

  const start = ({
    onStart,
    onStop,
  }: {
    onStart?: (path: string) => void;
    onStop?: (path: string | null) => void;
  } = {}) => {
    if (currentProcess) {
      console.log("Recording already in progress.");
      return;
    }

    ensureOutputDir(outputDir);
    const filename = `recording_${timestamp()}.wav`;
    const outPath = path.join(outputDir, filename);
    lastRecordingPath = outPath;

    const args = ["-q", "-d", "-r", String(sampleRate), "-c", "1", outPath];

    console.log(`START -> recording to ${outPath}`);
    currentProcess = spawn("sox", args, { stdio: "ignore" });

    currentProcess.on("spawn", () => {
      if (onStart) onStart(outPath);
    });

    currentProcess.on("exit", (code, signal) => {
      if (signal) {
        console.log(`sox exited with signal ${signal}`);
      } else {
        console.log(`sox exited with code ${code}`);
      }
      currentProcess = null;
      if (onStop) onStop(lastRecordingPath);
    });
  };

  const stop = () => {
    if (!currentProcess) {
      console.log("No active recording to stop.");
      return;
    }

    console.log("STOP -> stopping recording");
    currentProcess.kill("SIGINT");
  };

  return { start, stop, isRecording };
}
