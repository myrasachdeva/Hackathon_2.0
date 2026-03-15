let player;
let obstacles;
let ground;

let score = 0;
let scoreText;
let highScore = 0;
let highScoreText;
let speedMultiplier = 1;

let gameOver = false;
let gameStarted = false;
let isDucking = false;

let cursors;
let particles;
let shieldActive = false;
let shieldCooldown = false;
let shieldIcon;
let shieldBar;
let shieldBarBg;
let shieldLabel;

let scanlineGraphics;
let glowGraphics;

const threatInfo = {
    phishing: {
        title: "PHISHING EMAIL",
        explanation: "Phishing emails impersonate trusted sources to steal your credentials.",
        tip: "Always verify the sender's address before clicking any links!",
        color: 0xff4444,
        emoji: "🎣"
    },
    malware: {
        title: "MALWARE",
        explanation: "Malware is malicious software designed to damage or disrupt your device.",
        tip: "Never download files from unknown or untrusted sources!",
        color: 0xff6600,
        emoji: "🦠"
    },
    Wifi: {
        title: "FAKE WiFi HOTSPOT",
        explanation: "Hackers set up rogue WiFi networks to intercept your data in transit.",
        tip: "Avoid connecting to unknown public WiFi — use a VPN when necessary!",
        color: 0xffaa00,
        emoji: "📡"
    },
    virusbird: {
        title: "MALICIOUS LINK",
        explanation: "Weaponised links can silently install malware when clicked.",
        tip: "Hover before you click — never follow suspicious URLs!",
        color: 0xff0088,
        emoji: "🔗"
    }
};

const config = {
    type: Phaser.AUTO,
    antialias: true,
    roundPixels: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 900,
        height: 400
    },

    backgroundColor: "#000000",

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 1200 },
            debug: false
        }
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    }
}   ;

new Phaser.Game(config);

// ─── PRELOAD ────────────────────────────────────────────────────────────────

