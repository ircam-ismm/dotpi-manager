
// from https://techsparx.com/nodejs/deployment/rsync.html
// var user = config.deploy_rsync.user;
// var host = config.deploy_rsync.host;
// var dir  = config.deploy_rsync.dir;
// var rsync = spawn('rsync',
//     [ '--verbose', '--archive', '--delete', config.root_out+'/', user+'@'+host+':'+dir+'/' ],
//     {env: process.env, stdio: 'inherit'});

export function syncDirectory(globalState, dotpiCollection) {

}

// // @todo - use tokens to retrieve feedback to the front-end
// syncDirectory(event, localDirectory, remoteDirectory, tokens, clearTokens = true) {
//   tokens.forEach(token => {
//     const { hostname } = token.client;

//     let destinationDirectory = '';
//     // we are in debug mode with locally emulated devices
//     if (/debug/.test(hostname)) {
//       destinationDirectory = remoteDirectory;
//     } else {
//       destinationDirectory = `pi@${hostname}.local:${remoteDirectory}`;
//     }

//     const cmd = `rsync --rsync-path='mkdir -p "${remoteDirectory}" && rsync'`
//           + ` --archive --exclude="node_modules" --delete-after`
//           + ` "${localDirectory}/" "${destinationDirectory}"`;

//     // console.log('cmd: ', cmd);

//     exec(cmd, (err, stdout, stderr) => {
//       if (err) {
//         return console.error('Error: ', err);
//       }

//       // console.log('stdout: ', stdout.toString());
//       // console.log('stderr; ', stderr.toString());

//       // token has { address, port } has rinfo does
//       const msg = `"${remoteDirectory}" successfully synchronized\n`;
//       this.mainWindow.webContents.send('device:stdout', token.client, msg);

//       if (clearTokens) {
//         this.mainWindow.webContents.send('device:clear-token', token.uuid);
//       }
//     });
//   });
// },

// // token system is absurd here
// startWatchingDirectory(event, localDirectory, remoteDirectory, tokens) {
//   const watchOptions = {
//     ignoreDotFiles: true,
//     ignoreUnreadableDir: true,
//     ignoreNotPermitted: true,
//     ignoreDirectoryPattern: /node_modules/,
//     interval: 1,
//   };

//   watch.createMonitor(localDirectory, Object.assign({}, watchOptions), monitor => {
//     this.watchInfos.monitor = monitor;
//     this.watchInfos.tokens = tokens;

//     // @note - try to delay to account for transpile time
//     // this doesn't work because transpile is itself delayed by watch...
//     // see if it creates problems in real situations
//     const sync = debounce(() => {
//       this.syncDirectory(event, localDirectory, remoteDirectory, tokens, false);
//     }, 100);

//     monitor.on('created', sync);
//     monitor.on('changed', sync);
//     monitor.on('removed', sync);

//     tokens.forEach(token => {
//       this.mainWindow.webContents.send('device:set-token-status', token.uuid, 'watching');
//     });
//   });
// },

// stopWatchingDirectory(event) {
//   this.watchInfos.monitor.stop();

//   this.watchInfos.tokens.forEach(token => {
//     this.mainWindow.webContents.send('device:clear-token', token.uuid);
//   });

//   this.watchInfos.monitor = null;
//   this.watchInfos.tokens = null;
// },
