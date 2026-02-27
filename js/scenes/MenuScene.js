class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    preload() {
        this.load.image("IconaMenu", "img/Menu.png");
    }

    create() {
        this.children.removeAll();

        const icona = this.add.image(960, 540, 'IconaMenu').setOrigin(0.5, 0.5);
        icona.setScale(Math.min(1920 / icona.width, 1080 / icona.height));

        const btnGraphics = this.add.graphics();
        const drawBtn = (color) => {
            btnGraphics.clear();
            btnGraphics.fillStyle(color, 1);
            btnGraphics.fillRoundedRect(820, 900, 250, 75, 20);
            btnGraphics.lineStyle(3, 0x000000, 1);
            btnGraphics.strokeRoundedRect(820, 900, 250, 75, 20);
        };

        drawBtn(0x3498db);

        const startText = this.add.text(945, 938, "Start", {
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