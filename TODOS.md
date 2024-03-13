# TODOS

- [ ] review stdout and stderr logs, should be stacked in right order
      -> list of type, cmd, cwd, type, msg, etc.

- [x] store current tab
- [x] kill doesn't work at all
  + [x] move back to terminate
  + [x] prevent launching command in sudo

##
- [x] check process is closed when panel is deleted
- [x] empty command crashes the client

- [x] problem with fork
      - [x] sudo issue
      -> replaced `terminate` w/ `sudo kill pid`
- [x] reboot does not work
- [x] remove hostname from all lists on disconnect

- [ ] sync feedback does not work

- [ ] remove launcher from thing client
- [ ] dotpi-list should not scroll (cf. firefox)
- [ ] maybe do not propagate rsync errors (?)

## Chore
- [x] implement control panels
- [x] fix filter list select/unselect all
- [x] logs in right order: newer on bottom
- [x] filter logs
- [x] sync
- [x] feedback in controller if discrepancies with versions
- [x] report errors from server (e.g. rsync) into controller
- [x] review panel layout

## GUI / Usability Improvements
- [x] store screen position into local storage
      cf. implement in sc-components
- [x] fix text input to prevent new lines
      cf. https://github.com/ircam-ismm/sc-components/issues/36
- [ ] add placeholder for filter / update on @input
      cf. https://github.com/ircam-ismm/sc-components/issues/36
- [ ] use id as opposed to label in sc-tab controller 
      cf. https://github.com/ircam-ismm/sc-components/issues/40
- [ ] highlight icons when one in list is active, mainly for execute, sync)
      cf. https://github.com/ircam-ismm/sc-components/issues/29

## Emulated clients
- [x] use index from plugin check to create hostname

## Audio
- [x] do not crash is audioContext fails to start
- [x] white noise
- [x] sweep
- [ ] general volume button

