import os from 'node:os';
import { exec } from 'node:child_process';
import chokidar from 'chokidar';

const localHome = os.homedir();

function doSync(dotpiList, localPathname, remotePathname) {
  localPathname = localPathname.replace(/^~/, localHome);

  dotpiList.forEach(dotpi => {
    const user = dotpi.get('user');
    const hostname = dotpi.get('hostname');
    const remoteHome = dotpi.get('home');

    remotePathname = remotePathname.replace(/^~/, remoteHome);

    const dest = dotpi.get('isDebugClient')
      ? remotePathname
      : `${user}@${hostname}.local:${remotePathname}`;


    // console.log('sync', localPathname, dest);
    const cmd = `rsync --rsync-path='mkdir -p "${remotePathname}" && rsync'`
      + ` --archive --exclude="node_modules" --delete`
      + ` "${localPathname}/" "${dest}"`;

    dotpi.set({ syncing: true });

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
      }

      // @todo - do something with stdout and stderr (?)
      dotpi.set({ syncing: false });
    });
  });
}

let watcher = null;

export function syncDirectory(global, dotpiCollection) {
  global.onUpdate(updates => {
    if ('syncTrigger' in updates) {
      const localPathname = global.get('syncLocalPathname');
      const remotePathname = global.get('syncRemotePathname');

      const dotpiList = dotpiCollection.filter(state => state.get('cmdProcess'));
      doSync(dotpiList, localPathname, remotePathname);
    }

    if ('syncWatch' in updates) {
      const watch = updates.syncWatch;

      if (watcher !== null) {
        watcher.close(); // this is async, but no need to wait here
        watcher = null;
      }

      if (watch) {
        const localPathname = global.get('syncLocalPathname');
        const remotePathname = global.get('syncRemotePathname');

        // launch chokidar watch
        const absLocalPathname = global.get('syncLocalPathname').replace(/^~/, localHome);

        watcher = chokidar.watch(absLocalPathname, { ignored: 'node_modules' });
        watcher.on('all', () => {
          const dotpiList = dotpiCollection.filter(state => state.get('cmdProcess'));
          doSync(dotpiList, localPathname, remotePathname);
        });
      }
    }
  });
}
