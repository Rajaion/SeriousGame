class IntroScene extends Phaser.Scene {

    constructor() {
        super({ key: "IntroScene" });
    }

    create() {
        this.children.removeAll();

        // Usa dimensioni fisse del gioco (1920x1080)
        const centerX = 960;  // 1920 / 2
        const centerY = 540;  // 1080 / 2

        const boxWidth = 1700;
        const boxHeight = 800;

        // Bordo della scena 
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(
            centerX - 960,
            centerY - 540,
            1920,
            1080
        );
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(centerX - 960, centerY - 540, 1920, 1080, 0);

        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight, 20);
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight, 20);

        const scenarioText =
            "\nSei un infermiere in turno presso il reparto di cardiologia. \n" +
            "\n\nTi suona il campanello, è la moglie del signor bianchi, 65 anni ricoverato per scompenso cardiaco,ti dice che non le risponde più, nemmeno se lo chiama.";

        this.add.text(centerX - 10, centerY - 40, scenarioText, {
            fontSize: `70px`,
            fontFamily: "Poppins",
            color: "#2c3e50",
            wordWrap: { width: boxWidth * 0.9 },
            lineSpacing: 4, 
            resolution: 3
        }).setOrigin(0.5);

        const buttonWidth = 300;
        const buttonHeight = 70;
        const buttonX = centerX - buttonWidth / 2;
        const buttonY = centerY + boxHeight * 0.50 - buttonHeight / 2;

        const buttonBg = this.add.graphics();

        const drawButton = color => {
            buttonBg.clear();
            buttonBg.fillStyle(color, 1);
            buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
            buttonBg.lineStyle(3, 0x000000, 1);
            buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        };

        drawButton(0x5DADE2);

        const startButton = this.add.text(centerX, centerY + boxHeight * 0.50, "Inizia", {
            fontSize: `60px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startButton.on("pointerover", () => {
            drawButton(0x5DADE2);
            startButton.setScale(1.05);
        });

        startButton.on("pointerout", () => {
            drawButton(0x3498db);
            startButton.setScale(1);
        });

        startButton.on("pointerdown", () => {
            drawButton(0x5DADE2);
            this.time.delayedCall(100, () => {
                this.scene.start("HospitalScene");
            });
        });
    }
}
