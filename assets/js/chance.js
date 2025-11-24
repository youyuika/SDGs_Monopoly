// ====== 鍵與共用 ======
const USED_KEY = 'chance_used_v2';
const STATE_KEY = 'monopoly_state_v4';
const ACTION_KEY = 'monopoly_action_v1';

// 狀態存取
function readState() {
    try { const raw = localStorage.getItem(STATE_KEY); if (raw) return JSON.parse(raw); } catch { }
    return { teamCount: 2, teamNames: ['第一小隊', '第二小隊'], money: { t0: 100, t1: 100 }, pos: 4 };
}
function writeState(st) { localStorage.setItem(STATE_KEY, JSON.stringify(st)); }
function addMoney(side, delta) {
    const st = readState();
    st.money[side] = (st.money[side] ?? 0) + delta;
    writeState(st);
    return st.money[side];
}
function queueAction(obj) { localStorage.setItem(ACTION_KEY, JSON.stringify(obj)); }

// 已使用卡
let used = new Set();
try { const raw = localStorage.getItem(USED_KEY); if (raw) used = new Set(JSON.parse(raw)); } catch { }
function saveUsed() { localStorage.setItem(USED_KEY, JSON.stringify([...used])); }
function markUsedImmediate(idx) {
    used.add(idx); saveUsed();
    const el = document.querySelector(`.card[data-index="${idx}"]`);
    if (el) { el.classList.add('used'); el.setAttribute('tabindex', '-1'); }
}

// 題庫（沿用）
const BASE = {
    1: `各小隊派1人出來猜拳，第一名的小隊可獲得100元，第二名的小隊可獲得50元，其餘0元。`,
    2: `群組有人傳「點連結送禮券」的假消息，小隊沒有查證就亂傳，損失50元。`,
    3: `弄丟了文具，必須花錢重新購買，損失50元。`,
    4: `未查證就轉傳假消息 → <b>−50</b>（能說正確作法可免扣）。`,
    5: `反詐騙專線？<b>165</b>。答對 <b>+50</b>；答錯 <b>0</b>。`,
    6: `喊隊呼 → <b>+100</b>。`,
    7: `A. 不衝動消費 → <b>+50</b>； B. 買「前進券」→ <b>前進 1 格</b>（回主頁自動）。`,
    8: `回到起點並 <b>+100</b>（回主頁即時生效）。`,
    9: `運氣爆棚！<b>+50</b> 並可再擲一次（回主頁手動按）。`,
    10: `加倍券！下一次答題加倍（由關主記錄）。`,
    11: `擲骰：≥4 → <b>+50</b>；≤3 → <b>−100</b>；不參與 → 0。`,
    12: `未查證轉發錯誤資訊 → <b>−50</b>。`,
};

// 生成 1~15 卡片
const grid = document.getElementById('grid');
for (let i = 1; i <= 12; i++) {
    const card = document.createElement('div');
    card.className = 'card'; card.dataset.index = String(i);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.style.backgroundImage = `url("../assets/img/命運&機會卡/${i}.png")`;
    card.innerHTML = `<div class="num">${i}</div>`;
    if (used.has(i)) card.classList.add('used');
    card.addEventListener('click', () => { if (!card.classList.contains('used')) openModal(i); });
    card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!card.classList.contains('used')) openModal(i); } });
    grid.appendChild(card);
}

// Modal
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('closeBtn');
let activeIndex = null;

function openModal(i) {
    activeIndex = i;
    modalTitle.textContent = `機會／命運 #${i}`;
    renderQuestion(i);
    modal.classList.add('show'); closeBtn.focus();
}
function closeModal() {
    modal.classList.remove('show');
    if (activeIndex != null) { markUsedImmediate(activeIndex); activeIndex = null; }
}
closeBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// 共用：產生小隊選擇器
function renderTeamPicker() {
    const st = readState();
    const wrap = document.createElement('div');
    wrap.className = 'team-picker';
    wrap.innerHTML = `<div style="margin:6px 0 10px; font-weight:700">記分對象：</div>`;
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.flexWrap = 'wrap'; row.style.gap = '6px';

    let current = null;
    Object.keys(st.money).sort().forEach(k => {
        const idx = Number(k.replace('t', '') || 0);
        const name = st.teamNames?.[idx] || `小隊 ${idx + 1}`;
        const btn = document.createElement('button');
        btn.className = 'btn'; btn.type = 'button';
        btn.textContent = name;
        btn.dataset.team = k;
        btn.addEventListener('click', () => {
            row.querySelectorAll('button').forEach(b => b.classList.remove('primary'));
            btn.classList.add('primary'); current = k;
        });
        row.appendChild(btn);
    });

    wrap.getSelected = () => current;
    wrap.appendChild(row);
    return wrap;
}

