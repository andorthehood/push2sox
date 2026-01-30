import { spawn, type ChildProcess } from "child_process";

function shellEscape(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

type ActionOptions = {
  commandTemplate: string;
};

export function createAction({ commandTemplate }: ActionOptions) {
  console.log(`Action template: ${commandTemplate}`);
  let currentChild: ChildProcess | null = null;
  let cancelToken = 0;

  const run = async (text: string) => {
    console.log("Running action...");
    const cmd = commandTemplate.replaceAll("{text}", shellEscape(text));
    const token = ++cancelToken;

    return await new Promise<boolean>((resolve) => {
      currentChild = spawn(cmd, { shell: true, stdio: "inherit" });
      currentChild.on("error", (err) => {
        console.error("Action error:", err.message);
        resolve(false);
      });
      currentChild.on("exit", (code) => {
        if (token !== cancelToken) {
          resolve(false);
          return;
        }
        console.log(`Action exited with code ${code}`);
        resolve(code === 0);
      });
    });
  };

  const cancel = () => {
    cancelToken++;
    if (currentChild && !currentChild.killed) {
      currentChild.kill("SIGINT");
    }
    currentChild = null;
  };

  return { run, cancel };
}
