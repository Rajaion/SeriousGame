class PatientScene extends Phaser.Scene {
    
    constructor() {
        super({ key: "PatientScene" });
        this.ordCounter = 0;
    }
    
    preload() {
        this.load.image("ReloadButton", "img/ReloadButton.png");
        this.load.image("PatientCloseUp", "img/PatientCloseUp.png");
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
        if (this.children) {
            this.children.removeAll();
        }
        
        // Reset counter
        this.ordCounter = 0;

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        this.add.rectangle(centerX, centerY, width, height, 0x104D5B);

        // Calcola scala
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        const scale = Math.min(scaleX, scaleY);

        // CONTAINER per elementi grafici
        this.mainContainer = this.add.container(0, 0);

        // Coordinate di riferimento (1920x1080)
        const refCenterX = 960;
        const refCenterY = 540;

        // Posizioni di riferimento
        const patientX = 576;  // 30% di 1920
        const patientY = 540;

        const questionX = 1536; // 80% di 1920
        const questionY = 324;  // 30% di 1080

        const answer1X = 1536;
        const answer1Y = 540;   // 50% di 1080

        const answer2X = 1536;
        const answer2Y = 648;   // 60% di 1080

        const answer3X = 1536;
        const answer3Y = 756;   // 70% di 1080

        const reloadX = 1536;
        const reloadY = 918;    // 85% di 1080

        // Immagine paziente
        const patient = this.add.image(patientX, patientY, "PatientCloseUp")
            .setScale(0.7);

        // Box domanda
        const questionBox = this.add.graphics();
        questionBox.fillStyle(0xecf0f1, 1);
        questionBox.fillRoundedRect(questionX - 300, questionY - 70, 600, 140, 5);
        questionBox.lineStyle(2, 0x2c3e50, 1);
        questionBox.strokeRoundedRect(questionX - 300, questionY - 70, 600, 140, 5);

        // Box risposte
        this.answer1Box = this.add.graphics();
        this.answer2Box = this.add.graphics();
        this.answer3Box = this.add.graphics();

        this.drawAnswerBox(this.answer1Box, answer1X, answer1Y, 500, 70);
        this.drawAnswerBox(this.answer2Box, answer2X, answer2Y, 500, 70);
        this.drawAnswerBox(this.answer3Box, answer3X, answer3Y, 500, 70);

        // Bottone reload
        const reloadButton = this.add.image(reloadX, reloadY, "ReloadButton")
            .setScale(0.5)
            .setInteractive({ useHandCursor: true });

        // Aggiungi elementi grafici al container
        this.mainContainer.add([
            patient,
            questionBox,
            this.answer1Box,
            this.answer2Box,
            this.answer3Box,
            reloadButton
        ]);

        // Scala il container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenterX * scale),
            centerY - (refCenterY * scale)
        );

        // TESTI FUORI DAL CONTAINER (per qualità)
        const minFontSize = 18;
        const questionFontSize = Math.max(minFontSize, 40 * scale);
        const answerFontSize = Math.max(minFontSize, 38 * scale);
        const feedbackFontSize = Math.max(minFontSize, 38 * scale);

        // Calcola posizioni reali dei testi
        const questionTextX = centerX + ((questionX - refCenterX) * scale);
        const questionTextY = centerY + ((questionY - refCenterY) * scale);

        const answer1TextX = centerX + ((answer1X - refCenterX) * scale);
        const answer1TextY = centerY + ((answer1Y - refCenterY) * scale);

        const answer2TextX = centerX + ((answer2X - refCenterX) * scale);
        const answer2TextY = centerY + ((answer2Y - refCenterY) * scale);

        const answer3TextX = centerX + ((answer3X - refCenterX) * scale);
        const answer3TextY = centerY + ((answer3Y - refCenterY) * scale);

        const feedbackTextY = centerY + ((432 - refCenterY) * scale); // 40% di 1080

        // Testo domanda
        const questionText = this.add.text(questionTextX, questionTextY, 
            "Il paziente non risponde\nCome procedi?", {
            fontSize: `${questionFontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Arial, sans-serif",
        }).setOrigin(0.5);

        // Testo feedback
        this.goNextText = this.add.text(answer1TextX, feedbackTextY, 
            "Corretto!\nOra andiamo a dare le medicine al paziente!", {
            fontSize: `${feedbackFontSize}px`,
            color: "#27ae60",
            align: "center",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5).setAlpha(0);

        // Testi risposte
        const text1 = this.add.text(answer1TextX, answer1TextY, "Valutazione GAS", {
            fontSize: `${answerFontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Arial, sans-serif"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const text2 = this.add.text(answer2TextX, answer2TextY, "Inizi le compressioni", {
            fontSize: `${answerFontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Arial, sans-serif"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const text3 = this.add.text(answer3TextX, answer3TextY, "Libera le vie aeree", {
            fontSize: `${answerFontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Arial, sans-serif"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Salva coordinate per i box (scalate)
        this.coords = {
            answer1: { x: answer1TextX, y: answer1TextY, width: 500 * scale, height: 70 * scale },
            answer2: { x: answer2TextX, y: answer2TextY, width: 500 * scale, height: 70 * scale },
            answer3: { x: answer3TextX, y: answer3TextY, width: 500 * scale, height: 70 * scale }
        };

        // Eventi
        reloadButton.removeAllListeners();
        reloadButton.on("pointerdown", () => {
            this.scene.start("HospitalScene");
        });

        text1.removeAllListeners();
        text1.on("pointerdown", () => {
            if (this.ordCounter != 0) {
                this.ordCounter = 0;
                this.showError();
                this.setDefault();
            } else {
                this.ordCounter = 1;
                this.setGreen(this.answer1Box, answer1X, answer1Y, 500, 70);
            }
        });

        text2.removeAllListeners();
        text2.on("pointerdown", () => {
            if (this.ordCounter != 1) {
                this.ordCounter = 0;
                this.showError();
                this.setDefault();
            } else {
                this.ordCounter = 2;
                this.setGreen(this.answer2Box, answer2X, answer2Y, 500, 70);
            }
        });

        text3.removeAllListeners();
        text3.on("pointerdown", () => {
            if (this.ordCounter != 2) {
                this.ordCounter = 0;
                this.showError();
                this.setDefault();
            } else {
                this.setGreen(this.answer3Box, answer3X, answer3Y, 500, 70);
                this.goNextText.setAlpha(1);
                this.time.delayedCall(3500, () => {
                    this.scene.start("CartScene");
                });
            }
        });
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
        this.drawAnswerBox(this.answer1Box, 1536, 540, 500, 70);
        this.drawAnswerBox(this.answer2Box, 1536, 648, 500, 70);
        this.drawAnswerBox(this.answer3Box, 1536, 756, 500, 70);
    }

    showError() {
        // Feedback visivo per errore
        const errorText = this.add.text(
            this.coords.answer1.x, 
            this.coords.answer1.y - 100, 
            "Sequenza sbagliata!", {
            fontSize: `${Math.max(18, 40 * Math.min(this.scale.width / 1920, this.scale.height / 1080))}px`,
            color: "#e74c3c",
            align: "center",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            errorText.destroy();
        });
    }

    shutdown() {
        this.scale.off('resize', this.handleResize, this);
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
    }
}