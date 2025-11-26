class IntroScene extends Phaser.Scene{

    constructor(){
        super({key: "IntroScene"});
    }
    preload(){

    }
    create(){
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        //Introduzione
        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(centerX - 300, centerY - 200, 600, 300, 20); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 10 (maggiore valore -> maggiore arrotondamento)
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(centerX - 300, centerY - 200, 600, 300, 10);

        this.add.text(centerX, centerY - 150, '🚨', {
            fontSize: "64px"
        }).setOrigin(0.5);

        const scenarioText = `Sei un infermiere del pronto soccorso.\n\n` + //\n\n è per fare piu spazio
                           `Un paziente è appena arrivato in codice rosso.\n` +
                           `Devi agire velocemente e in modo corretto.\n\n` +
                           `Sei pronto?`;
        
        this.add.text(centerX, centerY - 20, scenarioText, {
            fontSize: "20px",
            color: "#2c3e50",
            align: "center"
        }).setOrigin(0.5);

        const startButton = this.add.text(centerX, centerY + 120, "Let's go", {
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "rgba(52, 219, 108, 1)",
            padding: {x:30, y:15}
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true}); //Appena ci va sopra compare la mano per cliccare

        startButton.on("pointerover", () => {
            startButton.setStyle({backgroundColor: "rgba(46, 137, 64, 0.93)"})
        });

        startButton.on("pointerout", () => {
            startButton.setStyle({backgroundColor: "rgba(52, 219, 108, 1)"})
        });

        startButton.on("pointerdown", () => {
            this.scene.start("HospitalScene")
        });
    }
    update(){

    }
}