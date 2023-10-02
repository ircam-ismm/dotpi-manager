import { exec } from 'node:child_process';
import fs from 'node:fs';

const execProcesses = new Set();

export function execCommand(dotpi) {
  dotpi.onUpdate(async updates => {
    if ('execTrigger' in updates) {
      const home = dotpi.get('home');
      const uid = dotpi.get('uid');
      const cmd = dotpi.get('execCmd');
      // allow using tilde in exec paths
      const cwd = dotpi.get('execCwd').replace(/^~/, home);
      const execInfos = { cmd, cwd };

      // check that cwd does exsits
      if (!fs.existsSync(cwd)) {
        const log = { cmd, cwd, log: `${cwd}: No such file or directory` };
        dotpi.set({ stderr: log });
        return;
      }

      const childProcess = exec(cmd, { cwd, uid }, (err, stdout, stderr) => {
        if (err) {
          dotpi.set({ stderr: err.message });
        }

        if (stdout) {
          const log = { cmd, cwd, msg: stdout };
          dotpi.set({ stdout: log });
        }

        if (stderr) {
          const log = { cmd, cwd, msg: stderr };
          dotpi.set({ stderr: log });
        }

        execProcesses.delete(execInfos);
        dotpi.set({ execProcesses: Array.from(execProcesses) });
      });

       // store pid so that we can kill a stuck process (todo)
      execInfos.pid = childProcess.pid;
      execProcesses.add(execInfos);

      dotpi.set({ execProcesses: Array.from(execProcesses) });
    }

    // is this something we need?
    if ('execKill' in updates) {}
  });
}
