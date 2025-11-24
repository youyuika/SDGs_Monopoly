// ===== 常數與鍵 =====
const STORAGE_KEY = 'monopoly_state_v4';    // ★ 無回合/無當前隊伍
const ACTION_KEY = 'monopoly_action_v1';   // 跨頁待執行動作（保留）
const TILES = [
    { idx: 0, type: 'info' }, { idx: 1, type: 'consume' }, { idx: 2, type: 'info' }, { idx: 3, type: 'fraud' },
    { idx: 4, type: 'start' }, { idx: 5, type: 'chance' }, { idx: 6, type: 'consume' }, { idx: 7, type: 'fraud' },
    { idx: 8, type: 'chance' }, { idx: 9, type: 'info' }, { idx: 10, type: 'consume' }, { idx: 11, type: 'fraud' },
    { idx: 12, type: 'consume' }, { idx: 13, type: 'info' }, { idx: 14, type: 'chance' }, { idx: 15, type: 'fraud' }
];
const TILE_COUNT = TILES.length;

// === 骰子圖設定 ===
const DICE_IMAGES = [
    "../assets/img/dice/1.png",
    "../assets/img/dice/2.png",
    "../assets/img/dice/3.png",
    "../assets/img/dice/4.png",
    "../assets/img/dice/5.png",
    "../assets/img/dice/6.png",
];
const ROLL_ANIM_MS = 2000;
const ROLL_FRAME_MS = 80;

const diceBoxEl = document.getElementById('dice');
const diceImgEl = document.getElementById('diceImg');
const diceTextEl = document.getElementById('diceText');
let rolling = false;

// 預載圖片
(function preloadDice() { DICE_IMAGES.forEach(src => { const img = new Image(); img.src = src; }); })();

// 棋子
// 每一步的動畫時間（需與 CSS 180ms 對齊），以及步與步之間的節拍間隔
const PIECE_HOP_MS = 180;
const PIECE_STEP_MS = 200; // 每格停留時間（決定整體節奏）

// ===== 預設隊名（第一小隊、第二小隊…） =====
function defaultTeamNames(n) {
    const zhNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    const names = [];
    for (let i = 0; i < n; i++) {
        const k = i + 1;
        let zh = '';
        if (k <= 10) zh = zhNums[k - 1];
        else { const t = Math.floor(k / 10), o = k % 10; zh = (t === 1 ? '十' : (zhNums[t - 1] + '十')) + (o ? zhNums[o - 1] : ''); }
        names.push(`第${zh}小隊`);
    }
    return names;
}

// ===== 狀態（多隊＋共享棋子；無 turn） =====
let state = {
    teamCount: 2,
    teamNames: defaultTeamNames(2),
    money: { t0: 100, t1: 100 },
    pos: 4
};

// ===== DOM =====
const boardEl = document.getElementById('board');
const pieceEl = document.getElementById('piece');
const diceEl = document.getElementById('dice');
const rollBtn = document.getElementById('roll');
const confirmBox = document.getElementById('confirm');
const confirmTitle = document.getElementById('confirm-title');
const confirmText = document.getElementById('confirm-text');
const btnEnter = document.getElementById('confirm-enter');
const btnCancel = document.getElementById('cancel-enter');
const newBtn = document.getElementById('newgame');
const newGameModal = document.getElementById('confirm-newgame');
const doNewGameBtn = document.getElementById('do-newgame');
const cancelNewGameBtn = document.getElementById('cancel-newgame');

const teamsContainer = document.getElementById('teamsContainer');
const teamCountSel = document.getElementById('teamCount');
const applyTeamsBtn = document.getElementById('applyTeams');

// ===== 儲存/讀取 =====
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState() {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) state = { ...state, ...JSON.parse(raw) }; } catch { }
}

// ===== 幫手 =====
// 用 DOM 幾何回復置中（不使用任何錨點/順序）
function getTileCenter(idx) {
    const tile = document.querySelector(`.board .tile[data-idx="${idx}"]`);
    const boardRect = document.getElementById('board').getBoundingClientRect();
    if (!tile) {
        // 找不到時回到起點（避免報錯）
        return { x: boardRect.width * 0.9, y: boardRect.height * 0.9 };
    }
    const tileRect = tile.getBoundingClientRect();
    return {
        x: tileRect.left - boardRect.left + tileRect.width / 2,
        y: tileRect.top - boardRect.top + tileRect.height / 2
    };
}

