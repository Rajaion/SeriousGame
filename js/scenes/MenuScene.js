class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    preload() {
        this.load.image("IconaMenu", "img/Menu.png");
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
        }

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        this.add.rectangle(centerX, centerY, width, height, 0x104D5B);

        // CREA TUTTO nel container con coordinate fisse (come se fosse 1920x1080)
        this.mainContainer = this.add.container(0, 0);

        // Posizioni fisse di riferimento
        const refCenterX = 960;  // Centro di 1920
        const refCenterY = 540;  // Centro di 1080

        // Icona
        const icona = this.add.image(refCenterX, refCenterY * 1, 'IconaMenu')
            .setScale(0.5);

        // Titolo
        const title = this.add.text(refCenterX, refCenterY * 0.35, 'Emergenza medica', {
            fontSize: '77px',
            color: "#2c3e50",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Bottone
        const buttonGraphics = this.add.graphics();
        buttonGraphics.fillStyle(0x3CFA80, 1);
        buttonGraphics.fillRoundedRect(refCenterX - 125, refCenterY * 1.6 - 37.5, 250, 75, 20);

        const drawButton = (color) => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(color, 1);
            buttonGraphics.fillRoundedRect(refCenterX - 125, refCenterY * 1.6 - 37.5, 250, 75, 20);
        };

        // Testo bottone
        const startText = this.add.text(refCenterX, refCenterY * 1.6, "Start", {
            fontSize: '40px',
            color: "#ffffff",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startText.removeAllListeners();

        startText.on("pointerover", () => {
            drawButton(0x3DFB3F);
            startText.setScale(1.05);
        });

        startText.on("pointerout", () => {
            drawButton(0x3CFA80);
            startText.setScale(1);
        });

        startText.on("pointerdown", () => {
            drawButton(0x2ecc71);
            this.time.delayedCall(100, () => {
                this.scene.start("IntroScene");
            });
        });

        // Aggiungi tutto al container
        this.mainContainer.add([buttonGraphics, icona, title, startText]);

        // SCALA il container per adattarlo allo schermo
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        const scale = Math.min(scaleX, scaleY); // Mantieni proporzioni

        this.mainContainer.setScale(scale);

        // Centra il container scalato
        this.mainContainer.setPosition(
            centerX - (960 * scale),
            centerY - (540 * scale)
        );

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
    }

    shutdown() {
        this.scale.off('resize', this.handleResize, this);
    }
}