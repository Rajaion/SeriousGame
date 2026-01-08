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
        
        // Configurazione posizioni (riferimento 1920x1080)
        this.refPositions = {
            refCenter: { x: 960, y: 540 },
            phone: { x: 1632, y: 432 },  // phoneY * 0.8 = 540 * 0.8
            patient: { x: 768, y: 594 },
            infoBox: { x: 1550, y: 162 },
            convBox: { x: 1536, y: 0 },
            options: {
                y: 700,
                spacing: 95,
                width: 600,
                height: 80
            }
        };
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
    
    handleResize() {
        this.time.delayedCall(50, () => {
            if (this.scene.isActive()) {
                this.createContent();
            }
        });
    }
    
    createContent() {
        // Pulisci tutto
        this.children.removeAll();
        this.convOn = false;
        this.textElements = [];
        
        const { width, height, centerX, centerY, scale } = this.getScreenMetrics();
        const { borderWidth, borderHeight } = this.getBorderDimensions(scale);

        this.createBackground(centerX, centerY, borderWidth, borderHeight, scale);
        this.createGameContent(centerX, centerY, scale);
        this.createTexts(centerX, centerY, scale);
    }

    getScreenMetrics() {
        const width = this.scale.width;
        const height = this.scale.height;
        const scale = Math.min(width / 1920, height / 1080);
        return {
            width,
            height,
            centerX: width / 2,
            centerY: height / 2,
            scale
        };
    }

    getBorderDimensions(scale) {
        return {
            borderWidth: 1920 * scale,
            borderHeight: 1080 * scale
        };
    }

    createBackground(centerX, centerY, borderWidth, borderHeight, scale) {
        // Background ospedale 
        this.mainContainer = this.add.container(0, 0);
        const { refCenter } = this.refPositions;

        // Immagine ospedale (background)
        const ospedale = this.add.image(0, 0, "Ospedale").setOrigin(0, 0);
        
        // Scala l'ospedale per coprire l'area
        const ospedaleScaleX = 1920 / ospedale.width;
        const ospedaleScaleY = 1080 / ospedale.height;
        const ospedaleScale = Math.max(ospedaleScaleX, ospedaleScaleY);
        ospedale.setScale(ospedaleScale);

        // Box info paziente
        const infoBox = this.add.graphics();
        const { infoBox: infoPos } = this.refPositions;
        infoBox.fillStyle(0xecf0f1, 1);
        infoBox.fillRoundedRect(infoPos.x - 300, infoPos.y - 75, 600, 150, 0);
        infoBox.lineStyle(2, 0x2c3e50, 1);
        infoBox.strokeRoundedRect(infoPos.x - 300, infoPos.y - 75, 600, 150, 0);

        // Telefono
        const { phone } = this.refPositions;
        const telephone = this.add.image(phone.x, phone.y, "Phone")
            .setScale(0.4)
            .setInteractive({ useHandCursor: true });

        // Area paziente (invisibile ma interattiva)
        const { patient } = this.refPositions;
        const patientArea = this.add.rectangle(patient.x, patient.y, 400, 400)
            .setAlpha(0.01)
            .setInteractive({ useHandCursor: true });

        // Aggiungi al container
        this.mainContainer.add([
            ospedale,
            infoBox,
            telephone,
            patientArea
        ]);

        // Scala e posiziona container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenter.x * scale),
            centerY - (refCenter.y * scale)
        );

        // Salva riferimenti per eventi
        this.telephone = telephone;
        this.patientArea = patientArea;
    }

    createGameContent(centerX, centerY, scale) {
        // Setup eventi telefono e paziente
        this.setupEvents(scale);
    }

    createTexts(centerX, centerY, scale) {
        const { refCenter } = this.refPositions;
        const minFontSize = 40 * scale;

        // Score text
        const scoreTextX = centerX;
        const scoreTextY = centerY + ((32 - refCenter.y) * scale);
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

        // Bottom text
        const bottomTextSpaceX = centerX;
        const bottomTextSpaceY = centerY + ((refCenter.y - 38) * scale);
        
        this.bottomTextSpace = this.add.text(bottomTextSpaceX, bottomTextSpaceY, 
            this.bottomText, {
            fontSize: `${scoreFontSize}px`,
            align: "center",
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5, 0.5);
        this.textElements.push(this.bottomTextSpace);

        // Info paziente text
        const { infoBox: infoPos } = this.refPositions;
        const infoTextX = centerX + ((infoPos.x - refCenter.x) * scale);
        const infoTextY = centerY + ((infoPos.y - refCenter.y) * scale);
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

        // Carica testo del telefono
        this.getPhonetext(this.cache.text.get("phoneOptions"));
    }

    setupEvents(scale) {
        // EVENTI TELEFONO
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
            this.showPhoneConvo(scale);
        });

        // EVENTI PAZIENTE
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

    showPhoneConvo(scale) {
        // Aggiornare le info del testo sotto
        this.bottomText = "Selezionare l'opzione giusta tra le 3";
        this.bottomTextSpace.setText(this.bottomText);
        
        const { refCenter, convBox, options } = this.refPositions;
        const { centerX, centerY } = this.getScreenMetrics();
        
        // Crea rettangoli opzioni nel container
        this.createOptionBoxes();
        
        // Crea testi opzioni FUORI dal container (come PatientScene)
        this.createOptionTexts(centerX, centerY, scale);
    }

    createOptionBoxes() {
        const { convBox, options } = this.refPositions;
        const optWidth = options.width;
        const optHeight = options.height;
        const startOptY = options.y;
        const optSpacing = options.spacing;

        // Opzione 1
        const opt1Y = startOptY;
        this.optRect1 = this.add.graphics();
        this.drawAnswerBox(this.optRect1, convBox.x, opt1Y, optWidth, optHeight);
        
        // Opzione 2
        const opt2Y = startOptY + optSpacing;
        this.optRect2 = this.add.graphics();
        this.drawAnswerBox(this.optRect2, convBox.x, opt2Y, optWidth, optHeight);
        
        // Opzione 3
        const opt3Y = startOptY + (optSpacing * 2);
        this.optRect3 = this.add.graphics();
        this.drawAnswerBox(this.optRect3, convBox.x, opt3Y, optWidth, optHeight);

        // Aggiungi rettangoli al container
        this.mainContainer.add([this.optRect1, this.optRect2, this.optRect3]);
    }

    createOptionTexts(centerX, centerY, scale) {
        const { refCenter, convBox, options } = this.refPositions;
        const startOptY = options.y;
        const optSpacing = options.spacing;
        
        // Calcola font size scalato (come PatientScene)
        const fontSize = Math.max(60 * scale, 60 * scale) * 0.8;
        const textStyle = {
            fontSize: `${fontSize}px`,
            color: '#2c3e50',
            align: 'center',
            fontFamily: "Poppins",
            resolution: 2
        };

        // Testo opzione 1 - FUORI dal container con posizione scalata
        const opt1TextX = centerX + ((convBox.x - refCenter.x) * scale);
        const opt1TextY = centerY + ((startOptY + 20 - refCenter.y) * scale);
        this.option1 = this.add.text(opt1TextX, opt1TextY, this.opzione1, textStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        this.textElements.push(this.option1);

        // Testo opzione 2
        const opt2TextX = centerX + ((convBox.x - refCenter.x) * scale);
        const opt2TextY = centerY + (((startOptY + 20 + optSpacing) - refCenter.y) * scale);
        this.option2 = this.add.text(opt2TextX, opt2TextY, this.opzione2, textStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        this.textElements.push(this.option2);

        // Testo opzione 3
        const opt3TextX = centerX + ((convBox.x - refCenter.x) * scale);
        const opt3TextY = centerY + (((startOptY + 20 +(optSpacing * 2)) - refCenter.y) * scale);
        this.option3 = this.add.text(opt3TextX, opt3TextY, this.opzione3, textStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        this.textElements.push(this.option3);

        // Eventi click sui testi
        this.option1.on("pointerdown", () => {
            this.buttonChoice(1);
        });

        this.option2.on("pointerdown", () => {
            this.buttonChoice(2);
        });

        this.option3.on("pointerdown", () => {
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