function drawPiece() {
    const c = getTileCenter(state.pos);
    const pieceEl = document.getElementById('piece');
    const w = pieceEl.getBoundingClientRect().width || 56;
    const h = pieceEl.getBoundingClientRect().height || 56;
    pieceEl.style.left = (c.x - w / 2) + 'px';
    pieceEl.style.top = (c.y - h / 2) + 'px';
}

// 動畫式移動棋子
// 單次平滑移動到目標（steps = 要走幾格）
function animateMove(steps, callback) {
    if (steps <= 0) {
        if (callback) callback();
        return;
    }

    // 下一步（注意你的移動方向是逆時針）
    state.pos = (state.pos - 1 + TILE_COUNT) % TILE_COUNT;
    drawPiece();

    // 每步之間停 200ms（可調整速度）
    setTimeout(() => {
        animateMove(steps - 1, callback);
    }, 200);
}

// 左側分數卡
//<span class="dot"></span>
function renderTeams() {
    teamsContainer.innerHTML = '';
    Object.keys(state.money).sort().forEach((key) => {
        const idx = Number(key.replace('t', '') || 0);
        const name = state.teamNames[idx] || `小隊 ${idx + 1}`;
        const card = document.createElement('div');
        card.className = 'money-card';
        card.dataset.key = key;
        card.innerHTML = `
      <div class="who">${name}</div>
      <div class="stepper">
        <button class="btn minus" data-key="${key}">−</button>
        <div class="amt" id="money-${key}">$${state.money[key]}</div>
        <button class="btn plus" data-key="${key}">＋</button>
      </div>`;
        teamsContainer.appendChild(card);
    });

    teamsContainer.querySelectorAll('.plus').forEach(b => {
        b.addEventListener('click', () => {
            const k = b.dataset.key;
            state.money[k] = (state.money[k] ?? 0) + 50;
            document.getElementById(`money-${k}`).textContent = `$${state.money[k]}`;
            saveState();
        });
    });
    teamsContainer.querySelectorAll('.minus').forEach(b => {
        b.addEventListener('click', () => {
            const k = b.dataset.key;
            state.money[k] = (state.money[k] ?? 0) - 50;
            document.getElementById(`money-${k}`).textContent = `$${state.money[k]}`;
            saveState();
        });
    });
}

// 隊伍數下拉
function renderTeamCountOptions() {
    teamCountSel.innerHTML = '';
    for (let n = 2; n <= 8; n++) {
        const opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = `${n}`;
        if (n === state.teamCount) opt.selected = true;
        teamCountSel.appendChild(opt);
    }
}

// 套用隊伍數：重設 teamNames、money（保留棋子位置）
function applyTeamCount(n) {
    const count = Math.max(2, Math.min(12, Number(n) || 2));
    const names = defaultTeamNames(count);
    const money = {};
    for (let i = 0; i < count; i++) money['t' + i] = 200;
    state.teamCount = count;
    state.teamNames = names;
    state.money = money;
    saveState();
    renderTeams();
}

// 檢查這次移動是否「經過或剛好停在」起點（idx=4）
function crossesStart(oldPos, steps) {
    for (let k = 1; k <= steps; k++) {
        const p = (oldPos - k + TILE_COUNT) % TILE_COUNT;
        if (p === 4) return true;
    }
    return false;
}

// 對所有隊伍 +100，並更新 UI
function awardLapBonus() {
    Object.keys(state.money).forEach(k => {
        state.money[k] = (state.money[k] ?? 0) + 100;
        const el = document.getElementById(`money-${k}`);
        if (el) el.textContent = `$${state.money[k]}`;
    });
    saveState();
}

// 顯示 3 秒 toast
function showLapToast(duration = 3000) {  // 預設 3 秒
    const t = document.getElementById('lapToast');
    if (!t) return;
    const msg = t.querySelector('.toast-msg');

    // 顯示容器
    t.style.display = 'flex';

    // 重新觸發動畫
    msg.style.animation = 'none';
    msg.offsetHeight; // 強制重排
    msg.style.animation = `popFade ${duration}ms ease forwards`;

    // duration 後自動隱藏
    setTimeout(() => { t.style.display = 'none'; }, duration);
}

// 擲骰與移動（逆時針，共用棋子）
function setDiceFace(n) {
    if (n >= 1 && n <= 6) {
        diceImgEl.src = DICE_IMAGES[n - 1];
        diceImgEl.alt = `骰子 ${n}`;
        diceImgEl.style.display = 'block';
        diceTextEl.style.display = 'none';
    } else {
        // 初始或重置：顯示「–」
        diceImgEl.removeAttribute('src');
        diceImgEl.style.display = 'none';
        diceTextEl.textContent = '–';
        diceTextEl.style.display = 'block';
    }
}

