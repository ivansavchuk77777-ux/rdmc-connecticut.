import React, {useEffect, useState} from 'react';
import {Capacitor, registerPlugin} from '@capacitor/core';

export const appleRegistration = Capacitor.getPlatform() === 'ios';
const store = registerPlugin('RDMCRegistration');

export function Registration({onRegister, onBack}) {
  const [item, setItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const status = await store.status();
        if (active) setItem(status);
      } catch (error) {
        if (active) { setItem({priceUnavailable: true}); setMessage(error.message); }
      }
    }
    refresh();
    const listener = store.addListener('registrationChanged', refresh);
    return () => { active = false; listener.then(handle => handle.remove()).catch(() => {}); };
  }, []);

  async function perform(action) {
    setBusy(true);
    setMessage('');
    try {
      if (action === 'retry') {
        setItem(await store.status());
      } else if (action === 'register') {
        if ((await store.status()).owned) await onRegister();
        else setMessage('Restore your purchase to continue.');
      } else {
        const result = action === 'restore' ? await store.restore() : await store.purchase();
        if (result.owned) {
          setItem({owned: true});
          if (action === 'restore') setMessage('Registration purchase restored.');
        }
        else if (result.pending) setMessage('Your purchase is pending Apple approval.');
        else if (action === 'restore') setMessage('Apple found no registration purchase for this Apple Account.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally { setBusy(false); }
  }

  return <div className="registration">
    <h3>One-time registration</h3>
    <p>Register an RDMC account for a one-time fee in addition to the app download. Ivan approves membership and separately controls access to member contacts.</p>
    {item?.owned
      ? <button disabled={busy} onClick={() => perform('register')}>Complete registration</button>
      : item?.priceUnavailable ? <button disabled={busy} onClick={() => perform('retry')}>Retry App Store price</button>
      : <button disabled={busy || !item?.price} onClick={() => perform('purchase')}>
          {item?.price ? 'Register for ' + item.price : 'Checking App Store price…'}
        </button>}
    <button className="secondary" disabled={busy} onClick={() => perform('restore')}>Restore Purchase</button>
    <button className="secondary" disabled={busy} onClick={onBack}>Back to account details</button>
    {message && <p role="status">{message}</p>}
  </div>;
}
