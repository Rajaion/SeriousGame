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
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: window.devicePixelRatio  // CHIAVE per la nitidezza
    },
    backgroundColor: '#4D5B8C',
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: false
    },
    scene: [MenuScene, IntroScene, CartScene, EndScene, HospitalScene, PatientScene, ReviewScene] // Le tue scene
};

const game = new Phaser.Game(config);