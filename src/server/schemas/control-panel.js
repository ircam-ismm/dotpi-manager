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
  localPath: {
    type: 'string',
    default: '',
  },
  remotePath: {
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
  filteredList: {
    type: 'any',
    default: [],
  },
  filteredListAdd: {
    type: 'any', // Array of hostnames to add to the list
    event: true,
  },
  filteredListDelete: {
    type: 'any', // Array of hostnames to remove from the list
    event: true,
  },

}
