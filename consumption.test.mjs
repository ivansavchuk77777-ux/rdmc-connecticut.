import test from 'node:test';
import assert from 'node:assert/strict';
import {monthRange, summarizeConsumption, validateConsumption} from './consumption.mjs';

test('month boundaries include leap February and December rollover', () => {
  assert.deepEqual(monthRange('2028-02'), {start:'2028-02-01', end:'2028-03-01'});
  assert.deepEqual(monthRange('2026-12'), {start:'2026-12-01', end:'2027-01-01'});
  assert.throws(() => monthRange('2026-13'));
});
test('independent usage entries add together, voids do not count, empty members remain visible', () => {
  const result = summarizeConsumption([{id:'a',name:'Member A'}, {id:'b',name:'Member B'}], [
    {member_id:'a',product:'Beer',quantity:2},
    {member_id:'a',product:'Beer',quantity:3},
    {member_id:'a',product:'Water',quantity:1},
    {member_id:'b',product:'Chips',quantity:7,voided_at:'2026-10-29'},
  ]);
  assert.equal(result.total, 6);
  assert.equal(result.totals.Beer, 5);
  assert.equal(result.rows[0].counts.Water, 1);
  assert.equal(result.rows[1].total, 0);
});
test('quantity and date validation reject fractions, future dates and impossible dates', () => {
  const draft = {member_id:'a',product:'Beer',quantity:'1',used_on:'2026-10-29'};
  assert.equal(validateConsumption(draft, '2026-10-29'), '');
  for (const quantity of ['0','-1','1.2','1000','NaN']) assert.ok(validateConsumption({...draft, quantity},'2026-10-29'));
  assert.ok(validateConsumption({...draft,used_on:'2026-10-30'},'2026-10-29'));
  assert.ok(validateConsumption({...draft,used_on:'2026-02-30'},'2026-10-29'));
  assert.ok(validateConsumption({...draft,product:'Other'},'2026-10-29'));
});
