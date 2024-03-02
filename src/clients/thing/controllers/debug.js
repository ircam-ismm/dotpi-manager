
export function debug(controlPanelCollection, dotpi) {
  const hostname = dotpi.get('hostname');

  controlPanelCollection.onUpdate((controlPanel, updates) => {
    if (controlPanel.get('filteredList').indexOf(hostname) !== -1) {
      return;
    }

    if ('debugTriggerError' in updates) {
      throw new Error('[debug] test error');
    }
  });
}
