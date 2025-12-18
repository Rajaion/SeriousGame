class PatientScene extends Phaser.Scene{


    answer1Box = null;
    answer2Box = null;
    answer3Box = null;
    ordCounter = 0;
    cords1 = null;
    cords2 = null;
    cords3 = null;
    goNextText;
    constructor(){
        super({key: "PatientScene"})
    }
    preload(){
        this.load.image("ReloadButton", "img/ReloadButton.png");
        this.load.image("PatientCloseUp", "img/PatientCloseUp.png");
    }
    create(){
        this.ordCounter = 0;

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.cords1 = {x: this.scale.width * 0.80, y: this.scale.height * 0.5, width: 500, height: 70};
        this.cords2 = {x: this.scale.width * 0.80, y: this.scale.height * 0.6, width: 500, height: 70}
        this.cords3 = {x: this.scale.width * 0.80, y: this.scale.height * 0.7, width: 500, height: 70}

        const ReloadButton = this.add.image(this.scale.width * 0.80, this.scale.height * 0.85, "ReloadButton").setScale(0.5).setOrigin(0.5, 0.5).setInteractive({useHandCursor: true}).setDepth(10);
        const Patient = this.add.image(this.scale.width * 0.3, this.scale.height * 0.5, "PatientCloseUp").setScale(0.7).setOrigin(0.5, 0.5);

        ReloadButton.on("pointerdown", () => {
            this.scene.start("HospitalScene");
        })

        const questionBox = this.createBox(this.scale.width * 0.80, this.scale.height * 0.3, 600, 140);
        this.answer1Box = this.createBox(this.cords1.x, this.cords1.y, this.cords1.width, this.cords1.height);
        this.answer2Box = this.createBox(this.cords2.x, this.cords2.y, this.cords2.width, this.cords2.height);
        this.answer3Box = this.createBox(this.cords3.x, this.cords3.y, this.cords3.width, this.cords3.height);

        this.add.text(this.scale.width * 0.80, this.scale.height * 0.3, "Il paziente non risponde\n\n Come procedi?", {
            fontSize: "40px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setOrigin(0.5);

        this.goNextText = this.add.text(this.cords1.x, this.scale.height * 0.4, "Corretto!\nOra andiamo a dare le medicine al paziente!", {
            fontSize: "38px",
            color: "#000000ff",
            align: "center"
        }).setOrigin(0.5).setAlpha(0);

        const text1 = this.add.text(this.cords1.x, this.scale.height * 0.5, "Valutazione GAS", {
            fontSize: "38px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({useHandCursor: "true"}).setOrigin(0.5);

        const text2 = this.add.text(this.cords1.x, this.scale.height * 0.6, "Inizi le compressioni", {
            fontSize: "38px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({useHandCursor: "true"}).setOrigin(0.5);
        
        const text3 = this.add.text(this.cords1.x, this.scale.height * 0.7, "libiri le vie aeree", {
            fontSize: "38px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setInteractive({useHandCursor: "true"}).setOrigin(0.5);
        
        text1.on("pointerdown", ()=> {
            if(this.ordCounter != 0){
                this.ordCounter = 0;
                alert("sbagliata sequenza");
                this.setDefault();
            }else{
                this.ordCounter = 1;
                this.setGreen(this.answer1Box, this.cords1.x, this.cords1.y , this.cords1.width, this.cords1.height)
            }
        });

        text2.on("pointerdown", ()=> {
            if(this.ordCounter != 1){
                this.ordCounter = 0;
                this.setDefault();
                alert("sbagliata sequenza");
            }else{
                this.ordCounter = 2
                this.setGreen(this.answer2Box, this.cords2.x, this.cords2.y, this.cords2.width, this.cords2.height)
            }
        });

        text3.on("pointerdown", ()=> {
            if(this.ordCounter != 2){
                this.ordCounter = 0;
                this.setDefault();
                alert("sbagliata sequenza");
            }else{
                this.setGreen(this.answer3Box, this.cords3.x, this.cords3.y, this.cords3.width, this.cords3.height);
                this.goNextText.setAlpha(1);
                this.time.delayedCall(3500, () =>{
                    this.scene.start("CartScene");
                })
            }
        });

    }
    update(){

        
    }
    createBox(valueX, valueY, width, height){
        const box = this.add.graphics(valueX - width / 2, valueY - height / 2, width, height);
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(valueX - width / 2, valueY - height / 2, width, height, 5); 
        //box.strokeRoundedRect(valueX, valueY, width , height, 5);
        return box;
    }

    setGreen(box, x, y, width, height){
        box.fillStyle(0x27ae60, 1);
        box.fillRoundedRect(x - width / 2, y - height / 2, width, height, 1); 
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(x - width / 2, y - height / 2, height, 1)
    }

    setDefault(){
        this.setEachDefault(this.answer1Box, this.cords1.x, this.cords1.y, this.cords1.width, this.cords1.height);
        this.setEachDefault(this.answer2Box, this.cords2.x, this.cords2.y, this.cords2.width, this.cords2.height);
        this.setEachDefault(this.answer3Box, this.cords3.x, this.cords3.y, this.cords3.width, this.cords3.height);
    }

    setEachDefault(box, x, y, width, height){
        box.clear();
        box.fillStyle(0xffffff, 1);
        box.fillRoundedRect(x - width / 2, y - height / 2, width, height, 5); 
        box.lineStyle(2, 0x000000, 1);
        box.strokeRoundedRect(x - width / 2, y - height / 2, width , height, 5);
    }

}