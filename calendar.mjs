export const CHAPTER_TIME_ZONE = 'America/New_York';
export const PUBLIC_EVENTS = [
  {id:'newark-halloween',title:'Red Devils MC Newark',date:'2026-10-24',time:'8 PM',image:'1000016806.PNG',alt:'Red Devils MC Newark Halloween Party, October 24 at 8 PM'},
  {id:'charter-oak-halloween',title:'Charter Oak Connecticut',date:'2026-10-24',time:'6 PM',image:'IMG_1955.PNG',alt:'Charter Oak Connecticut Halloween Pig Roast, Saturday October 24 at 6 PM'},
  {id:'tri-city-halloween',title:'RDMC Tri-City',date:'2026-10-31',time:'7 PM',image:'signal-2026-09-23-114809.JPG',alt:'RDMC Tri-City Annual Halloween Party, October 31 at 7 PM'},
  {id:'recons-toy-run',title:'Recon’s Birthday Toy Run',date:'2026-10-17',time:'1–6 PM',image:'recons-birthday-toy-run-2026.jpeg',alt:'Recon’s Birthday Toy Run, October 17, 2026, Brooklyn, NY'}
];
export function chapterDay(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:CHAPTER_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function splitEvents(events, now = new Date()) {
  const today = chapterDay(now);
  return {
    upcoming:events.filter(e => (e.date || chapterDay(e.starts_at)) >= today).sort((a,b) => (a.date || a.starts_at).localeCompare(b.date || b.starts_at)),
    past:events.filter(e => (e.date || chapterDay(e.starts_at)) < today).sort((a,b) => (b.date || b.starts_at).localeCompare(a.date || a.starts_at))
  };
}
export function formatEventDate(day) {
  return new Intl.DateTimeFormat('en-US',{timeZone:CHAPTER_TIME_ZONE,weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(new Date(day+'T12:00:00-05:00'));
}
export function formatChapterTime(value) {
  return new Intl.DateTimeFormat('en-US',{timeZone:CHAPTER_TIME_ZONE,dateStyle:'medium',timeStyle:'short'}).format(new Date(value))+' Eastern';
}
export function nextChapterMeeting(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:CHAPTER_TIME_ZONE,year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric',hourCycle:'h23'}).formatToParts(new Date(now));
  const get = type => Number(parts.find(p => p.type === type).value);
  const day = new Date(Date.UTC(get('year'),get('month')-1,get('day')));
  let days = (4-day.getUTCDay()+7)%7;
  if(days===0 && get('hour')>=19) days=7;
  day.setUTCDate(day.getUTCDate()+days);
  return day.toISOString().slice(0,10);
}
