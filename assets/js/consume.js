const USED_KEY = 'consume_used_v1';
let used = new Set(); try { const raw = localStorage.getItem(USED_KEY); if (raw) used = new Set(JSON.parse(raw)); } catch { }
function saveUsed() { localStorage.setItem(USED_KEY, JSON.stringify([...used])); }
function markUsedImmediate(idx) { used.add(idx); saveUsed(); const el = document.querySelector(`.card[data-index="${idx}"]`); if (el) { el.classList.add('used'); el.setAttribute('tabindex', '-1'); } }

const DATA = {
    1: {
        q: '小美和媽媽去超市買雞蛋，發現有一種「非籠飼雞蛋」，意思是母雞不是被關在小籠子裡，而是有更多空間活動。請問，選擇「非籠飼雞蛋」代表什麼意思？',
        opts: ['價格便宜就好', '支持動物福利，讓雞隻生活更健康', '雞蛋顏色比較白', '吃起來會變得更聰明'],
        ans: 1,
        explain: '選擇「非籠飼雞蛋」是一種友善環境、友善動物的消費方式，代表我們重視動物福利。'
    },
    2: {
        q: '小明看到電視廣告，馬上想買一台新玩具車，但家裡已經有好幾台了。請問他應該怎麼做才符合「友善環境的消費」？',
        opts: ['先冷靜想一想，避免衝動消費', '趕快買，不然會被搶走', '把舊玩具車丟掉', '請同學幫他買'],
        ans: 0,
        explain: '不要因為一時興奮就買東西，避免浪費資源，才是環境友善的好習慣。'
    },
    3: {
        q: '小華放學回家要去在學校附近的補習班，他有以下三種交通方式可以選，請問哪一種選擇最能降低耗能，減少碳足跡？',
        opts: ['走路或騎腳踏車', '每次都要爸爸開車載', '搭大眾交通工具', '以上都一樣'],
        ans: 0,
        explain: '走路或騎腳踏車最環保，碳排放最低；如果路程太遠，搭大眾交通工具也比自己開車更友善環境。'
    },
    4: {
        q: '小美在餐廳點了一大份餐，結果吃不完要丟掉。請問她下次該怎麼做才是「負責任的消費」？',
        opts: ['點適量的餐點，吃得完就好', '越多越好，吃不完丟掉也沒關係', '故意點兩份，吃一份丟一份', '不用想，反正有錢就能買'],
        ans: 0,
        explain: '負責任的消費就是要避免浪費。吃不完就丟掉不但浪費食物，也浪費種植、運輸所用的水和能源。點適量、吃得完，才是對環境和社會負責。'
    },
    5: {
        q: '小明要買一個新鉛筆盒，看到有兩種：(1) 可以用很久的堅固鉛筆盒 (2) 雖然很便宜，但容易壞掉的一次性鉛筆盒 請問，哪一個才是「負責任的消費」？',
        opts: ['便宜的就好', '漂亮的就好', '可以用很久的堅固鉛筆盒', '買兩個一起用'],
        ans: 2,
        explain: '便宜但容易壞掉的東西，買了不久又要換，反而更浪費錢和資源。選擇耐用的產品，可以用更久，也能減少垃圾，這就是負責任的消費。'
    },
    6: {
        q: '你在便利商店買飲料時，店員問你要不要塑膠袋。你會怎麼做？（簡答）',
        opts: [],
        explain: '減少塑膠袋使用，可以降低塑膠垃圾對環境的危害。'
    },
    7: {
        q: '如果家裡有一些不穿的衣服，你覺得怎麼做比較符合「負責任的消費」？（簡答）',
        opts: [],
        explain: '舊衣物若能再利用，就能減少浪費和垃圾。'
    },
    8: {
        q: '你在文具店看到一支「便宜原子筆」，和一支「可以替換筆芯的原子筆」，你會怎麼選擇？（簡答）',
        opts: [],
        explain: '持續使用可替換筆芯的文具能減少垃圾，是更友善環境的選擇。'
    },
    9: {
        q: '你在超市看到「有機蔬菜」，比一般蔬菜貴一點，你會怎麼考慮？（簡答）',
        opts: [],
        explain: '有機農業能減少農藥使用，保護土壤和生態。'
    },
    10: {
        q: '請說出 3 種日常生活中可以減少垃圾的方法。（簡答）',
        opts: [],
        explain: '減少垃圾的產生能降低資源浪費，也保護環境。'
    },
    11: {
        q: '為什麼我們要支持「公平貿易」的產品？（簡答）',
        opts: [],
        explain: '公平貿易讓消費不只環竟友善，還能幫助弱勢的農民和工人。'
    },
    12: {
        q: '你覺得「友善環境的消費」對未來有什麼幫助？（簡答）',
        opts: [],
        explain: '建立長遠觀念，知道每一次消費都會影響環境。'
    }
};

const grid = document.getElementById('grid');
for (let i = 1; i <= 12; i++) {
    const card = document.createElement('div');
    card.className = 'card'; card.dataset.index = String(i);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.style.backgroundImage = `url("../assets/img/消費卡/${i}.png")`;
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
    activeIndex = i; modalTitle.textContent = `消費 #${i}`; renderQuestion(i);
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

    // ★★★ 新增這段：針對字數太多的題目 (第 1 題與第 5 題) 縮小字體 ★★★
    if (i === 1 || i === 5) {
        // 原本預設大約是 clamp(24px, 4vw, 56px)
        // 這裡我們改用比較小的數值，並稍微縮減行高
        qBox.style.fontSize = 'clamp(24px, 3vw, 44px)';
        qBox.style.lineHeight = '1.3';

        // 如果還是太擠，可以再縮減一點內距
        qBox.style.paddingLeft = '8%';
        qBox.style.paddingRight = '8%';
    }

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