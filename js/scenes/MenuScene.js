class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    preload() {
        this.load.image("IconaMenu", "img/Menu.jpg");
    }

    create() {
        this.children.removeAll();

        // Usa dimensioni fisse del gioco (1920x1080)
        const centerX = 960;  // 1920 / 2
        const centerY = 540;  // 1080 / 2

        // Bordo della scena
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(centerX - 960, centerY - 540, 1920, 1080);
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(centerX - 960, centerY - 540, 1920, 1080, 0);

        // Icona
        const icona = this.add.image(centerX, centerY, 'IconaMenu').setScale(0.7);

        // Sfondo Titolo
        const titleBackground = this.add.graphics();
        titleBackground.fillStyle(0xffffff, 1);
        titleBackground.fillRoundedRect(centerX - 310, centerY * 0.35 - 37.5, 620, 75, 20);
        titleBackground.lineStyle(3, 0x000000, 1);
        titleBackground.strokeRoundedRect(centerX - 310, centerY * 0.35 - 37.5, 620, 75, 20);

        // Titolo
        const title = this.add.text(centerX, centerY * 0.35, 'Emergenza medica', {
            fontSize: '60px',
            color: "#ff0000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
        }).setOrigin(0.5);

        // Bottone
        const buttonGraphics = this.add.graphics();
        buttonGraphics.fillStyle(0x3498db, 1);
        buttonGraphics.fillRoundedRect(centerX - 130, centerY * 1.6 - 37.5, 250, 75, 20);
        buttonGraphics.lineStyle(3, 0x000000, 1);
        buttonGraphics.strokeRoundedRect(centerX - 130, centerY * 1.6 - 37.5, 250, 75, 20);

        const drawButton = (color) => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(color, 1);
            buttonGraphics.fillRoundedRect(centerX - 130, centerY * 1.6 - 37.5, 250, 75, 20);
            buttonGraphics.lineStyle(3, 0x000000, 1);
            buttonGraphics.strokeRoundedRect(centerX - 130, centerY * 1.6 - 37.5, 250, 75, 20);
        };

        // Testo bottone
        const startText = this.add.text(centerX * 0.99, centerY * 1.6, "Start", {
            fontSize: '60px',
            color: "#000000ff",
            fontFamily: "Poppins",
            align: "center",
            resolution: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startText.on("pointerover", () => {
            drawButton(0x5DADE2);
            startText.setScale(1.05);
        });

        startText.on("pointerout", () => {
            drawButton(0x3498db);
            startText.setScale(1);
        });

        startText.on("pointerdown", () => {
            drawButton(0x2980b9);
            this.time.delayedCall(100, () => {
                this.scene.start("IntroScene");
            });
        });
    }
}