let player;
let obstacles;
let ground;

let score = 0;
let scoreText;
let highScore = 0;
let highScoreText;
let speedMultiplier = 1;
let baseSpeed = 350;

let gameOver = false;
let gameStarted = false;
let isDucking = false;

let cursors;
let shieldActive = false;
let shieldCooldown = false;
let shieldBar;
let shieldBarBg;

let scanlineGraphics;
let glowGraphics;

// Performance optimization - limit active elements
let difficultyLevel = 1;
let activeObstacles = 0;
let maxObstacles = 8; // Maximum obstacles at once
let lastSpawnTime = 0;
let spawnTimer = null;
let difficultyTimer = null;
let updateTimer = null;

const threatInfo = {
    phishing: {
        title: "PHISHING EMAIL",
        explanation: "Phishing emails impersonate trusted sources to steal your credentials.",
        tip: "Always verify the sender's address before clicking any links!",
        color: 0xff4444,
        emoji: "🎣",
        speed: 1.0
    },
    malware: {
        title: "MALWARE",
        explanation: "Malware is malicious software designed to damage or disrupt your device.",
        tip: "Never download files from unknown or untrusted sources!",
        color: 0xff6600,
        emoji: "🦠",
        speed: 1.1
    },
    Wifi: {
        title: "FAKE WiFi HOTSPOT",
        explanation: "Hackers set up rogue WiFi networks to intercept your data in transit.",
        tip: "Avoid connecting to unknown public WiFi — use a VPN when necessary!",
        color: 0xffaa00,
        emoji: "📡",
        speed: 0.9
    },
    virusbird: {
        title: "MALICIOUS LINK",
        explanation: "Weaponised links can silently install malware when clicked.",
        tip: "Hover before you click — never follow suspicious URLs!",
        color: 0xff0088,
        emoji: "🔗",
        speed: 1.3
    },
    ransomware: {
        title: "RANSOMWARE",
        explanation: "Ransomware encrypts your files and demands payment for decryption.",
        tip: "Regular backups are your best defense against ransomware!",
        color: 0xff0000,
        emoji: "💰",
        speed: 1.2
    },
    zeroDay: {
        title: "ZERO-DAY EXPLOIT",
        explanation: "Unknown vulnerability being actively exploited by hackers.",
        tip: "Keep all software updated to patch known vulnerabilities!",
        color: 0xaa00ff,
        emoji: "💀",
        speed: 1.4
    },
    botnet: {
        title: "BOTNET ATTACK",
        explanation: "Your device could be recruited into a network of infected computers.",
        tip: "Unusual network activity might indicate botnet infection!",
        color: 0x00aa88,
        emoji: "🕸️",
        speed: 0.8
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
            debug: false,
            fps: 60 // Limit physics updates
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

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
    
    // Initialize
    difficultyLevel = 1;
    activeObstacles = 0;
    
    // Clean up any existing timers
    if (spawnTimer) spawnTimer.remove();
    if (difficultyTimer) difficultyTimer.remove();
    if (updateTimer) updateTimer.remove();

    // ── Background ──────────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d1a2e, 0x0d1a2e, 1);
    bg.fillRect(0, 0, 900, 400);

    // Static grid (lighter for performance)
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00ffff, 0.03);
    for (let x = 0; x <= 900; x += 60) { // Wider spacing for performance
        grid.lineBetween(x, 0, x, 400);
    }
    for (let y = 0; y <= 400; y += 60) {
        grid.lineBetween(0, y, 900, y);
    }

    // Glowing horizon line
    glowGraphics = this.add.graphics();
    drawGlowLine(glowGraphics);

    // Scanlines (static for performance)
    scanlineGraphics = this.add.graphics();
    drawScanlines(scanlineGraphics);

    // ── Ground ──────────────────────────────────────────────────────────────
    ground = this.add.tileSprite(450, 380, 900, 40, "ground");
    ground.setTint(0x00ccff);
    ground.setAlpha(0.7);
    this.physics.add.existing(ground, true);

    // ── Player ──────────────────────────────────────────────────────────────
    player = this.physics.add.sprite(120, 50, "laptop");
    player.setScale(0.09);
    player.setCollideWorldBounds(true);
    player.setTint(0x88eeff);
    player.setSize(player.width * 0.55, player.height * 0.7);
    player.setOffset(player.width * 0.2, player.height * 0.25);
    this.physics.add.collider(player, ground);

    // ── Obstacle group ───────────────────────────────────────────────────────
    obstacles = this.physics.add.group({
        maxSize: 20 // Limit total obstacles
    });

    this.physics.add.overlap(player, obstacles, hitObstacle, function(p, o) {
        if (shieldActive) return false;
        return Phaser.Geom.Intersects.RectangleToRectangle(p.getBounds(), o.getBounds());
    }, this);

    // ── HUD ─────────────────────────────────────────────────────────────────
    buildHUD.call(this);
    addDifficultyIndicator.call(this);

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

    this.input.keyboard.on("keydown-S", () => {
        activateShield.call(scene);
    });

    // ─── OPTIMIZED TIMERS ───────────────────────────────────────────────────
    
    // Score timer (less frequent updates)
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
                // Update difficulty every 2 seconds instead of every second
                if (score % 20 === 0) {
                    updateDifficulty.call(this);
                    updateDifficultyIndicator.call(this);
                }
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

    // Ground movement
    ground.tilePositionX += 6 * speedMultiplier;

    // Simple player pulse (less frequent)
    if (this.time.now % 300 < 16) {
        const pulse = 0.85 + Math.sin(this.time.now / 300) * 0.15;
        player.setAlpha(pulse);
    }

    // Clean up off-screen obstacles and count active ones
    activeObstacles = 0;
    obstacles.getChildren().forEach(o => {
        if (o.x < -100) {
            o.destroy();
        } else {
            activeObstacles++;
        }
    });
}

