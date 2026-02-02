class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    preload() {
        this.load.image("IconaMenu", "img/Menu.jpg");
    }

    create() {
        this.children.removeAll();

        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(0, 0, 1920, 1080);
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(0, 0, 1920, 1080, 0);

        this.add.image(960, 540, 'IconaMenu').setScale(0.7);

        const titleBg = this.add.graphics();
        titleBg.fillStyle(0xffffff, 1);
        titleBg.fillRoundedRect(650, 152, 620, 75, 20);
        titleBg.lineStyle(3, 0x000000, 1);
        titleBg.strokeRoundedRect(650, 152, 620, 75, 20);

        this.add.text(960, 189, 'Emergenza medica', {
            fontSize: '60px',
            color: "#ff0000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
        }).setOrigin(0.5);

        const btnGraphics = this.add.graphics();
        const drawBtn = (color) => {
            btnGraphics.clear();
            btnGraphics.fillStyle(color, 1);
            btnGraphics.fillRoundedRect(830, 826, 250, 75, 20);
            btnGraphics.lineStyle(3, 0x000000, 1);
            btnGraphics.strokeRoundedRect(830, 826, 250, 75, 20);
        };

        drawBtn(0x3498db);

        const startText = this.add.text(950, 864, "Start", {
            fontSize: '60px',
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startText.on("pointerover", () => { drawBtn(0x5DADE2); startText.setScale(1.05); });
        startText.on("pointerout", () => { drawBtn(0x3498db); startText.setScale(1); });
        startText.on("pointerdown", () => {
            drawBtn(0x2980b9);
            this.time.delayedCall(100, () => this.scene.start("IntroScene"));
        });
    }
}