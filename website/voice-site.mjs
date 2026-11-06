import {mountVoice} from './voice-control.mjs';

const names = {shop:'support', store:'support', 'support gear':'support', sponsors:'sponsorship'};
const sections = ['home','about','events','history','worldwide','sponsorship','support','contact','cart']
  .filter(id => document.getElementById(id));
const help = 'Say “show events”, “show support gear”, or “stop listening”.';
mountVoice(document.querySelector('.rdmc-voice'), {
  help,
  command(phrase) {
    const target = phrase.toLowerCase().replace(/[.!?]+$/, '').replace(/^(?:go to|open|show|scroll to) (?:the )?/, '');
    if (target === 'cancel') return 'Cancelled.';
    const id = names[target] || target;
    if (!sections.includes(id)) return help;
    location.hash = id;
    document.getElementById(id).scrollIntoView();
    return 'Showing ' + id + '.';
  }
});
