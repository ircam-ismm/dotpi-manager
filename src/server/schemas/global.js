export default {

  // list of dotpi clients that have been seen since the
  dotpiSeen: {
    type: 'any',
    default: [],
  },

  // list of hostnames that should execute commands
  cmdFilter: {
    type: 'any',
    default: [],
  },

  // command: support only one exec, fork and sync at the same time for now
  // ...maybe improve this later

  execCwd: {
    type: 'string',
    default: '',
  },
  execCmd: {
    type: 'string',
    default: '',
  },
  execTrigger: {
    type: 'boolean',
    event: true,
  },
  execKill: {
    type: 'boolean', // pid
    event: true,
  },
  // execProcesses: {
  //   type: 'any',
  //   default: [], // { cmd, pwd, pid }
  // },

  forkPwd: {
    type: 'string',
    default: '',
  },
  forkCmd: {
    type: 'string',
    default: '',
  },
  forkToggle: {
    type: 'boolean',
    event: true,
  },
  // forkStop: {
  //   type: 'integer', // pid
  //   event: true,
  // },
  // forkedProcesses: {
  //   type: 'any',
  //   default: [], // { cmd, pwd, pid }
  // },

  syncLocalPathname: {
    type: 'string',
    default: null,
    nullable: true,
  },
  syncRemotePathname: {
    type: 'string',
    default: null,
    nullable: true,
  },
  syncDirectory: {
    type: 'string',
    default: null,
    nullable: true,
  },
  syncWatch: {
    type: 'boolean',
    default: false,
  },
  syncErr: {
    type: 'string',
    event: true,
  },
};
