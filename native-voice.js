import {Capacitor} from '@capacitor/core';
import {SpeechRecognition} from '@capacitor-community/speech-recognition';

function makeNativeInput() {
  let generation = 0;
  return {
    async listen() {
      const id = ++generation;
      let permission = await SpeechRecognition.checkPermissions();
      if (permission.speechRecognition !== 'granted') permission = await SpeechRecognition.requestPermissions();
      if (id !== generation) return '';
      if (permission.speechRecognition !== 'granted') throw new Error('Allow speech recognition in iPhone Settings to use voice control.');
      if (!(await SpeechRecognition.available()).available) throw new Error('Speech recognition is unavailable.');
      if (id !== generation) return '';
      try {
        const {matches} = await SpeechRecognition.start({language:'en-US',maxResults:1,partialResults:false});
        return matches?.[0] || '';
      } catch (error) {
        if (/no speech detected/i.test(error.message)) return '';
        throw error;
      }
    },
    stop() { generation++; SpeechRecognition.stop().catch(() => {}); }
  };
}

export const nativeVoice = Capacitor.isNativePlatform() ? makeNativeInput() : undefined;
