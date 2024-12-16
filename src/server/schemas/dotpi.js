export default {
  hostname: {
    type: 'string',
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
  managerVersion: {
    type: 'string',
    default: '',
  },
  soundworksVersion: {
    type: 'string',
    default: '',
  },

  hasInternet: {
    type: 'boolean',
    default: false,
  },
  testAudio: {
    type: 'boolean',
    event: true,
  },
  testLight: {
    type: 'boolean',
    event: true,
  },

  upgrade: {
    type: 'boolean',
    event: true,
  },
  upgrading: {
    type: 'boolean',
    default: false,
  },

  stdout: {
    type: 'any', // cmd, pwd, msg, source
    event: true,
  },
  stderr: {
    type: 'any', // cmd, pwd, msg, source
    event: true,
  },
};
