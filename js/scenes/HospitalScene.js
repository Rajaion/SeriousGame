class HospitalScene extends Phaser.Scene{

    centerX = null;
    centerY = null;
    convOn = false;
    opzione1 = "default";
    opzione2 = "default";
    opzione3 = "default";
    clickedCorOpt = false;
    correctNumber = 1;
    wrongChoiceText;
    ordineClick = false; //false se il paziente viene cliccato prima del telefono, true l'inverso
    scoreText = null;
    constructor(){
        super({key: "HospitalScene"});
    }
    preload(){
        this.load.text("phoneOptions", "text/Phone.txt")

        this.load.image("convBox", "img/TextBoxLeft.png");
        this.load.image("Phone", "img/Phone.png");
        this.load.image("Paziente", "img/Paziente.png");
    }
    create(){

    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;
    
    const box = this.add.graphics();
    box.fillStyle(0xecf0f1, 1);
    box.fillRoundedRect(this.centerX + 100, this.centerY - 100, 400, 100, 0); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 10 (maggiore valore -> maggiore arrotondamento)
    box.lineStyle(2, 0x2c3e50, 1);
    box.strokeRoundedRect(this.centerX + 100, this.centerY - 100, 400, 100, 0);

    this.getPhonetext(this.cache.text.get("phoneOptions"));

    this.scoreText = this.add.text(this.centerX, 50, "Score: " + gameState.score, {
        fontSize: "20px",
        align: "center",
        
    }).setOrigin(0.5);

    this.wrongChoiceText = this.add.text(this.centerX, this.centerY - this.centerY / 1.5, "Careful,\n\nchoose the correct option", {
            align: "center",
            fontSize: "20px",
            color: "#ff0000",
            padding: {x:15, Y:5}
        }).setOrigin(0.5).setAlpha(0);

    const infoPaziente = this.add.text(this.centerX + 300, this.centerY - 50, 'hai già constatato che\nil paziente non risponde', {
        fontSize: '20px',
        color: '#2c3e50',
        align: 'center'
    }).setOrigin(0.5);

    const telephone = this.add.image(200, this.centerY - 30, "Phone").setScale(0.5).setInteractive({useHandCursor: true});

    telephone.on("pointerdown", () => {
        
        if(this.clickedCorOpt){
            return;
            telephone.setInteractive({useHandCursor: false});
        }

        if(this.convOn){
            this.deletePhoneConvo();
            this.convOn = false;
            return;
        }

        this.convOn = true;
        const optioncords = {x: this.centerX - this.centerX / 2 + 160, y: this.centerY}
        this.phoneConvo = this.add.image(this.centerX - this.centerX / 2 + 150, this.centerY, "convBox").setScale(1.0).setOrigin(0.5, 0.5);
        
        optioncords.y -= 49;
        
        this.optRect1 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 74%, 67%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect1.setStrokeStyle(3, 0x000000);
        this.option1 = this.add.text(optioncords.x, optioncords.y + 15, this.opzione1, {
            fontSize: "20px",
            color: '#2c3e50',
            align: 'center',
            wordWrap: {width: 300, height: 30}
        }).setOrigin(0.5);

        
        
        optioncords.y += 45;
        
        this.optRect2 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 9%, 59%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect2.setStrokeStyle(3, 0x000000);
        this.option2 = this.add.text(optioncords.x, optioncords.y + 15, this.opzione2, {
            fontSize: "20px",
            color: '#2c3e50',
            align: 'center',
            wordWrap: {width: 300, height: 20}
        }).setOrigin(0.5);

        optioncords.y += 45;
        this.optRect3 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 9%, 59%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect3.setStrokeStyle(3, 0x000000);
        this.option3 = this.add.text(optioncords.x, optioncords.y + 15, this.opzione3, {
            fontSize: "20px",
            color: '#2c3e50',
            align: 'center',
            wordWrap: {width: 300, height: 20}
        }).setOrigin(0.5);

        this.optRect1.on("pointerdown", () => {
            this.buttonChoice(1);
        });

        this.optRect2.on("pointerdown", () => {
            this.buttonChoice(2);
        });

        this.optRect3.on("pointerdown", () => {
            this.buttonChoice(3);
        });

    });

    const patient = this.add.image(this.centerX, this.centerY + 200, "Paziente").setScale(0.6).setInteractive({useHandCursor: true});

    patient.on("pointerdown", () => {
        if(this.clickedCorOpt){
            this.scene.start("PatientScene");
        }else{
            gameState.errors.Hospital ++;
            gameState.score -= 2;
            this.scoreText.setText("Score:" + gameState.score)
            alert("Non ancora, prima interagire con il telefono")
        }
    });

    }
    update(){
        
    }

    buttonChoice(Chosen_number){
        if(this.correctNumber === Chosen_number ){
            this.clickedCorOpt = true;
        }
        else{
            gameState.errors.Hospital ++;
            gameState.score -= 5;
            this.scoreText.setText("Score: " + gameState.score)
            this.clickedWrongChoice();
        }
        this.deletePhoneConvo();
    };

    clickedWrongChoice(){

        this.wrongChoiceText.setAlpha(1);

        this.tweens.add({ //Aggiunge animazioni, fa scomparire la scritta in 2 secondi
            targets: this.wrongChoiceText,
            alpha: 0,
            duration: 2000,
        });

    }

    getPhonetext(fullText){
        
        const opzioni = fullText.split("\n");
        let i = 4; //const non cambia mentre let può
        let riga = 0;
        while(i!=0 || riga > opzioni.length - 1){
            riga++;
            if (opzioni[riga].substring(0, 9) === "#Option1:"){
                this.opzione1 = opzioni[riga].substring(10);
                i--;
            }else if(opzioni[riga].substring(0, 9) === "#Option2:"){
                this.opzione2 = opzioni[riga].substring(10);
                i--;
            }else if(opzioni[riga].substring(0, 9) === "#Option3:"){
                this.opzione3 = opzioni[riga].substring(10);
                i--;
            }else if(opzioni[riga].substring(0, 15) === "#CorrectOption:"){
                this.correctNumber = Number(opzioni[riga].substring(16));
                i--;
            }

        }
        console.log(this.correctNumber);
    }

    deletePhoneConvo(){
        this.optRect1.destroy();
        this.optRect2.destroy();
        this.optRect3.destroy();
        this.phoneConvo.destroy();
        this.option1.destroy();
        this.option2.destroy();
        this.option3.destroy();
    }
}
