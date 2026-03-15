import Phaser from 'phaser';
import { wordBank } from '../data/words.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.grade = data.grade || 1;
    this.maxWrong = 8;
    this.wrongCount = 0;
    this.guessedLetters = [];
    this.wordData = this.pickWord();
    this.word = this.wordData.word.toUpperCase();
    this.gameOver = false;
    this.hintUsed = false;
  }

  pickWord() {
    const list = wordBank[this.grade];
    return list[Phaser.Math.Between(0, list.length - 1)];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.bgRect = this.add.rectangle(W / 2, H / 2, W, H, 0xFFFACD);
    this.add.rectangle(W / 2, 0, W, 10, 0x81C784).setOrigin(0.5, 0);
    this.add.rectangle(W / 2, H, W, 10, 0x81C784).setOrigin(0.5, 1);

    this.flowerGraphics = this.add.graphics();
    this.flowerX = W / 2;
    this.flowerY = H * 0.38;
    this.drawFlower(this.flowerX, this.flowerY, 8);

    this.createHTML();
    this.cameras.main.fadeIn(500);
  }

  getBgHex(petals) {
    const c = ['#78909C','#AB47BC','#EF5350','#EF5350','#FFA726','#FFF176','#AED581','#C5E1A5','#FFFACD'];
    return c[Math.max(0, Math.min(petals, 8))];
  }

  getPhaserBg(petals) {
    const c = [0x78909C,0xAB47BC,0xEF5350,0xEF5350,0xFFA726,0xFFF176,0xAED581,0xC5E1A5,0xFFFACD];
    return c[Math.max(0, Math.min(petals, 8))];
  }

  drawFlower(x, y, petalsLeft) {
    this.flowerGraphics.clear();
    const g = this.flowerGraphics;
    const totalPetals = 8;
    const centerRadius = 22;
    const petalRadius = 18;
    const petalDist = centerRadius + petalRadius;

    if (petalsLeft === 0) {
      g.fillStyle(0xBDBDBD, 1);
      g.fillCircle(x, y, centerRadius);
      g.lineStyle(7, 0xBDBDBD, 1);
      g.beginPath();
      g.moveTo(x, y + centerRadius);
      g.lineTo(x + 15, y + 130);
      g.strokePath();
      return;
    }

    // Stem
    const stemCol = petalsLeft >= 6 ? 0x388E3C : petalsLeft >= 4 ? 0x8BC34A : 0xAFB42B;
    g.lineStyle(8, stemCol, 1);
    g.beginPath();
    g.moveTo(x, y + centerRadius);
    g.lineTo(x, y + 150);
    g.strokePath();

    // Leaves
    if (petalsLeft >= 4) {
      g.fillStyle(0x66BB6A, 1);
      g.fillEllipse(x - 36, y + 95, 48, 18);
      g.fillEllipse(x + 36, y + 118, 48, 18);
    }

    // Petals
    for (let i = 0; i < totalPetals; i++) {
      const angle = (i / totalPetals) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * petalDist;
      const py = y + Math.sin(angle) * petalDist;

      if (i < petalsLeft) {
        g.fillStyle(0xF48FB1, 1);
        g.fillCircle(px, py, petalRadius);
        g.fillStyle(0xFF80AB, 1);
        g.fillCircle(px, py, petalRadius - 3);
        g.fillStyle(0xFFFFFF, 0.25);
        g.fillCircle(px - 5, py - 5, 6);
      } else {
        g.fillStyle(0xCFD8DC, 0.35);
        g.fillCircle(px, py, petalRadius * 0.4);
      }
    }

    // Center
    g.fillStyle(0xFFEE58, 0.5);
    g.fillCircle(x, y, centerRadius + 6);
    g.fillStyle(0xFFD600, 1);
    g.fillCircle(x, y, centerRadius);
    g.fillStyle(0xFFA000, 1);
    g.fillCircle(x, y, 13);
    g.fillStyle(0xFF6F00, 1);
    g.fillCircle(x, y, 6);
  }

  createHTML() {
    const old = document.getElementById('game-ui');
    if (old) old.remove();

    const ui = document.createElement('div');
    ui.id = 'game-ui';
    ui.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 20;
      font-family: 'Nunito', sans-serif;
      display: grid;
      grid-template-rows: auto auto 1fr auto auto auto auto;
      align-items: center;
      pointer-events: none;
    `;

    ui.innerHTML = `
      <!-- Row 1: Top bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 28px 0;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:15px; font-weight:800; color:#2E7D32;
            background:rgba(255,255,255,0.8); padding:5px 16px; border-radius:20px;">
            🌿 Grade ${this.grade}
          </span>
          <button id="back-btn" style="
            background:rgba(255,255,255,0.85);
            border:2px solid #81C784;
            border-radius:20px;
            padding:5px 14px;
            font-family:'Nunito',sans-serif;
            font-size:13px; font-weight:800; color:#388E3C;
            cursor:pointer;
            box-shadow:0 2px 6px rgba(0,0,0,0.08);
            pointer-events:all;
          ">🏠 Menu</button>
        </div>
        <span style="font-size:15px; font-weight:800; color:#C62828;
          background:rgba(255,255,255,0.8); padding:5px 16px; border-radius:20px;">
          ❤️ <span id="lives-display">${this.maxWrong}</span> lives left
        </span>
      </div>

      <!-- Row 2: Question -->
      <div style="
        margin: 10px auto 0;
        background:rgba(255,255,255,0.92);
        border:2px solid #A5D6A7;
        border-radius:16px;
        padding:10px 28px;
        max-width:700px;
        width:88%;
        text-align:center;
        box-shadow:0 4px 14px rgba(0,0,0,0.07);
      ">
        <div style="font-size:11px; font-weight:800; color:#81C784;
          text-transform:uppercase; letter-spacing:2px; margin-bottom:4px;">
          ❓ Question
        </div>
        <div style="font-size:15px; font-weight:700; color:#1B5E20; line-height:1.5;">
          ${this.wordData.question}
        </div>
      </div>

      <!-- Row 3: Flower space -->
      <div></div>

      <!-- Row 4: Word blanks -->
      <div id="blanks-row" style="
        display:flex; gap:10px; justify-content:center;
        flex-wrap:wrap; padding:0 24px;
        margin: 0 auto 6px;
        pointer-events:none;
      ">${this.renderBlanks()}</div>

      <!-- Row 5: Hint -->
      <div style="display:flex; flex-direction:column; align-items:center;
        gap:5px; margin-bottom:6px; pointer-events:all;">
        <button id="hint-btn" style="
          background:#FFFDE7; border:2px solid #F9A825;
          border-radius:12px; padding:7px 22px;
          font-family:'Nunito',sans-serif;
          font-size:13px; font-weight:700; color:#F57F17;
          cursor:pointer; box-shadow:0 3px 0 rgba(249,168,37,0.4);
        ">💡 Use Hint (costs 1 life)</button>
        <div id="hint-text" style="font-size:12px; color:#E65100; font-style:italic;
          max-width:520px; text-align:center; min-height:14px; padding:0 20px;"></div>
      </div>

      <!-- Row 6: Wrong letters -->
      <div style="text-align:center; font-size:12px; color:#757575; font-weight:600; margin-bottom:6px; pointer-events:none;">
        Wrong letters: <span id="wrong-letters" style="color:#C62828; font-weight:800; letter-spacing:3px;"></span>
      </div>

      <!-- Row 7: Keyboard -->
      <div id="keyboard" style="
        display:flex; flex-direction:column; align-items:center;
        gap:4px; padding-bottom:14px; pointer-events:all;
      ">${this.renderKeyboard()}</div>
    `;

    document.body.appendChild(ui);

    // Back to menu button
    document.getElementById('back-btn').addEventListener('click', () => {
      if (this.gameOver) return;
      this.gameOver = true;
      const ui = document.getElementById('game-ui');
      if (ui) ui.remove();
      const layer = document.getElementById('ui-layer');
      if (layer) layer.style.display = 'flex';
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    document.getElementById('hint-btn').addEventListener('click', () => this.useHint());
    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleGuess(btn.dataset.letter, btn));
    });
  }

  renderBlanks() {
    return this.word.split('').map(l => {
      const shown = this.guessedLetters.includes(l);
      return `
        <div style="display:flex; flex-direction:column; align-items:center; min-width:26px;">
          <span style="font-size:26px; font-weight:800; color:#1B5E20;
            min-height:32px; display:block; line-height:32px;">
            ${shown ? l : '&nbsp;'}
          </span>
          <div style="width:26px; height:3px; background:#388E3C; border-radius:2px;"></div>
        </div>`;
    }).join('');
  }

  renderKeyboard() {
    const rows = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['Z','X','C','V','B','N','M']
    ];
    return rows.map(row => `
      <div style="display:flex; gap:4px;">
        ${row.map(l => `
          <button class="key-btn" data-letter="${l}" style="
            width:42px; height:42px; border-radius:10px;
            border:2px solid #81C784; background:#C8E6C9;
            font-family:'Nunito',sans-serif;
            font-size:14px; font-weight:800; color:#1B5E20;
            cursor:pointer; box-shadow:0 3px 0 #81C784;
          ">${l}</button>`).join('')}
      </div>`).join('');
  }

  updateBlanks() {
    const el = document.getElementById('blanks-row');
    if (el) el.innerHTML = this.renderBlanks();
  }

  updateLives() {
    const el = document.getElementById('lives-display');
    const r = this.maxWrong - this.wrongCount;
    if (el) el.textContent = Math.max(0, r);
  }

  updateWrong() {
    const el = document.getElementById('wrong-letters');
    if (el) el.textContent = this.guessedLetters
      .filter(l => !this.word.includes(l)).join('  ');
  }

  shiftBackground(petals) {
    this.bgRect.setFillStyle(this.getPhaserBg(petals));
    document.body.style.transition = 'background 0.7s ease';
    document.body.style.background = this.getBgHex(petals);
  }

  handleGuess(letter, btnEl) {
    if (this.gameOver || this.guessedLetters.includes(letter)) return;
    this.guessedLetters.push(letter);

    btnEl.disabled = true;
    btnEl.style.background = '#EEEEEE';
    btnEl.style.borderColor = '#BDBDBD';
    btnEl.style.color = '#BDBDBD';
    btnEl.style.cursor = 'default';
    btnEl.style.boxShadow = 'none';

    if (this.word.includes(letter)) {
      this.updateBlanks();
      this.checkWin();
    } else {
      this.wrongCount++;
      const r = this.maxWrong - this.wrongCount;
      this.updateLives();
      this.updateWrong();
      this.shiftBackground(r);
      this.drawFlower(this.flowerX, this.flowerY, r);
      if (r <= 0) {
        this.gameOver = true;
        this.time.delayedCall(800, () => this.endGame(false));
      }
    }
  }

  useHint() {
    if (this.hintUsed || this.gameOver || this.wrongCount >= this.maxWrong - 1) return;
    this.hintUsed = true;

    const btn = document.getElementById('hint-btn');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'default'; }

    const el = document.getElementById('hint-text');
    if (el) el.textContent = `💡 ${this.wordData.hint}`;

    this.wrongCount++;
    const r = this.maxWrong - this.wrongCount;
    this.updateLives();
    this.shiftBackground(r);
    this.drawFlower(this.flowerX, this.flowerY, r);
  }

  checkWin() {
    const won = this.word.split('').every(l => this.guessedLetters.includes(l));
    if (won) {
      this.gameOver = true;
      this.time.delayedCall(800, () => this.endGame(true));
    }
  }

  endGame(won) {
    const ui = document.getElementById('game-ui');
    if (ui) ui.remove();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ResultScene', {
        won,
        word: this.word,
        grade: this.grade,
        funFact: this.wordData.hint,
        question: this.wordData.question
      });
    });
  }
}