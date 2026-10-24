import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlayer } from "./player-auth";
import { PlayerAuthDialog } from "./player-auth-dialog";

export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = usePlayer();
  const { pathname } = useLocation();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const submit = async () => {
    const text = message.trim();
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (text.length < 2) {
      toast.error("請寫下至少 2 個字的回饋");
      return;
    }
    if (text.length > 500) {
      toast.error("回饋請控制在 500 字以內");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("user_feedback").insert({
      user_id: user.id,
      message: text,
      page: pathname,
    });
    setSending(false);
    if (error) {
      toast.error("送出失敗，請稍後重試");
      return;
    }
    toast.success("謝謝你的回饋！我們會認真閱讀。");
    setMessage("");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="oasis-dialog">
          <DialogTitle>意見回饋</DialogTitle>
          <DialogDescription>
            對 TreeBack 的想法、建議或發現的問題，都歡迎告訴我們。回饋只有管理員看得到。
          </DialogDescription>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={500}
            placeholder="例如：希望地圖可以顯示更多行政區…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              font: "inherit",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={submit} disabled={sending}>
              <Send size={14} /> {sending ? "送出中…" : user ? "送出回饋" : "登入後送出"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PlayerAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        title="登入後送出回饋"
        description="回饋會連結到你的帳號，方便我們後續回覆。"
      />
    </>
  );
}
