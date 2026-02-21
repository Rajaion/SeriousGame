class IntroScene extends Phaser.Scene {

    constructor() {
        super({ key: "IntroScene" });
    }

    preload() {
        this.load.image("CroceRossa", "img/RedCross.png");
    }

    create() {
        this.children.removeAll();

        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(0, 0, 1920, 1080);
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(0, 0, 1920, 1080, 0);

        

        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(110, 140, 1700, 800, 20);
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(110, 140, 1700, 800, 20);

        this.add.image(960, 120, "CroceRossa").setScale(0.4);

        this.add.text(950, 500, "\nSei un infermiere in turno presso il reparto di cardiologia. \n\n\nTi suona il campanello, è la moglie del signor Bianchi, 65 anni ricoverato per scompenso cardiaco, ti dice che non le risponde più, nemmeno se lo chiama.", {
            fontSize: `70px`,
            fontFamily: "Poppins, sans-serif",
            color: "#2c3e50",
            wordWrap: { width: 1200 },
            lineSpacing: 4,
            resolution: 1
        }).setOrigin(0.5);

        const btnBg = this.add.graphics();
        const drawBtn = color => {
            btnBg.clear();
            btnBg.fillStyle(color, 1);
            btnBg.fillRoundedRect(810, 940, 300, 70, 10);
            btnBg.lineStyle(3, 0x000000, 1);
            btnBg.strokeRoundedRect(810, 940, 300, 70, 10);
        };

        drawBtn(0x5DADE2);

        const startBtn = this.add.text(960, 975, "Inizia", {
            fontSize: `60px`,
            color: "#000000ff",
            fontFamily: "Poppins, sans-serif",
            fontStyle: "bold",
            resolution: 1
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on("pointerover", () => { drawBtn(0x5DADE2); startBtn.setScale(1.05); });
        startBtn.on("pointerout", () => { drawBtn(0x3498db); startBtn.setScale(1); });
        startBtn.on("pointerdown", () => {
            drawBtn(0x5DADE2);
            this.time.delayedCall(100, () => this.scene.start("HospitalScene"));
        });
    }
}
