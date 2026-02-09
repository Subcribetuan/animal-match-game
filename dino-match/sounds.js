/* ===========================================
   SOUNDS MODULE
   Generates and plays audio that works on
   iPhone even in silent mode
   =========================================== */

// Audio elements
let popSound = null;
let matchSound = null;
let winSound = null;
let welcomeSound = null;
let audioInitialized = false;

/**
 * Generate a WAV file as a base64 data URI
 * This creates actual audio files that play as "media" (not UI sounds)
 * which means they work even when iPhone is on silent
 */
function generateWav(frequency, duration, volume = 0.3) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate sine wave samples with fade out
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = Math.sin(2 * Math.PI * frequency * t);
    const envelope = Math.exp(-t * 10); // Fade out
    sample *= envelope * volume * 32767;
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample)), true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

/**
 * Generate a multi-tone WAV (for melodies)
 */
function generateMultiToneWav(frequencies, durations, volume = 0.25) {
  const sampleRate = 44100;
  let totalSamples = 0;
  for (let d of durations) {
    totalSamples += Math.floor(sampleRate * d);
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = totalSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let sampleIndex = 0;
  for (let n = 0; n < frequencies.length; n++) {
    const freq = frequencies[n];
    const dur = durations[n];
    const numSamples = Math.floor(sampleRate * dur);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.exp(-t * 8);
      sample *= envelope * volume * 32767;
      view.setInt16(44 + sampleIndex * 2, Math.max(-32768, Math.min(32767, sample)), true);
      sampleIndex++;
    }
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

/**
 * Initialize all audio - call this on first user tap
 */
function initAudio() {
  if (audioInitialized) return;

  // Pop sound - short, soft tap feedback
  popSound = new Audio(generateWav(500, 0.08, 0.3));
  popSound.playsInline = true;

  // Match sound - happy two-note chime
  matchSound = new Audio(generateMultiToneWav([880, 1100], [0.12, 0.18], 0.25));
  matchSound.playsInline = true;

  // Win sound - ascending melody C-E-G-C
  winSound = new Audio(generateMultiToneWav([523, 659, 784, 1047], [0.15, 0.15, 0.15, 0.3], 0.25));
  winSound.playsInline = true;

  // Welcome sound - quick ascending notes
  welcomeSound = new Audio(generateMultiToneWav([440, 550, 660], [0.1, 0.1, 0.15], 0.2));
  welcomeSound.playsInline = true;

  audioInitialized = true;
}

/**
 * Play the pop sound (card flip)
 */
function playPop() {
  if (popSound) {
    popSound.currentTime = 0;
    popSound.play().catch(() => {});
  }
}

/**
 * Play the match sound (found a pair)
 */
function playMatch() {
  if (matchSound) {
    matchSound.currentTime = 0;
    matchSound.play().catch(() => {});
  }
}

/**
 * Play the win sound (game complete)
 */
function playWin() {
  if (winSound) {
    winSound.currentTime = 0;
    winSound.play().catch(() => {});
  }
}

/**
 * Play the welcome sound (game start)
 */
function playWelcome() {
  if (welcomeSound) {
    welcomeSound.currentTime = 0;
    welcomeSound.play().catch(() => {});
  }
}
