class EndScene extends Phaser.Scene{
    constructor(){
        super({key: "EndScene"});
    }

    preload(){

        this.load.image("HappyPatient", "img/HappyPatient.png")

    }

    create(){

            const centerX = this.scale.width / 2;
            const centerY = this.scale.height / 2;

            const box = this.add.graphics();
            box.fillStyle(0xecf0f1, 1);
            box.fillRoundedRect(centerX - 350, centerY - 50, 700, 200, 5);
            box.lineStyle(2, 0x2c3e50, 1);
            box.strokeRoundedRect(centerX - 350, centerY - 50, 700, 200, 5);

            const endText = this.add.text(centerX, centerY + 50, "Congratulationi, hai salvato il paziente!\n\n \n\nScore: " + gameState.score, {
                fontSize: "24px",
                color: "#000000ff",
                align: "center",
                padding: {x:30, y:15}
            }).setOrigin(0.5);

            const reviewButton = this.add.text(centerX, centerY + 210, "Vediamo gli errori", {
                fontSize: "24px",
                color: "#ffffff",
                backgroundColor: "rgba(52, 219, 108, 1)",
                padding: {x:30, y:15},
            }).setOrigin(0.5).setInteractive({useHandCursor: true});
            
            reviewButton.on("pointerover", () => {
                reviewButton.setStyle({backgroundColor: "#2ecc71"});
             });

            reviewButton.on("pointerout", () => {
                reviewButton.setStyle({backgroundColor: "#27ae60"});
             });

            const patient = this.add.image(centerX, centerY - 200, "HappyPatient").setScale(0.7);
    }

    Update(){

    }

}