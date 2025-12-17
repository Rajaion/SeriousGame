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
        mode: Phaser.Scale.FIT,  // Torna a FIT per evitare problemi
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,  // Dimensioni base di design
        height: 1080,
        resolution: window.devicePixelRatio || 1  // Per nitidezza
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

// Gestione resize con debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        game.scale.refresh();
    }, 100);
});

// Gestione cambio orientamento
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        game.scale.refresh();
    }, 200);
});