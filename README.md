# push2sox

Listen for serial `DOWN`/`UP` commands to control a `sox` recording, then send the WAV to AssemblyAI and run a configurable action on the transcript.

## Requirements
- Node.js with native TypeScript support
- `sox` installed and available on `PATH`
- A serial device that sends `DOWN` and `UP`

## Setup
```bash
npm install
```

Create a `.env` file based on `.env.example`:
```
ASSEMBLYAI_API_KEY=your_key_here
```

## Run
```bash
npm start
```

## Environment variables
- `SERIAL_PORT` (default `/dev/cu.usbmodem2102`)
- `BAUD_RATE` (default `9600`)
- `SAMPLE_RATE` (default `44100`)
- `ASSEMBLYAI_API_KEY` (required for transcription)
- `TRANSCRIPT_COMMAND_TEMPLATE` (optional; defaults to logging to console)

## Make targets
```bash
make free-serial           # kill any process holding the serial port
make start                 # run the app
```

## Action
If `TRANSCRIPT_COMMAND_TEMPLATE` is set, it runs as a shell command with this placeholder:
- `{text}` transcript text (shell-escaped)

Examples:
```bash
TRANSCRIPT_COMMAND_TEMPLATE="echo {text}"
TRANSCRIPT_COMMAND_TEMPLATE="my-agent --prompt {text}"
TRANSCRIPT_COMMAND_TEMPLATE="python3 ./save_transcript.py {text}"
```

## Notes
- The app sends `ON` when recording starts and `OFF` when it ends.
- If the API key is not set, transcription is skipped.
