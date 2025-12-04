const gameState = {
  score: 0,
  maxScore: 100,
  errors: {Hospital: 0, Patient: 0, Cart: 0},
  currentChoice: null,
}

const config = {
  type: Phaser.CANVAS,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#43b2bc",
  scene: [ //tutte le varie scene del wireFrame
    MenuScene, 
    IntroScene,
    HospitalScene,
    PatientScene,
    CartScene,
    EndScene,
    ReviewScene,
  ],

  //scala in maniera automatica il "teatro"
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics:{
    default: "arcade", //tipo di fisica stile giochi arcade (non sofisticata)
  },
};

const game = new Phaser.Game(config);
