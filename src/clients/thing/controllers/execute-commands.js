import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';

import terminate from 'terminate/promise.js';

const spawnedProcesses = new Map();

class LogStack {
  constructor(type, dotpi, cmd, pwd, panelLabel) {
    this.type = type;
    this.dotpi = dotpi;
    this.cmd = cmd;
    this.pwd = pwd;
    this.panelLabel = panelLabel;
    this.msg = ``;
    this.timeoutId = null;
  }

  push(msg) {
    clearTimeout(this.timeoutId);
    this.msg += msg;

    this.timeoutId = setTimeout(() => {
      const { cmd, pwd, msg, panelLabel } = this;
      const log = { cmd, pwd, msg, panelLabel };
      this.dotpi.set({ [this.type]: log });
      this.msg = ``;
    }, 500);
  }
}

export function executeCommands(controlPanelCollection, dotpi) {
  const hostname = dotpi.get('hostname');
  const home = dotpi.get('home');
  const uid = dotpi.get('uid');

  controlPanelCollection.onUpdate((controlPanel, updates) => {
    const panelId = controlPanel.get('id');
    const panelLabel = controlPanel.get('label');
    let cmd = controlPanel.get('command');
    // ensure npm install is a bit verbose
    if (cmd === 'npm install') {
      // 2>$1 redirects stderr to stdout
      cmd = `npm install --loglevel info 2>&1`;
    }

    const pwd = controlPanel.get('remotePath').replace(/^~/, home);

    if ('executeCommand' in updates) {
      const { executeCommand } = updates;

      // if there is any process still running, kill it
      if (spawnedProcesses.has(panelId)) {
        try {
          const pid = spawnedProcesses.get(panelId);
          spawnedProcesses.delete(panelId);
          controlPanel.set({ executingCommandListDelete: hostname });

          terminate(pid); // no need to await, this just creates race conditions
        } catch (err) {
          dotpi.set({
            stderr: {
              cmd,
              pwd,
              msg:`Cannot terminate process (${pid}): ${err.message}\n`,
              panelLabel,
            },
          });
        }
      }

      if (executeCommand) {
        // if in filter list, do nothing
        if (controlPanel.get('filteredList').indexOf(hostname) !== -1) {
          return;
        }

        if (!fs.existsSync(pwd)) {
          dotpi.set({
            stderr: {
              cmd,
              pwd,
              msg: `"${pwd}": No such file or directory\n`,
              panelLabel,
            },
          });
          controlPanel.set({ executingCommandListDelete: hostname });
          return;
        }

        const parts = cmd.trim().split(/\s+/);
        const command = parts.shift();
        const args = parts;
        const stdoutStack = new LogStack('stdout', dotpi, cmd, pwd, panelLabel);
        const stderrStack = new LogStack('stderr', dotpi, cmd, pwd, panelLabel);

        const spawned = spawn(command, args, {
          cwd: pwd,
          uid,
          shell: '/bin/bash',
          detached: false,
        });

        spawned.stdout.on('data', data => stdoutStack.push(data.toString()));
        spawned.stderr.on('data', data => stderrStack.push(data.toString()));
        spawned.on('error', err => stderrStack.push(`${err.message}`));
        spawned.on('close', code => {
          stdoutStack.push(`Child process exited (code ${code})\n`);

          spawnedProcesses.delete(panelId);
          controlPanel.set({ executingCommandListDelete: hostname });
        });

        spawnedProcesses.set(panelId, spawned.pid);
        controlPanel.set({ executingCommandListAdd: hostname });
      }
    }
  });

  controlPanelCollection.onDetach(controlPanel => {
    const panelId = controlPanel.get('id');

    if (spawnedProcesses.has(panelId)) {
      const pid = spawnedProcesses.get(panelId);
      console.log('> [executeCommand] Panel closed, killing process:', pid);
      spawnedProcesses.delete(panelId);
      terminate(pid);
    }
  });
}
