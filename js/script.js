const gameState = {
  score: 0,
  maxScore: 100,
  errors: { Hospital: 0, Patient: 0, Cart: 0 },
  errorLog: [], // ogni errore: { scene, description }
  currentChoice: null,
};

// Registra un errore (incrementa il contatore e aggiunge a errorLog per Firebase)
function logGameError(scene, description) {
  if (gameState.errors[scene] !== undefined) gameState.errors[scene]++;
  gameState.errorLog.push({ scene: scene, description: description || scene });
}
window.logGameError = logGameError;

const config = {
    type: Phaser.AUTO,
    parent: 'game-wrapper',
    backgroundColor: '#000000',
    // Risoluzione fissa del gioco (design resolution)
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT, // Mantiene aspect ratio, aggiunge letterboxing se necessario
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centra sia orizzontalmente che verticalmente
        width: 1920,
        height: 1080,
        // Phaser gestirà automaticamente il resize e il centraggio
    },
    // Rendering ad alta risoluzione per evitare sgranatura
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    },
    scene: [MenuScene, IntroScene, HospitalScene, PatientScene, PatientToCart, CartScene, EndScene, DataScene],
};

const game = new Phaser.Game(config);

// Imposta resolution basata su devicePixelRatio per rendering nitido
if (game.renderer && game.renderer.gl) {
    const dpr = window.devicePixelRatio || 1;
    game.renderer.resolution = Math.min(dpr, 2); // Limita a 2x per performance
}

// Gestione resize: Phaser.FIT gestisce automaticamente il resize
// Aggiungiamo solo un refresh per sicurezza
window.addEventListener('resize', () => {
    if (game.scale) {
        game.scale.refresh();
    }
});

window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (game.scale) {
            game.scale.refresh();
        }
    }, 200);
});