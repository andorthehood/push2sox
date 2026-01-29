import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

type SerialCallbacks = {
  portPath: string;
  baudRate: number;
  onStart?: () => void;
  onStop?: () => void;
  onCommand?: (cmd: string) => void;
};

export function createSerialController({
  portPath,
  baudRate,
  onStart,
  onStop,
  onCommand,
}: SerialCallbacks) {
  const port = new SerialPort({
    path: portPath,
    baudRate,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  port.on("open", () => {
    console.log(`Serial open on ${portPath} @ ${baudRate}`);
  });

  port.on("error", (err) => {
    console.error("Serial error:", err.message);
    process.exitCode = 1;
  });

  parser.on("data", (line) => {
    const cmd = String(line).trim().toUpperCase();
    if (!cmd) return;

    if (onCommand) onCommand(cmd);

    if (cmd === "DOWN") {
      if (onStart) onStart();
    } else if (cmd === "UP") {
      if (onStop) onStop();
    } else {
      console.log(`Ignoring command: ${cmd}`);
    }
  });

  const send = (message: string) => {
    if (!port || !port.writable) return;
    port.write(`${message}\n`, (err) => {
      if (err) {
        console.error("Serial write error:", err.message);
      }
    });
  };

  const close = () => {
    if (!port || !port.isOpen) return;
    port.close((err) => {
      if (err) {
        console.error("Serial close error:", err.message);
      }
    });
  };

  return { port, send, close };
}
