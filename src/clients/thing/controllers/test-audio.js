import fs from 'node:fs';
import path from 'node:path';

import { AudioContext } from 'node-web-audio-api';

let audioContext = null;
let audioContextError = null;

try {
  audioContext = new AudioContext();
} catch (err) {
  audioContextError = err;
}

const noise = fs.readFileSync(path.join('public', 'audio', 'white-noise.wav'));
const sweep = fs.readFileSync(path.join('public', 'audio', 'sweep.wav'));

const buffers = {
  noise: await audioContext.decodeAudioData(noise.buffer),
  sweep: await audioContext.decodeAudioData(sweep.buffer),
};

export function testAudio(global, dotpi) {
  dotpi.onUpdate(updates => {
    if ('testAudio' in updates) {
      if (audioContextError !== null) {
        dotpi.set({
          stderr: {
            msg:`Cannot test audio: ${audioContextError.message}\n`,
            source: 'runtime',
          },
        });
        return;
      }

      const source = global.get('testAudioSource');
      const src = audioContext.createBufferSource();
      src.buffer = buffers[source];
      src.connect(audioContext.destination);
      src.start();
    }
  });
}
