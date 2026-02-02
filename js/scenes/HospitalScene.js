class HospitalScene extends Phaser.Scene {
    
    convOn = false;
    contextText = "default";
    opzione1 = "default";
    opzione2 = "default";
    opzione3 = "default";
    clickedCorOpt = false;
    correctNumber = 1;
    scoreText = null;
    bottomTextSpace = null;
    bottomText = "Interagire con il telefono";
    
    constructor() {
        super({ key: "HospitalScene" });
    }
    
    preload() {
        this.load.text("phoneOptions", "text/Phone.txt");
        this.load.image("Ospedale", "img/Ospedale.jpg");
        this.load.image("convBox", "img/TextBoxLeft.png");
        this.load.image("Phone", "img/Telefono.png");
        this.load.image("Paziente", "img/Paziente.png");
    }
    
    create() {
        this.createContent();
    }
    
    createContent() {
        this.children.removeAll();
        this.convOn = false;
        this.textElements = [];

        this.createBackground();
        this.setupEvents();
        this.createTexts();
    }

    createBackground() {
        this.mainContainer = this.add.container(0, 0);

        const ospedale = this.add.image(0, 0, "Ospedale").setOrigin(0, 0);
        ospedale.setScale(Math.max(1920 / ospedale.width, 1080 / ospedale.height));

        const infoBox = this.add.graphics();
        infoBox.fillStyle(0xecf0f1, 1);
        infoBox.fillRoundedRect(1250, 87, 600, 150, 0);
        infoBox.lineStyle(2, 0x2c3e50, 1);
        infoBox.strokeRoundedRect(1250, 87, 600, 150, 0);

        this.telephone = this.add.image(1632, 432, "Phone")
            .setScale(0.4)
            .setInteractive({ useHandCursor: true });

        this.patientArea = this.add.rectangle(768, 594, 400, 400)
            .setAlpha(0.01)
            .setInteractive({ useHandCursor: true });

        this.mainContainer.add([ospedale, infoBox, this.telephone, this.patientArea]);
    }

    createTexts() {
        this.scoreText = this.add.text(960, 32, "Score: " + gameState.score, {
            fontSize: `50px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.scoreText);

        this.bottomTextSpace = this.add.text(960, 1042, this.bottomText, {
            fontSize: `50px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5, 0.5);
        this.textElements.push(this.bottomTextSpace);

        this.textElements.push(this.add.text(1550, 162, 'Il paziente non risponde', {
            fontSize: `48px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            wordWrap: {width: 410, height: 75},
            resolution: 2
        }).setOrigin(0.5));

        this.getPhonetext(this.cache.text.get("phoneOptions"));
    }

    setupEvents() {
        this.telephone.removeAllListeners();
        this.telephone.on("pointerdown", () => {
            if (this.clickedCorOpt) {
                this.telephone.disableInteractive();
                return;
            }
            if (this.convOn) {
                this.deletePhoneConvo();
                this.convOn = false;
                return;
            }
            this.convOn = true;
            this.showPhoneConvo();
        });

        this.patientArea.removeAllListeners();
        this.patientArea.on("pointerdown", () => {
            if (this.clickedCorOpt) {
                this.scene.start("PatientScene");
            } else {
                gameState.score -= 5;
                this.scoreText.setText("Score: " + gameState.score);
                this.clickedOption("Interagire prima con il telefono", false);
            }
        });
    }

    showPhoneConvo() {
        this.bottomText = "Selezionare l'opzione giusta tra le 3";
        this.bottomTextSpace.setText(this.bottomText);
        this.createContextBox();
        this.createOptionBoxes();
        this.createOptionTexts();
    }

    createContextBox() {
        this.contextBoxGraphic = this.add.graphics();
        this.drawAnswerBox(this.contextBoxGraphic, 1536, 620, 600, 60);
        this.mainContainer.add(this.contextBoxGraphic);
        
        this.contextTextElement = this.add.text(1536, 620, this.contextText, {
            fontSize: `51px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2,
            wordWrap: { width: 580 }
        }).setOrigin(0.5);
        this.textElements.push(this.contextTextElement);
    }

    createOptionBoxes() {
        this.optRect1 = this.add.graphics();
        this.drawAnswerBox(this.optRect1, 1536, 700, 600, 80);
        this.optRect2 = this.add.graphics();
        this.drawAnswerBox(this.optRect2, 1536, 795, 600, 80);
        this.optRect3 = this.add.graphics();
        this.drawAnswerBox(this.optRect3, 1536, 890, 600, 80);
        this.mainContainer.add([this.optRect1, this.optRect2, this.optRect3]);
    }

    createOptionTexts() {
        const textStyle = {
            fontSize: `48px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            resolution: 2
        };

        this.option1 = this.add.text(1536, 720, this.opzione1, textStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.option2 = this.add.text(1536, 815, this.opzione2, textStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.option3 = this.add.text(1536, 910, this.opzione3, textStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.textElements.push(this.option1, this.option2, this.option3);
        [this.option1, this.option2, this.option3].forEach((opt, idx) => {
            opt.on("pointerdown", () => this.buttonChoice(idx + 1));
        });
    }

    buttonChoice(chosenNumber) {
        if (this.correctNumber === chosenNumber) {
            this.clickedOption("Corretto! Ora clickare sul paziente per un check-up!", true);
            this.clickedCorOpt = true;
        } else {
            gameState.errors.Hospital++;
            gameState.score -= 5;
            this.scoreText.setText("Score: " + gameState.score);
            this.clickedOption("Attenzione, scegliere l'opzione corretta", false);
        }
        this.deletePhoneConvo();
    }

    drawAnswerBox(box, x, y, width, height) {
        box.clear();
        box.fillStyle(0xffffff, 1);
        box.fillRoundedRect(x - width / 2, y - height / 2, width, height, 5);
        box.lineStyle(2, 0x000000, 1);
        box.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 5);
    }

    clickedOption(info, win) {
        if (win) {
            this.bottomTextSpace.setColor("#167e30ff");   
        } else {
            this.bottomTextSpace.setColor("#ff0000");
        }
        this.bottomTextSpace.setText(info);
        this.bottomText = info;
    }

    getPhonetext(fullText) {
        const opzioni = fullText.split("\n");
        let i = 5, riga = 0;
        while (i != 0) {
            riga++;
            if (opzioni[riga].substring(0, 12) === "#ContextText:") {
                this.contextText = opzioni[riga].substring(13);
                i--;
            } else if (opzioni[riga].substring(0, 9) === "#Option1:") {
                this.opzione1 = opzioni[riga].substring(10);
                i--;
            } else if (opzioni[riga].substring(0, 9) === "#Option2:") {
                this.opzione2 = opzioni[riga].substring(10);
                i--;
            } else if (opzioni[riga].substring(0, 9) === "#Option3:") {
                this.opzione3 = opzioni[riga].substring(10);
                i--;
            } else if (opzioni[riga].substring(0, 15) === "#CorrectOption:") {
                this.correctNumber = Number(opzioni[riga].substring(16));
                i--;
            }
        }
    }

    deletePhoneConvo() {
        [this.contextBoxGraphic, this.contextTextElement, this.optRect1, this.optRect2, this.optRect3, this.option1, this.option2, this.option3]
            .forEach(el => { if (el) { el.destroy(); } });
        this.contextBoxGraphic = this.contextTextElement = this.optRect1 = this.optRect2 = this.optRect3 = this.option1 = this.option2 = this.option3 = null;
    }

    shutdown() {
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
        if (this.textElements) {
            this.textElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
        this.deletePhoneConvo();
    }
}