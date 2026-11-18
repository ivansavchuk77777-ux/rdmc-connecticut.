import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewWorkspace, sessionKey} from './review-workspace.mjs';

test('review member uses synthetic records, can post, reload, and sign out', async () => {
  const keys = new Map([[sessionKey, 'active']]);
  const storage = {getItem:k=>keys.get(k), setItem:(k,v)=>keys.set(k,v), removeItem:k=>keys.delete(k)};
  let left = false;
  const journal = [];
  const request = async (_token,action,text) => {
    if (action === 'chat') journal.push({table_name:'member_chat',author_id:'review-member',body:text});
    return {data:journal,error:null};
  };
  const client = createReviewWorkspace(storage, () => {left = true;}, request);
  const {data:{user}} = await client.auth.getUser();
  const profile = await client.from('profiles').select('*').eq('id', user.id).single();
  assert.equal(profile.data.role, 'member');
  assert.equal(profile.data.access_scope, 'ct_member');
  assert.equal((await client.from('member_directory').select('id',{head:true})).count, 1);
  assert.equal((await client.from('private_records').select('*')).data, null);
  assert.ok((await client.functions.invoke('create-background-check')).error);
  await client.from('member_chat').insert({body:'Review message', author_id:user.id});
  const restored = createReviewWorkspace(storage, () => {}, request);
  assert.equal((await restored.from('member_chat').select('*').eq('body','Review message').single()).data.author_id, user.id);
  await client.auth.signOut();
  assert.equal(left, true);
  assert.equal(keys.size, 0);
});
