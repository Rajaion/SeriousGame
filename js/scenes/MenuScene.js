class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    preload() {
        this.load.image("IconaMenu", "img/Menu.jpg");
    }

    create() {
        this.createUI();
        this.scale.on('resize', this.handleResize, this);
    }

    handleResize(gameSize) {
        this.time.delayedCall(50, () => {
            this.createUI();
        });
    }

    createUI() {
        // Pulisci tutto
        if (this.mainContainer) {
            this.mainContainer.destroy();
            this.sceneBorder.destroy();
        }

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // SCALA il container per adattarlo allo schermo
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        const scale = Math.min(scaleX, scaleY); // Mantieni proporzioni

        const borderWidth = 1920 * scale;
        const borderHeight = 1080 * scale;

        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight
        );
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight,
            0
        );

        // CREA TUTTO nel container con coordinate fisse (come se fosse 1920x1080)
        this.mainContainer = this.add.container(0, 0);

        // Posizioni fisse di riferimento
        const refCenterX = 960;  // Centro di 1920
        const refCenterY = 540;  // Centro di 1080

        // Icona
        const icona = this.add.image(refCenterX, refCenterY * 1, 'IconaMenu')
            .setScale(0.7);

        // Titolo
        const title = this.add.text(refCenterX, refCenterY * 0.35, 'Emergenza medica', {
            fontSize: '60px',
            color: "#ff0000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
        }).setOrigin(0.5);

        // Bottone
        const buttonGraphics = this.add.graphics();
        buttonGraphics.fillStyle(0x3498db, 1);
        buttonGraphics.fillRoundedRect(refCenterX - 130, refCenterY * 1.6 - 37.5, 250, 75, 20);
        buttonGraphics.lineStyle(3, 0x000000, 1);
        buttonGraphics.strokeRoundedRect(refCenterX - 130, refCenterY * 1.6 - 37.5, 250, 75, 20);

        // Sfondo Titolo
        const titleBackground = this.add.graphics();
        titleBackground.fillStyle(0xffffff, 1);
        titleBackground.fillRoundedRect(refCenterX - 310, refCenterY * 0.35 - 37.5, 620, 75, 20);
        titleBackground.lineStyle(3, 0x000000, 1);
        titleBackground.strokeRoundedRect(refCenterX - 310, refCenterY * 0.35 - 37.5, 620, 75, 20);

        const drawButton = (color) => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(color, 1);
            buttonGraphics.fillRoundedRect(refCenterX - 130, refCenterY * 1.6 - 37.5, 250, 75, 20);
            buttonGraphics.lineStyle(3, 0x000000, 1);
            buttonGraphics.strokeRoundedRect(refCenterX - 130, refCenterY * 1.6 - 37.5, 250, 75, 20);
        };

        // Testo bottone
        const startText = this.add.text(refCenterX * 0.99, refCenterY * 1.6, "Start", {
            fontSize: '60px',
            color: "#000000ff",
            fontFamily: "Poppins",
            align: "center",
            resolution: 2
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startText.removeAllListeners();

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

        // Aggiungi tutto al container
        this.mainContainer.add([icona, buttonGraphics, titleBackground, title, startText]);

        this.mainContainer.setScale(scale);

        // Centra il container scalato
        this.mainContainer.setPosition(
            centerX - (960 * scale),
            centerY - (540 * scale)
        );

    }

    shutdown() {
        this.scale.off('resize', this.handleResize, this);
    }
}