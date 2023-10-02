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

  // commands
  execCmd: {
    type: 'string',
    default: '',
  },
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
    default: [],
  }
};
