class HospitalScene extends Phaser.Scene {
    
    convOn = false;
    opzione1 = "default";
    opzione2 = "default";
    opzione3 = "default";
    clickedCorOpt = false;
    correctNumber = 1;
    wrongChoiceText;
    ordineClick = false;
    scoreText = null;
    
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
        this.scale.on('resize', this.handleResize, this);
    }
    
    handleResize(gameSize) {
        this.time.delayedCall(50, () => {
            if (this.scene.isActive()) {
                this.createContent();
            }
        });
    }
    
    createContent() {
        // Pulisci tutto
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
        if (this.textElements) {
            this.textElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
        if (this.children) {
            this.children.removeAll();
        }
        
        // Reset stato
        this.convOn = false;

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Calcola scala
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        const scale = Math.min(scaleX, scaleY);

        // CONTAINER per elementi grafici
        this.mainContainer = this.add.container(0, 0);

        // Coordinate di riferimento (1920x1080)
        const refCenterX = 960;
        const refCenterY = 540;

        // Carica testo del telefono
        this.getPhonetext(this.cache.text.get("phoneOptions"));

        // Immagine ospedale (background)
        const ospedale = this.add.image(0, 0, "Ospedale").setOrigin(0, 0);
        
        // Scala l'ospedale per coprire l'area
        const ospedaleScaleX = 1920 / ospedale.width;
        const ospedaleScaleY = 1080 / ospedale.height;
        const ospedaleScale = Math.max(ospedaleScaleX, ospedaleScaleY);
        ospedale.setScale(ospedaleScale);

        // Posizioni di riferimento
        const phoneX = 1632;    // 1.7 * 960
        const phoneY = 540;
        
        const patientX = 768;   // 0.8 * 960
        const patientY = 594;   // 1.1 * 540
        
        const infoBoxX = 1550;  // 
        const infoBoxY = 162;   // 0.3 * 540

        // Box info paziente
        const infoBox = this.add.graphics();
        infoBox.fillStyle(0xecf0f1, 1);
        infoBox.fillRoundedRect(infoBoxX  - 300, infoBoxY - 75, 600, 150, 0);
        infoBox.lineStyle(2, 0x2c3e50, 1);
        infoBox.strokeRoundedRect(infoBoxX - 300, infoBoxY - 75, 600, 150, 0);

        // Telefono
        const telephone = this.add.image(phoneX, phoneY * 0.8, "Phone")
            .setScale(0.4)
            .setInteractive({ useHandCursor: true });

        // Area paziente (invisibile ma interattiva)
        const patientArea = this.add.rectangle(patientX, patientY, 400, 400)
            .setAlpha(0.01)
            .setInteractive({ useHandCursor: true });

        // Aggiungi al container
        this.mainContainer.add([
            ospedale,
            infoBox,
            telephone,
            patientArea
        ]);

        // Scala il container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenterX * scale),
            centerY - (refCenterY * scale)
        );

        // TESTI FUORI DAL CONTAINER
        this.textElements = [];
        const minFontSize = 16;
        
        // Calcola posizioni reali
        const scoreTextX = centerX;
        const scoreTextY = centerY + ((50 - refCenterY) * scale);
        
        const infoTextX = centerX + ((infoBoxX - refCenterX) * scale);
        const infoTextY = centerY + ((infoBoxY - refCenterY) * scale);
        
        const wrongTextX = centerX;
        const wrongTextY = centerY + ((centerY / 1.5 - refCenterY) * scale);

        // Score text
        const scoreFontSize = Math.max(minFontSize, 35 * scale);
        this.scoreText = this.add.text(scoreTextX, scoreTextY, 
            "Score: " + gameState.score, {
            fontSize: `${scoreFontSize}px`,
            align: "center",
            color: "rgba(255, 0, 0, 1)",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.textElements.push(this.scoreText);

        // Info paziente text
        const infoFontSize = Math.max(minFontSize, 20 * scale) * 0.8;
        const infoPaziente = this.add.text(infoTextX, infoTextY, 
            'Il paziente non risponde', {
            fontSize: `${infoFontSize}px`,
            color: '#2c3e50',
            align: 'center',
            fontFamily: "Arial, sans-serif",
            wordWrap: {width: scale * 400, height: scale * 75}
        }).setOrigin(0.5);
        this.textElements.push(infoPaziente);

        // Wrong choice text
        const wrongFontSize = Math.max(minFontSize, 24 * scale);
        this.wrongChoiceText = this.add.text(wrongTextX, wrongTextY, 
            "Careful,\nchoose the correct option", {
            align: "center",
            fontSize: `${wrongFontSize}px`,
            color: "#ff0000",
            padding: { x: 15, y: 5 },
            fontFamily: "Arial, sans-serif"
        }).setOrigin(0.5).setAlpha(0);
        this.textElements.push(this.wrongChoiceText);

        // EVENTI TELEFONO
        telephone.removeAllListeners();
        telephone.on("pointerdown", () => {
            if (this.clickedCorOpt) {
                telephone.disableInteractive();
                return;
            }

            if (this.convOn) {
                this.deletePhoneConvo();
                this.convOn = false;
                return;
            }

            this.convOn = true;
            this.showPhoneConvo(scale, centerX, centerY, refCenterX, refCenterY);
        });

        // EVENTI PAZIENTE
        patientArea.removeAllListeners();
        patientArea.on("pointerdown", () => {
            if (this.clickedCorOpt) {
                this.scene.start("PatientScene");
            } else {
                gameState.score -= 5;
                this.scoreText.setText("Score: " + gameState.score);
                this.clickedOption("Interagire prima con il telefono", false);
            }
        });
    }

    showPhoneConvo(scale, centerX, centerY, refCenterX, refCenterY) {
    // Posizioni di riferimento per la conversazione - IN BASSO A DESTRA
    const convBoxX = 1536;  // Coordinata X di riferimento (1920x1080)
    const convBoxY = 900;   // In basso (83% di 1080)

    // Posizioni opzioni - partendo da 780px (72% di 1080)
    let optY = 780;
    const optWidth = 600;   // Larghezza aumentata
    const optHeight = 80;   // Altezza aumentata
    const optSpacing = 95;  // Spaziatura tra opzioni

    // Opzione 1
    const optRect1 = this.add.rectangle(convBoxX, optY, optWidth, optHeight, 0x999999, 1)
        .setInteractive({ useHandCursor: true });
    optRect1.setStrokeStyle(4, 0x000000);

    // Opzione 2
    optY += optSpacing;
    const optRect2 = this.add.rectangle(convBoxX, optY, optWidth, optHeight, 0x999999, 1)
        .setInteractive({ useHandCursor: true });
    optRect2.setStrokeStyle(4, 0x000000);

    // Opzione 3
    optY += optSpacing;
    const optRect3 = this.add.rectangle(convBoxX, optY, optWidth, optHeight, 0x999999, 1)
        .setInteractive({ useHandCursor: true });
    optRect3.setStrokeStyle(4, 0x000000);

    // Aggiungi rettangoli al container
    this.mainContainer.add([optRect1, optRect2, optRect3]);

    // TESTI opzioni (fuori dal container per qualità)
    const minFontSize = 16;
    const optionFontSize = Math.max(minFontSize, 25 * scale); // Font più grande

    // Calcola posizioni reali dei testi
    const opt1TextX = centerX + ((convBoxX - refCenterX) * scale);
    const opt1TextY = centerY + ((810 - refCenterY) * scale);

    const opt2TextX = centerX + ((convBoxX - refCenterX) * scale);
    const opt2TextY = centerY + ((905 - refCenterY) * scale);

    const opt3TextX = centerX + ((convBoxX - refCenterX) * scale);
    const opt3TextY = centerY + ((1005 - refCenterY) * scale);

    const option1Text = this.add.text(opt1TextX, opt1TextY, 
        this.opzione1, {
        fontSize: `${optionFontSize * 0.7}px`,
        color: '#2c3e50',
        align: 'center',
        wordWrap: { width: optWidth * scale },
        fontFamily: "Arial, sans-serif",
        fontStyle: "bold"
    }).setOrigin(0.5);

    const option2Text = this.add.text(opt2TextX, opt2TextY, 
        this.opzione2, {
        fontSize: `${optionFontSize * 0.7}px`,
        color: '#2c3e50',
        align: 'center',
        wordWrap: { width: optWidth * scale },
        fontFamily: "Arial, sans-serif",
        fontStyle: "bold"
    }).setOrigin(0.5);

    const option3Text = this.add.text(opt3TextX, opt3TextY, 
        this.opzione3, {
        fontSize: `${optionFontSize * 0.7}px`,
        color: '#2c3e50',
        align: 'center',
        wordWrap: { width: optWidth * scale },
        fontFamily: "Arial, sans-serif",
        fontStyle: "bold"
    }).setOrigin(0.5);

    // Salva riferimenti per cleanup
   this.optRect1 = optRect1;
    this.optRect2 = optRect2;
    this.optRect3 = optRect3;
    this.option1 = option1Text;
    this.option2 = option2Text;
    this.option3 = option3Text;

    // Eventi click
    optRect1.on("pointerdown", () => {
        this.buttonChoice(1);
    });

    optRect2.on("pointerdown", () => {
        this.buttonChoice(2);
    });

    optRect3.on("pointerdown", () => {
        this.buttonChoice(3);
    });
}

    buttonChoice(chosenNumber) {
        if (this.correctNumber === chosenNumber) {
            this.clickedOption("Corretto!\nOra andiamo a fare un check-up sul paziente", true);
            this.clickedCorOpt = true;
        } else {
            gameState.errors.Hospital++;
            gameState.score -= 5;
            this.scoreText.setText("Score: " + gameState.score);
            this.clickedOption("Attenzione,\nscegliere l'opzione corretta", false);
        }
        this.deletePhoneConvo();
    }

    clickedOption(info, win) {
        if (win) {
            this.wrongChoiceText.setColor("#167e30ff");
        } else {
            this.wrongChoiceText.setColor("#ff0000");
        }

        this.wrongChoiceText.setText(info);
        this.wrongChoiceText.setAlpha(1);

        this.tweens.add({
            targets: this.wrongChoiceText,
            alpha: 0,
            duration: 3000,
        });
    }

    getPhonetext(fullText) {
        const opzioni = fullText.split("\n");
        let i = 4;
        let riga = 0;
        
        while (i != 0) {
            riga++;
            if (opzioni[riga].substring(0, 9) === "#Option1:") {
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
        console.log("Correct option:", this.correctNumber);
    }

    deletePhoneConvo() {
        if (this.optRect1) {
            this.optRect1.destroy();
            this.optRect1 = null;
        }
        if (this.optRect2) {
            this.optRect2.destroy();
            this.optRect2 = null;
        }
        if (this.optRect3) {
            this.optRect3.destroy();
            this.optRect3 = null;
        }
        if (this.phoneConvo) {
            this.phoneConvo.destroy();
            this.phoneConvo = null;
        }
        if (this.option1) {
            this.option1.destroy();
            this.option1 = null;
        }
        if (this.option2) {
            this.option2.destroy();
            this.option2 = null;
        }
        if (this.option3) {
            this.option3.destroy();
            this.option3 = null;
        }
    }

    shutdown() {
        this.scale.off('resize', this.handleResize, this);
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