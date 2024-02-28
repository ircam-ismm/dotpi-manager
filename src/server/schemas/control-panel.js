export default {
  id: {
    type: 'integer',
    default: -1,
  },

  label: {
    type: 'string',
    default: null,
    nullable: true,
  },

  // --------------------------------------------------------------------------
  // related local and remote directories
  // --------------------------------------------------------------------------
  localDirectory: {
    type: 'string',
    default: '',
  },

  remoteDirectory: {
    type: 'string',
    default: '',
  },

  // --------------------------------------------------------------------------
  // commands
  // --------------------------------------------------------------------------
  command: {
    type: 'string',
    default: '',
  },

  executeCommand: {
    type: 'boolean',
    default: false,
  },

  executingCommandList: {
    type: 'any',
    default: [],
  },
  executingCommandListAdd: {
    type: 'string',
    event: true,
  },
  executingCommandListDelete: {
    type: 'string',
    event: true,
  },

  // --------------------------------------------------------------------------
  // sync
  // --------------------------------------------------------------------------
  syncTrigger: {
    type: 'boolean',
    event: true,
  },

  syncWatch: {
    type: 'boolean',
    default: false,
  },

  syncingList: {
    type: 'any',
    default: [],
  },
  syncingListAdd: {
    type: 'string',
    event: true,
  },
  syncingListDelete: {
    type: 'string',
    event: true,
  },

  // --------------------------------------------------------------------------
  // filter comand and sync, if in list does not sync nor execute commands
  // --------------------------------------------------------------------------
  filterList: {
    type: 'any',
    default: [],
  },
  filterListAdd: {
    type: 'string',
    event: true,
  },
  filterListDelete: {
    type: 'string',
    event: true,
  },

}
