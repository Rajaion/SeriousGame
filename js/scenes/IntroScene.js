class IntroScene extends Phaser.Scene {

    constructor() {
        super({ key: "IntroScene" });
    }

    preload() {}

    create() {
        this.createContent();
        this.scale.on("resize", this.handleResize, this);
    }

    handleResize() {
        this.time.delayedCall(50, () => {
            if (this.scene.isActive()) {
                this.createContent();
            }
        });
    }

    createContent() {
        this.children.removeAll();

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        const scaleX = width / 1920;
        const scaleY = height / 1080;
        const scale = Math.min(scaleX, scaleY);

        const borderWidth = 1920 * scale;
        const borderHeight = 1080 * scale;

        

        const refCenterX = centerX;
        const refCenterY = centerY;

        const boxWidth = 1700 * scale;
        const boxHeight = 800 * scale;

        //Bordo della scena 
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight
        );
        this.sceneBorder.fillStyle(0x000055, 1);
        this.sceneBorder.fillRoundedRect(centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight,
            0
        );

        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(
            refCenterX - boxWidth / 2,
            refCenterY - boxHeight / 2,
            boxWidth,
            boxHeight,
            20 * scale
        );
        box.lineStyle(2 * scale, 0x2c3e50, 1);
        box.strokeRoundedRect(
            refCenterX - boxWidth / 2,
            refCenterY - boxHeight / 2,
            boxWidth,
            boxHeight,
            20 * scale
        );

        const icon = this.add.text(
            refCenterX,
            refCenterY - boxHeight * 0.3,
            "🚨",
            {
                fontSize: `${120 * scale}px`, 
            }
        ).setOrigin(0.5);

        const scenarioText =
            "\nSei un infermiere del pronto soccorso e un paziente è appena arrivato in codice rosso.\n" +
            "Devi agire velocemente e in modo corretto.\n\n";

        const textContent = this.add.text(
            refCenterX - 10,
            refCenterY,
            scenarioText,
            {
                fontSize: `${70 * scale}px`,
                fontFamily: "Poppins",
                color: "#2c3e50",
                wordWrap: { width: boxWidth * 0.9 },
                lineSpacing: 4 * scale, 
                resolution: 3
            }
        ).setOrigin(0.5);

        const buttonWidth = 300 * scale;
        const buttonHeight = 70 * scale;
        const buttonX = refCenterX - buttonWidth / 2;
        const buttonY = refCenterY + boxHeight * 0.50 - buttonHeight / 2;

        const buttonBg = this.add.graphics();

        const drawButton = color => {
            buttonBg.clear();
            buttonBg.fillStyle(color, 1);
            buttonBg.fillRoundedRect(
                buttonX,
                buttonY,
                buttonWidth,
                buttonHeight,
                10 * scale,
                40
            );
        };

        drawButton(0x34db6c);

        const startButton = this.add.text(
            refCenterX,
            refCenterY + boxHeight * 0.50,
            "Inizia",
            {
                fontSize: `${60 * scale}px`,
                color: "#ffffff",
                fontFamily: "Poppins",
                fontStyle: "bold",
                resolution: window.devicePixelRatio
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startButton.on("pointerover", () => {
            drawButton(0x2e8940);
            startButton.setScale(1.05);
        });

        startButton.on("pointerout", () => {
            drawButton(0x34db6c);
            startButton.setScale(1);
        });

        startButton.on("pointerdown", () => {
            drawButton(0x27ae60);
            this.time.delayedCall(100, () => {
                this.scene.start("HospitalScene");
            });
        });
    }

    shutdown() {
        this.scale.off("resize", this.handleResize, this);
    }
}
