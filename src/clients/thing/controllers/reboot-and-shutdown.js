import { execSync } from 'node:child_process';

export function rebootAndShutdown(global, dotpi) {
  global.onUpdate(updates => {
    if ('reboot' in updates) {
      const isDebug = dotpi.get('isDebugClient');
      const uid = dotpi.get('uid');

      console.log('Rebooting system');

      if (!isDebug) {
        execSync(`sudo reboot`, { uid });
      }
    }

    if ('shutdown' in updates) {
      const isDebug = dotpi.get('isDebugClient');
      const uid = dotpi.get('uid');

      console.log('Shutting down system');

      if (!isDebug) {
        execSync(`sudo shutdown now`, { uid });
      }
    }
  });
}
