import { AudioContext } from 'node-web-audio-api';

const audioContext = new AudioContext();

const duration = 0.1;
const length = Math.ceil(duration * audioContext.sampleRate);
const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);

const noise = new Float32Array(length);
// maybe we want the same buffer everywhere
for (let i = 0; i < length; i++) {
  noise[i] = Math.random() * 2 - 1;
}

buffer.copyToChannel(noise, 0);

export function testAudio(dotpi) {
  dotpi.onUpdate(updates => {
    if ('testAudio' in updates) {
      const src = audioContext.createBufferSource();
      src.buffer = buffer;
      src.connect(audioContext.destination);
      src.start();
    }
  });
}
