<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules

- The oasis game lives under `/oasis`, with pure game rules isolated from evidence-backed pages; authenticated players persist all role sessions and pending events in owner-scoped `oasis_progress` through authenticated server functions, while guests remain session-only. Why: progress must survive return visits without exposing or mixing player saves.

- The TreeBack app pages live in `src/lib/treeback/` (shell, dashboard, fieldwork,
  sources) behind routes `/`, `/fieldwork`, `/sources`, and the shared header,
  hero, disclaimer and footer come from `TreeBackShell`; content pages pass
  `hero={false}` so each page keeps exactly one `h1`. Why: the dashboard hero is
  only the dashboard's, and repeating it pushed real content below the fold.
- Styles imported from the upstream repository stay scoped under `.tb`; never
  add an unscoped global selector from that stylesheet. Why: the slide deck and
  the app share one stylesheet and the deck relies on the theme tokens.
- The slide deck is the Lovable slides kit: slide content in
  `src/components/Slides.tsx`, route in `src/routes/slides.tsx`; do not hand-roll
  a second deck. Why: the kit owns that route file and overwrites a hand-written
  deck.
- `https://github.com/jeromepolyglot-jpg/treeback-taipei` is a one-way upstream:
  pull its changes into this project when asked, and never assume two-way sync.
  Why: Lovable Git sync can only create a new repository, it cannot link an
  existing one.

- 見縫插樹通報存於 `tree_reports`（公開讀、登入者可寫自己的通報），照片存私密 `report-photos` 圖庫並以限時簽名連結展示；集氣走 `increment_wishes` RPC。Why: 通報要公開可見，但寫入與照片必須限定本人，且平台不允許公開圖庫。
- 登入對話框共用 `src/lib/treeback/player-auth-dialog.tsx`；需要登入的頁面用內嵌 CTA 開啟，不導向。Why: 綠洲遊戲與通報頁共用同一套登入流程，避免重複維護。
- 大樹守護訂閱存於 `tree_subscriptions`、預警存於 `tree_alerts`，兩者 RLS 皆限定本人；工程預警無公開資料來源，通知一律標示【模擬】並由使用者手動觸發。Why: 訂閱是私人資料，且沒有真實異動來源時不得假裝是真實預警。
- 認領卡分享在 `/card`，純前端 canvas 產圖（`card-model.ts` 繪製、`card-page.tsx` 互動），不落地儲存；三種卡片都必須帶資料界線聲明（通報未查證／文化局來源／遊戲參數）。Why: 分享圖會流出站外，資料界線必須跟著圖走。
- 遊戲排行榜在 `/leaderboard`，成績存 `oasis_leaderboard`（公開讀、本人可刪），發佈走 `publish_oasis_score` RPC（SECURITY DEFINER，驗證角色與暱稱），頁面與證書都標明是玩家自願發佈的虛構遊戲參數。Why: 排行榜公開但寫入必須限定本人，且遊戲數值不得冒充真實成果。
- AI 每週遊戲回顧：排程 `weekly-oasis-summary`（每週一 09:00 台北）呼叫 `/api/public/jobs/weekly-oasis-summary`，用 AI Gateway 預設模型為本週有玩的玩家產生繁中摘要存入 `oasis_weekly_summaries`（RLS 僅本人可讀），顯示在 `/records`；工作狀態（單次執行鎖、暫停原因）存 `ai_job_runs`，402/403/429 會自動暫停。Why: 排程工作必須防重複、可熔斷，且 AI 摘要屬個人資料。
- The admin console lives at `/admin` (`src/lib/treeback/admin-page.tsx`), gated by `public.has_role(uid,'admin')` against `public.user_roles`; the first signed-in user can self-claim admin only while no admin exists (bootstrap insert policy). Why: roles must never come from user-editable metadata, and the project needs a first admin without dashboard access.
- Demo datasets (simulated reports, subscriptions, alerts, leaderboard rows named 模擬玩家NNN) were seeded directly via SQL with UUIDs not tied to real auth users. Why: they are display/test data, clearly labeled as simulation per the data-integrity rule.
