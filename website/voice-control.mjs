// One recognition turn at a time. Pause the microphone during spoken replies.
export function browserInput() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;
  let current;
  return {
    listen() {
      return new Promise((resolve, reject) => {
        const recognition = new Recognition();
        current = recognition;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.onresult = e => {
          recognition.transcript = e.results[0][0].transcript;
        };
        recognition.onerror = e => {
          if (e.error !== 'no-speech') reject(new Error('Microphone: ' + e.error));
        };
        recognition.onend = () => resolve(recognition.transcript || '');
        recognition.start();
      });
    },
    stop() { current?.abort(); }
  };
}

export function mountVoice(host, {input = browserInput(), command, help, reset = () => {}}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Voice control';
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  host.append(button, status);
  let session = 0;
  let active = false;
  let timer;
  let finishSpeech;
  function stop(message = '') {
    active = false;
    session++;
    clearTimeout(timer);
    input?.stop();
    if (finishSpeech) { window.speechSynthesis?.cancel(); finishSpeech(); }
    reset();
    button.textContent = 'Voice control';
    button.setAttribute('aria-pressed', 'false');
    status.textContent = message;
  }
  function say(message) {
    status.textContent = message;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return Promise.resolve();
    return new Promise(resolve => {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      const finish = () => { finishSpeech = null; resolve(); };
      finishSpeech = finish;
      utterance.onend = utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    });
  }
  async function listen(id) {
    try {
      if (!active || id !== session) return;
      status.textContent = 'Listening · ' + help;
      const phrase = (await input.listen()).trim();
      if (!active || id !== session) return;
      if (/^stop listening[.!?]?$/i.test(phrase)) return stop('Microphone off.');
      if (phrase) {
        const reply = await command(phrase, () => active && id === session);
        if (!active || id !== session) return;
        await say(reply || help);
      }
      if (active && id === session) timer = setTimeout(() => listen(id), 250);
    } catch (e) {
      if (active && id === session) stop(e.message || 'Voice input stopped. Try again.');
    }
  }
  button.setAttribute('aria-pressed', 'false');
  button.onclick = () => {
    if (active) return stop('Microphone off.');
    if (!input) return stop('Use iPhone Voice Control or a browser with speech recognition.');
    active = true;
    button.textContent = 'Stop listening';
    button.setAttribute('aria-pressed', 'true');
    listen(++session);
  };
  const visibility = () => { if (document.hidden) stop(); };
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', visibilityStop);
  function visibilityStop() { stop(); }
  return () => {
    stop();
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', visibilityStop);
    host.replaceChildren();
  };
}
