class PatientScene extends Phaser.Scene{

    ordCounter = 0;
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

        const ReloadButton = this.add.image(this.scale.width * 0.1, this.scale.height * 0.9, "ReloadButton").setScale(0.6).setOrigin(0.5, 0.5).setInteractive({useHandCursor: true});
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

        const text1 = this.add.text(this.scale.width * 0.655, centerY * 0.4 + 130, "Valutazione GAS", {
            fontSize: "22px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({useHandCursor: "true"});

        const text2 = this.add.text(this.scale.width * 0.615, centerY * 0.6 + 130, "Inizi le compressioni", {
            fontSize: "22px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({useHandCursor: "true"});
        
        const text3 = this.add.text(this.scale.width * 0.62, centerY * 0.8 + 130, "libiri le vie aeree", {
            fontSize: "22px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({useHandCursor: "true"});
        
        text1.on("pointerdown", ()=> {
            if(this.ordCounter != 0){
                this.ordCounter = 0;
                alert("sbagliata sequenza");
            }else{
                answer1Box.fillStyle(0xff0000);
                this.ordCounter = 1
            }
        });

        text2.on("pointerdown", ()=> {
            if(this.ordCounter != 1){
                this.ordCounter = 0;
                alert("sbagliata sequenza");
            }else{
                answer2Box.fillStyle(0x27ae60);
                this.ordCounter = 2
            }
        });

        text3.on("pointerdown", ()=> {
            if(this.ordCounter != 2){
                this.ordCounter = 0;
                alert("sbagliata sequenza");
            }else{
                answer3Box.fillStyle(0x27ae60);
                this.ordCounter = 3;
                alert("andiamo a salvare il paziente");
                this.scene.start("CartScene");
            }
        });

    }
    update(){

    }
    createBox(valueX, valueY, width, height){
        const box = this.add.graphics(valueX, valueY, width, height);
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(valueX, valueY, width, height, 5); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 5 (maggiore valore -> maggiore arrotondamento)
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(valueX, valueY, width , height, 5);
        return box;
    }

    setDefault(){
        answer1Box.fillStyle(0xecf0f1, 1);
        answer2Box.fillStyle(0xecf0f1, 1);
        answer3Box.fillStyle(0xecf0f1, 1);
    }

}