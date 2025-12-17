const gameState = {
  score: 0,
  maxScore: 100,
  errors: {Hospital: 0, Patient: 0, Cart: 0},
  currentChoice: null,
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE, // IMPORTANTE: usa RESIZE
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    backgroundColor: '#4D5B8C',
    scene: [MenuScene, IntroScene, CartScene, EndScene, HospitalScene, PatientScene, ReviewScene] // Le tue scene
};

const game = new Phaser.Game(config);