# Issues

Error: error while querying config: DeviceNotAvailable

# TODOS

- [x] Update layout and styles from latest soundworks
- [x] Sketch a clean layout for controller

- [ ] logger
    + [x] time tag all logs
    + [x] display in order
    + [x] select logs from specific clients
    + [x] Write into file
    + [x] Only keep last x log files
    + [?] Shoud keep logs of clients until they are removed from `clientSeen`
    + [ ] reverse log order -> new logs on bottom / problem with scroll behaviour

- [x] execute command
    + [ ] No feedback for long commands, e.g. npm install

- [x] fork process

- [ ] synchronize directory
    + [x] trigger
    + [x] watch
    + [x] feedback on controller
    + [?] do something with rsync output 
    + [ ] IMPORTANT - prevent rsync from erasing important informations
        i.e. if syncing into home, all ssh, etc. files are deleted, which breaks the RPi
    + [ ] global log when all devices are synced?
    + [ ] debouce
    
- [x] filter clients on which the commands are executed
- [x] lock path change when fork and syncWatch are active

- [x] reboot
- [x] shutdown

- [ ] test audio
    + [x] white noise
    + [ ] sweep

- [ ] notifications
  https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
  + [x] test API
  + [x] client disconnect
  + [ ] error received
  + [x] only if visibility is hidden
  
- [ ] DEV
    + [ ] discovery broadcast doen't work if only localhost network interface exists
    cf. https://en.wikipedia.org/wiki/Multicast_address
    
- [x] dotpi lists
    + [x] seen but disconnect clients are just in window session memory, maybe this can be unpractical -> stored in globals
    + [x] same for exec command list, this could lead to issues if two controllers are executing commands at the same time. -> stored in dotpi states
    > this is not completely satisfying
    cf. https://github.com/collective-soundworks/soundworks/issues/64
    cf. https://github.com/collective-soundworks/soundworks/issues/67
    
- [ ] install / uninstall daemons for soundworks apps
- [ ] DHCP / DNS / NAT 
    + [ ] handle ulimit https://github.com/collective-soundworks/soundworks/issues/46
- [ ] Share internet big button

- [ ] rsync 2 & 3 options, cf. _BACKUP-ISMM-STOCK.command
