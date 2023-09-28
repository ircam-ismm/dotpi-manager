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

  stdout: {
    type: 'any', // cmd, cwd, msg
    event: true,
  },
  stderr: {
    type: 'any', // cmd, cwd, msg
    event: true,
  },

  // must be local as we may want to control each client individualy
  execCmd: {
    type: 'string',
    default: '',
  },
  // maybe should be stateful
  execCwd: {
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
  execProcesses: {
    type: 'any',
    default: [], // { cmd, pwd, pid }
  },

  forkCommand: {
    type: 'string',
    event: true,
  },
  // maybe should be stateful
  forkPwd: {
    type: 'string',
    event: true,
  },
  forkStart: {
    type: 'boolean',
    event: true,
  },
  forkStop: {
    type: 'integer', // pid
    event: true,
  },
  forkedProcesses: {
    type: 'any',
    default: [], // { cmd, pwd, pid }
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
};
