import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import ResultScene from './scenes/ResultScene.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#FFFACD',
  transparent: false,
  scene: [MenuScene, GameScene, ResultScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: false,
    antialias: true,
    resolution: window.devicePixelRatio || 1
  },
  parent: 'game-container'
};

export default new Phaser.Game(config);
