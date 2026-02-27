class PatientScene extends Phaser.Scene {
    constructor() {
        super({ key: "PatientScene" });
        this.ordCounter = 0;
        this.opzione1 = "default";
        this.opzione2 = "default";
        this.opzione3 = "default";
        this.answerBoxes = [];
        this.answerTexts = [];
        this.bottomTextSpace = null;
        this.bottomText = "";
        // L'ordine corretto sarà calcolato dopo lo shuffle
        // L'ordine nel file è: Option1 (prima), Option3 (seconda), Option2 (terza)
        // Quindi gli indici originali sono: 0, 2, 1
        this.correctOrder = [];
        this.refPositions = {
            patient: { x: 576, y: 540 },
            question: { x: 1500, y: 324 },
            instruction: { x: 960, y: 162 },
            answers: [
                { x: 1500, y: 540, text: "default" },
                { x: 1500, y: 648, text: "default" },
                { x: 1500, y: 756, text: "default" }
            ],
            reload: { x: 1500, y: 918 }
        };
    }
    
    preload() {
        this.load.image("ReloadButton", "img/ReloadButton.png");
        this.load.image("PatientCloseUp", "img/PatientCloseUp.jpeg");
        this.load.text("PatientOptions", "text/Patient.txt?v=" + Date.now());
    }
    
    create() {
        this.createContent();
    }
    
    createContent() {
        this.children.removeAll();
        this.ordCounter = 0;
        this.answerBoxes = [];
        this.answerTexts = [];
        this.textElements = [];

        // Carica le opzioni PRIMA di creare il contenuto
        this.getPhonetext(this.cache.text.get("PatientOptions"));
        this.createBackground();
        this.createTopBottomBars();
        this.createGameContent();
        this.createTexts();
    }

    createBackground() {
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(0, 0, 1920, 1080);
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(0, 0, 1920, 1080, 0);
    }

    createTopBottomBars() {
        const createBar = (x, y) => {
            const bar = this.add.graphics();
            bar.fillStyle(0xffffff, 1);
            bar.fillRoundedRect(x, y, 1920, 40, 0);
            bar.lineStyle(2, 0x000000, 1);
            bar.strokeRoundedRect(x, y, 1920, 40, 0);
        };
        createBar(0, 0);
        createBar(0, 1040);
    }

    createTexts() {
        // Score in alto
        this.scoreText = this.add.text(960, 25, "Score: " + gameState.score, {
            fontSize: `40px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.scoreText);

        this.textElements.push(this.add.text(960, 162, "Segui l'ordine corretto delle procedure", {
            fontSize: `48px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            wordWrap: {width: 600},
            resolution: 2
        }).setOrigin(0.5));

        this.bottomTextSpace = this.add.text(960, 1060, this.bottomText, {
            fontSize: `40px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5, 0.5);
        this.textElements.push(this.bottomTextSpace);
    }

    createGameContent() {

        const patient = this.add.image(576, 540, "PatientCloseUp").setScale(0.65);

        // Freccia sopra le risposte (stile CartScene/HospitalScene: triangolo rosso che punta in basso, animata)
        this.answersArrowHint = this.add.graphics();
        this.answersArrowBaseX = 1500;
        this.answersArrowBaseY = 540 - 90;
        this.answersArrowHint.fillStyle(0xe74c3c, 0.95);
        this.answersArrowHint.lineStyle(2, 0xc0392b, 1);
        this.answersArrowHint.fillTriangle(0, 20, -24, -20, 24, -20);
        this.answersArrowHint.strokeTriangle(0, 20, -24, -20, 24, -20);
        this.answersArrowHint.x = this.answersArrowBaseX;
        this.answersArrowHint.y = this.answersArrowBaseY;
        this.answersArrowHint.setDepth(10);
        this.answersArrowBobTween = this.tweens.add({
            targets: this.answersArrowHint,
            y: this.answersArrowBaseY + 16,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        const questionBox = this.add.graphics();
        questionBox.fillStyle(0xecf0f1, 1);
        questionBox.fillRoundedRect(1100, 254, 800, 140, 5);
        questionBox.lineStyle(2, 0x2c3e50, 1);
        questionBox.strokeRoundedRect(1100, 254, 800, 140, 5);

        const reloadButton = this.add.image(70, 975, "ReloadButton")
            .setScale(0.5)
            .setInteractive({ useHandCursor: true });

        this.createAnswerBoxes();
        this.createAnswerTexts();
        this.createQuestionText();
        this.setupEvents(reloadButton);
    }

    createAnswerBoxes() {
        this.refPositions.answers.forEach((answer, index) => {
            const box = this.add.graphics();
            // La terza opzione (index 2) ha un testo più lungo, quindi allargare la box
            const width = 800;
            this.drawAnswerBox(box, answer.x, answer.y, width, 70);
            this.answerBoxes.push(box);
        });
    }

    createAnswerTexts() {
        const textStyle = {
            fontSize: `42px`,
            color: "#000000",
            fontFamily: "Poppins",
            resolution: 2
        };

        // Usa le opzioni mescolate invece dei testi hardcoded
        const textsToShow = [this.opzione1, this.opzione2, this.opzione3];
        this.refPositions.answers.forEach((answer, index) => {
            const textToShow = textsToShow[index] || answer.text;
            this.answerTexts.push(this.add.text(answer.x, answer.y, textToShow, textStyle)
                .setOrigin(0.5).setInteractive({ useHandCursor: true }));
        });
    }

    createQuestionText() {
        this.add.text(1500, 324, this.questionText, {
            fontSize: `49px`,
            color: "#000000",
            fontFamily: "Poppins",
            wordWrap: {width: 800},
            resolution: 2
        }).setOrigin(0.5);
    }

    setupEvents(reloadButton) {
        reloadButton.on("pointerdown", () => {
            this.scene.start("HospitalScene");
        });

        this.answerTexts.forEach((text, index) => {
            text.on("pointerdown", () => {
                this.handleAnswerClick(index);
            });
        });
    }

    handleAnswerClick(index) {
        const answer = this.refPositions.answers[index];
        const expectedIndex = this.correctOrder[this.ordCounter];

        if (index !== expectedIndex) {
            this.ordCounter = 0;
            if (typeof window.logGameError === "function") window.logGameError("Patient", "Sequenza GAS sbagliata");
            gameState.score -= 10;
            if (this.scoreText) this.scoreText.setText("Score: " + gameState.score);
            this.showError();
            this.setDefault();
        } else {
            this.ordCounter++;
            // La terza opzione (index 2) ha una box più larga
            const width = 800;
            this.setGreen(this.answerBoxes[index], answer.x, answer.y, width, 70);

            const messages = [
                "Corretto! Procedi con la prossima azione",
                "Perfetto! Continua con l'ultima procedura",
                "Eccellente! Hai completato tutte le procedure correttamente!"
            ];
            const messageIndex = this.ordCounter - 1;
            this.showMessage(messages[messageIndex], true);
            if (this.ordCounter === 3) {
                gameState.score += 30;
                if (this.scoreText) this.scoreText.setText("Score: " + gameState.score);
                this.time.delayedCall(1500, () => this.scene.start("PatientToCart"));
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
        this.refPositions.answers.forEach((answer, index) => {
            // La terza opzione (index 2) ha una box più larga
            const width = 800;
            this.drawAnswerBox(this.answerBoxes[index], answer.x, answer.y, width, 70);
        });
    }

    showError() {
        if (this.bottomTextSpace) {
            this.bottomTextSpace.setColor("#ff0000");
            this.bottomTextSpace.setText("Sequenza sbagliata! Riprova seguendo l'ordine corretto");
            this.bottomText = "Sequenza sbagliata! Riprova seguendo l'ordine corretto";
            this.time.delayedCall(3000, () => {
                if (this.bottomTextSpace) {
                    this.bottomTextSpace.setColor("#000000ff");
                    this.bottomTextSpace.setText(this.bottomText);
                }
            });
        }
    }

    showMessage(message, isSuccess) {
        if (this.bottomTextSpace) {
            this.bottomTextSpace.setColor(isSuccess ? "#167e30ff" : "#ff0000");
            this.bottomTextSpace.setText(message);
            this.bottomText = message;
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

    getPhonetext(fullText) {
        const opzioni = fullText.split("\n");
        let originalOptions = [];
        
        // Cerca tutte le righe che iniziano con #
        for (let riga = 0; riga < opzioni.length; riga++) {
            const linea = opzioni[riga].trim();
            if (linea.startsWith("#ContextText:")) {
                this.questionText = linea.substring(13).trim();
            } else if (linea.startsWith("#Option1:")) {
                originalOptions[0] = linea.substring(10).trim();
            } else if (linea.startsWith("#Option2:")) {
                originalOptions[1] = linea.substring(10).trim();
            } else if (linea.startsWith("#Option3:")) {
                originalOptions[2] = linea.substring(10).trim();
            }
        }
        
        // Mescola le opzioni (Fisher-Yates shuffle)
        const shuffled = [...originalOptions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Assegna le opzioni mescolate
        this.opzione1 = shuffled[0];
        this.opzione2 = shuffled[1];
        this.opzione3 = shuffled[2];
        
        // Calcola l'ordine corretto: l'ordine nel file è dall'alto al basso
        // Dopo lo shuffle, troviamo dove si trovano queste opzioni
        const originalOrder = [0, 1, 2]; // vie Aree, gas, compressioni
        this.correctOrder = originalOrder.map(originalIndex => 
            shuffled.indexOf(originalOptions[originalIndex])
        );
    }

}