function preload() {
    this.load.image("laptop",    "assets/laptop.png");
    this.load.image("phishing",  "assets/phishing.png");
    this.load.image("malware",   "assets/malware.png");
    this.load.image("Wifi",      "assets/Wifi.png");
    this.load.image("virusbird", "assets/virusbird.png");
    this.load.image("ground",    "assets/ground.png");
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

function create() {
    const scene = this;
    

    // ── Background gradient layers ──────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d1a2e, 0x0d1a2e, 1);
    bg.fillRect(0, 0, 900, 400);

    // Grid lines (subtle cyber grid)
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00ffff, 0.04);
    for (let x = 0; x <= 900; x += 45) {
        grid.lineBetween(x, 0, x, 400);
    }
    for (let y = 0; y <= 400; y += 45) {
        grid.lineBetween(0, y, 900, y);
    }

    // Glowing horizon line
    glowGraphics = this.add.graphics();
    drawGlowLine(glowGraphics);

    // Scanlines overlay (drawn last for depth)
    scanlineGraphics = this.add.graphics();
    drawScanlines(scanlineGraphics);

    // ── Ground ──────────────────────────────────────────────────────────────
    ground = this.add.tileSprite(450, 380, 900, 40, "ground");
    // Tint ground to match neon theme
    ground.setTint(0x00ccff);
    ground.setAlpha(0.7);
    this.physics.add.existing(ground, true);

    // Neon ground line
    const groundLine = this.add.graphics();
    groundLine.lineStyle(2, 0x00ffff, 0.9);
    groundLine.lineBetween(0, 360, 900, 360);

    // ── Player ──────────────────────────────────────────────────────────────
    player = this.physics.add.sprite(120, 50, "laptop");
    player.setScale(0.09);
    player.setCollideWorldBounds(true);
    player.setTint(0x88eeff);

    player.setSize(player.width * 0.55, player.height * 0.7);
    player.setOffset(player.width * 0.2, player.height * 0.25);

    this.physics.add.collider(player, ground);

    // ── Obstacle group ───────────────────────────────────────────────────────
    obstacles = this.physics.add.group();

    this.physics.add.overlap(player, obstacles, hitObstacle, function(p, o) {
        if (shieldActive) return false;
        return Phaser.Geom.Intersects.RectangleToRectangle(p.getBounds(), o.getBounds());
    }, this);

    // ── HUD ─────────────────────────────────────────────────────────────────
    buildHUD.call(this);

    // ── Keyboard ─────────────────────────────────────────────────────────────
    cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on("keydown-SPACE", () => {
        if (!gameStarted && !gameOver) {
            startGame.call(scene);
            return;
        }
        if (player.body.touching.down && gameStarted && !gameOver) {
            player.setVelocityY(-700);
            spawnJumpParticles.call(scene);
        }
        if (gameOver) {
            restartGame.call(scene);
        }
    });

    this.input.keyboard.on("keydown-UP", () => {
        if (!gameStarted || gameOver) return;
        if (player.body.touching.down) {
            player.setVelocityY(-700);
            spawnJumpParticles.call(scene);
        }
    });

    this.input.keyboard.on("keydown-DOWN", () => {
        if (!gameStarted || gameOver) return;
        if (!isDucking) {
            isDucking = true;
            player.setSize(player.width * 0.55, player.height * 0.35);
            player.setOffset(player.width * 0.2, player.height * 0.6);
        }
    });

    this.input.keyboard.on("keyup-DOWN", () => {
        if (gameOver) return;
        isDucking = false;
        player.setSize(player.width * 0.55, player.height * 0.7);
        player.setOffset(player.width * 0.2, player.height * 0.25);
    });

    // Shield key (S)
    this.input.keyboard.on("keydown-S", () => {
        activateShield.call(scene);
    });

    

    // ── Score timer ──────────────────────────────────────────────────────────
    this.time.addEvent({
        delay: 1000,
        callback: () => {
            if (!gameOver && gameStarted) {
                score += 10;
                scoreText.setText(String(score).padStart(5, "0"));
                if (score > highScore) {
                    highScore = score;
                    highScoreText.setText("BEST " + String(highScore).padStart(5, "0"));
                }
                // Gradually speed up
                speedMultiplier = 1 + Math.floor(score / 300) * 0.12;
            }
        },
        loop: true
    });

    // ── Title screen ─────────────────────────────────────────────────────────
    showTitleScreen.call(this);
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

function update() {
    if (!gameStarted || gameOver) return;

    ground.tilePositionX += 6 * speedMultiplier;

    // Pulse player glow slightly
    const t = this.time.now;
    const pulse = 0.85 + Math.sin(t / 300) * 0.15;
    player.setAlpha(pulse);

    // Clean up obstacles
    obstacles.getChildren().forEach(o => {
        if (o.x < -100) o.destroy();
    });
}

// ─── HUD ────────────────────────────────────────────────────────────────────

function buildHUD() {
    // Score area background
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.4);
    hudBg.fillRoundedRect(8, 8, 220, 44, 8);
    hudBg.lineStyle(1, 0x00ffff, 0.4);
    hudBg.strokeRoundedRect(8, 8, 220, 44, 8);

    // Score label
    this.add.text(20, 14, "SCORE", {
    fontFamily: "'Courier New', monospace",
    fontSize: "10px",
    color: "#00ffff",
    letterSpacing: 3,
    resolution: 2
});

    scoreText = this.add.text(20, 26, "00000", {
        fontFamily: "'Courier New', monospace",
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 2
    });

    // High score
    const hsBg = this.add.graphics();
    hsBg.fillStyle(0x000000, 0.4);
    hsBg.fillRoundedRect(240, 8, 220, 44, 8);
    hsBg.lineStyle(1, 0x00ffff, 0.2);
    hsBg.strokeRoundedRect(240, 8, 220, 44, 8);

    this.add.text(252, 14, "BEST", {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#00ffff",
        alpha: 0.6,
        letterSpacing: 3,
        resolution: 2
    });

    highScoreText = this.add.text(252, 26, "BEST 00000", {
        fontFamily: "'Courier New', monospace",
        fontSize: "14px",
        color: "#aaffff",
        alpha: 0.7
    });

    // Shield button hint
    const shieldHintBg = this.add.graphics();
    shieldHintBg.fillStyle(0x000000, 0.4);
    shieldHintBg.fillRoundedRect(720, 8, 170, 44, 8);
    shieldHintBg.lineStyle(1, 0xaa00ff, 0.4);
    shieldHintBg.strokeRoundedRect(720, 8, 170, 44, 8);

    this.add.text(732, 12, "[S] FIREWALL", {
        fontFamily: "'Courier New', monospace",
        fontSize: "10px",
        color: "#cc88ff",
        letterSpacing: 2,
        resolution: 2
    });

    shieldBarBg = this.add.graphics();
    shieldBarBg.fillStyle(0x330033, 1);
    shieldBarBg.fillRoundedRect(732, 28, 146, 10, 4);

    shieldBar = this.add.graphics();
    drawShieldBar(shieldBar, 1);
}

