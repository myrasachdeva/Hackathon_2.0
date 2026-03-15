import Phaser from 'phaser';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.won = data.won;
    this.word = data.word || '';
    this.grade = data.grade || 1;
    this.funFact = data.funFact || '';
    this.question = data.question || '';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background colour: green-tinted on win, cool grey on lose
    const bgColor = this.won ? 0xF1F8E9 : 0xECEFF1;
    this.bgRect = this.add.rectangle(W / 2, H / 2, W, H, bgColor);

    // Accent bands
    const accentColor = this.won ? 0x81C784 : 0x90A4AE;
    this.add.rectangle(W / 2, 0, W, 10, accentColor).setOrigin(0.5, 0);
    this.add.rectangle(W / 2, H, W, 10, accentColor).setOrigin(0.5, 1);

    // Draw flower (fully bloomed or fully dead)
    this.flowerGfx = this.add.graphics();
    this.flowerX = W / 2;
    this.flowerY = H * 0.32;

    if (this.won) {
      this.drawFlowerBloomed(this.flowerX, this.flowerY);
      this.addConfetti(W, H);
    } else {
      this.drawFlowerDead(this.flowerX, this.flowerY);
    }

    // Fade in
    this.cameras.main.fadeIn(600);

    // Build HTML overlay
    this.createHTML(W, H);
  }

  // ─── Flower: fully bloomed ───────────────────────────────────────────────
  drawFlowerBloomed(x, y) {
    const g = this.flowerGfx;
    g.clear();

    // Stem
    g.lineStyle(9, 0x388E3C, 1);
    g.beginPath();
    g.moveTo(x, y + 24);
    g.lineTo(x, y + 160);
    g.strokePath();

    // Leaves
    g.fillStyle(0x66BB6A, 1);
    g.fillEllipse(x - 40, y + 95, 52, 20);
    g.fillEllipse(x + 40, y + 120, 52, 20);

    // Outer petals (8, large, bright)
    const totalPetals = 8;
    const centerRadius = 24;
    const petalRadius = 22;
    const petalDist = centerRadius + petalRadius;

    for (let i = 0; i < totalPetals; i++) {
      const angle = (i / totalPetals) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * petalDist;
      const py = y + Math.sin(angle) * petalDist;
      g.fillStyle(0xF48FB1, 1);
      g.fillCircle(px, py, petalRadius);
      g.fillStyle(0xFF80AB, 1);
      g.fillCircle(px, py, petalRadius - 4);
      g.fillStyle(0xFFFFFF, 0.3);
      g.fillCircle(px - 5, py - 5, 6);
    }

    // Center glow
    g.fillStyle(0xFFEE58, 0.6);
    g.fillCircle(x, y, centerRadius + 8);
    g.fillStyle(0xFFD600, 1);
    g.fillCircle(x, y, centerRadius);
    g.fillStyle(0xFFA000, 1);
    g.fillCircle(x, y, 14);
    g.fillStyle(0xFF6F00, 1);
    g.fillCircle(x, y, 7);

    // Sparkle tweens
    this.addSparkles(x, y);
  }

  // ─── Flower: fully dead / wilted ─────────────────────────────────────────
  drawFlowerDead(x, y) {
    const g = this.flowerGfx;
    g.clear();

    // Drooping stem
    g.lineStyle(8, 0xBDBDBD, 1);
    g.beginPath();
    g.moveTo(x, y + 24);
    g.lineTo(x + 18, y + 90);
    g.lineTo(x + 10, y + 160);
    g.strokePath();

    // Fallen leaves
    g.fillStyle(0xB0BEC5, 0.6);
    g.fillEllipse(x - 10, y + 145, 44, 14);
    g.fillEllipse(x + 30, y + 158, 36, 12);

    // Dead petals (stub circles, drooping)
    const totalPetals = 8;
    const centerRadius = 22;
    const petalRadius = 18;

    for (let i = 0; i < totalPetals; i++) {
      const angle = (i / totalPetals) * Math.PI * 2 - Math.PI / 2 + 0.3;
      const dist = centerRadius + petalRadius * 0.5;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist + 14; // droops down
      g.fillStyle(0xCFD8DC, 0.5);
      g.fillCircle(px, py, petalRadius * 0.45);
    }

    // Dead center
    g.fillStyle(0xBDBDBD, 1);
    g.fillCircle(x, y, centerRadius);
    g.fillStyle(0x90A4AE, 1);
    g.fillCircle(x, y, 13);
    g.fillStyle(0x78909C, 1);
    g.fillCircle(x, y, 6);
  }

  // ─── Sparkle effect for win ───────────────────────────────────────────────
  drawStar(g, x, y, points, outerR, innerR, color) {
    g.fillStyle(color, 1);
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
  }

  addSparkles(cx, cy) {
    const sparkColors = [0xFFD600, 0xFF80AB, 0x81C784, 0x64B5F6];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = 80 + Math.random() * 40;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;

      const spark = this.add.graphics();
      this.drawStar(spark, sx, sy, 4, 8, 3, sparkColors[i % sparkColors.length]);

      this.tweens.add({
        targets: spark,
        scaleX: 1.8,
        scaleY: 1.8,
        alpha: 0,
        duration: 900 + Math.random() * 600,
        ease: 'Sine.easeOut',
        repeat: -1,
        delay: i * 180
      });
    }
  }

  // ─── Confetti for win ─────────────────────────────────────────────────────
  addConfetti(W, H) {
    const colors = [0xF48FB1, 0xFFD600, 0x81C784, 0x64B5F6, 0xFF8A65, 0xCE93D8];

    for (let i = 0; i < 38; i++) {
      const x = Phaser.Math.Between(20, W - 20);
      const conf = this.add.graphics();
      conf.fillStyle(Phaser.Math.RND.pick(colors), 1);
      const size = Phaser.Math.Between(5, 10);
      // Alternate between circle and rect confetti
      if (i % 2 === 0) {
        conf.fillCircle(x, -20, size / 2);
      } else {
        conf.fillRect(x, -20, size, size * 0.6);
      }

      this.tweens.add({
        targets: conf,
        y: H + 40,
        x: x + Phaser.Math.Between(-60, 60),
        angle: Phaser.Math.Between(-360, 360),
        duration: Phaser.Math.Between(1800, 3400),
        delay: Phaser.Math.Between(0, 1400),
        ease: 'Sine.easeIn',
        repeat: 1,
        onStart: () => { conf.setPosition(0, 0); }
      });
    }
  }

  // ─── HTML UI Overlay ──────────────────────────────────────────────────────
  createHTML(W, H) {
    const old = document.getElementById('result-ui');
    if (old) old.remove();

    const accentMain = this.won ? '#2E7D32' : '#455A64';
    const accentLight = this.won ? '#A5D6A7' : '#B0BEC5';
    const accentBg = this.won ? 'rgba(232,245,233,0.95)' : 'rgba(236,239,241,0.95)';
    const badgeBg = this.won ? '#C8E6C9' : '#CFD8DC';
    const badgeColor = this.won ? '#1B5E20' : '#37474F';
    const badgeBorder = this.won ? '#81C784' : '#90A4AE';

    const statusEmoji = this.won ? '🌸' : '🥀';
    const statusText = this.won ? 'You revived it!' : 'The flower wilted…';
    const statusSub = this.won
      ? 'Amazing spelling! The flower is in full bloom!'
      : `The word was: <strong style="color:#C62828; font-size:17px; letter-spacing:2px;">${this.word}</strong>`;

    const ui = document.createElement('div');
    ui.id = 'result-ui';
    ui.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 20;
      font-family: 'Nunito', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 22px;
      pointer-events: none;
    `;

    ui.innerHTML = `
      <!-- Status badge (top area, floats above flower) -->
      <div style="
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        background: ${accentBg};
        border: 2px solid ${accentLight};
        border-radius: 20px;
        padding: 8px 28px;
        text-align: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        pointer-events: none;
      ">
        <div style="font-size: 22px; font-weight: 800; color: ${accentMain};">
          ${statusEmoji} ${statusText}
        </div>
        <div style="font-size: 14px; color: ${accentMain}; margin-top: 2px; font-weight: 600;">
          ${statusSub}
        </div>
      </div>

      <!-- Fun Fact Card -->
      <div style="
        background: ${accentBg};
        border: 2px solid ${accentLight};
        border-radius: 18px;
        padding: 14px 24px;
        max-width: 660px;
        width: 88%;
        box-shadow: 0 4px 16px rgba(0,0,0,0.09);
        margin-bottom: 14px;
        pointer-events: none;
      ">
        <div style="font-size: 11px; font-weight: 800; color: ${accentMain};
          text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
          🌿 Did You Know?
        </div>
        <div style="font-size: 14px; font-weight: 700; color: ${accentMain}; line-height: 1.55;">
          ${this.funFact}
        </div>
        ${this.question ? `
        <div style="margin-top: 8px; padding-top: 8px;
          border-top: 1.5px solid ${accentLight};
          font-size: 12px; color: ${accentMain}; font-style: italic; font-weight: 600;">
          ❓ The question was: ${this.question}
        </div>` : ''}
      </div>

      <!-- Grade badge + Buttons -->
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        pointer-events: all;
      ">
        <div style="
          background: ${badgeBg};
          border: 2px solid ${badgeBorder};
          border-radius: 12px;
          padding: 4px 18px;
          font-size: 13px;
          font-weight: 800;
          color: ${badgeColor};
        ">🌿 Grade ${this.grade}</div>

        <div style="display: flex; gap: 14px;">
          <button id="play-again-btn" style="
            background: ${this.won ? '#C8E6C9' : '#CFD8DC'};
            border: 2.5px solid ${this.won ? '#66BB6A' : '#90A4AE'};
            border-radius: 14px;
            padding: 12px 30px;
            font-family: 'Nunito', sans-serif;
            font-size: 15px;
            font-weight: 800;
            color: ${this.won ? '#1B5E20' : '#37474F'};
            cursor: pointer;
            box-shadow: 0 4px 0 ${this.won ? '#81C784' : '#B0BEC5'};
            transition: transform 0.12s ease, box-shadow 0.12s ease;
          ">🔄 Play Again</button>

          <button id="change-grade-btn" style="
            background: #FFF9C4;
            border: 2.5px solid #F9A825;
            border-radius: 14px;
            padding: 12px 30px;
            font-family: 'Nunito', sans-serif;
            font-size: 15px;
            font-weight: 800;
            color: #E65100;
            cursor: pointer;
            box-shadow: 0 4px 0 #F9A825;
            transition: transform 0.12s ease, box-shadow 0.12s ease;
          ">🎓 Change Grade</button>
        </div>
      </div>
    `;

    document.body.appendChild(ui);

    // Button hover effects
    ['play-again-btn', 'change-grade-btn'].forEach(id => {
      const btn = document.getElementById(id);
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-3px)';
        btn.style.boxShadow = btn.style.boxShadow.replace('4px', '7px');
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = btn.style.boxShadow.replace('7px', '4px');
      });
    });

    document.getElementById('play-again-btn').addEventListener('click', () => {
      this.cleanupAndGo('GameScene', { grade: this.grade });
    });

    document.getElementById('change-grade-btn').addEventListener('click', () => {
      this.cleanupAndGo('MenuScene', {});
    });
  }

  cleanupAndGo(sceneKey, data) {
    const ui = document.getElementById('result-ui');
    if (ui) ui.remove();

    // Re-show the HTML grade selector if going back to menu
    if (sceneKey === 'MenuScene') {
      const layer = document.getElementById('ui-layer');
      if (layer) layer.style.display = 'flex';
    }

    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(sceneKey, data);
    });
  }

  // Cleanup on scene shutdown
  shutdown() {
    const ui = document.getElementById('result-ui');
    if (ui) ui.remove();
  }
}
