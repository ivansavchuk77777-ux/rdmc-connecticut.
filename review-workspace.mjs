// Queries operate only on synthetic fixtures and the dedicated review account journal.
export const reviewEmail = 'app-review@rdmcfairfieldcounty.us';
export const sessionKey = 'rdmc.review.session.v1';

const reviewer = {id: 'review-member', email: reviewEmail};

function sampleRecords() {
  const today = new Date();
  const nextRide = new Date(today.getTime() + 7 * 86400000).toISOString();
  const created = today.toISOString();
  return {
    profiles: [{...reviewer, full_name: 'Sample Member', chapter: 'Fairfield County', country: 'United States', role: 'member', access_scope: 'ct_member', subscription_status: 'exempt'}],
    member_directory: [{id:'sample-directory', name:'Alex Rider', title:'Sample member', chapter:'Fairfield County', sort_order:1}],
    inventory_items: [{id:'sample-inventory', item_name:'Ride water bottles', quantity:12, category:'Supplies', sort_order:1}],
    events: [{id:'sample-ride', title:'Sample chapter ride', event_type:'ride', starts_at:nextRide, location:'Sample meeting point', details:'Meet for the chapter ride.'}],
    announcements: [{id:'sample-news', title:'Chapter ride', body:'The next sample ride is on the calendar.', created_at:created}],
    club_tasks: [{id:'sample-task', title:'Prepare ride supplies', category:'Club', completed:false, created_at:created}],
    member_chat: [{id:'sample-message', author_id:reviewer.id, body:'Welcome to the sample chapter.', created_at:created}],
    consumption_members: [{id:'sample-roster', name:'Alex Rider', sort_order:1}],
    consumption_entries: [{id:'sample-entry', member_id:'sample-roster', product:'Water', quantity:2, used_on:created.slice(0,10), created_at:created, voided_at:null}],
    background_checks: [], zoom_meetings: [], account_deletion_requests: []
  };
}

export function createReviewWorkspace(storage, leave, request) {
  const fixtures = sampleRecords();
  async function journal(action = 'read', message = null) {
    const result = await request(storage.getItem(sessionKey), action, message);
    if (result.error) throw new Error(result.error.message);
    return result.data;
  }
  const listeners = new Set();
  const error = message => ({data:null, error:{message}});
  function from(table) {
    const filters = [], orders = [];
    let first = 0, last = Infinity, single = false, head = false, insertion;
    const query = {
      select(_columns, options = {}) { head = options.head; return query; },
      eq(key, value) { filters.push(row => row[key] === value); return query; },
      is(key, value) { return query.eq(key, value); },
      gte(key, value) { filters.push(row => row[key] >= value); return query; },
      lt(key, value) { filters.push(row => row[key] < value); return query; },
      order(key, {ascending = true} = {}) { orders.push({key, ascending}); return query; },
      limit(n) { last = n - 1; return query; },
      range(start, end) { first = start; last = end; return query; },
      single() { single = true; return query; },
      maybeSingle() { single = true; return query; },
      insert(values) { insertion = values; return query; },
      then(resolve, reject) {
        return Promise.resolve().then(async () => {
          if (!Object.prototype.hasOwnProperty.call(fixtures, table)) return error('Unavailable in the sample workspace.');
          if (insertion) {
            if (!['member_chat', 'account_deletion_requests'].includes(table)) return error('Member access required.');
            const entries = await journal(table === 'member_chat' ? 'chat' : 'deletion', insertion.body);
            const matches = entries.filter(entry => entry.table_name === table);
            const row = matches[matches.length - 1];
            for (const listener of listeners) if (listener.table === table) listener.refresh();
            return {data:single ? row : [row], error:null};
          }
          const saved = await journal();
          let rows = [...fixtures[table], ...saved.filter(row => row.table_name === table)].filter(row => filters.every(filter => filter(row)));
          for (const {key, ascending} of [...orders].reverse()) {
            rows.sort((a,b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (ascending ? 1 : -1));
          }
          const count = rows.length;
          rows = rows.slice(first, last + 1);
          return {data:head ? null : single ? rows[0] ?? null : rows, count, error:null};
        }).catch(e=>error(e.message)).then(resolve,reject);
      }
    };
    return query;
  }
  return {
    from,
    auth:{
      getUser:async () => ({data:{user:reviewer}, error:null}),
      onAuthStateChange:() => ({data:{subscription:{unsubscribe(){}}}}),
      signOut:async () => { try { await journal('logout'); } finally { storage.removeItem(sessionKey); leave(); } return {error:null}; }
    },
    channel() {
      const handlers = [];
      return {
        on(_type, filter, refresh) { handlers.push({table:filter.table,refresh}); return this; },
        subscribe(status) { handlers.forEach(h=>listeners.add(h)); status?.('SUBSCRIBED'); return this; },
        unsubscribe() { handlers.forEach(h=>listeners.delete(h)); }
      };
    },
    removeChannel(channel) { channel.unsubscribe(); },
    functions:{invoke:async () => error('External provider actions are unavailable in the sample workspace.')}
  };
}
