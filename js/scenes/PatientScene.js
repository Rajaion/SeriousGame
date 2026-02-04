class PatientScene extends Phaser.Scene {
    constructor() {
        super({ key: "PatientScene" });
        this.ordCounter = 0;
        this.answerBoxes = [];
        this.answerTexts = [];
        this.bottomTextSpace = null;
        this.bottomText = "Segui l'ordine corretto delle procedure";
        // Ordine corretto: 0 (GAS), 2 (Vie aeree), 1 (Compressioni)
        this.correctOrder = [0, 2, 1];
        this.refPositions = {
            patient: { x: 576, y: 540 },
            question: { x: 1500, y: 324 },
            instruction: { x: 960, y: 162 },
            answers: [
                { x: 1500, y: 540, text: "Valutazione GAS" },
                { x: 1500, y: 648, text: "Inizia le compressioni" },
                { x: 1500, y: 756, text: "Controlla che le vie aeree siano libere" }
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
    }
    
    createContent() {
        this.children.removeAll();
        this.ordCounter = 0;
        this.answerBoxes = [];
        this.answerTexts = [];
        this.textElements = [];

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
        this.scoreText = this.add.text(960, 32, "Score: " + gameState.score, {
            fontSize: `48px`,
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
        const arrow = this.add.image(1500, 454, "Arrow").setScale(4);

        const questionBox = this.add.graphics();
        questionBox.fillStyle(0xecf0f1, 1);
        questionBox.fillRoundedRect(1100, 254, 800, 140, 5);
        questionBox.lineStyle(2, 0x2c3e50, 1);
        questionBox.strokeRoundedRect(1100, 254, 800, 140, 5);

        const reloadButton = this.add.image(1500, 918, "ReloadButton")
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
            const width = index === 2 ? 750 : 650;
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

        this.refPositions.answers.forEach((answer) => {
            this.answerTexts.push(this.add.text(answer.x, answer.y, answer.text, textStyle)
                .setOrigin(0.5).setInteractive({ useHandCursor: true }));
        });
    }

    createQuestionText() {
        this.add.text(1500, 324, "Il paziente non risponde\nCome procedi?", {
            fontSize: `49px`,
            color: "#000000",
            fontFamily: "Poppins"
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
            this.showError();
            this.setDefault();
        } else {
            this.ordCounter++;
            // La terza opzione (index 2) ha una box più larga
            const width = index === 2 ? 750 : 650;
            this.setGreen(this.answerBoxes[index], answer.x, answer.y, width, 70);
            
            const messages = [
                "Corretto! Procedi con la prossima azione",
                "Perfetto! Continua con l'ultima procedura",
                "Eccellente! Hai completato tutte le procedure correttamente!"
            ];
            const messageIndex = this.ordCounter - 1;
            this.showMessage(messages[messageIndex], true);
            if (this.ordCounter === 3) {
                this.time.delayedCall(3500, () => this.scene.start("CartScene"));
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
            const width = index === 2 ? 750 : 650;
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

}