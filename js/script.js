const gameState = {
  score: 0,
  maxScore: 100,
  errors: {Hospital: 0, Patient: 0, Cart: 0},
  currentChoice: null,
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,              // Mantiene proporzioni
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centrato
        width: 1280,   // Larghezza base
        height: 720,   // Altezza base (16:9)
        min: {
            width: 800,   // ← Larghezza minima (non diventa troppo piccolo)
            height: 450
        },
        max: {
            width: 1920,  // Larghezza massima
            height: 1080
        }
    },
    backgroundColor: '#5bc0de',
    scene: [MenuScene, IntroScene, HospitalScene, PatientScene, CartScene, ReviewScene, EndScene],

  physics:{
    default: "arcade", //tipo di fisica stile giochi arcade (non sofisticata)
  },
};

const game = new Phaser.Game(config);
