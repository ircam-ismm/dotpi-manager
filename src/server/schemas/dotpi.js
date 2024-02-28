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
    type: 'any', // cmd, pwd, msg, panelLabel
    event: true,
  },
  stderr: {
    type: 'any', // cmd, pwd, msg, panelLabel
    event: true,
  },
};
