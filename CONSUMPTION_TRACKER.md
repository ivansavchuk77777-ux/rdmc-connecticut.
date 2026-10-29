# Consumption tracker

The Consumption tab is inside the approved Connecticut member area. It shows monthly per-member quantities for Beer, Shots, Mixed drinks, Soda, Water and Chips. All approved chapter accounts can view the sheet and export the selected month as CSV. The owner records usage and can void mistakes; original entries remain in the usage history.

## Data and synchronization

- `consumption_members` is a private roster seeded from the approved workbook. It is separate from the phone directory and does not create login accounts.
- `consumption_entries` stores individual dated usage records. Monthly totals are derived from non-voided records, so concurrent additions do not overwrite one another.
- Postgres Changes refreshes open sheets. A 20-second polling fallback and refresh on returning to the page cover interrupted connections.
- Failed reads clear the visible sheet and disable export rather than presenting stale or partial totals as current.
- Save retries reuse the entry UUID to avoid recording a timed-out request twice.
- A downloaded Excel workbook is a separate snapshot; this does not automatically update the workbook in ChatGPT.

## Access rules

Anonymous, pending, blocked, expired and worldwide-only accounts cannot read chapter consumption records. Only the existing owner account with approved chapter access can insert entries or set `voided_at`. Quantity, product, date, recorder and original timestamp cannot be edited through the member API. Deletion is not granted.

No member names or usage records are seeded in public source. Roster data is inserted separately through authorized database access.

## Verification

Run `node --test consumption.test.mjs` and `npm run build` for the client. `supabase/consumption_access_test.sql` tests database access with a transaction that rolls back all fixtures. The test assumes the initial 12-member roster. Production roster and usage records are not changed by the test.

October 29 2026: schema and private 12-member roster installed; ledger empty; calculation, validation, build and database permission tests passed. Frontend publication and deployment authorized by the owner on October 29 2026. Signed-in browser and multiple-device synchronization checks remain to be performed after deployment.
