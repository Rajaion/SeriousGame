const gameState = {
  score: 0,
  maxScore: 100,
  errors: {Hospital: 0, Patient: 0, Cart: 0},
  currentChoice: null,
}

const config = {
 type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,              // Adatta allo schermo
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centra
        width: 1280,   // Larghezza base (proporzione 16:9)
        height: 720    // Altezza base
    },
    backgroundColor: '#5bc0de',
    scene: [MenuScene, IntroScene, HospitalScene, PatientScene, CartScene, ReviewScene, EndScene],

  physics:{
    default: "arcade", //tipo di fisica stile giochi arcade (non sofisticata)
  },
};

const game = new Phaser.Game(config);
