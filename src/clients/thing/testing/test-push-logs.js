

export function testPushLogs(client) {
  let index = 0;
  let hostname = client.get('hostname');
  // testing
  (function triggerLog() {
    index += 1;
    const type = Math.random() < 0.3 ? 'stderr' : 'stdout';

    client.set({ [type]: {
      cmd: 'mysupercommand -xrvs',
      pwd: '/home/pi/apps/test',
      msg: `\nmy super command output log from ${hostname} with index ${index}`,
    }});

    setTimeout(triggerLog, (1 + Math.floor(Math.random() * 2)) * 1000);
  }())
}
