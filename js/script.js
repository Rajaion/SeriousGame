const gameState = {
  score: 0,
  maxScore: 100,
  errors: {Hospital: 0, Patient: 0, Cart: 0},
  currentChoice: null,
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-wrapper', 

    scale: {
        mode: Phaser.Scale.RESIZE,              // Mantiene proporzioni
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centrato
        width: 1920,   // Larghezza base
        height: 1080,   // Altezza base (16:9)
    },
    backgroundColor: '#5bc0de',
    scene: [MenuScene, IntroScene, HospitalScene, PatientScene, CartScene, ReviewScene, EndScene],

  physics:{
    default: "arcade", //tipo di fisica stile giochi arcade (non sofisticata)
  },
};

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

const game = new Phaser.Game(config);
