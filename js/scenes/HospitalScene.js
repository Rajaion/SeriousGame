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
        infoBox.fillRoundedRect(infoBoxX - 300, infoBoxY - 75, 600, 150, 0);
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

        // TESTI FUORI DAL CONTAINER
        this.textElements = [];
        const minFontSize = 40 * scale;
        
        // Calcola posizioni reali
        const scoreTextX = centerX;
        const scoreTextY = centerY + ((32 - refCenterY) * scale);

        const bottomTextSpaceX = centerX;
        const bottomTextSpaceY = centerY + ((refCenterY - 38) * scale);
        
        const infoTextX = centerX + ((infoBoxX - refCenterX) * scale);
        const infoTextY = centerY + ((infoBoxY - refCenterY) * scale);

        // Score text
        const scoreFontSize = Math.max(minFontSize, 50 * scale);
        this.scoreText = this.add.text(scoreTextX, scoreTextY, 
            "Score: " + gameState.score, {
            fontSize: `${scoreFontSize}px`,
            align: "center",
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.scoreText);

        this.bottomTextSpace = this.add.text(bottomTextSpaceX, bottomTextSpaceY, 
            this.bottomText , {
            fontSize: `${scoreFontSize}px`,
            align: "center",
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5, 0.5);
        this.textElements.push(this.scoreText);

        // Info paziente text
        const infoFontSize = Math.max(minFontSize, 60 * scale) * 0.8;
        const infoPaziente = this.add.text(infoTextX, infoTextY, 
            'Il paziente non risponde', {
            fontSize: `${infoFontSize}px`,
            color: '#2c3e50',
            align: 'center',
            fontFamily: "Poppins",
            wordWrap: {width: scale * 410, height: scale * 75},
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(infoPaziente);

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
            this.showPhoneConvo(scale);
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

        // Scala il container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenterX * scale),
            centerY - (refCenterY * scale)
        );
    }

    showPhoneConvo(scale) {
    // Aggiornare le info del testo sotto
    this.bottomText = "Selezionare l'opzione giusta tra le 3";
    this.bottomTextSpace.setText(this.bottomText);
    // Posizioni di riferimento per la conversazione (coordinate 1920x1080)
    const convBoxX = 1536;
    
    // Posizioni opzioni nel container
    const startOptY = 750;
    const optWidth = 600;
    const optHeight = 80;
    const optSpacing = 95;

    // Opzione 1
    const opt1Y = startOptY;
    const optRect1 = this.add.graphics();
    optRect1.fillStyle(0xecf0f1, 1);
    optRect1.fillRoundedRect(convBoxX - optWidth/2, opt1Y - optHeight/2, optWidth, optHeight, 0);
    optRect1.lineStyle(2, 0x2c3e50, 1);
    optRect1.strokeRoundedRect(convBoxX - optWidth/2, opt1Y - optHeight/2, optWidth, optHeight, 0);

    // Opzione 2
    const opt2Y = startOptY + optSpacing;
    const optRect2 = this.add.graphics();
    optRect1.fillStyle(0xecf0f1, 1);
    optRect1.fillRoundedRect(convBoxX - optWidth/2, opt2Y - optHeight/2, optWidth, optHeight, 0);
    optRect1.lineStyle(2, 0x2c3e50, 1);
    optRect1.strokeRoundedRect(convBoxX - optWidth/2, opt2Y - optHeight/2, optWidth, optHeight, 0);

    // Opzione 3
    const opt3Y = startOptY + (optSpacing * 2);
    const optRect3 =  this.add.graphics();
    optRect1.fillStyle(0xecf0f1, 1);
    optRect1.fillRoundedRect(convBoxX - optWidth/2, opt3Y - optHeight/2, optWidth, optHeight, 0);
    optRect1.lineStyle(2, 0x2c3e50, 1);
    optRect1.strokeRoundedRect(convBoxX - optWidth/2, opt3Y - optHeight/2   , optWidth, optHeight, 0);

    // TESTI - coordinate nel container 
    const option1Text = this.add.text(convBoxX, startOptY, 
        this.opzione1, {
        fontSize: '60px',
        color: '#2c3e50',
        align: 'center',
        fontFamily: "Poppins",
        resolution: 2,
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });;

    const option2Text = this.add.text(convBoxX, startOptY + optSpacing, 
        this.opzione2, {
        fontSize: '60px',
        color: '#2c3e50',
        align: 'center',
        fontFamily: "Poppins",
        resolution: 2,
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });;

    const option3Text = this.add.text(convBoxX, startOptY + (optSpacing * 2), 
        this.opzione3, {
        fontSize: '60px',
        color: '#2c3e50',
        align: 'center',
        fontFamily: "Poppins",
        resolution: 2,
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });;

    // Aggiungi TUTTO al container (così viene scalato insieme)
    this.mainContainer.add([optRect1, optRect2, optRect3, option1Text, option2Text, option3Text]);

    // Salva riferimenti per cleanup
    this.optRect1 = optRect1;
    this.optRect2 = optRect2;
    this.optRect3 = optRect3;
    this.option1 = option1Text;
    this.option2 = option2Text;
    this.option3 = option3Text;

    // Eventi click
    option1Text.on("pointerdown", () => {
        this.buttonChoice(1);
    });

    option2Text.on("pointerdown", () => {
        this.buttonChoice(2);
    });

    option3Text.on("pointerdown", () => {
        this.buttonChoice(3);
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