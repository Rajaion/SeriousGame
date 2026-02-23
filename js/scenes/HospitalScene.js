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

    //crea il background dell'ospedale
    createBackground() {
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

        //area del paziente interagibile
        this.patientArea = this.add.rectangle(768, 594, 400, 400)
            .setAlpha(0.01)
            .setInteractive({ useHandCursor: true });

        // Freccia sopra il paziente (mostrata dopo risposta corretta al telefono)
        this.patientArrowHint = this.add.graphics();
        this.patientArrowBaseX = 768;
        this.patientArrowBaseY = 594 - 250;
        this.patientArrowHint.fillStyle(0xe74c3c, 0.95);
        this.patientArrowHint.lineStyle(2, 0xc0392b, 1);
        this.patientArrowHint.fillTriangle(0, 20, -24, -20, 24, -20);
        this.patientArrowHint.strokeTriangle(0, 20, -24, -20, 24, -20);
        this.patientArrowHint.x = this.patientArrowBaseX;
        this.patientArrowHint.y = this.patientArrowBaseY;
        this.patientArrowHint.setVisible(false).setDepth(10);
        this.patientArrowBobTween = null;
    }

    //crea il testo del score e del testo in basso
    createTexts() {
        //testo del score
        this.scoreText = this.add.text(960, 32, "Score: " + gameState.score, {
            fontSize: `50px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.scoreText);

        //testo in basso
        this.bottomTextSpace = this.add.text(960, 1042, this.bottomText, {
            fontSize: `50px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5, 0.5);
        this.textElements.push(this.bottomTextSpace);

        //testo con le informazioni del paziente in alto a destra
        this.textElements.push(this.add.text(1550, 162, 'Entri in stanza: il paziente è incosciente e non ha segni di vita', {
            fontSize: `40px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            wordWrap: {width: 500, height: 100},
            resolution: 2
        }).setOrigin(0.5));

        //carica le opzioni del telefono
        this.getPhonetext(this.cache.text.get("phoneOptions"));
    }

    //imposta gli eventi per il telefono e l'area del paziente
    setupEvents() {
        //telefono
        this.telephone.removeAllListeners();
        this.telephone.on("pointerdown", () => {
            if (this.clickedCorOpt) {
                this.telephone.disableInteractive();
                return;
            }
            if (this.convOn) {
                //non permettere di interagire con il telefono quando le opzioni sono visibili
                return;
            }
            this.convOn = true;
            this.showPhoneConvo();
        });

        this.patientArea.removeAllListeners();
        this.patientArea.on("pointerdown", () => {
            if (this.clickedCorOpt) {
                this.hidePatientHint();
                this.scene.start("PatientScene");
            } else {
                gameState.score -= 5;
                this.scoreText.setText("Score: " + gameState.score);
                this.clickedOption("Interagire prima con il telefono", false);
            }
        });
    }

    //mostra la conversazione del telefono
    showPhoneConvo() {
        //disabilita il cursore a mano quando compaiono le opzioni
        if (this.telephone.input) {
            this.telephone.input.cursor = 'default';
        }
        this.bottomText = "Selezionare l'opzione giusta tra le 3";
        this.bottomTextSpace.setText(this.bottomText);
        this.createContextBox();
        this.createOptionBoxes();
        this.createOptionTexts();
    }

    //crea la box per il testo sopra le 3 opzioni da scegliere
    createContextBox() {
        this.contextBoxGraphic = this.add.graphics();
        this.drawAnswerBox(this.contextBoxGraphic, 1536, 600, 750, 100);
        
        //testo informativo sopra le 3 opzioni da scegliere
        this.contextTextElement = this.add.text(1536, 600, this.contextText, {
            fontSize: `36px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2,
            wordWrap: { width: 720 }
        }).setOrigin(0.5);
        this.textElements.push(this.contextTextElement);
    }

    //funzione per creare le box per le 3 opzioni da scegliere
    createOptionBoxes() {
        this.optRect1 = this.add.graphics();
        this.drawAnswerBox(this.optRect1, 1536, 700, 720, 80);
        this.optRect2 = this.add.graphics();
        this.drawAnswerBox(this.optRect2, 1536, 795, 720, 80);
        this.optRect3 = this.add.graphics();
        this.drawAnswerBox(this.optRect3, 1536, 890, 720, 80);
    }

    //funzione per creare il testo delle 3 opzioni da scegliere
    createOptionTexts() {
        const textStyle = {
            fontSize: `40px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            resolution: 2,
            wordWrap: { width: 750 }
        };

        this.option1 = this.add.text(1536, 700, this.opzione1, textStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.option2 = this.add.text(1536, 795, this.opzione2, textStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.option3 = this.add.text(1536, 890, this.opzione3, textStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.textElements.push(this.option1, this.option2, this.option3);
        [this.option1, this.option2, this.option3].forEach((opt, idx) => {
            opt.on("pointerdown", () => this.buttonChoice(idx + 1));
        });
    }

    //funzione per gestire la scelta dell'utente relativamente alla risposta scelta e la gestione del punteggio
    buttonChoice(chosenNumber) {
        this.telephone.setInteractive({ useHandCursor: true });
        if (this.correctNumber === chosenNumber) {
            gameState.score += 15;
            this.scoreText.setText("Score: " + gameState.score);
            this.clickedOption("Corretto! Ora procedi con la valutazione del paziente interagendo su di lui", true);
            this.clickedCorOpt = true;
            this.showPatientHint();
        } else {
            if (typeof window.logGameError === "function") window.logGameError("Hospital", "Opzione telefono sbagliata");
            gameState.score -= 5;
            this.scoreText.setText("Score: " + gameState.score);
            this.clickedOption("Attenzione, scegliere l'opzione corretta", false);
        }
        this.deletePhoneConvo();
    }   

    //funzione per eliminare la conversazione del telefono
    deletePhoneConvo() {
        [this.contextBoxGraphic, this.contextTextElement, this.optRect1, this.optRect2, this.optRect3, this.option1, this.option2, this.option3]
            .forEach(el => { if (el) { el.destroy(); } });
        this.contextBoxGraphic = this.contextTextElement = this.optRect1 = this.optRect2 = this.optRect3 = this.option1 = this.option2 = this.option3 = null;
        this.convOn = false;
    }

    showPatientHint() {
        this.patientArrowHint.setVisible(true);
        this.patientArrowHint.x = this.patientArrowBaseX;
        this.patientArrowHint.y = this.patientArrowBaseY;
        if (this.patientArrowBobTween) this.patientArrowBobTween.remove();
        this.patientArrowBobTween = this.tweens.add({
            targets: this.patientArrowHint,
            y: this.patientArrowBaseY + 16,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    hidePatientHint() {
        this.patientArrowHint.setVisible(false);
        if (this.patientArrowBobTween) {
            this.patientArrowBobTween.remove();
            this.patientArrowBobTween = null;
        }
    }

    //funzione per gestire la scelta dell'utente relativamente alla risposta scelta
    clickedOption(info, win) {
        if (win) {
            this.bottomTextSpace.setColor("#167e30ff");   
        } else {
            this.bottomTextSpace.setColor("#ff0000");
        }
        this.bottomTextSpace.setText(info);
        this.bottomText = info;
    }

    //funzione per creare la box di background per il testo delle 3 opzioni da scegliere
    drawAnswerBox(box, x, y, width, height) {
        box.clear();
        box.fillStyle(0xffffff, 1);
        box.fillRoundedRect(x - width / 2, y - height / 2, width, height, 5);
        box.lineStyle(2, 0x000000, 1);
        box.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 5);
    }


    //funzione per ottenere le opzioni del telefono
    getPhonetext(fullText) {
        const opzioni = fullText.split("\n");
        let originalOptions = [];
        let originalCorrect = 1;
        
        // Cerca tutte le righe che iniziano con #
        for (let riga = 0; riga < opzioni.length; riga++) {
            const linea = opzioni[riga].trim();
            if (linea.startsWith("#ContextText:")) {
                this.contextText = linea.substring(13).trim();
            } else if (linea.startsWith("#Option1:")) {
                originalOptions[0] = linea.substring(10).trim();
            } else if (linea.startsWith("#Option2:")) {
                originalOptions[1] = linea.substring(10).trim();
            } else if (linea.startsWith("#Option3:")) {
                originalOptions[2] = linea.substring(10).trim();
            } else if (linea.startsWith("#CorrectOption:")) {
                originalCorrect = Number(linea.substring(16).trim());
            }
        }
        
        // Mescola le opzioni (Fisher-Yates shuffle)
        const shuffled = [...originalOptions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        //Trova la nuova posizione della risposta corretta
        this.correctNumber = shuffled.indexOf(originalOptions[originalCorrect - 1]) + 1;
        
        //Assegna le opzioni mescolate
        this.opzione1 = shuffled[0];
        this.opzione2 = shuffled[1];
        this.opzione3 = shuffled[2];
    }

    

}