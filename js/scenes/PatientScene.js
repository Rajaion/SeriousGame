class PatientScene extends Phaser.Scene{

    constructor(){
        super({key: "PatientScene"})
    }
    preload(){
        this.load.image("ReloadButton", "img/ReloadButton.png");
        this.load.image("PatientCloseUp", "img/PatientCloseUp.jpg");
    }
    create(){
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const ReloadButton = this.add.image(this.scale.width * 0.1, this.scale.height * 0.9, "ReloadButton").setScale(0.6).setOrigin(0.5, 0.5).setInteractive();
        const Patient = this.add.image(this.scale.width * 0.3, this.centerY, "PatientCloseUp").setScale(0.5).setOrigin(0.5, 0.5);

        ReloadButton.on("pointerdown", () => {
            this.scene.start("HospitalScene");
        })

        const questionBox = this.createBox(this.scale.width * 0.58, centerY * 0.1 + 100, 400, 100);
        const answer1Box = this.createBox(this.scale.width * 0.63, centerY * 0.4 + 130, 300, 50);
        const answer2Box = this.createBox(this.scale.width * 0.63, centerY * 0.6 + 130, 300, 50);
        const answer3Box = this.createBox(this.scale.width * 0.63, centerY * 0.8 + 130, 300, 50);

        this.add.text(this.scale.width * 0.58, centerY * 0.1 + 100, "Il paziente non risponde\n\n Come procedi?", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        });

        this.add.text(this.scale.width * 0.655, centerY * 0.4 + 130, "Valutazione GAS", {
            fontSize: "22px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({usaHandCursor: "true"});

        this.add.text(this.scale.width * 0.615, centerY * 0.6 + 130, "Inizi le compressioni", {
            fontSize: "22px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({useHandCursor: "true"});
        
        this.add.text(this.scale.width * 0.62, centerY * 0.8 + 130, "libiri le vie aeree", {
            fontSize: "22px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({useHandCursor: "true"});
        

    }
    update(){

    }
    createBox(valueX, valueY, width, height){
        const box = this.add.graphics(valueX, valueY, width, height);
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(valueX, valueY, width, height, 0); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 10 (maggiore valore -> maggiore arrotondamento)
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(valueX, valueY, width , height, 0 );
    }
}