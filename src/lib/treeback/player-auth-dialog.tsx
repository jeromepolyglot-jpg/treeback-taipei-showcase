import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { usePlayer } from './player-auth';

export function PlayerAuthDialog({ open, onOpenChange, title, description }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string }) {
  const { recovery } = usePlayer();
  const [mode, setMode] = useState<'login'|'signup'|'reset'>('login');
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [recovered, setRecovered] = useState(false);
  const changing = recovery && !recovered;
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      if (changing) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setRecovered(true); onOpenChange(false); setPassword('');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage('若此信箱已有帳號，將收到重設密碼的連結。');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setMessage('請查看信箱並確認帳號，確認後即可登入。');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onOpenChange(false); setPassword('');
      }
    } catch { setMessage('無法完成，請確認帳號、密碼或稍後重試；新帳號需先確認信箱。'); }
    finally { setBusy(false); }
  }
  async function social(provider: 'google'|'lovable') {
    setBusy(true); setMessage('');
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) onOpenChange(false);
    } catch { setMessage('登入未完成，請重試。'); }
    finally { setBusy(false); }
  }
  return <Dialog open={open || changing} onOpenChange={value=>{if(!changing)onOpenChange(value);}}><DialogContent className="oasis-dialog"><DialogTitle>{changing ? '設定新密碼' : mode==='signup' ? '建立玩家帳號' : mode==='reset' ? '重設密碼' : title}</DialogTitle><DialogDescription>{description}</DialogDescription>
    {!changing && mode!=='reset' && <div className="grid gap-2"><Button variant="outline" disabled={busy} onClick={()=>social('google')}>使用 Google 繼續</Button><Button className="lovable-auth-button" disabled={busy} onClick={()=>social('lovable')}>Continue with Lovable</Button></div>}
    <form onSubmit={submit} className="grid gap-3">{!changing && <label className="grid gap-1 text-sm">電子信箱<Input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>}{(changing || mode!=='reset') && <label className="grid gap-1 text-sm">{changing?'新密碼':'密碼'}<Input type="password" autoComplete={mode==='signup'||changing?'new-password':'current-password'} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/></label>}<Button type="submit" disabled={busy}>{busy?'處理中…':changing?'更新密碼':mode==='signup'?'建立帳號':mode==='reset'?'寄送重設連結':'登入'}</Button></form>
    {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}{!changing && <div className="flex flex-wrap gap-2"><Button variant="ghost" size="sm" onClick={()=>{setMode(mode==='signup'?'login':'signup');setMessage('');}}>{mode==='signup'?'已有帳號？登入':'建立帳號'}</Button><Button variant="ghost" size="sm" onClick={()=>{setMode(mode==='reset'?'login':'reset');setMessage('');}}>{mode==='reset'?'返回登入':'忘記密碼'}</Button></div>}
  </DialogContent></Dialog>;
}
