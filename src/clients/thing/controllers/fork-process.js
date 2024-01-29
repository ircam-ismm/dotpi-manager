import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';

import terminate from 'terminate/promise.js';


// @todo - handle several processes in parallel
let spawnedProcess = null;

class LogStack {
  constructor(type, dotpi, cmd, pwd) {
    this.type = type;
    this.dotpi = dotpi;
    this.cmd = cmd;
    this.pwd = pwd;
    this.msg = ``;
    this.timeoutId = null;
  }

  push(msg) {
    clearTimeout(this.timeoutId);
    this.msg += msg;

    this.timeoutId = setTimeout(() => {
      const log = { cmd: this.cmd, pwd: this.pwd, msg: this.msg };
      this.dotpi.set({ [this.type]: log });
      this.msg = ``;
    }, 500);
  }
}

export function forkProcess(dotpi) {
  dotpi.onUpdate(async updates => {
    if ('forkToggle' in updates) {
      const value = updates['forkToggle'];
      const home = dotpi.get('home');
      const uid = dotpi.get('uid');

      const cmd = dotpi.get('forkCmd'); // for logs
      // allow using tilde in fork paths
      const pwd = dotpi.get('forkPwd').replace(/^~/, home);

      // kill current process if any
      if (spawnedProcess !== null) {
        try {
          await terminate(spawnedProcess.pid);
          spawnedProcess = null;
        } catch (err) {
          const log = { cmd, pwd, msg:`Cannot terminate process: ${err.message}\n` }
          this.dotpi.set({ stderr: log });
        }
      }

      if (value === true) {
        const parts = cmd.trim().split(/\s+/);
        const command = parts.shift();
        const args = parts;

        // pack messages together
        const stdoutStack = new LogStack('stdout', dotpi, cmd, pwd);
        const stderrStack = new LogStack('stderr', dotpi, cmd, pwd);
        // spawn the process in detached mode
        spawnedProcess = spawn(command, args, {
          cwd: pwd,
          uid,
          shell: '/bin/bash',
          detached: false,
        });

        spawnedProcess.stdout.on('data', data => stdoutStack.push(data.toString()));
        spawnedProcess.stderr.on('data', data => stderrStack.push(data.toString()));
        spawnedProcess.on('error', err => stderrStack.push(`${err.message}`));
        spawnedProcess.on('close', code => {
          stdoutStack.push(`Child process exited (code ${code})\n`);
          spawnedProcess = null;
        });
      }
    }
  });
}
