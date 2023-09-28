import ping from 'ping';

const host = 'google.com';

export function probeInternet(rpi, intervalInSec = 10) {

  (async function probe() {
    const res = await ping.promise.probe(host);
    await rpi.set({ hasInternet: res.alive });

    setTimeout(probe, intervalInSec * 1000);
  }())
}