// 題目互動（全部題目都以「選擇的小隊」為記分對象）
function renderQuestion(i) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div>${BASE[i] || '（尚未設定）'}</div>`;

    const picker = renderTeamPicker();
    const actions = document.createElement('div'); actions.className = 'actions';
    const result = document.createElement('div'); result.className = 'note';

    function needTeam() {
        const k = picker.getSelected?.();
        if (!k) { result.textContent = '請先選擇「記分對象」小隊再操作。'; return null; }
        return k;
    }

    switch (i) {
        case 1: {
            // 直接用每隊一顆「勝方 +50」按鈕
            const st = readState();
            actions.innerHTML = Object.keys(st.money).sort().map(k => {
                const idx = Number(k.replace('t', '') || 0);
                const name = st.teamNames?.[idx] || `小隊 ${idx + 1}`;
                return `<button class="btn" data-team="${k}">${name}勝（+50）</button>`;
            }).join('');
            actions.addEventListener('click', (ev) => {
                const k = ev.target?.dataset?.team; if (!k) return;
                addMoney(k, 50);
                result.textContent = '已加 +50。';
                [...actions.querySelectorAll('button')].forEach(b => b.disabled = true);
            });
        } break;

        case 2: case 5: case 6: case 14: {
            // 加分型
            const bonus = { 2: 50, 5: 50, 6: 100, 14: 50 }[i];
            actions.innerHTML = `
        <button class="btn" data-act="ok">給分（+${bonus}）</button>
        <button class="btn ghost" data-act="skip">不給分（0）</button>`;
            actions.addEventListener('click', (e) => {
                const act = e.target?.dataset?.act; if (!act) return;
                const k = needTeam(); if (!k && act !== 'skip') return;
                if (act === 'ok') { addMoney(k, bonus); result.textContent = `已加 +${bonus}`; }
                else { result.textContent = '已記錄（0）'; }
                [...actions.querySelectorAll('button')].forEach(b => b.disabled = true);
            });
        } break;

        case 3: case 4: case 12: {
            const penalty = { 3: -50, 4: -50, 12: -50 }[i];
            actions.innerHTML = `<button class="btn warn" data-act="pen">扣分（${penalty}）</button>`;
            actions.addEventListener('click', (e) => {
                const k = needTeam(); if (!k) return;
                addMoney(k, penalty); result.textContent = `已扣 ${-penalty}`;
                e.target.disabled = true;
            });
        } break;

        case 7: {
            actions.innerHTML = `
        <button class="btn" data-act="A">選 A（不衝動消費 +50）</button>
        <button class="btn" data-act="B">選 B（買前進券 → 前進 1 格）</button>`;
            actions.addEventListener('click', (e) => {
                const act = e.target?.dataset?.act; if (!act) return;
                if (act === 'A') {
                    const k = needTeam(); if (!k) return;
                    addMoney(k, 50); result.textContent = '已加 +50';
                    [...actions.querySelectorAll('button')].forEach(b => b.disabled = true);
                } else {
                    markUsedImmediate(7);
                    queueAction({ type: 'move_for', steps: 1 });
                    const back = document.createElement('div'); back.className = 'actions';
                    back.innerHTML = `<a class="btn" href="index.html">返回大富翁</a>`;
                    actions.after(back);
                    result.textContent = '本局前進 1 格（回主頁後自動）。';
                    [...actions.querySelectorAll('button')].forEach(b => b.disabled = true);
                }
            });
        } break;

        case 8: {
            actions.innerHTML = `<button class="btn" data-act="go">回起點並 +100（返回大富翁）</button>`;
            actions.addEventListener('click', () => {
                const k = needTeam(); if (!k) return;
                addMoney(k, 100);
                markUsedImmediate(8);
                queueAction({ type: 'go_start' });
                location.href = 'index.html';
            });
        } break;

        case 9: {
            actions.innerHTML = `<button class="btn" data-act="again">+50 並可再擲一次（返回大富翁）</button>`;
            actions.addEventListener('click', () => {
                const k = needTeam(); if (!k) return;
                addMoney(k, 50);
                markUsedImmediate(9);
                queueAction({ type: 'extra_roll' });
                location.href = 'index.html';
            });
        } break;

        case 11: {
            actions.innerHTML = `
        <button class="btn" data-act="roll">在此擲骰</button>
        <button class="btn ghost" data-act="skip">不參與（0）</button>
        <span id="p11res" class="note"></span>`;
            actions.addEventListener('click', (e) => {
                const act = e.target?.dataset?.act; if (!act) return;
                if (act === 'skip') { closeModal(); return; }
                const k = needTeam(); if (!k) return;
                const n = 1 + Math.floor(Math.random() * 6);
                const resEl = document.getElementById('p11res');
                if (n >= 4) { addMoney(k, 50); resEl.innerHTML = `點數 <b>${n}</b>：+50 ✔`; }
                else { addMoney(k, -100); resEl.innerHTML = `點數 <b>${n}</b>：-100`; }
                e.target.disabled = true; e.target.textContent = `已擲出 ${n}`;
            });
        } break;

        case 13: {
            actions.innerHTML = `
        <button class="btn" data-act="save">使用合法折扣券比價（+50）</button>
        <button class="btn ghost" data-act="full">堅持原價（-50）</button>`;
            actions.addEventListener('click', (e) => {
                const act = e.target?.dataset?.act; if (!act) return;
                const k = needTeam(); if (!k) return;
                addMoney(k, act === 'save' ? 50 : -50);
                result.textContent = act === 'save' ? '已加 +50' : '已扣 50';
                [...actions.querySelectorAll('button')].forEach(b => b.disabled = true);
            });
        } break;

        case 10: case 15: {
            // 不涉及自動記分的描述/分流
            actions.innerHTML = `<button class="btn ghost">知道了</button>`;
            actions.addEventListener('click', closeModal);
        } break;

        default: {
            actions.innerHTML = `<button class="btn ghost">知道了</button>`;
            actions.addEventListener('click', closeModal);
        }
    }

    wrap.appendChild(picker);
    wrap.appendChild(actions);
    wrap.appendChild(result);
    modalBody.innerHTML = '';
    modalBody.appendChild(wrap);
}