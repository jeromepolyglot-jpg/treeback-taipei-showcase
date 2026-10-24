function Ext({ url, text }: { url: string; text: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {text} ↗
    </a>
  );
}

export function SourcesPage() {
  return (
    <>
      <div className="section-top">
        <div>
          <p className="eyebrow">DATA / METHOD / LIMITS</p>
          <h1 className="page-title">每個數字，都要知道它從哪裡來。</h1>
        </div>
        <a className="outline-btn" href="/downloads/simulation-inputs.csv" download>
          ↓ 原始情境 CSV
        </a>
      </div>

      <section className="method-intro">
        <div>
          <span className="eyebrow">TreeBack 地方化模型</span>
          <h3>
            TES 是模型輸出，
            <br />
            不是事實的標籤。
          </h3>
          <p>
            區級儀表板沿用前次情境輸入。沒有實測、沒有 AI
            推估，也沒有用最新官方人口／熱圖回算此處 12
            區分數。權重調整只會改變這組假設的結果。
          </p>
        </div>
        <div className="method-formula">
          <code>
            G = clip(1 − C / C_goal, 0, 1)
            <br />S = wH·H + wP·P + wV·V
            <br />PPI = 100·G·(0.5 + 0.5·S)
            <br />TES = 100 − PPI
          </code>
          <p>
            C_goal 固定為 24% 假設。wH + wP + wV = 1。
            <br />
            TES 與 PPI 相加為 100，非 American Forests 官方算法。
          </p>
        </div>
      </section>

      <div className="definitions">
        <article>
          <b>C / 街道樹冠率</b>
          <p>
            以百分比表示的假設值。非整區綠覆率，不包括以山林面積替代街道生活圈樹蔭。
          </p>
        </article>
        <article>
          <b>H / 熱暴露</b>
          <p>
            0–1 情境代理值，並非氣溫、體感溫度、衛星地表溫度或百分位數。
          </p>
        </article>
        <article>
          <b>P / 人口暴露</b>
          <p>
            0–1 情境代理值，並非真實人口密度、通勤人流或人數。
          </p>
        </article>
        <article>
          <b>V / 熱脆弱度</b>
          <p>
            0–1 情境代理值，並非本次計算的長者／兒少比例或個人健康資料。
          </p>
        </article>
      </div>

      <section className="field-section">
        <h2>可用圖資與它不能回答的問題</h2>
        <div className="source-list">
          <article>
            <span>01</span>
            <div>
              <h3>
                <Ext
                  url="https://data.taipei/dataset/detail?id=7a49d00c-a5ff-4a6b-be9e-aaa6dc1ff7e8"
                  text="公園處行道樹、公園樹與樹穴"
                />
              </h3>
              <p>
                樹木 ID、路段、TWD97
                點位、調查／更新日期；樹穴編號、穴形與面積。不定期更新，下載快照須另行留存。
              </p>
              <small>
                缺口：有樹穴不代表現況空置；物件匹配不代表健康或有權種植。
              </small>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>
                <Ext url="https://data.gov.tw/dataset/134905" text="新工處人行道範圍圖" />
              </h3>
              <p>
                行政區、道路名、路段起訖、單側、寬度欄位和 TWD97
                幾何，可建抽樣框。不定期更新。
              </p>
              <small>
                缺口：資料寬度不是現場有效通行淨寬；詮釋更新日不是測量日期。
              </small>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>
                <Ext
                  url="https://data.gov.tw/dataset/134908"
                  text="新工處人行道固定設施物：樹穴"
                />
              </h3>
              <p>
                ObjectID、Town_N、X_3826 / Y_3826
                與幾何，作樹穴位置線索。沒有空置鑑定欄位。
              </p>
              <small>
                缺口：沒有匹配僅是資料未匹配，不可宣稱樹已被砍或樹穴已空。
              </small>
            </div>
          </article>
          <article>
            <span>04</span>
            <div>
              <h3>
                <Ext
                  url="https://data.taipei/dataset/detail?id=a6394e3f-3514-4542-87bd-de4310a40db3"
                  text="臺北市各里人口數按年齡分"
                />
              </h3>
              <p>
                月更新里別戶籍人口與年齡，可作居住暴露及年齡需求代理。要保存統計月份，避免混用年度。
              </p>
              <small>
                缺口：不是白天實際使用人口、路段行人流或個人風險資料。
              </small>
            </div>
          </article>
          <article>
            <span>05</span>
            <div>
              <h3>
                <Ext url="https://taipei-tree-cover.pages.dev/" text="台北樹冠觀測" /> ／{" "}
                <Ext
                  url="https://www.mdpi.com/2413-8851/9/10/417"
                  text="夏季熱島研究"
                />
              </h3>
              <p>
                前者比較 2024–2026
                同季可判讀範圍；後者以 2018–2023
                測站資料做空間插值。可作研究背景，不是本網站 C / H 輸入。
              </p>
              <small>
                缺口：樹冠面積變化不等於當前街道樹冠率；插值格距不等於測站真實解析力。不能把研究年代說成即時。
              </small>
            </div>
          </article>
          <article>
            <span>06</span>
            <div>
              <h3>街道影像：自攝或逐筆核驗的授權來源</h3>
              <p>
                保存拍攝時間、觀察窗、道路單側與使用權。缺影像保留
                null。不由陰影推斷全年樹蔭，更不量測土壤與管線。
              </p>
              <small>
                <Ext
                  url="https://about.google/brand-resource-center/products-and-services/geo-guidelines"
                  text="Google Street View 限制"
                />
                ：不截圖／下載，不人工描繪／編碼成資料庫或 AI 提取特徵。僅作外部位置參考。
              </small>
            </div>
          </article>
        </div>
      </section>

      <section className="field-section">
        <h2>如何讓下一版可用於真實討論？</h2>
        <div className="sampling-rule">
          <p>
            先取得同年度、同街道／步行範圍的樹冠、熱暴露與人口資料，定義正規化參照、缺值規則、資料信心與樹冠目標；在格網／里別計算後，才以公開的匯總規則做行政區比较。現版本直接手填
            0–1 情境值，沒有正規化原始數據，不能以此分配市府經費。
          </p>
          <p>
            高 TES 也可能是目標設定或代理值造成。模型未納入管線、維護、道路法規與樹種適地性；它從不授予植樹或施工權利。
          </p>
        </div>
      </section>
    </>
  );
}
