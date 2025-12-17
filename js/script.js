const config = {
    type: Phaser.AUTO,
    parent: 'game-container', // ID del div contenitore
    scale: {
        mode: Phaser.Scale.FIT, // Adatta il gioco mantenendo le proporzioni
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centra sempre
        width: 1080, // Larghezza base di design
        height: 1920, // Altezza base di design (formato mobile verticale)
        min: {
            width: 360,
            height: 640
        },
        max: {
            width: 1920,
            height: 2560
        }
    },
    backgroundColor: '#4D5B8C',
    scene: [MenuScene, IntroScene] // Le tue scene
};

const game = new Phaser.Game(config);