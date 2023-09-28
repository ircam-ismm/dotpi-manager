import { exec } from 'node:child_process';
import fs from 'node:fs';

const execProcesses = new Set();

export function execCommand(rpi) {
  rpi.onUpdate(async updates => {
    if ('execTrigger' in updates) {
      const home = rpi.get('home');
      const uid = rpi.get('uid');
      const cmd = rpi.get('execCmd');
      // allow using tilde in exec paths
      const cwd = rpi.get('execCwd').replace(/^~/, home);
      const execInfos = { cmd, cwd };

      // check that cwd does exsits
      if (!fs.existsSync(cwd)) {
        const log = { cmd, cwd, log: `${cwd}: No such file or directory` };
        rpi.set({ stderr: log });
        return;
      }

      const childProcess = exec(cmd, { cwd, uid }, (err, stdout, stderr) => {
        if (err) {
          rpi.set({ stderr: err.message });
        }

        if (stdout) {
          const log = { cmd, cwd, msg: stdout };
          rpi.set({ stdout: log });
        }

        if (stderr) {
          const log = { cmd, cwd, msg: stderr };
          rpi.set({ stderr: log });
        }

        execProcesses.delete(execInfos);
        rpi.set({ execProcesses: Array.from(execProcesses) });
      });

      execInfos.pid = childProcess.pid;
      execProcesses.add(execInfos);
      rpi.set({ execProcesses: Array.from(execProcesses) });
    }

    // is this something we need?
    // if ('execKill' in updates) {
    //   // kill
    // }
  });
}
