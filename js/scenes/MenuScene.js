class MenuScene extends Phaser.Scene{

    safeArea;

    constructor(){
        super({key : "MenuScene"});
    }
    preload(){
        this.load.image("IconaMenu", "img/Menu.png");
    }
    create(){
        const {width, height} = this.scale;

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const safeMargin = width * 0.05;

        this.safeArea = new Phaser.Geom.Rectangle(
            safeMargin,
            0,
            width - safeMargin * 2,
            height
        );

        const bg = this.add.rectangle(
            width / 2 , height / 2, this.safeArea.width, height, 0x104D5B8C
        ); //rettangolo della scena

        const icona = this.add.image(centerX, centerY, 'IconaMenu').setScale(0.8);

        const title = this.add.text(centerX, centerY *0.42 , 'Emergenza medica', {
            fontSize: `${Math.round(this.safeArea.width * 0.040)}px`,
            wordWrap: { width: this.safeArea.width * 0.9 },
            color: "#2c3e50",
            fontFamily: "Arial"
        }).setOrigin(0.5);

        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRoundedRect(centerX - 250/2, centerY* 1.6 - 75/2, 250, 75, 40);
        this.graphics.setDepth(0);

        const drawButton = (color, alpha) => {
            this.graphics.clear(); // Pulisce il disegno precedente
            this.graphics.fillStyle(color, alpha);
            this.graphics.fillRoundedRect(centerX - 250/2, centerY * 1.6 - 75/2, 250, 75, 40);
            this.graphics.setDepth(0)
        };

        const startText = this.add.text(centerX, centerY * 1.6, "Start", {
            fontSize: `${Math.round(this.safeArea.width * 0.040)}px`,
            wordWrap: { width: this.safeArea.width * 0.9 },
            padding: {x: 40, y: 20},
            color: "#f03c3cff"
        }).setOrigin(0.5)
        .setDepth(1)
        .setInteractive({useHandCursor: true});


        startText.on("pointerover", () => {
            drawButton(0x1f3DFB3F, 1);
        });
        startText.on("pointerout", () => {
            drawButton(0x1f3CFA80, 1);
        });
        startText.on("pointerdown", () => {
            this.scene.start("IntroScene"); //passa alla prox scena
        });

        const container = this.add.container(0, 0);
        const scaleFactor = this.scale.width / 1920;
        container.add([icona, title, startText, button]);
        container.setScale(scaleFactor);
        container.setPosition(this.centerX, this.centerY)

    }   

    update(){

    }
}