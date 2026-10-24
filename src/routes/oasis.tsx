import { createFileRoute } from '@tanstack/react-router';
import { TreeBackShell } from '@/lib/treeback/shell';
import { OasisPage } from '@/lib/treeback/oasis-page';
export const Route = createFileRoute('/oasis')({
  head: () => ({ meta: [
    { title: 'TreeBack｜模擬城市綠洲・台北見縫插樹遊戲' },
    { name: 'description', content: '扮演市民、科企或政府人員，在虛構台北街區種樹、還原土壤、守護老樹。所有預算與生態效益皆為遊戲設定，非實測資料。' },
    { property: 'og:title', content: 'TreeBack｜模擬城市綠洲' },
    { property: 'og:description', content: '從一個空樹穴開始，探索綠色公民行動。可互動的台北街區遊戲，清楚區分遊戲參數與科學證據。' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <TreeBackShell hero={false}><OasisPage/></TreeBackShell>,
});