function drawShieldBar(g, fraction) {
    g.clear();
    const w = Math.max(0, Math.floor(146 * fraction));
    if (w > 0) {
        g.fillStyle(0xaa00ff, 1);
        g.fillRoundedRect(732, 28, w, 10, 4);
    }
}

function drawGlowLine(g) {
    g.clear();
    for (let i = 4; i >= 1; i--) {
        g.lineStyle(i * 2, 0x00ffff, 0.03 * i);
        g.lineBetween(0, 360, 900, 360);
    }
    g.lineStyle(1, 0x00ffff, 0.6);
    g.lineBetween(0, 360, 900, 360);
}

function drawScanlines(g) {
    g.clear();
    for (let y = 0; y < 400; y += 4) {
        g.lineStyle(1, 0x000000, 0.15);
        g.lineBetween(0, y, 900, y);
    }
}

// ─── TITLE SCREEN ────────────────────────────────────────────────────────────

function showTitleScreen() {
    const scene = this;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 900, 400);

    // Glowing title
    const titleGlow = this.add.text(450, 105, "CYBER DINO", {
        fontFamily: "'Courier New', monospace",
        fontSize: "52px",
        color: "#00ffff",
        fontStyle: "bold",
        resolution: 2,
        shadow: { offsetX: 0, offsetY: 0, color: "#00ffff", blur: 15, fill: true }
    }).setOrigin(0.5).setAlpha(0);

    const subtitle = this.add.text(450, 162, "DEFEND YOUR DEVICE", {
        fontFamily: "'Courier New', monospace",
        fontSize: "16px",
        color: "#aa88ff",
        letterSpacing: 6,
        resolution: 2
    }).setOrigin(0.5).setAlpha(0);

    const controls = this.add.text(450, 230, "▲ / SPACE  →  JUMP          ▼  →  DUCK          [S]  →  FIREWALL SHIELD", {
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        color: "#aaffcc",
        letterSpacing: 1,
        resolution: 2
    }).setOrigin(0.5).setAlpha(0);

    const prompt = this.add.text(450, 295, "[ PRESS SPACE TO BOOT UP ]", {
        fontFamily: "'Courier New', monospace",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 2
    }).setOrigin(0.5).setAlpha(0);

    const version = this.add.text(450, 345, "v2.0  —  STAY SAFE ONLINE", {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#334455",
        letterSpacing: 4,
        resolution: 2
    }).setOrigin(0.5);

    // Staggered fade-in
    this.tweens.add({ targets: titleGlow,  alpha: 1, duration: 600, delay: 100, ease: "Power2" });
    this.tweens.add({ targets: subtitle,   alpha: 1, duration: 600, delay: 400, ease: "Power2" });
    this.tweens.add({ targets: controls,   alpha: 1, duration: 600, delay: 700, ease: "Power2" });
    this.tweens.add({ targets: prompt,     alpha: 1, duration: 600, delay: 1000, ease: "Power2",
        onComplete: () => {
            // Blinking prompt
            scene.tweens.add({
                targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
            });
        }
    });

    // Store references so we can destroy on start
    this._titleObjects = [overlay, titleGlow, subtitle, controls, prompt, version];
}

function startGame() {
    // Destroy title screen objects
    if (this._titleObjects) {
        this._titleObjects.forEach(o => {
            this.tweens.killTweensOf(o);
            o.destroy();
        });
        this._titleObjects = null;
    }
    gameStarted = true;
    scheduleObstacle.call(this);
}

// ─── OBSTACLES ───────────────────────────────────────────────────────────────

function scheduleObstacle() {
    if (gameOver) return;
    const delay = Phaser.Math.Between(1400, 2800) / speedMultiplier;
    this.time.addEvent({ delay, callback: spawnObstacle, callbackScope: this });
}