// ─── DIFFICULTY MANAGEMENT ───────────────────────────────────────────────────

function updateDifficulty() {
    // Smoother difficulty progression
    const newDifficulty = 1 + Math.floor(score / 200);
    
    if (newDifficulty > difficultyLevel) {
        difficultyLevel = newDifficulty;
        
        // Update speed multiplier (capped at 2.8 for performance)
        speedMultiplier = Math.min(1 + (difficultyLevel - 1) * 0.2, 2.8);
        baseSpeed = 350 + (difficultyLevel - 1) * 30;
        
        // Visual feedback (simplified)
        if (difficultyLevel % 2 === 0) {
            const flash = this.add.graphics();
            flash.fillStyle(0xff0000, 0.15);
            flash.fillRect(0, 0, 900, 400);
            this.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 200,
                onComplete: () => flash.destroy()
            });
        }
    }
}

function addDifficultyIndicator() {
    const indicatorBg = this.add.graphics();
    indicatorBg.fillStyle(0x000000, 0.4);
    indicatorBg.fillRoundedRect(480, 8, 160, 44, 8);
    indicatorBg.lineStyle(1, 0xffaa00, 0.4);
    indicatorBg.strokeRoundedRect(480, 8, 160, 44, 8);
    
    this.add.text(492, 14, "THREAT LEVEL", {
        fontFamily: "'Courier New', monospace",
        fontSize: "9px",
        color: "#ffaa00",
        letterSpacing: 2,
        resolution: 2
    });
    
    this.difficultyText = this.add.text(492, 26, "SECURE", {
        fontFamily: "'Courier New', monospace",
        fontSize: "14px",
        color: "#00ff00",
        fontStyle: "bold",
        resolution: 2
    });
}

function updateDifficultyIndicator() {
    if (!this.difficultyText) return;
    
    let text = "SECURE";
    let color = "#00ff00";
    
    if (difficultyLevel >= 7) {
        text = "CRITICAL";
        color = "#ff0000";
    } else if (difficultyLevel >= 5) {
        text = "SEVERE";
        color = "#ff6600";
    } else if (difficultyLevel >= 3) {
        text = "ELEVATED";
        color = "#ffaa00";
    } else if (difficultyLevel >= 2) {
        text = "GUARDED";
        color = "#ffff00";
    }
    
    this.difficultyText.setText(text);
    this.difficultyText.setColor(color);
}

// ─── HUD ────────────────────────────────────────────────────────────────────

function buildHUD() {
    // Score area
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.4);
    hudBg.fillRoundedRect(8, 8, 220, 44, 8);
    hudBg.lineStyle(1, 0x00ffff, 0.4);
    hudBg.strokeRoundedRect(8, 8, 220, 44, 8);

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

    // Shield
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
    g.lineStyle(2, 0x00ffff, 0.6);
    g.lineBetween(0, 360, 900, 360);
}

function drawScanlines(g) {
    g.clear();
    for (let y = 0; y < 400; y += 6) { // Thicker lines for performance
        g.lineStyle(1, 0x000000, 0.1);
        g.lineBetween(0, y, 900, y);
    }
}

// ─── TITLE SCREEN ────────────────────────────────────────────────────────────

