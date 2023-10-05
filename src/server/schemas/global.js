export default {

  dotpiSeen: {
    type: 'any',
    default: [],
  },
  // work around the missing set type,
  // cf. https://github.com/collective-soundworks/soundworks/issues/67
  dotpiSeenDeleteRequest: {
    type: 'string',
    event: true,
  },

  // command: support only one exec, fork and sync at the same time for now
  // ...maybe improve this later
  reboot: {
    type: 'boolean',
    event: true,
  },
  shutdown: {
    type: 'boolean',
    event: true,
  },

  execPwd: {
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
  syncTrigger: {
    type: 'boolean',
    event: true,
  },
  syncWatch: {
    type: 'boolean',
    default: false,
  },
  // syncErr: {
  //   type: 'string',
  //   event: true,
  // },
};