function spawnObstacle() {
    if (gameOver) return;

    const groundTypes = ["phishing", "malware", "Wifi"];
    let obstacle;

    if (Math.random() < 0.7) {
        const type = Phaser.Utils.Array.GetRandom(groundTypes);
        obstacle = obstacles.create(920, 330, type);
        obstacle.setScale(0.09);
        // Neon tints per threat
        const tints = { phishing: 0xff6666, malware: 0xff8844, Wifi: 0xffcc44 };
        obstacle.setTint(tints[type] || 0xffffff);
    } else {
        obstacle = obstacles.create(920, 255, "virusbird");
        obstacle.setScale(0.09);
        obstacle.setTint(0xff44cc);
    }

    obstacle.setVelocityX(-350 * speedMultiplier);
    obstacle.body.allowGravity = false;
    obstacle.setSize(obstacle.width * 0.6, obstacle.height * 0.6);
    obstacle.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);

    // Eerie pulse on obstacle
    this.tweens.add({
        targets: obstacle, alpha: 0.7, duration: 400, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });

    scheduleObstacle.call(this);
}

// ─── SHIELD ───────────────────────────────────────────────────────────────────

function activateShield() {
    if (shieldActive || shieldCooldown || !gameStarted || gameOver) return;

    shieldActive = true;
    player.setTint(0xaa00ff);

    // Visual ring around player
    const ring = this.add.graphics();
    const updateRing = () => {
        ring.clear();
        ring.lineStyle(3, 0xaa00ff, 0.9);
        ring.strokeCircle(player.x, player.y + 10, 38);
        ring.lineStyle(1, 0xdd88ff, 0.4);
        ring.strokeCircle(player.x, player.y + 10, 46);
    };

    const ringTimer = this.time.addEvent({ delay: 16, callback: updateRing, loop: true });

    const shieldDuration = 3000;
    const startTime = this.time.now;

    // Drain shield bar
    const drainEvent = this.time.addEvent({
        delay: 50,
        callback: () => {
            const elapsed = this.time.now - startTime;
            drawShieldBar(shieldBar, 1 - elapsed / shieldDuration);
        },
        loop: true
    });

    this.time.delayedCall(shieldDuration, () => {
        shieldActive = false;
        shieldCooldown = true;
        ringTimer.remove();
        drainEvent.remove();
        ring.destroy();
        player.setTint(0x88eeff);
        drawShieldBar(shieldBar, 0);

        // Cooldown recharge (5s)
        const rechargeStart = this.time.now;
        const recharge = this.time.addEvent({
            delay: 50,
            callback: () => {
                const e = this.time.now - rechargeStart;
                drawShieldBar(shieldBar, e / 5000);
                if (e >= 5000) {
                    shieldCooldown = false;
                    drawShieldBar(shieldBar, 1);
                    recharge.remove();
                    // Flash bar to signal ready
                    this.tweens.add({ targets: shieldBar, alpha: 0.3, duration: 150, yoyo: true, repeat: 3 });
                }
            },
            loop: true
        });
    });
}

// ─── JUMP PARTICLES ───────────────────────────────────────────────────────────

function spawnJumpParticles() {
    const g = this.add.graphics();
    const px = player.x;
    const py = player.y + 20;
    const dots = [];
    for (let i = 0; i < 6; i++) {
        dots.push({ x: px + Phaser.Math.Between(-12, 12), y: py, vx: Phaser.Math.Between(-40, 40) / 60, vy: Phaser.Math.Between(1, 4) / 60, alpha: 1 });
    }
    let life = 0;
    const ev = this.time.addEvent({
        delay: 16,
        callback: () => {
            life++;
            g.clear();
            dots.forEach(d => {
                d.x += d.vx * 3;
                d.y += d.vy * 3;
                d.alpha -= 0.05;
                if (d.alpha > 0) {
                    g.fillStyle(0x00ffff, d.alpha);
                    g.fillCircle(d.x, d.y, 2);
                }
            });
            if (life > 20) { ev.remove(); g.destroy(); }
        },
        loop: true
    });
}

// ─── HIT / DEATH ─────────────────────────────────────────────────────────────

function hitObstacle(player, obstacle) {
    if (gameOver) return;

    gameOver = true;
    player.setTint(0xff0000);
    player.setAlpha(1);

    // Screen flash
    const flash = this.add.graphics();
    flash.fillStyle(0xff0000, 0.35);
    flash.fillRect(0, 0, 900, 400);
    this.tweens.add({ targets: flash, alpha: 0, duration: 300 });

    // Camera shake substitute (move player)
    this.tweens.add({
        targets: player,
        x: player.x + 8,
        duration: 40,
        yoyo: true,
        repeat: 4
    });

    const type = obstacle.texture.key;
    const info = threatInfo[type] || threatInfo["phishing"];

    this.time.delayedCall(350, () => {
        showDeathScreen.call(this, info);
    });
}