function roll() {
    if (rolling) return;
    rolling = true;
    rollBtn.disabled = true;

    // 關閉進關字卡
    confirmBox.classList.remove('show');

    let rollingIndex = 0;
    const anim = setInterval(() => {
        const face = (rollingIndex % 6) + 1;
        setDiceFace(face);
        rollingIndex++;
    }, ROLL_FRAME_MS);

    setTimeout(() => {
        clearInterval(anim);

        // 真實骰子點數
        //const n = 1 + Math.floor(Math.random() * 6);
        const n = 1
        setDiceFace(n);

        // 這一拍只算完骰子，不做重工作
        const oldPos = state.pos;

        // 讓棋子平滑走到終點
        animateMove(n, () => {
            saveState();

            // 走完後才檢查格子類型 / 顯示卡片
            const tileType = TILES.find(t => t.idx === state.pos)?.type || '';
            const passedStart = crossesStart(oldPos, n);
            if (passedStart) {
                awardLapBonus();
                showLapToast();
            }

            if (tileType !== 'start') {
                const mapping = { fraud: '詐騙', consume: '消費', info: '資訊', chance: '機會／命運', start: '起點' };
                confirmTitle.textContent = `停在「${mapping[tileType] || '關卡'}」`;
                confirmText.textContent = `要進入「${mapping[tileType] || '關卡'}」關卡嗎？`;
                confirmBox.classList.add('show');
            }

            rolling = false;
            rollBtn.disabled = false;
        });

    }, ROLL_ANIM_MS);
}

// 進關確認
btnEnter.addEventListener('click', () => {
    confirmBox.classList.remove('show');
    openPageByType(TILES.find(t => t.idx === state.pos)?.type);
});
btnCancel.addEventListener('click', () => {
    confirmBox.classList.remove('show');
});

// 開啟對應頁
function openPageByType(type) {
    const map = { fraud: 'fraud.html', consume: 'consume.html', info: 'info.html', chance: 'chance.html' };
    const url = map[type];
    if (url) location.href = url;
}

// 新遊戲
// 1. 點擊「新遊戲」按鈕 -> 顯示確認視窗
newBtn.addEventListener('click', () => {
    newGameModal.classList.add('show');
});

// 2. 點擊「取消」 -> 關閉視窗
cancelNewGameBtn.addEventListener('click', () => {
    newGameModal.classList.remove('show');
});

// 3. 點擊「確定重置」 -> 執行原本的重置邏輯
doNewGameBtn.addEventListener('click', () => {
    // 關閉視窗
    newGameModal.classList.remove('show');

    // --- 以下是原本 newGame() 的重置程式碼 ---
    applyTeamCount(state.teamCount);
    state.pos = 4;
    setDiceFace(null);
    confirmBox.classList.remove('show');

    // 清除所有紀錄
    localStorage.removeItem('chance_used_v2');
    localStorage.removeItem('info_used_v1');
    localStorage.removeItem('fraud_used_v1');
    localStorage.removeItem('consume_used_v1');
    localStorage.removeItem(ACTION_KEY);

    saveState();
    drawPiece();

    // 提示
    // alert('遊戲已重置！'); // 視需求決定是否要跳這個提示，通常畫面變了就知道了
});

// chance 等頁傳回的動作（仍可用於前進/回起點等，但不涉分數）
function processPendingAction() {
    try {
        const raw = localStorage.getItem(ACTION_KEY);
        if (!raw) return;
        const act = JSON.parse(raw);
        localStorage.removeItem(ACTION_KEY);
        if (!act || !act.type) return;

        if (act.type === 'extra_roll') {
            // 只提示可再擲一次；不會自動擲
        }
        else if (act.type === 'move_for' && typeof act.steps === 'number') {
            state.pos = (state.pos - act.steps + TILE_COUNT) % TILE_COUNT;
            drawPiece(); saveState();
        }
        else if (act.type === 'go_start') {
            state.pos = 4; drawPiece(); saveState();
        }
    } catch { }
}

// 初始化
window.addEventListener('load', () => {
    loadState();
    renderTeamCountOptions();
    renderTeams();
    drawPiece();
    setDiceFace(null);
    processPendingAction();
});
window.addEventListener('resize', drawPiece);
rollBtn.addEventListener('click', roll);
applyTeamsBtn.addEventListener('click', () => applyTeamCount(teamCountSel.value));
