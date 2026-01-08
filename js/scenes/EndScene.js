class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: "EndScene" });
        
        // Configurazione posizioni (riferimento 1920x1080)
        this.refPositions = {
            refCenter: { x: 960, y: 540 },
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
        this.scale.on('resize', this.handleResize, this);
    }

    handleResize() {
        this.time.delayedCall(50, () => {
            if (this.scene.isActive()) {
                this.createContent();
            }
        });
    }

    createContent() {
        // Pulisci tutto
        this.children.removeAll();
        this.textElements = [];

        const { width, height, centerX, centerY, scale } = this.getScreenMetrics();
        const { borderWidth, borderHeight } = this.getBorderDimensions(scale);

        this.createBackground(centerX, centerY, borderWidth, borderHeight);
        this.createGameContent(centerX, centerY, scale);
        this.createTexts(centerX, centerY, scale);
    }

    getScreenMetrics() {
        const width = this.scale.width;
        const height = this.scale.height;
        const scale = Math.min(width / 1920, height / 1080);
        return {
            width,
            height,
            centerX: width / 2,
            centerY: height / 2,
            scale
        };
    }

    getBorderDimensions(scale) {
        return {
            borderWidth: 1920 * scale,
            borderHeight: 1080 * scale
        };
    }

    createBackground(centerX, centerY, borderWidth, borderHeight) {
        // Background con stesso colore di MenuScene e IntroScene
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight
        );
        this.sceneBorder.fillStyle(0x2c3e50, 1);  // Stesso colore di MenuScene/IntroScene
        this.sceneBorder.fillRoundedRect(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight,
            0
        );
    }

    createGameContent(centerX, centerY, scale) {
        const { refCenter } = this.refPositions;
        this.mainContainer = this.add.container(0, 0);

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

        // Aggiungi al container
        this.mainContainer.add([
            patientImg,
            messageBoxGraphics,
            this.buttonGraphics,
            buttonArea
        ]);

        // Scala e posiziona container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenter.x * scale),
            centerY - (refCenter.y * scale)
        );

        // Salva riferimento per eventi
        this.buttonArea = buttonArea;
        this.drawButton = drawButton;
    }

    createTexts(centerX, centerY, scale) {
        const { refCenter, messageBox, button } = this.refPositions;
        const minFontSize = 40 * scale;

        // Testo congratulazioni dentro la box
        const messageTextX = centerX + ((messageBox.x - refCenter.x) * scale);
        const messageTextY = centerY + ((messageBox.y - refCenter.y - 30) * scale);  // Leggermente più in alto per lo score
        const messageFontSize = Math.max(minFontSize, 50 * scale) * 0.8;
        
        const messageText = this.add.text(messageTextX, messageTextY,
            "Congratulazioni!!\nHai salvato il paziente!", {
            fontSize: `${messageFontSize}px`,
            color: "#2c3e50",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(messageText);

        // Score text dentro la box, sotto il messaggio
        const scoreTextX = centerX + ((messageBox.x - refCenter.x) * scale);
        const scoreTextY = centerY + ((messageBox.y - refCenter.y + 40) * scale);
        const scoreFontSize = Math.max(minFontSize, 45 * scale) * 0.7;
        
        const scoreText = this.add.text(scoreTextX, scoreTextY,
            "\n\nScore: " + gameState.score, {
            fontSize: `${scoreFontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(scoreText);

        // Testo bottone (stile MenuScene/IntroScene)
        const buttonTextX = centerX + ((button.x - refCenter.x) * scale);
        const buttonTextY = centerY + ((button.y - refCenter.y) * scale);
        const buttonFontSize = Math.max(minFontSize, 50 * scale);
        
        const reviewButton = this.add.text(buttonTextX, buttonTextY,
            "Vediamo gli errori", {
            fontSize: `${buttonFontSize * 0.8}px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
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

    shutdown() {
        this.scale.off('resize', this.handleResize, this);
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
        if (this.textElements) {
            this.textElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
    }
}