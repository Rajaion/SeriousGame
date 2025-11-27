const gameState = {
  score: 0,
  maxScore: 100,
  errors: [],
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
    DialogScene,
    PatientScene,
    CartScene,
    //EndScene
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
