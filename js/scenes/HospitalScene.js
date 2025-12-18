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

        this.load.image("Ospedale", "img/Ospedale.png");
        this.load.image("convBox", "img/TextBoxLeft.png");
        this.load.image("Phone", "img/Telefono.png");
        this.load.image("Paziente", "img/Paziente.png");
    }
    create(){

    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;

    this.add.image(0, 0, "Ospedale").setOrigin(0, 0);

    this.getPhonetext(this.cache.text.get("phoneOptions"));

    this.scoreText = this.add.text(this.centerX, 50, "Score: " + gameState.score, {
        fontSize: "35px",
        align: "center",
        color: "rgba(255, 0, 0, 1)"
        
    }).setOrigin(0.5);

    this.wrongChoiceText = this.add.text(this.centerX, this.centerY - this.centerY / 1.5, "Careful,\nchoose the correct option", {
            align: "center",
            fontSize: "28px",
            color: "#ff0000",
            padding: {x:15, Y:5}
        }).setOrigin(0.5).setAlpha(0);

        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(this.centerX * 1.7 - 200, this.centerY * 0.3 - 50, 400, 100, 0); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 10 (maggiore valore -> maggiore arrotondamento)
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(this.centerX * 1.7 - 200, this.centerY * 0.3 - 50, 400, 100, 0);

    const infoPaziente = this.add.text(this.centerX * 1.7, this.centerY * 0.3, 'Hai già constatato che\nil paziente non risponde', {
        fontSize: '24px',
        color: '#2c3e50',
        align: 'center'
    }).setOrigin(0.5);



    const telephone = this.add.image(this.centerX * 1.7, this.centerY, "Phone").setScale(0.3).setInteractive({useHandCursor: true});

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
        const optioncords = {x: this.centerX * 1.35, y: this.centerY *0.8}
        this.phoneConvo = this.add.image(this.centerX * 1.35, this.centerY * 0.78, "convBox").setScale(1.0).setOrigin(0.5, 0.5);
        
        optioncords.y -= 49;
        
        this.optRect1 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 74%, 67%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect1.setStrokeStyle(3, 0x000000);
        this.option1 = this.add.text(optioncords.x, optioncords.y + 10, this.opzione1, {
            fontSize: "20px",
            color: '#2c3e50',
            align: 'center',
            wordWrap: {width: 300, height: 30}
        }).setOrigin(0.5);

        optioncords.y += 45;
        
        this.optRect2 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 9%, 59%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect2.setStrokeStyle(3, 0x000000);
        this.option2 = this.add.text(optioncords.x, optioncords.y + 10, this.opzione2, {
            fontSize: "20px",
            color: '#2c3e50',
            align: 'center',
            wordWrap: {width: 300, height: 20}
        }).setOrigin(0.5);

        optioncords.y += 45;
        this.optRect3 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 9%, 59%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect3.setStrokeStyle(3, 0x000000);
        this.option3 = this.add.text(optioncords.x, optioncords.y + 10, this.opzione3, {
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

    const patient = this.add.rectangle(this.centerX * 0.8, this.centerY * 1.1, 400, 400).setAlpha(1).setInteractive({useHandCursor: true});

    patient.on("pointerdown", () => {
        if(this.clickedCorOpt){
            this.scene.start("PatientScene");
        }else{
            this.scoreText.setText("Score:" + gameState.score)
            this.clickedOption("Interagire prima con il telefono", false)
        }
    });

    }
    update(){
        
    }

    buttonChoice(Chosen_number){
        if(this.correctNumber === Chosen_number ){
            this.clickedOption("Corretto!\nOra andiamo a fare un check-up sul paziente", true)
            this.clickedCorOpt = true;
        }
        else{
            gameState.errors.Hospital ++;
            gameState.score -= 5;
            this.scoreText.setText("Score: " + gameState.score)
            this.clickedOption("Attenzione,\nscegliere l'opzione corretta", false);
        }
        this.deletePhoneConvo();
    };

    clickedOption(info, win){ //info è il testo da far vedere, mentre win è un boolean che serve per capire se è stata presa l'opzione giusta o no

        if(win){
            this.wrongChoiceText.setColor("#167e30ff");
        }

        this.wrongChoiceText.setText(info)

        this.wrongChoiceText.setAlpha(1);

        this.tweens.add({ //Aggiunge animazioni, fa scomparire la scritta in 2 secondi
            targets: this.wrongChoiceText,
            alpha: 0,
            duration: 3000,
        });

    }

    getPhonetext(fullText){
        
        const opzioni = fullText.split("\n");
        let i = 4; //const non cambia mentre let può
        let riga = 0;
        while(i!=0){
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