function showDeathScreen(info) {
    const scene = this;
    const cx = 450, cy = 200;

    // Blur overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, 900, 400);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x080818, 1);
    panel.fillRoundedRect(cx - 330, cy - 170, 660, 340, 14);
    panel.lineStyle(2, info.color, 0.9);
    panel.strokeRoundedRect(cx - 330, cy - 170, 660, 340, 14);

    // Inner glow on panel edge
    panel.lineStyle(8, info.color, 0.12);
    panel.strokeRoundedRect(cx - 330, cy - 170, 660, 340, 14);

    // Skull / title
    this.add.text(cx, cy - 148, "CONNECTION TERMINATED", {
        fontFamily: "'Courier New', monospace",
        fontSize: "13px",
        color: "#" + info.color.toString(16).padStart(6, "0"),
        letterSpacing: 5,
        resolution: 2
    }).setOrigin(0.5);

    this.add.text(cx, cy - 118, info.emoji + "  THREAT DETECTED: " + info.title, {
        fontFamily: "'Courier New', monospace",
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 2,
        shadow: { offsetX: 0, offsetY: 0, color: "#" + info.color.toString(16).padStart(6, "0"), blur: 10, fill: true }
    }).setOrigin(0.5);

    // Divider
    const div = this.add.graphics();
    div.lineStyle(1, info.color, 0.4);
    div.lineBetween(cx - 280, cy - 90, cx + 280, cy - 90);

    // Score row
    const isNewBest = score >= highScore && score > 0;
    this.add.text(cx - 200, cy - 72, "FINAL SCORE", {
        fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#556677", letterSpacing: 3, resolution: 2 
    });
    this.add.text(cx - 200, cy - 52, String(score).padStart(5, "0"), {
        fontFamily: "'Courier New', monospace", fontSize: "28px", color: "#ffffff", fontStyle: "bold", resolution: 2
    });

    if (isNewBest) {
        this.add.text(cx - 200, cy - 20, "★ NEW BEST!", {
            fontFamily: "'Courier New', monospace", fontSize: "13px", color: "#ffdd00", resolution: 2
        });
    }

    // Explanation
    this.add.text(cx + 40, cy - 72, "THREAT ANALYSIS:", {
        fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#556677", letterSpacing: 2, resolution: 2
    });
    this.add.text(cx + 40, cy - 55, info.explanation, {
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        color: "#aabbcc",
        wordWrap: { width: 260 },
        resolution: 2
    });

    // Tip box
    const tipBox = this.add.graphics();
    tipBox.fillStyle(0x001122, 1);
    tipBox.fillRoundedRect(cx - 300, cy + 40, 600, 52, 8);
    tipBox.lineStyle(1, 0x00ffcc, 0.5);
    tipBox.strokeRoundedRect(cx - 300, cy + 40, 600, 52, 8);

    this.add.text(cx, cy + 55, "💡  " + info.tip, {
        fontFamily: "'Courier New', monospace",
        fontSize: "13px",
        color: "#00ffcc",
        wordWrap: { width: 560 },
        align: "center",
        resolution: 2
    }).setOrigin(0.5);

    // Restart prompt (blinking)
    const restart = this.add.text(cx, cy + 122, "[ PRESS SPACE TO RECONNECT ]", {
        fontFamily: "'Courier New', monospace",
        fontSize: "15px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 2  
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: restart, alpha: 1, duration: 400, delay: 600, onComplete: () => {
        scene.tweens.add({ targets: restart, alpha: 0.25, duration: 550, yoyo: true, repeat: -1 });
    }});

    // Animate panel in
    overlay.setAlpha(0);
    panel.setAlpha(0);
    this.tweens.add({ targets: [overlay, panel], alpha: 1, duration: 250 });
}

// ─── RESTART ─────────────────────────────────────────────────────────────────

function restartGame() {
    score = 0;
    gameOver = false;
    gameStarted = false;
    isDucking = false;
    shieldActive = false;
    shieldCooldown = false;
    speedMultiplier = 1;
    this.scene.restart();
}
