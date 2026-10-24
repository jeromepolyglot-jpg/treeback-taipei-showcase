import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { initialProgress, type Progress } from './oasis-progress';
import { loadOasisProgress, saveOasisProgress } from './oasis-progress.functions';
import { usePlayer } from './player-auth';

export function useOasisProgress() {
  const { user, loading } = usePlayer();
  const [progress, setProgress] = useState(initialProgress);
  const [status, setStatus] = useState<'guest'|'loading'|'saving'|'saved'|'error'>('loading');
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const owner = useRef<string | null>(null);
  const latest = useRef(progress);
  latest.current = progress;
  const load = useServerFn(loadOasisProgress), save = useServerFn(saveOasisProgress);
  useEffect(() => {
    if (loading) return;
    let active = true;
    const id = user?.id ?? null;
    const previous = owner.current;
    owner.current = id;
    setReadyFor(null);
    if (!id) {
      if (previous) setProgress(initialProgress());
      setStatus('guest');
      return;
    }
    setStatus('loading');
    load().then(saved => {
      if (!active) return;
      setProgress(saved ?? (previous && previous !== id ? initialProgress() : latest.current));
      setReadyFor(id);
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [user?.id, loading, load, retry]);
  useEffect(() => {
    const id = user?.id;
    if (!id || readyFor !== id) return;
    const n = ++revision.current;
    setStatus('saving');
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (owner.current !== id) return;
      await save({ data: progress });
    }).then(() => { if (owner.current === id && revision.current === n) setStatus('saved'); }).catch(() => { if (owner.current === id && revision.current === n) setStatus('error'); });
  }, [progress, readyFor, user?.id, save]);
  function retrySave() {
    if (readyFor) setProgress(p => ({ ...p }));
    else setRetry(n => n + 1);
  }
  return { progress, setProgress, status, retrySave, blocked: loading || (!!user && readyFor !== user.id) };
}