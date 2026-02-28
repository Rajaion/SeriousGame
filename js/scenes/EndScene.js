class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: "EndScene" });
        
        // Configurazione posizioni (riferimento 1920x1080)
        this.refPositions = {
            patient: { x: 960, y: 220 },
            messageBox: { x: 960, y: 520 },
            button: { x: 960, y: 870 }
        };
    }

    preload() {
        this.load.image("HappyPatient", "img/HappyPatient.png");
    }

    create() {
        this.createContent();
    }

    createContent() {
        this.children.removeAll();
        this.textElements = [];

        this.createBackground();
        this.createGameContent();
        this.createTexts();
    }

    createBackground() {
        const happyPatient = this.add.image(960, 540, "HappyPatient").setOrigin(0.5, 0.5);
        happyPatient.setScale(Math.min(1920 / happyPatient.width, 1080 / happyPatient.height));
    }

    createGameContent() {



        // Bottone (stile MenuScene/IntroScene)
        const { button } = this.refPositions;
        const buttonWidth = 500;
        const buttonHeight = 75;
        this.buttonGraphics = this.add.graphics();

        const drawButton = (color) => {
            if (!this.buttonGraphics) return;
            this.buttonGraphics.clear();
            this.buttonGraphics.fillStyle(color, 1);
            this.buttonGraphics.fillRoundedRect(
                button.x - buttonWidth / 2,
                button.y - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                20
            );
            this.buttonGraphics.lineStyle(3, 0x000000, 1);
            this.buttonGraphics.strokeRoundedRect(
                button.x - buttonWidth / 2,
                button.y - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                20
            );
        };

        drawButton(0x3498db);  // Stesso colore blu di MenuScene

        // Area interattiva bottone
        const buttonArea = this.add.rectangle(button.x, button.y, buttonWidth, buttonHeight)
            .setInteractive({ useHandCursor: true })
            .setAlpha(0.01);



        // Salva riferimento per eventi
        this.buttonArea = buttonArea;
        this.drawButton = drawButton;
    }

    createTexts() {
        const { messageBox, button } = this.refPositions;
        

        // Score text dentro la box, sotto il messaggio
        const scoreText = this.add.text(960, 900,
            "\n\nScore: " + gameState.score, {
            fontSize: `32px`,
            color: "#000000",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(scoreText);

        // Testo bottone
        const reviewButton = this.add.text(button.x, button.y,
            "Invia il risultato", {
            fontSize: `40px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.textElements.push(reviewButton);

        // Eventi bottone (stile MenuScene/IntroScene)
        this.buttonArea.removeAllListeners();
        
        reviewButton.on("pointerover", () => {
            this.drawButton(0x5DADE2);  // Colore hover come MenuScene
            reviewButton.setScale(1.05);
        });

        reviewButton.on("pointerout", () => {
            this.drawButton(0x3498db);
            reviewButton.setScale(1);
        });

        this.buttonArea.on("pointerover", () => {
            this.drawButton(0x5DADE2);
            reviewButton.setScale(1.05);
        });

        this.buttonArea.on("pointerout", () => {
            this.drawButton(0x3498db);
            reviewButton.setScale(1);
        });

        this.buttonArea.on("pointerdown", () => {
            this.drawButton(0x2980b9);  // Colore click come MenuScene
            this.time.delayedCall(100, () => {
                this.scene.start("DataScene");
            });
        });

        reviewButton.on("pointerdown", () => {
            this.drawButton(0x2980b9);
            this.time.delayedCall(100, () => {
                this.scene.start("DataScene");
            });
        });
    }
}