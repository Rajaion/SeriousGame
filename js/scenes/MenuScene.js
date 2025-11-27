class MenuScene extends Phaser.Scene{
    constructor(){
        super({key : "MenuScene"});
    }
    preload(){
        this.load.image("IconaMenu", "img/Menu.png");
    }
    create(){
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.image(centerX, centerY - 100, 'IconaMenu').setScale(0.5);

        this.add.text(centerX, centerY + 30, 'Emergenza medica', {
            fontSize: "48px",
            color: "#2c3e50",
            fontFamily: "Arial"
        }).setOrigin(0.5);
    
        const startButton = this.add.text(centerX, centerY + 100, "Start", {
            fontSize: "32px",
            color: "#ffffff",
            backgroundColor: "#302121",
            padding: {x: 40, y: 20}
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true});

        startButton.on("pointerover", () => {
            startButton.setStyle({backgroundColor: "#2ecc71"});
        });
        startButton.on("pointerout", () => {
            startButton.setStyle({backgroundColor: "#27ae60"});
        });
        startButton.on("pointerdown", () => {
            this.scene.start("IntroScene"); //passa alla prox scena
        });
    }   

    update(){

    }
}