class HospitalScene extends Phaser.Scene{

    convOn = false;
    clickedCorOpt = false;
    correctNumber = 1;
    ordineClick = false; //false se il paziente viene cliccato prima del telefono, true l'inverso
    scoreText = null;
    constructor(){
        super({key: "HospitalScene"});
    }
    preload(){
        this.load.image("convBox", "img/TextBoxLeft.png");
        this.load.image("Phone", "img/Phone.png");
        this.load.image("Paziente", "img/Paziente.png");
    }
    create(){

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    
    const box = this.add.graphics();
    box.fillStyle(0xecf0f1, 1);
    box.fillRoundedRect(centerX + 100, centerY - 100, 400, 100, 0); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 10 (maggiore valore -> maggiore arrotondamento)
    box.lineStyle(2, 0x2c3e50, 1);
    box.strokeRoundedRect(centerX + 100, centerY - 100, 400, 100, 0);

    this.scoreText = this.add.text(centerX, 50, "Score: " + gameState.score, {
        fontSize: "20px",
        align: "center",
        
    }).setOrigin(0.5);

    const infoPaziente = this.add.text(centerX + 300, centerY - 50, 'hai già constatato che\nil paziente non risponde', {
        fontSize: '20px',
        color: '#2c3e50',
        align: 'center'
    }).setOrigin(0.5);

    const telephone = this.add.image(150, centerY - 10, "Phone").setScale(0.5).setInteractive({useHandCursor: true});

    telephone.on("pointerdown", () => {
        
        if(this.convOn){
            this.deletePhoneConvo();
            this.convOn = false;
            return;
        }

        this.convOn = true;
        const optioncords = {x: centerX - centerX / 2 + 160, y: centerY}
        this.phoneConvo = this.add.image(centerX - centerX / 2 + 150, centerY, "convBox").setScale(1.0).setOrigin(0.5, 0.5);
        
        optioncords.y -= 49;
        
        this.optRect1 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 74%, 67%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect1.setStrokeStyle(3, 0x000000);
        this.option1 = this.add.text(optioncords.x, optioncords.y, "Opzione 1", {
            fontSize: "20px",
            color: '#2c3e50',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        optioncords.y += 45;
        
        this.optRect2 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 9%, 59%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect2.setStrokeStyle(3, 0x000000);
        this.option2 = this.add.text(optioncords.x, optioncords.y, "Opzione 2", {
            fontSize: "20px",
            color: '#2c3e50',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        optioncords.y += 45;
        this.optRect3 = this.add.rectangle(optioncords.x, optioncords.y, 300, 40, "hsla(180, 9%, 59%, 1.00)", 0, 20).setInteractive({useHandCursor: true});
        this.optRect3.setStrokeStyle(3, 0x000000);
        this.option3 = this.add.text(optioncords.x, optioncords.y, "Opzione 3", {
            fontSize: "20px",
            color: '#2c3e50',
            align: 'center'
        }).setOrigin(0.5, 0.5);

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

    const patient = this.add.image(centerX, centerY + 200, "Paziente").setScale(0.6).setInteractive({useHandCursor: true});
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
        if(this.correctNumber === Chosen_number){
            this.clickedCorOpt = true;
        }
        else{
            gameState.errors.Hospital ++;
            gameState.score -= 5;
            this.scoreText.setText("Score: " + gameState.score)
            alert("Opzione incorretta, ritenta");
        }
        this.deletePhoneConvo();
    };

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
