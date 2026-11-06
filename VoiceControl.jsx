import React, {useEffect, useRef} from 'react';
import {mountVoice} from './voice-control.mjs';
import {supabase} from './supabase';
import './voice.css';

const tabs = {home:'Dashboard', dashboard:'Dashboard', dealers:'Dealers', store:'Store', tasks:'Tasks',
  inventory:'Inventory', consumption:'Consumption', members:'Members', chat:'Members Chat',
  'members chat':'Members Chat', planner:'Planner', calendar:'Planner', zoom:'Zoom', admin:'Admin'};
const normalize = text => text.trim().toLowerCase().replace(/[.!?]+$/, '').replace(/\s+/g, ' ');
const help = 'Say “open planner”, “open chat”, or “stop listening”.';

export default function VoiceControl({userId, admin, chapterChat, navigate, refreshAdmin, input}) {
  const host = useRef(null);
  const actions = useRef(null);
  actions.current = {navigate, refreshAdmin};
  useEffect(() => {
    let pending;
    const reset = () => { pending = null; };
    async function command(phrase, current) {
      const words = normalize(phrase);
      if (words === 'cancel') { reset(); return 'Cancelled.'; }
      if (pending && Date.now() > pending.expires) reset();
      if (words === 'send it' || words === 'confirm approval') {
        const action = pending;
        reset();
        if (!action || action.confirm !== words) return 'Nothing to confirm.';
        const {data, error: authError} = await supabase.auth.getUser();
        if (!current() || authError || data.user?.id !== userId) return 'Please sign in again.';
        if (action.confirm === 'send it' && chapterChat) {
          const {error} = await supabase.from('member_chat').insert({author_id:userId, body:action.body});
          return error ? 'Message could not be sent. Check member access.' : 'Message sent.';
        }
        if (!admin) return 'Owner access required.';
        const {data: changed, error} = await supabase.from('profiles')
          .update({subscription_status:'active'}).eq('id',action.id)
          .eq('subscription_status','pending').select('id');
        if (error || !changed?.length) return 'Approval did not go through. Check the member list.';
        if (current()) actions.current.refreshAdmin();
        return action.name + ' approved.';
      }
      reset();
      if (words === 'show pending members' || words.startsWith('approve ')) {
        if (!admin) return 'Owner access required.';
        const {data, error} = await supabase.from('profiles').select('id,full_name')
          .eq('subscription_status','pending').order('full_name');
        if (error || !current()) return 'Could not load pending members.';
        actions.current.navigate('Admin');
        actions.current.refreshAdmin();
        if (words === 'show pending members') return data.length
          ? data.length + ' pending. ' + data.slice(0,5).map(m=>m.full_name || 'Unnamed member').join(', ') : 'No pending members.';
        const name = words.slice(8).trim();
        const matches = data.filter(m => m.id !== userId && m.full_name && normalize(m.full_name) === name);
        if (matches.length !== 1) return 'Use one exact, unique name from the pending list.';
        pending = {confirm:'confirm approval', id:matches[0].id, name:matches[0].full_name, expires:Date.now()+60000};
        return 'Approve ' + pending.name + '? Say “confirm approval” or “cancel”.';
      }
      const draft = phrase.match(/^tell the brothers\s+(.+)$/i);
      if (draft) {
        if (!chapterChat) return 'Chapter member access required.';
        if (draft[1].length > 2000) return 'Please use a shorter message.';
        actions.current.navigate('Members Chat');
        pending = {confirm:'send it', body:draft[1], expires:Date.now()+120000};
        return 'Message: ' + pending.body + '. Say “send it” or “cancel”.';
      }
      const tab = tabs[words.replace(/^(open|show|go to) (the )?/, '')];
      if (typeof tab !== 'string') return help;
      if (tab === 'Admin' && !admin) return 'Owner access required.';
      actions.current.navigate(tab);
      if (tab === 'Admin') actions.current.refreshAdmin();
      return 'Opening ' + tab + '.';
    }
    return mountVoice(host.current, {command, input, reset, help});
  }, [userId, admin, chapterChat, input]);
  return <div className="rdmc-voice" ref={host}/>;
}
