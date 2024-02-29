function padLeft(value) {
  value = `${value}`;

  while (value.length < 2) {
    value = `0${value}`;
  }

  return value;
}

function formatLog(log) {
  const prefix = log.type === 'stdout' ? '' : '[ERROR]';
  return `\
# ${prefix}[${log.date.toLocaleString()}][${log.hostname}] cmd: ${log.cmd} | pwd: ${log.pwd}

${log.msg}`;
}

export async function logger(server, dotpiCollection) {
  const today = new Date();
  const filename = `${today.getUTCFullYear()}-${padLeft(today.getUTCMonth() + 1)}-${padLeft(today.getUTCDate())}.txt`;
  const logger = await server.pluginManager.get('logger');
  const writer = await logger.createWriter(filename, {
    usePrefix: false,
    allowReuse: true,
  });

  dotpiCollection.onUpdate((dotpi, updates) => {
    ['stdout', 'stderr'].forEach(type => {
      if (type in updates) {
        const log = updates[type];
        log.date = new Date();
        log.hostname = dotpi.get('hostname');
        log.type = type;

        writer.write(formatLog(log));
      }
    });
  });
}
