import { useState } from 'react';
import { LogIn, LogOut, Cloud, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from './player-auth';
import { PlayerAuthDialog } from './player-auth-dialog';

export function OasisAccount({ status, retry }: { status: string; retry: () => void }) {
  const { user } = usePlayer();
  const [open, setOpen] = useState(false);
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3">
    <span className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><Cloud size={16}/>{status === 'guest' ? '訪客遊戲 · 尚未保存' : status === 'loading' ? '正在讀取進度…' : status === 'saving' ? '正在保存…' : status === 'saved' ? '進度已保存' : '進度未同步，請重試'}</span>
    <div className="flex flex-wrap items-center gap-2">{status === 'error' && <Button variant="outline" size="sm" onClick={retry}><RefreshCw/>重試保存</Button>}{user ? <><span className="max-w-48 truncate text-sm text-muted-foreground">{user.email}</span><Button variant="ghost" size="sm" disabled={status==='saving'} onClick={async()=>{await supabase.auth.signOut();}}><LogOut/>登出</Button></> : <Button size="sm" onClick={()=>setOpen(true)}><LogIn/>登入保存進度</Button>}</div>
    <PlayerAuthDialog open={open} onOpenChange={setOpen} title="登入城市綠洲" description="登入後接續你的街區與三種角色進度；存檔只有你能查看。"/>
  </div>;
}
