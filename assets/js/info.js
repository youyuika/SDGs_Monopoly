const USED_KEY = 'info_used_v1';
let used = new Set();
try { const raw = localStorage.getItem(USED_KEY); if (raw) used = new Set(JSON.parse(raw)); } catch { }
function saveUsed() { localStorage.setItem(USED_KEY, JSON.stringify([...used])); }
function markUsedImmediate(idx) {
    used.add(idx); saveUsed();
    const el = document.querySelector(`.card[data-index="${idx}"]`);
    if (el) { el.classList.add('used'); el.setAttribute('tabindex', '-1'); }
}

const DATA = {
    1: {
        q: '某新聞標題寫「吃維他命 C 可以完全預防感冒！」，你會怎麼判斷這個資訊？',
        opts: ['立刻相信，開始每天大量吃維他命 C', '查證來源，確認是否有醫學根據', '分享到群組讓大家都知道', '傳給正在感冒的朋友讓他試試看'],
        ans: 1,
        explain: '新聞標題常常誇大，正確做法是查證來源，避免被誤導。'
    },
    2: {
        q: '你在網路上看到一張「明天全國停班停課」的圖片，你該怎麼做？',
        opts: ['立刻相信，準備放假', '查詢縣市政府公告', '問朋友是不是真的'],
        ans: 1,
        explain: '颱風假資訊必須以政府公告為準。'
    },
    3: {
        q: '小安玩手機遊戲時，出現「限時10分鐘！只要300元就能抽到超稀有角色」的廣告。他應該怎麼判斷？',
        opts: ['立刻花錢抽卡，怕錯過機會', '想清楚這是商業手法，判斷自己是否真的需要', '傳給朋友，跟他一起抽', '讓朋友買給自己'],
        ans: 1,
        explain: '遊戲廣告常利用「限時、稀有」製造焦慮感。玩家要有資訊判讀力，了解這是行銷手段，不要被情緒影響而衝動消費。'
    },
    4: {
        q: '小明收到一封簡訊：「恭喜您中獎 iPhone！請點擊連結領取。」以下哪個行為較「不」合適？',
        opts: ['立刻點連結領獎', '拿去問老師或家長', '把簡訊刪掉，不理會', '以上都一樣'],
        ans: 0,
        explain: '這是常見的釣魚簡訊，點連結可能會中毒或被盜帳號，最安全的方法就是直接刪除，並告訴師長遇到避免下一位受害。'
    },
    5: {
        q: '某YouTuber說「跟著我這樣做，15分鐘教你快速減重！」，你會怎麼做？',
        opts: ['毫不猶豫跟著影片實作，期望達到快速減重的成效', '懷疑效果，查詢可靠來源驗證影片提到的方法', '直接分享給朋友'],
        ans: 1,
        explain: '自媒體創作人常藉由誇張效果，吸引觀看率，作為閱聽人要有判斷力以及查證資訊的能力，不可盡信。'
    },
    6: {
        q: '你在班級群組看到有人轉傳「只要花 50 元，就能在校門口買到正版的課本」，你會怎麼辦？（簡答）',
        opts: [],
        explain: '課本不可能在校外隨便賣超低價，這很可能是假貨或詐騙。'
    },
    7: {
        q: '你收到一封電子郵件說「你的遊戲帳號快過期了，請輸入密碼重新登入」，應該怎麼辦？（簡答）',
        opts: [],
        explain: '這是假冒官方的詐騙手法，很有可能在輸入帳號及密碼的過程中，被盜用資料。'
    },
    8: {
        q: '有人說「幫我買點數卡，我再給你錢」，你會怎麼做？（簡答）',
        opts: [],
        explain: '詐騙常用「代買點數卡」方式騙錢。'
    },
    9: {
        q: '如果朋友傳給你一個「免費零食網站」，要你填個資換禮物，你會怎麼做？（簡答）',
        opts: [],
        explain: '假贈品常用來收集個資，必須警覺有可能是釣魚網站，這是一種網路詐騙行為，攻擊者會偽裝成合法網站，誘騙使用者點擊連結輸入個人敏感資訊，以進行盜取資料或財產。'
    },
    10: {
        q: '為什麼詐騙常會說「限時、最後一天」？（簡答）',
        opts: [],
        explain: '詐騙利用「時間壓力」讓人衝動做錯決定。'
    },
    11: {
        q: '請說出 3 種避免受騙的方法。（簡答）',
        opts: [],
        explain: '建立具體防詐方法，提升警覺。'
    },
    12: {
        q: '你覺得「防詐騙知識」對生活有什麼幫助？（簡答）',
        opts: [],
        explain: '培養長期的防詐意識，幫助做出正確判斷。'
    }
};

const grid = document.getElementById('grid');
for (let i = 1; i <= 12; i++) {
    const card = document.createElement('div');
    card.className = 'card'; card.dataset.index = String(i);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.style.backgroundImage = `url("../assets/img/資訊卡/${i}.png")`;
    card.innerHTML = `<div class="num">${i}</div>`;
    if (used.has(i)) card.classList.add('used');
    card.addEventListener('click', () => { if (!card.classList.contains('used')) openModal(i); });
    card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!card.classList.contains('used')) openModal(i); } });
    grid.appendChild(card);
}

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('closeBtn');
let activeIndex = null;

