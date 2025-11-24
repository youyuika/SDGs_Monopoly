// ====== 基本設定 ======
const USED_KEY = 'chance_used_v2';
let used = new Set();
try { const raw = localStorage.getItem(USED_KEY); if (raw) used = new Set(JSON.parse(raw)); } catch { }

function saveUsed() { localStorage.setItem(USED_KEY, JSON.stringify([...used])); }
function markUsedImmediate(idx) {
    used.add(idx);
    saveUsed();
    const el = document.querySelector(`.card[data-index="${idx}"]`);
    if (el) {
        // ★ 修改：只要加上 class 就好，CSS 會負責讓它消失
        el.classList.add('used');
    }
}

// ====== 題目資料 ======
// type: 'text' (純敘述事件，無選項)
// type: 'choice' (有選項的題目)
const CHANCE_DATA = {
    1: {
        type: 'text',
        q: '各小隊派 1 人出來猜拳。<br><br>第一名的小隊可獲得 100 元<br>第二名的小隊可獲得 50 元<br>其餘 0 元。'
    },
    2: {
        type: 'text',
        q: '<div>群組有人傳「點連結送禮券」的假消息，小隊沒有查證就亂傳，損失 50 元。<br><br><span style="color:#d6336c; font-size:0.8em;">（但如果小隊能說出正確做法的話...）</span></div>'
    },
    3: {
        type: 'text',
        q: '弄丟了文具，必須花錢重新購買，損失 50 元。'
    },
    4: {
        type: 'text',
        q: '關主隨機問一題「資訊判讀／詐騙」小問題<br>答對者，獲得 50 元<br>答錯者，不懲罰。'
    },
    5: {
        type: 'text',
        q: '突如其來的打工機會！<br>小隊執行喊隊呼，可獲得 50 元。'
    },
    6: {
        type: 'text',
        q: '沒有查證就轉發假新聞，經驗證結果是錯誤資訊，損失 50 元。'
    },
    7: {
        type: 'text',
        q: '獲得加倍券！下一題回答問題所獲得的獎金翻倍。'
    },
    8: {
        type: 'text',
        q: '賺錢的機會：各小隊派一人跟關主猜拳。<br><br>贏的獲得 100 元<br>平手 0 元<br>輸的損失 50 元'
    },
    // <br><br>（如選擇不參與則維持現狀）
    // --- 以下為選擇題 ---
    9: {
        type: 'choice',
        q: '小隊看到群組有人傳「抽獎要填個人資料」訊息，討論後決定要不要參加。',
        opts: [
            {
                label: '參加',
                resTitle: '❌ 損失 50 元',
                resDesc: '參加者損失 50 元。<br>關主提醒：注意個人資料保護及網路詐騙釣魚手法。',
                isGood: false
            },
            {
                label: '不參加',
                resTitle: '⭕ 獲得 50 元',
                resDesc: '不參加者獲得 50 元。<br>很好的警覺心！',
                isGood: true
            }
        ]
    },
    10: {
        type: 'choice',
        q: '零用錢有 300 元，你會怎麼分配？（請各小隊討論後選擇）',
        opts: [
            {
                label: '全部買晚餐',
                resTitle: '❌ 損失 50 元',
                resDesc: '結果發現自己吃不完，屬於浪費食物的行為。',
                isGood: false
            },
            {
                label: '買便當 100 元，剩下存下來',
                resTitle: '⭕ 獲得 100 元',
                resDesc: '合理的金錢分配！',
                isGood: true
            }
        ]
    },
    11: {
        type: 'choice',
        q: '看到「限時買遊戲點數優惠」訊息，你會怎麼做？',
        opts: [
            {
                label: '馬上下單',
                resTitle: '❌ 損失 50 元',
                resDesc: '屬於衝動購物。',
                isGood: false
            },
            {
                label: '先問家長',
                resTitle: '⭕ 獲得 50 元',
                resDesc: '理性討論及評估，做得好！',
                isGood: true
            }
        ]
    },
    12: {
        type: 'choice',
        q: '發現同學轉傳假新聞，你會怎麼做？',
        opts: [
            {
                label: '趕緊轉發',
                resTitle: '❌ 損失 50 元',
                resDesc: '加速假消息的散播。',
                isGood: false
            },
            {
                label: '提醒同學',
                resTitle: '⭕ 獲得 50 元',
                resDesc: '更正錯誤資訊，很棒的媒體素養！',
                isGood: true
            }
        ]
    }
};

