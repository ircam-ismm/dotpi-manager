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
      const pwd = dotpi.get('execPwd').replace(/^~/, home);
      const execInfos = { cmd, pwd };

      // check that pwd does exsits
      if (!fs.existsSync(pwd)) {
        const log = { cmd, pwd, msg: `${pwd}: No such file or directory\n` };
        dotpi.set({ stderr: log });
        return;
      }

      const childProcess = exec(cmd, { pwd, uid }, (err, stdout, stderr) => {
        if (err) {
          dotpi.set({ stderr: err.message });
        }

        if (stdout) {
          const log = { cmd, pwd, msg: stdout };
          dotpi.set({ stdout: log });
        }

        if (stderr) {
          const log = { cmd, pwd, msg: stderr };
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
