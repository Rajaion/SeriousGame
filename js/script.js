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
        mode: Phaser.Scale.RESIZE, 
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    scene: [MenuScene, IntroScene, HospitalScene, PatientScene, CartScene, EndScene, ReviewScene],
    backgroundColor: '#34495e'
};

const game = new Phaser.Game(config);

// Gestione resize finestra
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        game.scale.resize(window.innerWidth, window.innerHeight);
    }, 100);
});

// Gestione cambio orientamento (importante per mobile)
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        game.scale.resize(window.innerWidth, window.innerHeight);
        game.scale.refresh();
    }, 200);
});