import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';

import terminate from 'terminate';

const spawnedProcesses = new Map();

class LogStack {
  constructor(type, dotpi, cmd, pwd, source) {
    this.type = type;
    this.dotpi = dotpi;
    this.cmd = cmd;
    this.pwd = pwd;
    this.source = source;
    this.msg = ``;
    this.timeoutId = null;
  }

  push(msg) {
    clearTimeout(this.timeoutId);
    this.msg += msg;

    this.timeoutId = setTimeout(() => {
      const { cmd, pwd, msg, source } = this;
      const log = { cmd, pwd, msg, source };
      this.dotpi.set({ [this.type]: log });
      this.msg = ``;
    }, 500);
  }
}

// @fixme - with nested processes, e.g. `npm run watch thing`, there might still
// be cases where we end up with gost processes. It seems to occur when terminate
// is trigerred when the 1rst sub process is launching the second one (tbc)
function killPanelProcess(panelId) {
  const spawned = spawnedProcesses.get(panelId);
  terminate(spawned.pid);
  spawnedProcesses.delete(panelId);
}

export function executeCommands(controlPanelCollection, dotpi) {
  const hostname = dotpi.get('hostname');
  const home = dotpi.get('home');
  const uid = dotpi.get('uid');

  controlPanelCollection.onUpdate((controlPanel, updates) => {
    const panelId = controlPanel.get('id');
    const source = controlPanel.get('label');
    const cmd = controlPanel.get('command');
    const pwd = controlPanel.get('remotePath').replace(/^~/, home);

    if ('executeCommand' in updates) {
      const { executeCommand } = updates;

      // if there is any process running, kill it
      if (spawnedProcesses.has(panelId)) {
        killPanelProcess(panelId);
        controlPanel.set({ executingCommandListDelete: hostname });
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
              source,
            },
          });
          controlPanel.set({ executingCommandListDelete: hostname });
          return;
        }

        const parts = cmd.trim().split(/\s+/);
        const command = parts.shift();
        const args = parts;
        const stdoutStack = new LogStack('stdout', dotpi, cmd, pwd, source);
        const stderrStack = new LogStack('stderr', dotpi, cmd, pwd, source);

        if (command === '') {
          dotpi.set({
            stderr: {
              cmd,
              pwd,
              msg: `Execute command: command cannot be empty\n`,
              source,
            },
          });
          controlPanel.set({ executingCommandListDelete: hostname });
          return;
        }

        // @todo - to be confirmed
        if (command === 'sudo') {
          dotpi.set({
            stderr: {
              cmd,
              pwd,
              msg: `Executing command in sudo is not allowed\n`,
              source,
            },
          });
          controlPanel.set({ executingCommandListDelete: hostname });
          return;
        }

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
          if (code !== 0) {
            stdoutStack.push(`Child process exited with code ${code}\n`);
          }

          spawnedProcesses.delete(panelId);
          controlPanel.set({ executingCommandListDelete: hostname });
        });

        spawnedProcesses.set(panelId, spawned);

        controlPanel.set({ executingCommandListAdd: hostname });
      }
    }
  });

  controlPanelCollection.onDetach(controlPanel => {
    const panelId = controlPanel.get('id');

    if (spawnedProcesses.has(panelId)) {
      console.log('> [executeCommand] Panel closed, killing process:', pid);
      killPanelProcess(panelId);
    }
  });
}
