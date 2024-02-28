export default {
  hostname: {
    type: 'string',
    default: null,
    nullable: true,
  },
  address: {
    type: 'string',
    default: null,
    nullable: true,
  },
  port: {
    type: 'integer',
    default: null,
    nullable: true,
  },
  isDebugClient: {
    type: 'boolean',
    default: false,
  },
  home: {
    type: 'string',
    default: null,
    nullable: true,
  },
  user: {
    type: 'string',
    default: null,
    nullable: true,
  },
  uid: {
    type: 'integer',
    default: null,
    nullable: true,
  },
  hasInternet: {
    type: 'boolean',
    default: false,
  },
  testAudio: {
    type: 'boolean',
    event: true,
  },

  stdout: {
    type: 'any', // cmd, pwd, msg
    event: true,
  },
  stderr: {
    type: 'any', // cmd, pwd, msg
    event: true,
  },

  // // define if the client should execute the commands
  // cmdProcess: {
  //   type: 'boolean',
  //   default: true,
  // },

  // reboot: {
  //   type: 'boolean',
  //   event: true,
  // },
  // shutdown: {
  //   type: 'boolean',
  //   event: true,
  // },

  // // commands
  // execCmd: {
  //   type: 'string',
  //   default: '',
  // },
  // execPwd: {
  //   type: 'string',
  //   default: '',
  // },
  // execTrigger: {
  //   type: 'boolean',
  //   event: true,
  // },
  // // not implemented
  // execKill: {
  //   type: 'boolean', // pid
  //   event: true,
  // },
  // execProcesses: {
  //   type: 'any',
  //   default: [],
  // },

  // forkPwd: {
  //   type: 'string',
  //   default: '',
  // },
  // forkCmd: {
  //   type: 'string',
  //   default: '',
  // },
  // forkToggle: {
  //   type: 'boolean',
  //   event: true,
  // },

  // // for feedback when syncing is in progress
  // syncing: {
  //   type: 'boolean',
  //   default: false,
  // },
};