function openModal(i) {
    activeIndex = i;
    modalTitle.textContent = `資訊 #${i}`;
    renderQuestion(i);
    modal.classList.add('show'); closeBtn.focus();
}
function closeModal() {
    modal.classList.remove('show');
    if (activeIndex != null) { markUsedImmediate(activeIndex); activeIndex = null; }
}
closeBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function renderQuestion(i) {
    const d = DATA[i];
    // 判斷是否有選項 (有些題目可能沒有 opts 陣列，或長度為 0)
    const hasOptions = d.opts && d.opts.length > 0;

    // 準備選項代號 (支援到 4 個)
    const letters = ['A', 'B', 'C', 'D'];

    const modalEl = document.getElementById('modal');
    // 清空舊內容，保留關閉按鈕 (如果有的話)
    const oldClose = document.getElementById('closeBtn');
    modalEl.innerHTML = '';
    if (oldClose) modalEl.appendChild(oldClose);

    // ★ 1. 設定 Modal 佈局模式
    if (hasOptions) {
        // 有選項：上下分佈
        modalEl.classList.remove('single-mode');
    } else {
        // 無選項 (簡答題)：完全置中
        modalEl.classList.add('single-mode');
    }

    // ★ 2. 建立題目字卡 (上半部)
    const qBox = document.createElement('div');
    qBox.className = 'modal-question-box';
    qBox.innerHTML = d.q;
    modalEl.appendChild(qBox);

    // ★ 3. 建立選項按鈕 (如果有選項才建立)
    if (hasOptions) {
        const actBox = document.createElement('div');
        actBox.className = 'modal-actions';

        // 建立結果視窗 (隱藏)
        const resBox = document.createElement('div');
        resBox.className = 'modal-result';
        modalEl.appendChild(resBox); // 先加到 DOM

        let hasScored = false;

        d.opts.forEach((t, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.dataset.idx = idx;
            btn.innerHTML = `<b>${letters[idx] || ''}</b><div>${t}</div>`;

            btn.addEventListener('click', () => {
                const correct = d.ans;

                // 強制顯示結果視窗
                resBox.classList.add('show');

                // 定義返回按鈕 HTML
                const returnBtnHTML = `
                    <button class="btn primary" onclick="markUsedImmediate(${i}); location.href='index.html'">
                        返回大富翁
                    </button>
                `;

                if (idx === correct) {
                    // ★ 只有第一次答對時才加分
                    if (!hasScored) {
                        // addScoreToActiveTeam(50);
                        hasScored = true; // 鎖定加分
                    }

                    // ★ 強制覆蓋 innerHTML，確保內容變成「正確」的版本
                    resBox.innerHTML = `
                        <h2 style="color:#2f9e44;">⭕ 答對了！</h2>
                        <p>
                            ${d.explain}<br>
                        </p>
                        ${returnBtnHTML}
                    `;
                } else {
                    // ★ 強制覆蓋 innerHTML，確保內容變成「錯誤」的版本
                    resBox.innerHTML = `
                        <h2 style="color:#e03131;">❌ 答錯囉！</h2>
                        <p>
                            正確答案是 <b>${letters[correct]}</b><br>
                            ${d.explain}
                        </p>
                        ${returnBtnHTML}
                    `;
                }
            });

            actBox.appendChild(btn);
        });

        modalEl.appendChild(actBox);
    } else {
        // ★★★ 修改：簡答題模式 (樣式比照機會命運) ★★★

        // 1. 建立按鈕容器 (為了讓排版位置與機會命運一致)
        const actBox = document.createElement('div');
        actBox.className = 'modal-actions';

        // 2. 建立按鈕
        const backBtn = document.createElement('button');
        backBtn.className = 'btn primary';

        // ★ 關鍵樣式設定：比照 chance.js
        backBtn.style.minHeight = 'auto';   // 覆蓋原本的大按鈕高度
        backBtn.style.fontSize = '28px';
        backBtn.style.padding = '20px 60px';

        backBtn.textContent = '查看詳解';

        // 3. 按鈕邏輯：第一階段顯示詳解 -> 第二階段返回
        backBtn.onclick = () => {
            // 顯示詳解 (字體稍微縮小以利閱讀)
            qBox.innerHTML = `<div style="font-size:0.8em; line-height:1.5">${d.explain || '老師講解時間！'}</div>`;

            // 把按鈕改成返回功能
            backBtn.textContent = '完成 / 返回大富翁';
            backBtn.onclick = () => {
                markUsedImmediate(i); // 標記為已使用
                location.href = 'index.html';
            };
        };

        // 將按鈕加入容器，再將容器加入 Modal
        actBox.appendChild(backBtn);
        modalEl.appendChild(actBox);
    }

    // 重建關閉按鈕功能
    const close = document.createElement('button');
    close.className = 'close';
    close.innerHTML = '×';
    close.addEventListener('click', closeModal);
    modalEl.appendChild(close);
}