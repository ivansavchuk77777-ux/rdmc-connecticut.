import {createClient} from '@supabase/supabase-js';
import {reviewEmail, sessionKey, createReviewWorkspace} from './review-workspace.mjs';

const projectUrl = 'https://xvejpoblnoxidshrykte.supabase.co';
const publishableKey = 'sb_publishable_0cVlRcxK1DwKtovHSWjE4Q_sMvv1xr2';
async function reviewRpc(name, args) {
  try {
    const response = await fetch(projectUrl + '/rest/v1/rpc/' + name, {
      method:'POST', headers:{apikey:publishableKey,'Content-Type':'application/json'},
      body:JSON.stringify(args)
    });
    const data = await response.json();
    if (!response.ok) return {error:{message:data.message || 'Review account unavailable.'}};
    return {data,error:null};
  } catch {
    return {error:{message:'Could not reach the review account. Check your connection and try again.'}};
  }
}
export const inReviewWorkspace = Boolean(sessionStorage.getItem(sessionKey));
export const supabase = inReviewWorkspace
  ? createReviewWorkspace(sessionStorage, () => location.reload(),
    (token, action, message) => reviewRpc('rdmc_review_records',{session_token:token,action_name:action,message_body:message}))
  : createClient(projectUrl, publishableKey);

export async function signInMember({email, password}) {
  if (email.trim().toLowerCase() !== reviewEmail) return supabase.auth.signInWithPassword({email,password});
  const {data,error} = await reviewRpc('rdmc_review_login',{login_email:email,login_password:password});
  if (error) return {error};
  sessionStorage.setItem(sessionKey,data);
  location.reload();
  return {error:null};
}