function showTitleScreen() {
    const scene = this;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 900, 400);

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

    const version = this.add.text(450, 345, "v2.1  —  OPTIMIZED", {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#334455",
        letterSpacing: 4,
        resolution: 2
    }).setOrigin(0.5);

    // Simplified animations
    this.tweens.add({ targets: titleGlow, alpha: 1, duration: 600 });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 600, delay: 400 });
    this.tweens.add({ targets: controls, alpha: 1, duration: 600, delay: 700 });
    this.tweens.add({ targets: prompt, alpha: 1, duration: 600, delay: 1000 });

    this._titleObjects = [overlay, titleGlow, subtitle, controls, prompt, version];
}

function startGame() {
    if (this._titleObjects) {
        this._titleObjects.forEach(o => {
            this.tweens.killTweensOf(o);
            o.destroy();
        });
        this._titleObjects = null;
    }
    gameStarted = true;
    
    // Start spawn timer
    scheduleObstacle.call(this);
}

// ─── OBSTACLES ───────────────────────────────────────────────────────────────

function scheduleObstacle() {
    if (gameOver || !gameStarted) return;
    
    // Don't spawn if too many obstacles
    if (activeObstacles >= maxObstacles) {
        this.time.delayedCall(500, () => scheduleObstacle.call(this));
        return;
    }
    
    // Calculate delay based on difficulty and active obstacles
    let delay = Math.max(400, 1400 - (difficultyLevel - 1) * 80);
    
    // Adjust for performance
    if (activeObstacles > 3) {
        delay *= 1.5;
    }
    
    // Add random variation
    delay = Phaser.Math.Between(delay * 0.8, delay * 1.2);
    
    spawnTimer = this.time.delayedCall(delay, () => {
        spawnObstacle.call(this);
        scheduleObstacle.call(this);
    });
}

function spawnObstacle() {
    if (gameOver || !gameStarted) return;
    if (activeObstacles >= maxObstacles) return;

    // Determine spawn count (1-2 max for performance)
    let spawnCount = 1;
    if (difficultyLevel >= 4 && Math.random() < 0.25 && activeObstacles < maxObstacles - 1) {
        spawnCount = 2;
    }
    
    for (let i = 0; i < spawnCount; i++) {
        if (activeObstacles >= maxObstacles) break;
        
        // Select threat type
        let type;
        const rand = Math.random();
        
        if (difficultyLevel >= 6 && rand < 0.1) {
            type = "zeroDay";
        } else if (difficultyLevel >= 4 && rand < 0.15) {
            type = "ransomware";
        } else if (difficultyLevel >= 2 && rand < 0.2) {
            type = "botnet";
        } else {
            const standardRand = Math.random();
            if (standardRand < 0.35) type = "phishing";
            else if (standardRand < 0.65) type = "malware";
            else if (standardRand < 0.85) type = "Wifi";
            else type = "virusbird";
        }
        
        const threatData = threatInfo[type];
        
        // Spawn position
        let spawnX = 920 + (i * 50);
        let spawnY = (type === "virusbird" || type === "zeroDay") ? 255 : 330;
        
        // Create obstacle
        const obstacle = obstacles.create(spawnX, spawnY, type);
        if (!obstacle) continue; // Skip if pool is full
        
        obstacle.setScale(0.09);
        obstacle.setTint(threatData.color);
        
        const threatSpeed = baseSpeed * threatData.speed * speedMultiplier;
        obstacle.setVelocityX(-threatSpeed);
        obstacle.body.allowGravity = false;
        
        // Set collision size
        if (type === "botnet") {
            obstacle.setSize(obstacle.width * 0.8, obstacle.height * 0.8);
        } else if (type === "zeroDay") {
            obstacle.setSize(obstacle.width * 0.4, obstacle.height * 0.4);
        } else {
            obstacle.setSize(obstacle.width * 0.6, obstacle.height * 0.6);
        }
        
        obstacle.setOffset(obstacle.width * 0.2, obstacle.height * 0.2);
        obstacle.threatData = threatData;
        
        activeObstacles++;
    }
}

// ─── SHIELD ───────────────────────────────────────────────────────────────────

