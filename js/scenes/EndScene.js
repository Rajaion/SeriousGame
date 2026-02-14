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
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(0, 0, 1920, 1080);
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(0, 0, 1920, 1080, 0);
    }

    createGameContent() {
        // Paziente felice
        const { patient } = this.refPositions;
        const patientImg = this.add.image(patient.x, patient.y, "HappyPatient");

        // Box per il messaggio (come in IntroScene)
        const { messageBox } = this.refPositions;
        const boxWidth = 800;
        const boxHeight = 200;
        const messageBoxGraphics = this.add.graphics();
        messageBoxGraphics.fillStyle(0xecf0f1, 1);
        messageBoxGraphics.fillRoundedRect(
            messageBox.x - boxWidth / 2,
            messageBox.y - boxHeight / 2,
            boxWidth,
            boxHeight,
            20
        );
        messageBoxGraphics.lineStyle(2, 0x2c3e50, 1);
        messageBoxGraphics.strokeRoundedRect(
            messageBox.x - boxWidth / 2,
            messageBox.y - boxHeight / 2,
            boxWidth,
            boxHeight,
            20
        );

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
        
        // Testo congratulazioni dentro la box
        const messageText = this.add.text(messageBox.x, messageBox.y - 30,
            "Congratulazioni!!\nHai salvato il paziente!", {
            fontSize: `40px`,
            color: "#2c3e50",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(messageText);

        // Score text dentro la box, sotto il messaggio
        const scoreText = this.add.text(messageBox.x, messageBox.y + 40,
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
            "Vediamo gli errori", {
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
                this.scene.start("ReviewScene");
            });
        });

        reviewButton.on("pointerdown", () => {
            this.drawButton(0x2980b9);
            this.time.delayedCall(100, () => {
                this.scene.start("ReviewScene");
            });
        });
    }
}