
export function forwardCommands(global, dotpiCollection) {
  global.onUpdate(updates => {
    for (let [key, value] of Object.entries(updates)) {
      switch (key) {
        case 'execTrigger': {
          // filter collection according to `cmdFilter`
          const dotpiStates = dotpiCollection.filter(state => state.get('cmdProcess'));

          const execPwd = global.get('execPwd');
          const execCmd = global.get('execCmd');

          dotpiStates.forEach(state => {
            state.set({ execPwd, execCmd, execTrigger: true });
          });
          break;
        }
        case 'forkToggle': {
          // filter collection according to `cmdFilter`
          const dotpiStates = dotpiCollection.filter(state => state.get('cmdProcess'));

          const forkPwd = global.get('forkPwd');
          const forkCmd = global.get('forkCmd');

          dotpiStates.forEach(state => {
            state.set({ forkPwd, forkCmd, forkToggle: value });
          });
          break;
        }
        case 'reboot': {
          const dotpiStates = dotpiCollection.filter(state => state.get('cmdProcess'));
          dotpiStates.forEach(state => state.set({ reboot: true }));
          break;
        }
        case 'shutdown': {
          const dotpiStates = dotpiCollection.filter(state => state.get('cmdProcess'));
          dotpiStates.forEach(state => state.set({ shutdown: true }));
          break;
        }
      }
    }
  });
}
