class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: "EndScene" });
    }

    preload() {
        this.load.image("HappyPatient", "img/HappyPatient.png");
    }

    create() {
        this.createContent();
        this.scale.on('resize', this.handleResize, this);
    }

    handleResize(gameSize) {
        this.time.delayedCall(50, () => {
            if (this.scene.isActive()) {
                this.createContent();
            }
        });
    }

    createContent() {
        // Pulisci tutto
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
        if (this.textElements) {
            this.textElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
        if (this.children) {
            this.children.removeAll();
        }

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        this.add.rectangle(centerX, centerY, width, height, 0x104D5B);

        // Calcola scala
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        const scale = Math.min(scaleX, scaleY);

        // CONTAINER
        this.mainContainer = this.add.container(0, 0);

        const refCenterX = 960;
        const refCenterY = 540;

        // Posizioni di riferimento
        const patientY = 220;   // Paziente più in alto
        const boxY = 520;       // Box leggermente più in alto
        const buttonY = 870;    // Bottone più in basso

        // Paziente felice
        const patient = this.add.image(refCenterX, patientY, "HappyPatient");

        // Bottone
        const buttonWidth = 500;
        const buttonHeight = 75;
        this.buttonGraphics = this.add.graphics();

        const drawButton = (color) => {
            if (!this.buttonGraphics) return;
            this.buttonGraphics.clear();
            this.buttonGraphics.fillStyle(color, 1);
            this.buttonGraphics.fillRoundedRect(
                refCenterX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                10
            );
        };

        drawButton(0x34DB6C);

        // Area interattiva bottone
        const buttonArea = this.add.rectangle(refCenterX, buttonY, buttonWidth, buttonHeight)
            .setInteractive({ useHandCursor: true })
            .setAlpha(0.01);

        // Aggiungi al container
        this.mainContainer.add([
            patient,
            this.buttonGraphics,
            buttonArea
        ]);

        // Scala container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenterX * scale),
            centerY - (refCenterY * scale)
        );

        // TESTI FUORI DAL CONTAINER
        this.textElements = [];
        const minFontSize = 16;

        // Calcola posizioni reali
        const endTextX = centerX;
        const endTextY = centerY + ((520 - refCenterY) * scale); // Centrato nel box

        const buttonTextX = centerX;
        const buttonTextY = centerY + ((buttonY - refCenterY) * scale);

        // Testo finale
        const endFontSize = Math.max(minFontSize, 24 * scale);
        const endText = this.add.text(endTextX, endTextY,
            "Congratulazioni!! \n Hai salvato il paziente! \n\n  Score: " + gameState.score, {
            fontSize: `${endFontSize * 0.7}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            backgroundColor: "#ffffffff",
            padding: { x: 20, y: 5 }
        }).setOrigin(0.5);
        this.textElements.push(endText);

        // Testo bottone
        const buttonFontSize = Math.max(minFontSize, 28 * scale);
        const reviewButton = this.add.text(buttonTextX, buttonTextY,
            "Vediamo gli errori", {
            fontSize: `${buttonFontSize * 0.8}px`,
            color: "#ffffff",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            padding: {x: 40, y: 10},
            backgroundColor: "#26f51eff"
        }).setOrigin(0.5);
        this.textElements.push(reviewButton);

        // Eventi bottone
        buttonArea.removeAllListeners();
        buttonArea.on("pointerover", () => {
            drawButton(0x2E8940);
            reviewButton.setScale(1.05);
        });

        buttonArea.on("pointerout", () => {
            drawButton(0x34DB6C);
            reviewButton.setScale(1);
        });

        buttonArea.on("pointerdown", () => {
            drawButton(0x27ae60);
            this.time.delayedCall(100, () => {
                this.scene.start("ReviewScene");
            });
        });

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