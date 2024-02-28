import os from 'node:os';
import { exec } from 'node:child_process';
import chokidar from 'chokidar';
import debounce from 'lodash/debounce.js';

const localHome = os.homedir();

function doSync(dotpiList, localPathname, remotePathname) {
  localPathname = localPathname.replace(/^~/, localHome);

  dotpiList.forEach(dotpi => {
    const user = dotpi.get('user');
    const hostname = dotpi.get('hostname');
    const remoteHome = dotpi.get('home');

    remotePathname = remotePathname.replace(/^~/, remoteHome);

    // prevent writing into home
    // @todo - clean this
    if (remotePathname.replace(/\/$/, '') === remoteHome.replace(/\/$/, '')) {
      console.warn('sync abort: cannot sync into home');
      return;
    }

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
  console.log('> syncDirectory: @todo review');
  // global.onUpdate(updates => {
  //   if ('syncTrigger' in updates) {
  //     const localPathname = global.get('syncLocalPathname');
  //     const remotePathname = global.get('syncRemotePathname');

  //     const dotpiList = dotpiCollection.filter(state => state.get('cmdProcess'));
  //     doSync(dotpiList, localPathname, remotePathname);
  //   }

  //   if ('syncWatch' in updates) {
  //     const watch = updates.syncWatch;

  //     if (watcher !== null) {
  //       watcher.close(); // this is async, but no need to wait here
  //       watcher = null;
  //     }

  //     if (watch) {
  //       const localPathname = global.get('syncLocalPathname');
  //       const remotePathname = global.get('syncRemotePathname');

  //       // launch chokidar watch
  //       const absLocalPathname = global.get('syncLocalPathname').replace(/^~/, localHome);

  //       watcher = chokidar.watch(absLocalPathname, {
  //         ignored: 'node_modules',
  //         // without this option all files trigger an `add` event at startup, which crashes rsync
  //         ignoreInitial: true,
  //       });

  //       watcher.on('all', debounce(() => {
  //         const dotpiList = dotpiCollection.filter(state => state.get('cmdProcess'));
  //         doSync(dotpiList, localPathname, remotePathname);
  //       }), 500, {
  //         leading: true,
  //         trailing: true,
  //       });

  //       // do first sync on launch
  //       const dotpiList = dotpiCollection.filter(state => state.get('cmdProcess'));
  //       doSync(dotpiList, localPathname, remotePathname);
  //     }
  //   }
  // });
}
