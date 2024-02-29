import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { exec } from 'node:child_process';

import chokidar from 'chokidar';
import debounce from 'lodash/debounce.js';

const localHome = os.homedir();
const watchers = new Map(); // <panelId, watcher>

function doSync(controlPanel, dotpiCollection, localPath, remotePath) {
  const filteredList = controlPanel.get('filteredList');

  const dotpiFilteredList = dotpiCollection.filter(dotpi => {
    const hostname = dotpi.get('hostname');
    return filteredList.indexOf(hostname) === -1;
  });

  dotpiFilteredList.forEach(dotpi => {
    const user = dotpi.get('user');
    const hostname = dotpi.get('hostname');
    const remoteHome = dotpi.get('home');

    remotePath = remotePath.replace(/^~/, remoteHome);
    // if debug client normalize according to current platform
    // othewise assume this is linux/posix system
    if (dotpi.get('isDebugClient')) {
      remotePath = path.normalize(remotePath);
    } else {
      remotePath = path.posix.normalize(remotePath);
    }

    // prevent writing into home
    // @todo - report errors to controller
    if (remotePath.replace(/\/$/, '') === remoteHome.replace(/\/$/, '')) {
      const msg = 'Cannot synchronize - Syncing into remote $HOME is forbidden';
      dotpi.set({ stderr: { msg, source: controlPanel.get('label') }});
      console.error(msg);
      return;
    }

    const dest = dotpi.get('isDebugClient')
      ? remotePath
      : `${user}@${hostname}.local:${remotePath}`;

    const cmd = `rsync --rsync-path='mkdir -p "${remotePath}" && rsync'`
      + ` --archive --exclude="node_modules" --delete`
      + ` "${localPath}/" "${dest}"`;

    controlPanel.set({ syncingListAdd: hostname });

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        const msg = err.message;
        dotpi.set({ stderr: { msg, source: controlPanel.get('label') }});
        console.error(msg);
      }

      controlPanel.set({ syncingListDelete: hostname });
    });
  });
}

export function rsync(global, controlPanelCollection, dotpiCollection) {

  controlPanelCollection.onUpdate((controlPanel, updates) => {
    if ('syncTrigger' in updates || 'syncWatch' in updates) {
      const localPath = path.normalize(controlPanel.get('localPath').replace(/^~/, localHome));

      if (!fs.existsSync(localPath)) {
        const msg = `Cannot synchronize - ${localPath}": No such local file or directory`;
        global.set({ stderr: { msg, source: controlPanel.get('label') } });
        console.error(msg);
        return;
      }

      const remotePath = controlPanel.get('remotePath');

      if ('syncTrigger' in updates) {
        doSync(controlPanel, dotpiCollection, localPath, remotePath);
      }

      if ('syncWatch' in updates) {
        const panelId = controlPanel.get('id');

        if (watchers.has(panelId)) {
          const watcher = watchers.get(panelId);
          watchers.delete(panelId);
          watcher.close(); // this is async, but no need to wait here
        }

        if (updates.syncWatch === true) {
          const watcher = chokidar.watch(localPath, {
            ignored: 'node_modules',
            // without this option all files trigger an `add` event at startup, which crashes rsync
            ignoreInitial: true,
          });

          watchers.set(panelId, watcher);

          watcher.on('all', debounce(() => {
            doSync(controlPanel, dotpiCollection, localPath, remotePath);
          }), 1000, {
            leading: true,
            trailing: true,
          });

          // do first sync on launch
          doSync(controlPanel, dotpiCollection, localPath, remotePath);
        }
      }
    }
  });
}
