# TODOS.md

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
- [x] fork process
- [ ] synchronize directory
    + [x] trigger
    + [x] watch
    + [x] feedback on controller
    + [?] do something with rsync output 
- [x] filter clients on which the commands are executed
- [x] lock path change when fork and syncWatch are active

- [ ] shutdown
- [ ] restart

- [ ] notifications
  https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
  + [ ] client disconnect
  + [ ] error received
    
- [x] dotpi lists
    + [x] seen but disconnect clients are just in window session memory, maybe this can be unpractical -> stored in globals
    + [x] same for exec command list, this could lead to issues if two controllers are executing commands at the same time. -> stored in dotpi states
    > this is not completely satisfying
    cf. https://github.com/collective-soundworks/soundworks/issues/64
    cf. https://github.com/collective-soundworks/soundworks/issues/67

- [ ] handle update and evolutions
    + [ ] auto update clients
    + [ ] sync version between server and clients
    
- [ ] install / uninstall daemons for soundworks apps
- [ ] DHCP / DNS / NAT 
    + [ ] handle ulimit https://github.com/collective-soundworks/soundworks/issues/46
- [ ] 
- [ ] test required dependencies on startup  (
    + [ ] rsync 3
    > rsync  version 2.6.9  protocol version 29
    @note -> still the same after `brew install rsync`
