import { useState } from "react";

function Ext({ url, text }: { url: string; text: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {text} ↗
    </a>
  );
}

const EXAMPLE_ROWS = ["DT", "WH"].flatMap((d) =>
  ["A", "B", "C"].map((s) => ({
    id: `EX-${d}-${s}`,
    area: `${d === "DT" ? "大同" : "萬華"}／${s}`,
    basis:
      s === "A"
        ? "樹穴＋樹木快照"
        : s === "B"
          ? "生活設施＋自攝遮蔭"
          : "公共範圍＋硬鋪面線索",
  })),
);

export function FieldworkPage() {
  const [corridor, setCorridor] = useState<"dt" | "wh">("dt");

  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">48H / FIELDWORK PLAYBOOK</p>
          <h1 className="page-title">從一段路，找回日常的樹蔭。</h1>
          <p className="muted">
            大同與萬華是原型先導區，不是已證實最缺蔭區。以下是作業計畫，尚未實際盤點。
          </p>
        </div>
        <a className="outline-btn" href="/downloads/site-sampling-plan.md" download>
          ↓ 完整作業規格
        </a>
      </div>

      <div className="field-intro">
        <div className="field-lead">
          <span className="eyebrow">先縮小範圍，才能精準查核。</span>
          <h3>
            60 個抽樣單位
            <br />≠ 60 個植樹點
          </h3>
          <p>
            每區 30 個「100 公尺街段 × 單側」單位。每區 3
            層，各 8 個需求定向 + 2 個固定對照。共規劃最多 12
            個候選點有限現勘。
          </p>
          <p className="field-boundary">
            抽樣框、已取得合法影像、已現勘、獲核准：四種數字分開公布。缺資料不硬湊，權管未確認不標可種。
          </p>
        </div>
        <div className="field-scope">
          <div>
            <b>30 + 30</b>
            <span>街段單側抽樣目標</span>
          </div>
          <div>
            <b>3 × 10</b>
            <span>每區分層配置</span>
          </div>
          <div>
            <b>6 + 6</b>
            <span>候選點現勘上限</span>
          </div>
          <div>
            <b>8–12 / 區</b>
            <span>候選記錄目標，非保證</span>
          </div>
        </div>
      </div>

      <section className="field-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">01 / SEARCH CORRIDORS</p>
            <h2>用走廊建立抽樣框，不捏造點位。</h2>
          </div>
          <div className="segmented">
            <button
              className={corridor === "dt" ? "active" : ""}
              aria-pressed={corridor === "dt"}
              onClick={() => setCorridor("dt")}
            >
              大同區
            </button>
            <button
              className={corridor === "wh" ? "active" : ""}
              aria-pressed={corridor === "wh"}
              onClick={() => setCorridor("wh")}
            >
              萬華區
            </button>
          </div>
        </div>
        {corridor === "dt" ? (
          <div className="corridor-card">
            <div>
              <span className="small-tag">大同 · 起始搜尋假設</span>
              <h3>延平北路 × 重慶北路 × 民生西路</h3>
              <p>
                先以民生西路至民權西路之間的延平北路、重慶北路及相鄰生活街段建立小範圍抽樣框，再查站點、學校、市場與既有樹穴圖層。起訖、單側、人行道幾何都須行政界核對後才確定。
              </p>
            </div>
            <div className="corridor-notes">
              <b>大同的查核重點（假設）</b>
              <p>
                比較有騎樓與無騎樓路段；分開記錄棚蔭與樹蔭。既有樹穴訊號優先核對，狹窄巷弄不以破壞通行換取植樹。
              </p>
              <span>道路名稱不是缺蔭證據，未執行現勘。</span>
            </div>
          </div>
        ) : (
          <div className="corridor-card">
            <div>
              <span className="small-tag">萬華 · 起始搜尋假設</span>
              <h3>康定路 × 西園路 × 萬大路</h3>
              <p>
                先在桂林路至和平西路三段之間的康定路、西園路一段周邊建框；若合法影像或樣本不足，再記錄範圍變更理由後搜尋萬大路生活動線。文化徑僅證明步行路線存在，不代表缺蔭。
              </p>
            </div>
            <div className="corridor-notes">
              <b>萬華的查核重點（假設）</b>
              <p>
                比較文化／市場生活動線與一般住宅路段。記錄商家占用、站點候車空間與無障礙連續性；古蹟、私人騎樓和市場邊界不能自行視為公有種植地。
              </p>
              <span>
                <Ext
                  url="https://danlantrail.necoast-nsa.gov.tw/Trails-Content.aspx?a=3411&l=1&listid=3425&fromCnt=0"
                  text="艋舺文化徑官方路線"
                />
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="field-section">
        <p className="eyebrow">02 / TWO SEPARATE GATES</p>
        <h2>需求值得優先，不代表現地可以種。</h2>
        <div className="two-gates">
          <article>
            <span className="gate-number">A</span>
            <h3>需求與線索初篩</h3>
            <ol>
              <li>以 EPSG:3826 做行政界裁切，建立 100 m 單側穩定樣本 ID。</li>
              <li>
                疊加樹木、樹穴與人行道；以 5 m
                做物件匹配初查，另看 2 / 10 m 敏感度。
              </li>
              <li>
                檢視生活設施、人流代理與合法來源遮蔭線索；區級假設 TES 不下放到路段。
              </li>
              <li>未匹配只標「待核」，缺值保留 null，不把無資料視為無樹。</li>
            </ol>
            <span className="gate-result">
              結果：待查核線索／需補證，不是空穴清單。
            </span>
          </article>
          <article>
            <span className="gate-number">B</span>
            <h3>可行性逐項待查</h3>
            <ul>
              <li>土地與道路權管、種植許可與養護責任。</li>
              <li>有效通行淨寬、無障礙、出入口和路口視距。</li>
              <li>管線、箱體、號誌、路燈及既有根域衝突。</li>
              <li>土壤、排水、覆土深度與長期樹冠生長空間。</li>
            </ul>
            <p>
              志工可提供現場證據，不自行判定法規通過。未完成主管或專業確認，仍保留待查。
            </p>
            <span className="gate-result">
              結果：後續評估候選／需補證／不納入本輪。
            </span>
          </article>
        </div>
      </section>

      <section className="field-section">
        <p className="eyebrow">03 / STRATIFIED SAMPLING</p>
        <h2>每區三層，避免只拍看起來最缺樹的地方。</h2>
        <div className="strata">
          <article>
            <span>A / 10</span>
            <h3>既有樹穴待核對</h3>
            <p>
              有物件 ID 的樹穴或匹配歧義。先確認同一側、同一空間；不以無匹配推論已空置。
            </p>
          </article>
          <article>
            <span>B / 10</span>
            <h3>生活動線缺蔭線索</h3>
            <p>
              站點、學校、社福／市場周邊道路。遮蔭只由自攝或允許衍生資料的授權影像記錄。
            </p>
          </article>
          <article>
            <span>C / 10</span>
            <h3>硬鋪面／開放邊緣</h3>
            <p>
              以官方土地／公共設施線索建立抽樣框。權屬不明列待查，不以山區或郊區補數。
            </p>
          </article>
        </div>
        <div className="sampling-rule">
          <b>每層 8 + 2，兩區共 48 個定向 + 12 個對照。</b>
          <p>
            先抽對照，再從未入選單位取定向名額，確保不重複。依穩定鍵排序與固定 seed
            可重抽；同層最多 5 個備取。不足不跨層湊數。這是先導探索樣本，不用來估算整區空穴率。
          </p>
        </div>
      </section>

      <section className="field-section">
        <p className="eyebrow">04 / IMAGE EVIDENCE</p>
        <h2>街景是證據來源，不是量測捷徑。</h2>
        <div className="two-gates">
          <article>
            <h3>合法影像與抽樣位置</h3>
            <p>
              首選本計畫自攝，或已逐筆確認可保存、標註和衍生特徵的授權影像。每 100
              m 單側分成四個 25 m
              觀察窗，在各窗中點 12.5 / 37.5 / 62.5 / 87.5 m
              取景；每窗前後各一張，若視線遮擋增加側向照片。
            </p>
            <p>
              規劃最多 12 個現勘候選的所在街段補攝，目標 96
              張基本取景；實際數量受安全、天候和授權取得影響。60
              段是抽樣框目標，不保證全有影像。
            </p>
          </article>
          <article>
            <h3>每次觀察必須留存</h3>
            <p>
              來源與使用權、拍攝日期／時間、位置精度、道路單側、朝向、影像清晰度、樹冠／棚蔭／曝曬分開標籤、障礙物與審閱者。
            </p>
            <p>
              Google Street View 僅作外部位置參考；不保存截圖，不人工描繪／編碼成資料庫，也不以
              AI 擷取特徵。現場量測／主管確認不可由街景代替。
            </p>
            <span>
              <Ext
                url="https://about.google/brand-resource-center/products-and-services/geo-guidelines"
                text="Google 影像使用規範"
              />
            </span>
          </article>
        </div>
        <div className="sampling-rule">
          <b>路段桌面代理 DSA48 與 TES 分開。</b>
          <p>
            只在合法來源的四窗中記錄曝曬／遮蔭線索；不可判讀為
            null，至少 3 個有效窗才顯示「有效窗曝曬比例」。不同時刻、季節與棚蔭不可推成全年樹蔭率或熱實測。
          </p>
        </div>
      </section>

      <section className="field-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">05 / RECORD TEMPLATE</p>
            <h2>把「還不知道」也記錄下來。</h2>
          </div>
          <a className="outline-btn" href="/downloads/candidate-template.csv" download>
            ↓ 空白候選紀錄 CSV
          </a>
        </div>
        <p className="muted small">
          下列 6 筆是工作類型與格式示例，不是實際候選點；目前沒有位置、照片或已核對結果。
        </p>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">候選工作格式示例，非實際觀測點位</caption>
            <thead>
              <tr>
                <th scope="col">示例 ID</th>
                <th scope="col">區／層</th>
                <th scope="col">資料依據（待取得）</th>
                <th scope="col">需求指標</th>
                <th scope="col">可行性待查</th>
                <th scope="col">狀態</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.area}</td>
                  <td>{row.basis}</td>
                  <td>null · 尚無路段評分</td>
                  <td>淨寬／管線／權管／根域</td>
                  <td>
                    <span className="status-tag">格式示例 · 未觀測</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          狀態機：線索 → 需補證 → 現勘紀錄 → 主管／專業評估。所有本輪結果仍非核准植樹點。
        </p>
      </section>

      <section className="field-section">
        <p className="eyebrow">06 / 48-HOUR DELIVERY</p>
        <h2>兩天能做的，是可追溯的下一步。</h2>
        <div className="timeline">
          <article>
            <span>00—08h</span>
            <h3>鎖定來源與範圍</h3>
            <p>保留原始快照，轉公尺座標，建立行政界與單側道路框。</p>
          </article>
          <article>
            <span>08—24h</span>
            <h3>建立分層抽樣框</h3>
            <p>記錄 seed、來源授權、備取及缺口。網站權重互動同步完成。</p>
          </article>
          <article>
            <span>24—36h</span>
            <h3>白天有限現勘</h3>
            <p>兩區各最多 6 點，至少兩人一組；安全中止不改成已確認。</p>
          </article>
          <article>
            <span>36—48h</span>
            <h3>複核與封存</h3>
            <p>兩區三層各 2 筆盲抽複核，共 12 筆。公布實做數，不交付種植許可。</p>
          </article>
        </div>
        <div className="scope-warning">
          <strong>不在 48h 承諾內：</strong>
          全區空穴普查、夏季熱實測、地下管線勘探、樹種設計、跨局處核准、施工或實際補植。當前網頁提供方案與模擬功能，未代團隊執行現場工作。
        </div>
      </section>
    </>
  );
}
