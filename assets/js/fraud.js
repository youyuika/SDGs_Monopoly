const USED_KEY = 'fraud_used_v1';
let used = new Set(); try { const raw = localStorage.getItem(USED_KEY); if (raw) used = new Set(JSON.parse(raw)); } catch { }
function saveUsed() { localStorage.setItem(USED_KEY, JSON.stringify([...used])); }
function markUsedImmediate(idx) { used.add(idx); saveUsed(); const el = document.querySelector(`.card[data-index="${idx}"]`); if (el) { el.classList.add('used'); el.setAttribute('tabindex', '-1'); } }

const DATA = {
    1: {
        q: '有人在社群軟體上說「代儲 5 折」，你會怎麼做？',
        opts: ['立刻轉帳', '請朋友幫忙確認', '不理會，這是詐騙'],
        ans: 2,
        explain: '代儲是指玩家透過第三方平台，請賣家以較優惠的價格為其遊戲帳號儲值虛擬貨幣或道具的服務，通常是假冒行為，容易被盜帳號或衍伸金錢損失。'
    },
    2: {
        q: '你在網路上看到廣告保證「投資 1 萬，一週回本 2 萬」，你會怎麼做？',
        opts: ['立刻投資', '查詢金管會、165 反詐騙專線', '請他再多保證一些'],
        ans: 1,
        explain: '保證高報酬低風險，藉此吸引資金進入，幾乎都是詐騙手法。'
    },
    3: {
        q: '你接到一通電話，對方說：「這裡是銀行，你的帳號有問題，請馬上提供帳號密碼！」你會怎麼做？',
        opts: ['馬上告訴他帳號密碼', '請他等一下再打來', '不提供資料，掛掉電話', '把電話交給朋友處理'],
        ans: 2,
        explain: '銀行不會主動來電要求提供帳號密碼，這一定是詐騙，且銀行專員來電會提供員工編號及姓名，以供查證。'
    },
    4: {
        q: '有人在路上發傳單，說「買這個護身符，能讓你考試一百分！」你會怎麼做？',
        opts: ['馬上掏錢買', '不相信，因為這是騙人的', '問同學要不要一起買', '想一想再決定'],
        ans: 1,
        explain: '沒有任何東西能保證考試成績，這是假的。'
    },
    5: {
        q: '你在遊戲裡認識一個網友，他說：「我可以幫你升級帳號，只要給我帳號密碼。」你會怎麼做？',
        opts: ['不告訴他，這是詐騙', '介紹給朋友一起升級', '跟他合作，一起幫別人升級', '把遊戲刪掉'],
        ans: 0,
        explain: '帳號密碼不能隨便給人，可能會被盜用，進而造成個人資訊外流。'
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
    card.style.backgroundImage = `url("../assets/img/詐騙卡/${i}.png")`;
    card.innerHTML = `<div class="num">${i}</div>`;
    if (used.has(i)) card.classList.add('used');
    card.addEventListener('click', () => { if (!card.classList.contains('used')) openModal(i); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!card.classList.contains('used')) openModal(i); } });
    grid.appendChild(card);
}

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('closeBtn');
let activeIndex = null;

function openModal(i) {
    activeIndex = i; modalTitle.textContent = `詐騙 #${i}`; renderQuestion(i);
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
        // ★ 針對無選項的簡答題：
        // 這裡可能需要一個「看答案」或「返回」的按鈕，不然畫面會卡住
        // 為了不破壞畫面美感，我們可以在題目卡下方加一個小的透明按鈕，或者直接依賴右上角的 X 關閉
        // 這裡示範加一個簡單的「顯示詳解/返回」按鈕在正下方
        const backBtn = document.createElement('button');
        backBtn.className = 'btn primary';
        backBtn.style.marginTop = '30px';
        backBtn.style.padding = '15px 40px';
        backBtn.style.fontSize = '24px';
        backBtn.textContent = '查看詳解 / 返回';

        // 簡單顯示詳解的邏輯 (用 alert 或直接切換內容)
        backBtn.onclick = () => {
            qBox.innerHTML = `<div style="font-size:0.8em">${d.explain || '老師講解時間！'}</div>`;
            // 把按鈕改成返回
            backBtn.textContent = '返回大富翁';
            backBtn.onclick = () => {
                markUsedImmediate(i);
                location.href = 'index.html';
            };
        };

        // 將這個按鈕加到 modal (因為是 column 排列，它會自動在圖片下方)
        modalEl.appendChild(backBtn);
    }

    // 重建關閉按鈕功能
    const close = document.createElement('button');
    close.className = 'close';
    close.innerHTML = '×';
    close.addEventListener('click', closeModal);
    modalEl.appendChild(close);
}