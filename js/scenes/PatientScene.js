class PatientScene extends Phaser.Scene {
    constructor() {
        super({ key: "PatientScene" });
        this.ordCounter = 0;
        this.answerBoxes = [];
        this.answerTexts = [];
        this.instructionText = null;
        this.bottomTextSpace = null;
        this.bottomText = "Segui l'ordine corretto delle procedure";
        
        // Configurazione posizioni (riferimento 1920x1080)
        this.refPositions = {
            refCenter: { x: 960, y: 540 },
            patient: { x: 576, y: 540 },
            question: { x: 1500, y: 324 },
            instruction: { x: 960, y: 162 },  // Posizione testo istruzioni in alto
            answers: [
                { x: 1500, y: 540, text: "Valutazione GAS" },
                { x: 1500, y: 648, text: "Inizia le compressioni" },
                { x: 1500, y: 756, text: "Libera le vie aeree" }
            ],
            reload: { x: 1500, y: 918 }
        };
    }
    
    preload() {
        this.load.image("ReloadButton", "img/ReloadButton.png");
        this.load.image("PatientCloseUp", "img/PatientCloseUp.jpeg");
        this.load.image("Arrow", "img/Arrow.png");
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
        this.children.removeAll();
        this.ordCounter = 0;
        this.answerBoxes = [];
        this.answerTexts = [];
        this.textElements = [];

        const { width, height, centerX, centerY, scale } = this.getScreenMetrics();
        const { borderWidth, borderHeight } = this.getBorderDimensions(scale);

        this.createBackground(centerX, centerY, borderWidth, borderHeight);
        this.createTopBottomBars(centerX, centerY, borderWidth, borderHeight, scale);
        this.createGameContent(centerX, centerY, scale);
        this.createTexts(centerX, centerY, scale);  // Aggiungi creazione testi
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

    createBackground(centerX, centerY, borderWidth, borderHeight) {
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight
        );
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight,
            0
        );
    }

    createTopBottomBars(centerX, centerY, borderWidth, borderHeight, scale) {
        const barHeight = 40 * scale;
        const barStyle = { fill: 0xffffff, stroke: 0x000000, strokeWidth: 2 * scale };

        // Barra superiore
        this.createBar(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            barHeight,
            barStyle
        );

        // Barra inferiore
        this.createBar(
            centerX - borderWidth / 2,
            centerY + borderHeight / 2 - barHeight,
            borderWidth,
            barHeight,
            barStyle
        );
    }

    createBar(x, y, width, height, style) {
        const bar = this.add.graphics();
        bar.fillStyle(style.fill, 1);
        bar.fillRoundedRect(x, y, width, height, 0);
        bar.lineStyle(style.strokeWidth, style.stroke, 1);
        bar.strokeRoundedRect(x, y, width, height, 0);
    }

    createTexts(centerX, centerY, scale) {
        const { refCenter, instruction } = this.refPositions;
        const minFontSize = 40 * scale;

        // Testo istruzioni in alto (come infoPaziente in HospitalScene)
        const instructionTextX = centerX + ((instruction.x - refCenter.x) * scale);
        const instructionTextY = centerY + ((instruction.y - refCenter.y) * scale);
        const instructionFontSize = Math.max(minFontSize, 60 * scale) * 0.8;
        
        this.instructionText = this.add.text(instructionTextX, instructionTextY, 
            "Segui l'ordine corretto delle procedure", {
            fontSize: `${instructionFontSize}px`,
            color: '#2c3e50',
            align: 'center',
            fontFamily: "Poppins",
            wordWrap: {width: scale * 600},
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.instructionText);

        // Testo in basso per messaggi (come bottomTextSpace in HospitalScene)
        const bottomTextSpaceX = centerX;
        const bottomTextSpaceY = centerY + ((refCenter.y - 20) * scale);
        const bottomFontSize = Math.max(minFontSize, 40 * scale);
        
        this.bottomTextSpace = this.add.text(bottomTextSpaceX, bottomTextSpaceY, 
            this.bottomText, {
            fontSize: `${bottomFontSize}px`,
            align: "center",
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5, 0.5);
        this.textElements.push(this.bottomTextSpace);
    }

    createGameContent(centerX, centerY, scale) {
        const { refCenter } = this.refPositions;
        this.mainContainer = this.add.container(0, 0);

        // Elementi grafici
        const patient = this.add.image(
            this.refPositions.patient.x,
            this.refPositions.patient.y,
            "PatientCloseUp"
        ).setScale(0.65);

        const arrow = this.add.image(
            this.refPositions.question.x,
            this.refPositions.question.y + 130,
            "Arrow"
        ).setScale(4);

        const questionBox = this.createQuestionBox();
        const reloadButton = this.createReloadButton();

        // Box e testi risposte
        this.createAnswerBoxes();
        this.createAnswerTexts(centerX, centerY, scale);

        // Testo domanda
        this.createQuestionText(centerX, centerY, scale);

        // Aggiungi al container
        this.mainContainer.add([
            arrow,
            patient,
            questionBox,
            ...this.answerBoxes,
            reloadButton
        ]);

        // Scala e posiziona container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenter.x * scale),
            centerY - (refCenter.y * scale)
        );

        // Setup eventi
        this.setupEvents(reloadButton, scale);
    }

    createQuestionBox() {
        const { question } = this.refPositions;
        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(question.x - 400, question.y - 70, 800, 140, 5);
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(question.x - 400, question.y - 70, 800, 140, 5);
        return box;
    }

    createReloadButton() {
        const { reload } = this.refPositions;
        return this.add.image(reload.x, reload.y, "ReloadButton")
            .setScale(0.5)
            .setInteractive({ useHandCursor: true });
    }

    createAnswerBoxes() {
        const boxSize = { width: 650, height: 70 };
        this.refPositions.answers.forEach((answer, index) => {
            const box = this.add.graphics();
            this.drawAnswerBox(box, answer.x, answer.y, boxSize.width, boxSize.height);
            this.answerBoxes.push(box);
        });
    }

    createAnswerTexts(centerX, centerY, scale) {
        const { refCenter } = this.refPositions;
        const fontSize = Math.max(60 * scale, 60 * scale) * 0.7;
        const textStyle = {
            fontSize: `${fontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Poppins",
            resolution: 2
        };

        this.refPositions.answers.forEach((answer, index) => {
            const textX = centerX + ((answer.x - refCenter.x) * scale);
            const textY = centerY + ((answer.y - refCenter.y) * scale);
            
            const text = this.add.text(textX, textY, answer.text, textStyle)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });
            
            this.answerTexts.push(text);
        });
    }

    createQuestionText(centerX, centerY, scale) {
        const { question, refCenter } = this.refPositions;
        const fontSize = Math.max(60 * scale, 70 * scale) * 0.7;
        const textX = centerX + ((question.x - refCenter.x) * scale);
        const textY = centerY + ((question.y - refCenter.y) * scale);

        this.add.text(textX, textY, "Il paziente non risponde\nCome procedi?", {
            fontSize: `${fontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Poppins"
        }).setOrigin(0.5);
    }

    setupEvents(reloadButton, scale) {
        reloadButton.on("pointerdown", () => {
            this.scene.start("HospitalScene");
        });

        this.answerTexts.forEach((text, index) => {
            text.on("pointerdown", () => {
                this.handleAnswerClick(index, scale);
            });
        });
    }

    handleAnswerClick(index, scale) {
        const { answers } = this.refPositions;
        const answer = answers[index];
        const boxSize = { width: 650, height: 70 };

        if (this.ordCounter !== index) {
            this.ordCounter = 0;
            this.showError();
            this.setDefault();
        } else {
            this.ordCounter = index + 1;
            this.setGreen(this.answerBoxes[index], answer.x, answer.y, boxSize.width, boxSize.height);
            
            // Messaggi di successo
            if (index === 0) {
                this.showMessage("Corretto! Procedi con la prossima azione", true);
            } else if (index === 1) {
                this.showMessage("Perfetto! Continua con l'ultima procedura", true);
            } else if (index === 2) {
                // Ultima risposta corretta
                this.showMessage("Eccellente! Hai completato tutte le procedure correttamente!", true);
                this.time.delayedCall(3500, () => {
                    this.scene.start("CartScene");
                });
            }
            
            if (index === 2) {
                // Ultima risposta corretta
                this.time.delayedCall(3500, () => {
                    this.scene.start("CartScene");
                });
            }
        }
    }

    drawAnswerBox(box, x, y, width, height) {
        box.clear();
        box.fillStyle(0xffffff, 1);
        box.fillRoundedRect(x - width / 2, y - height / 2, width, height, 5);
        box.lineStyle(2, 0x000000, 1);
        box.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 5);
    }

    setGreen(box, x, y, width, height) {
        box.clear();
        box.fillStyle(0x27ae60, 1);
        box.fillRoundedRect(x - width / 2, y - height / 2, width, height, 5);
        box.lineStyle(3, 0x1e7e34, 1);
        box.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 5);
    }

    setDefault() {
        const { answers } = this.refPositions;
        const boxSize = { width: 650, height: 70 };
        answers.forEach((answer, index) => {
            this.drawAnswerBox(this.answerBoxes[index], answer.x, answer.y, boxSize.width, boxSize.height);
        });
    }

    showError() {
        // Usa il testo fisso in basso invece di creare un testo temporaneo
        if (this.bottomTextSpace) {
            this.bottomTextSpace.setColor("#ff0000");
            this.bottomTextSpace.setText("Sequenza sbagliata! Riprova seguendo l'ordine corretto");
            this.bottomText = "Sequenza sbagliata! Riprova seguendo l'ordine corretto";
            
            // Ripristina il colore dopo 3 secondi
            this.time.delayedCall(3000, () => {
                if (this.bottomTextSpace) {
                    this.bottomTextSpace.setColor("#000000ff");
                    this.bottomTextSpace.setText(this.bottomText);
                }
            });
        }
    }

    showMessage(message, isSuccess) {
        // Mostra messaggio nel testo in basso
        if (this.bottomTextSpace) {
            if (isSuccess) {
                this.bottomTextSpace.setColor("#167e30ff");  // Verde
            } else {
                this.bottomTextSpace.setColor("#ff0000");  // Rosso
            }
            this.bottomTextSpace.setText(message);
            this.bottomText = message;
            
            // Ripristina il colore dopo 2 secondi (se non è l'ultimo messaggio)
            if (!isSuccess || !message.includes("Eccellente")) {
                this.time.delayedCall(2000, () => {
                    if (this.bottomTextSpace) {
                        this.bottomTextSpace.setColor("#000000ff");
                        this.bottomTextSpace.setText(this.bottomText);
                    }
                });
            }
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
    }
}