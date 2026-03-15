export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0xFFFACD);

    // Top and bottom accent bands
    this.add.rectangle(W / 2, 0, W, 10, 0x81C784).setOrigin(0.5, 0);
    this.add.rectangle(W / 2, H, W, 10, 0x81C784).setOrigin(0.5, 1);

    // Flower in center
    this.drawFlower(W / 2, H / 2);

    // Poll for grade button click from HTML
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (window._gradeSelected) {
          window._gradeSelected = false;
          const grade = window._startGrade;
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene', { grade });
          });
        }
      }
    });
  }

  drawFlower(x, y) {
    const g = this.add.graphics();

    // Outer petals
    [[0,-48],[0,48],[-48,0],[48,0],[-34,-34],[34,-34],[-34,34],[34,34]]
      .forEach(([px, py]) => {
        g.fillStyle(0xF48FB1, 0.5);
        g.fillEllipse(x + px, y + py, 32, 32);
      });

    // Inner petals
    [[0,-36],[0,36],[-36,0],[36,0],[-26,-26],[26,-26],[-26,26],[26,26]]
      .forEach(([px, py]) => {
        g.fillStyle(0xFF80AB, 1);
        g.fillEllipse(x + px, y + py, 26, 26);
      });

    // Center glow
    g.fillStyle(0xFFEE58, 0.6);
    g.fillCircle(x, y, 26);

    // Center
    g.fillStyle(0xFFD600, 1);
    g.fillCircle(x, y, 20);

    // Center dot
    g.fillStyle(0xFFA000, 1);
    g.fillCircle(x, y, 8);

    // Stem
    g.lineStyle(6, 0x388E3C, 1);
    g.beginPath();
    g.moveTo(x, y + 20);
    g.lineTo(x, y + 100);
    g.strokePath();

    // Leaves
    g.fillStyle(0x66BB6A, 1);
    g.fillEllipse(x - 26, y + 60, 36, 16);
    g.fillEllipse(x + 26, y + 78, 36, 16);

    // Leaf veins
    g.lineStyle(1.5, 0x388E3C, 0.6);
    g.beginPath();
    g.moveTo(x - 8, y + 60);
    g.lineTo(x - 38, y + 60);
    g.strokePath();
    g.beginPath();
    g.moveTo(x + 8, y + 78);
    g.lineTo(x + 40, y + 78);
    g.strokePath();
  }
}
