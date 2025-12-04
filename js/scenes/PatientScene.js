class PatientScene extends Phaser.Scene{


    answer1Box = null;
    answer2Box = null;
    answer3Box = null;
    ordCounter = 0;
    cords1 = null;
    cords2 = null;
    cords3 = null;
    constructor(){
        super({key: "PatientScene"})
    }
    preload(){
        this.load.image("ReloadButton", "img/ReloadButton.png");
        this.load.image("PatientCloseUp", "img/PatientCloseUp.jpg");
    }
    create(){
        this.ordCounter = 0;

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.cords1 = {x: this.scale.width * 0.63, y: centerY * 0.4 + 130, width: 300, height: 50};
        this.cords2 = {x: this.scale.width * 0.63, y: centerY * 0.6 + 130, width: 300, height: 50}
        this.cords3 = {x: this.scale.width * 0.63, y: centerY * 0.8 + 130, width: 300, height: 50}

        const ReloadButton = this.add.image(this.scale.width * 0.1, this.scale.height * 0.9, "ReloadButton").setScale(0.6).setOrigin(0.5, 0.5).setInteractive({useHandCursor: true});
        const Patient = this.add.image(this.scale.width * 0.3, this.centerY, "PatientCloseUp").setScale(0.5).setOrigin(0.5, 0.5);

        ReloadButton.on("pointerdown", () => {
            this.scene.start("HospitalScene");
        })

        const questionBox = this.createBox(this.scale.width * 0.58, centerY * 0.1 + 100, 400, 100);
        this.answer1Box = this.createBox(this.cords1.x, this.cords1.y, this.cords1.width, this.cords1.height);
        this.answer2Box = this.createBox(this.cords2.x, this.cords2.y, this.cords2.width, this.cords2.height);
        this.answer3Box = this.createBox(this.cords3.x, this.cords3.y, this.cords3.width, this.cords3.height);

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
                this.setDefault();
            }else{
                this.ordCounter = 1;
                this.setGreen(this.answer1Box, this.scale.width * 0.63, centerY * 0.4 + 130, 300, 50)
            }
        });

        text2.on("pointerdown", ()=> {
            if(this.ordCounter != 1){
                this.ordCounter = 0;
                this.setDefault();
                alert("sbagliata sequenza");
            }else{
                this.ordCounter = 2
                this.setGreen(this.answer2Box, this.scale.width * 0.63, centerY * 0.6 + 130, 300, 50)
            }
        });

        text3.on("pointerdown", ()=> {
            if(this.ordCounter != 2){
                this.ordCounter = 0;
                this.setDefault();
                alert("sbagliata sequenza");
            }else{
                this.setGreen(this.answer3Box, this.scale.width * 0.63, centerY * 0.8 + 130, 300, 50);
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

    setGreen(box, x, y, width, height){
        box.fillStyle(0x27ae60, 1);
        box.fillRoundedRect(x, y, width, height, 1); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 5 (maggiore valore -> maggiore arrotondamento)
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(x, y. width, height, 1)
    }

    setDefault(){
        this.setEachDefault(this.answer1Box, this.cords1.x, this.cords1.y, this.cords1.width, this.cords1.height);
        this.setEachDefault(this.answer2Box, this.cords2.x, this.cords2.y, this.cords2.width, this.cords2.height);
        this.setEachDefault(this.answer3Box, this.cords3.x, this.cords3.y, this.cords3.width, this.cords3.height);
    }

    setEachDefault(box, x, y, width, height){
        box.clear();
        box.fillStyle(0xffffff, 1);
        box.fillRoundedRect(x, y, width, height, 5); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 5 (maggiore valore -> maggiore arrotondamento)
        box.lineStyle(2, 0x000000, 1);
        box.strokeRoundedRect(x, y, width , height, 5);
    }

}