// ====== 生成卡片 (1~15) ======
const grid = document.getElementById('grid');
// 這裡產生 15 張卡片，雖然目前題目只有 12 題，避免錯誤我們還是生成 15 張
// 超出範圍的卡片會顯示「尚未設定」
for (let i = 1; i <= 12; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = String(i);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    // 設定背景圖
    card.style.backgroundImage = `url("../assets/img/命運&機會卡/${i}.png")`;

    // 如果已使用，套用已使用樣式
    if (used.has(i)) {
        // ★ 修改：只要加上 class 就好
        card.classList.add('used');
    }

    card.addEventListener('click', () => { if (!used.has(i)) openModal(i); });
    grid.appendChild(card);
}

// ====== Modal 邏輯 ======
const modalEl = document.getElementById('modal');

function closeModal() {
    modalEl.classList.remove('show');
}

function openModal(i) {
    const d = CHANCE_DATA[i];

    // 如果點到沒有設定的題目 (例如第 13~15 題)
    if (!d) {
        alert('本題尚未設定');
        return;
    }

    modalEl.innerHTML = ''; // 清空
    modalEl.classList.add('show');

    // 判斷是「純文字事件」還是「選擇題」
    const isTextMode = (d.type === 'text');

    // 1. 設定排版模式
    if (isTextMode) {
        modalEl.classList.add('single-mode'); // 置中
    } else {
        modalEl.classList.remove('single-mode'); // 上下排版
    }

    // 2. 建立題目字卡
    const qBox = document.createElement('div');
    qBox.className = 'modal-question-box';
    // 背景圖設定 (請確認檔名是否正確)
    qBox.style.backgroundImage = "url('../assets/img/機會_命運.jpg')";
    qBox.innerHTML = d.q;

    // 針對文字較多的題目 (例如第1題) 自動縮小字體
    if (d.q.length > 50) {
        qBox.style.fontSize = 'clamp(20px, 3vw, 40px)';
    }

    modalEl.appendChild(qBox);

    // 3. 根據類型建立按鈕
    const actBox = document.createElement('div');
    actBox.className = 'modal-actions';

    if (isTextMode) {
        // --- 純文字事件模式：只有一個「返回」按鈕 ---
        const btn = document.createElement('button');
        btn.className = 'btn primary';
        btn.textContent = '完成 / 返回大富翁';
        btn.style.minHeight = 'auto'; // 這種按鈕不需要太高
        btn.style.fontSize = '28px';
        btn.style.padding = '20px 60px';

        btn.onclick = () => {
            markUsedImmediate(i);
            location.href = 'index.html';
        };
        actBox.appendChild(btn);

    } else {
        // --- 選擇題模式：顯示選項 ---
        // 結果視窗
        const resBox = document.createElement('div');
        resBox.className = 'modal-result';
        modalEl.appendChild(resBox);

        const letters = ['A', 'B'];
        d.opts.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.innerHTML = `<b>${letters[idx]}</b><div>${opt.label}</div>`;

            btn.onclick = () => {
                // 顯示結果
                resBox.classList.add('show');

                // 根據結果好壞顯示不同顏色
                const titleColor = opt.isGood ? '#2f9e44' : '#e03131';

                resBox.innerHTML = `
                    <h2 style="color:${titleColor};">${opt.resTitle}</h2>
                    <p>
                        ${opt.resDesc}<br>
                        <span style="font-size:0.8em; color:#666">(請關主手動記分)</span>
                    </p>
                    <button class="btn primary" onclick="markUsedImmediate(${i}); location.href='index.html'">
                        返回大富翁
                    </button>
                `;
            };
            actBox.appendChild(btn);
        });
    }

    modalEl.appendChild(actBox);

    // 關閉按鈕 (X)
    const close = document.createElement('button');
    close.className = 'close';
    close.innerHTML = '×';
    close.onclick = closeModal;
    modalEl.appendChild(close);
}