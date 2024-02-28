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
  createControlPanel: {
    type: 'boolean',
    event: true,
  },
  deleteControlPanel: {
    type: 'integer',
    event: true,
  },

  // is applied to all connected clients
  reboot: {
    type: 'boolean',
    event: true,
  },
  shutdown: {
    type: 'boolean',
    event: true,
  },
};