function activateShield() {
    if (shieldActive || shieldCooldown || !gameStarted || gameOver) return;

    shieldActive = true;
    player.setTint(0xaa00ff);

    // Simple shield ring (static for performance)
    const ring = this.add.graphics();
    ring.lineStyle(3, 0xaa00ff, 0.9);
    ring.strokeCircle(player.x, player.y + 10, 38);

    const shieldDuration = 3000;
    const startTime = this.time.now;

    // Update shield bar
    const drainEvent = this.time.addEvent({
        delay: 100, // Less frequent updates
        callback: () => {
            const elapsed = this.time.now - startTime;
            drawShieldBar(shieldBar, 1 - elapsed / shieldDuration);
        },
        loop: true
    });

    this.time.delayedCall(shieldDuration, () => {
        shieldActive = false;
        shieldCooldown = true;
        drainEvent.remove();
        ring.destroy();
        player.setTint(0x88eeff);
        drawShieldBar(shieldBar, 0);

        // Cooldown
        const cooldownTime = 4000;
        const rechargeStart = this.time.now;
        const recharge = this.time.addEvent({
            delay: 100,
            callback: () => {
                const e = this.time.now - rechargeStart;
                drawShieldBar(shieldBar, e / cooldownTime);
                if (e >= cooldownTime) {
                    shieldCooldown = false;
                    drawShieldBar(shieldBar, 1);
                    recharge.remove();
                }
            },
            loop: true
        });
    });
}

// ─── JUMP PARTICLES ───────────────────────────────────────────────────────────

function spawnJumpParticles() {
    // Simplified particles
    const g = this.add.graphics();
    for (let i = 0; i < 4; i++) {
        const x = player.x + Phaser.Math.Between(-10, 10);
        const y = player.y + 20;
        g.fillStyle(0x00ffff, 0.8);
        g.fillCircle(x, y, 2);
    }
    
    // Fade out quickly
    this.tweens.add({
        targets: g,
        alpha: 0,
        duration: 200,
        onComplete: () => g.destroy()
    });
}

// ─── HIT / DEATH ─────────────────────────────────────────────────────────────

function hitObstacle(player, obstacle) {
    if (gameOver) return;

    gameOver = true;
    player.setTint(0xff0000);

    // Simple flash
    const flash = this.add.graphics();
    flash.fillStyle(0xff0000, 0.3);
    flash.fillRect(0, 0, 900, 400);
    this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });

    // Simple shake
    this.tweens.add({
        targets: player,
        x: player.x + 8,
        duration: 30,
        yoyo: true,
        repeat: 3
    });

    const type = obstacle.texture.key;
    const info = threatInfo[type] || threatInfo["phishing"];

    this.time.delayedCall(300, () => {
        showDeathScreen.call(this, info);
    });
}

function showDeathScreen(info) {
    const scene = this;
    const cx = 450, cy = 200;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 900, 400);

    const panel = this.add.graphics();
    panel.fillStyle(0x080818, 1);
    panel.fillRoundedRect(cx - 330, cy - 170, 660, 340, 14);
    panel.lineStyle(2, info.color, 0.9);
    panel.strokeRoundedRect(cx - 330, cy - 170, 660, 340, 14);

    // Title
    this.add.text(cx, cy - 148, "CONNECTION TERMINATED", {
        fontFamily: "'Courier New', monospace",
        fontSize: "13px",
        color: "#" + info.color.toString(16).padStart(6, "0"),
        letterSpacing: 5,
        resolution: 2
    }).setOrigin(0.5);

    this.add.text(cx, cy - 118, info.emoji + "  THREAT DETECTED: " + info.title, {
        fontFamily: "'Courier New', monospace",
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 2
    }).setOrigin(0.5);

    // Score
    this.add.text(cx - 200, cy - 72, "FINAL SCORE", {
        fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#556677", letterSpacing: 3, resolution: 2 
    });
    this.add.text(cx - 200, cy - 52, String(score).padStart(5, "0"), {
        fontFamily: "'Courier New', monospace", fontSize: "28px", color: "#ffffff", fontStyle: "bold", resolution: 2
    });

    // Info
    this.add.text(cx + 40, cy - 55, info.explanation.substring(0, 50) + "...", {
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#aabbcc",
        wordWrap: { width: 260 },
        resolution: 2
    });

    // Restart prompt
    const restart = this.add.text(cx, cy + 122, "[ PRESS SPACE TO RECONNECT ]", {
        fontFamily: "'Courier New', monospace",
        fontSize: "15px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 2  
    }).setOrigin(0.5);

    // Simple blink
    this.tweens.add({
        targets: restart,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
    });
}

// ─── RESTART ─────────────────────────────────────────────────────────────────

function restartGame() {
    // Clean up timers
    if (spawnTimer) spawnTimer.remove();
    
    // Reset all variables
    score = 0;
    gameOver = false;
    gameStarted = false;
    isDucking = false;
    shieldActive = false;
    shieldCooldown = false;
    speedMultiplier = 1;
    difficultyLevel = 1;
    baseSpeed = 350;
    activeObstacles = 0;
    
    // Restart scene
    this.scene.restart();
}