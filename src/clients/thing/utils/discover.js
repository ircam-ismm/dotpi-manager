import { DiscoveryClient } from '@ircam/node-discovery';

export default function discover(broadcastAddress, port, hostname) {
  // look for the server on the network
  const { promise, resolve, reject } = Promise.withResolvers();
  const discoveryClient = new DiscoveryClient({
    broadcastAddress,
    port,
    payload: { hostname },
  });

  discoveryClient.on('connection', async (rinfo, linfo) => resolve([rinfo, linfo]));
  discoveryClient.on('close', () => {});
  discoveryClient.start();

  return promise;
}