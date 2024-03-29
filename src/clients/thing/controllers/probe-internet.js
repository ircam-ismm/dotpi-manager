import ping from 'ping';

const host = '1.1.1.1';

export function probeInternet(dotpi, intervalInSec = 10) {
  (async function probe() {
    const res = await ping.promise.probe(host);
    await dotpi.set({ hasInternet: res.alive });

    setTimeout(probe, intervalInSec * 1000);
  }());
}
