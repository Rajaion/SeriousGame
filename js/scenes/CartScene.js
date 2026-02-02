class CartScene extends Phaser.Scene {
    constructor() {
        super({ key: "CartScene" });
        this.usedItems = 2;
        this.gameEnded = false;
        this.pickedAdrenaline = false;
        this.pickedNacl = false;
        this.bottomText = "Clicca sul carrello per prendere le medicine";
    }

    preload() {
        this.load.image("Cart", "img/Cart.png");
        this.load.image("Elettrocardiogramma", "img/Elettrocardiogramma.png");
        this.load.image("Adrenalina", "img/Adrenalina.png");
        this.load.image("Nacl", "img/Nacl.png");
        this.load.image("Sfondo", "img/Mattone.png");
    }

    create() {
        this.createContent();
    }

    createContent() {
        this.children.removeAll();
        this.textElements = [];
        this.gameEnded = false;
        this.pickedNacl = false;
        this.pickedAdrenaline = false;
        this.usedItems = 2;

        this.createBackground();
        this.createTopBottomBars();
        this.createGameContent();
        this.createTexts();
    }

    createBackground() {
        this.mainContainer = this.add.container(0, 0);

        const backGround = this.add.image(0, 0, "Sfondo").setOrigin(0, 0);
        backGround.setScale(Math.max(1920 / backGround.width, 1080 / backGround.height));

        const elettroImg = this.add.image(192, 540, "Elettrocardiogramma").setScale(0.4);

        this.patientCart = this.add.rectangle(864, 756, 500, 500)
            .setScale(0.8)
            .setAlpha(0.01)
            .setInteractive({ useHandCursor: true });

        this.cart = this.add.image(1675, 860, "Cart")
            .setScale(0.5)
            .setInteractive({ useHandCursor: true });

        this.adrenalina = this.add.image(-550, -550, "Adrenalina")
            .setScale(0.15)
            .setInteractive({ useHandCursor: true });

        this.nacl = this.add.image(-550, -550, "Nacl")
            .setScale(0.15)
            .setInteractive({ useHandCursor: true });

        const instructionBox = this.add.graphics();
        instructionBox.fillStyle(0xecf0f1, 1);
        instructionBox.fillRoundedRect(560, 87, 800, 150, 0);
        instructionBox.lineStyle(2, 0x2c3e50, 1);
        instructionBox.strokeRoundedRect(560, 87, 800, 150, 0);

        this.mainContainer.add([backGround, elettroImg, this.patientCart, this.cart, this.adrenalina, this.nacl, instructionBox]);
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

    createGameContent() {
        this.setupEvents();
    }

    createTexts() {
        this.pointsText = this.add.text(960, 20, "Score: " + gameState.score, {
            fontSize: `40px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.pointsText);

        this.textElements.push(this.add.text(960, 162, "Somministra le medicine nell'ordine corretto", {
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

        this.adrenalinaText = this.add.text(-550, -550, "Adrenalina", {
            fontSize: `22px`,
            color: "#2c3e50",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.adrenalinaText);

        this.naclText = this.add.text(-550, -550, "Nacl", {
            fontSize: `22px`,
            color: "#2c3e50",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.naclText);
    }

    setupEvents() {
        this.cart.removeAllListeners();
        this.cart.on("pointerdown", () => {
            this.adrenSpawn();
            this.naclSpawn();
            this.cart.disableInteractive();
            this.showMessage("Trascina le medicine sul paziente nell'ordine corretto", true);
        });

        this.adrenalina.removeAllListeners();
        this.adrenalina.on("pointerdown", () => { this.pickedAdrenaline = true; });
        this.adrenalina.on("pointerup", () => { this.pickedAdrenaline = false; });

        this.nacl.removeAllListeners();
        this.nacl.on("pointerdown", () => { this.pickedNacl = true; });
        this.nacl.on("pointerup", () => { this.pickedNacl = false; });

        this.input.on('pointerup', () => {
            this.pickedAdrenaline = false;
            this.pickedNacl = false;
        });
    }

    update() {
        if (!this.gameEnded && this.usedItems === 0) {
            this.gameEnded = true;
            this.scene.start("EndScene");
        }

        if (!this.gameEnded && this.pickedAdrenaline && this.checkCollision(this.adrenalina, this.patientCart)) {
            this.pickedAdrenaline = false;
            this.adrenalina.destroy();
            this.adrenalinaText.destroy();
            gameState.score += 20;
            this.pointsText.setText("Score: " + gameState.score);
            this.usedItems--;
            this.showMessage("Corretto! Ora somministra la seconda medicina", true);
        }

        if (!this.gameEnded && this.pickedNacl && this.checkCollision(this.nacl, this.patientCart)) {
            if (this.usedItems === 2) {
                this.pickedNacl = false;
                this.naclSpawn();
                this.clickedWrongChoice();
                gameState.score -= 20;
                gameState.errors.Cart++;
                this.pointsText.setText("Score: " + gameState.score);
                return;
            }
            this.pickedNacl = false;
            this.nacl.destroy();
            this.naclText.destroy();
            gameState.score += 20;
            this.pointsText.setText("Score: " + gameState.score);
            this.usedItems--;
            this.showMessage("Perfetto! Hai completato tutte le somministrazioni!", true);
        }

        if (this.pickedAdrenaline) {
            this.moveObjAndText(this.adrenalina, this.adrenalinaText);
        }

        if (this.pickedNacl) {
            this.moveObjAndText(this.nacl, this.naclText);
        }
    }

    checkCollision(obj1, obj2) {
        return Phaser.Geom.Intersects.RectangleToRectangle(obj1.getBounds(), obj2.getBounds());
    }

    adrenSpawn() {
        this.adrenalina.x = this.cart.x + 30;
        this.adrenalina.y = this.cart.y;
        const pos = this.adrenalina.getWorldTransformMatrix();
        this.adrenalinaText.x = pos.tx;
        this.adrenalinaText.y = pos.ty - 100;
    }

    naclSpawn() {
        this.nacl.x = this.cart.x - 30;
        this.nacl.y = this.cart.y;
        const pos = this.nacl.getWorldTransformMatrix();
        this.naclText.x = pos.tx;
        this.naclText.y = pos.ty - 75;
    }

    clickedWrongChoice() {
        this.showMessage("Attenzione! Le medicine devono essere date in ordine: prima Adrenalina, poi Nacl", false);
    }

    showMessage(message, isSuccess) {
        if (this.bottomTextSpace) {
            this.bottomTextSpace.setColor(isSuccess ? "#167e30ff" : "#ff0000");
            this.bottomTextSpace.setText(message);
            this.bottomText = message;
            if (!isSuccess || !message.includes("completato")) {
                this.time.delayedCall(3000, () => {
                    if (this.bottomTextSpace) {
                        this.bottomTextSpace.setColor("#000000ff");
                        this.bottomTextSpace.setText(this.bottomText);
                    }
                });
            }
        }
    }

    moveObjAndText(obj, text) {
        obj.x = this.input.x;
        obj.y = this.input.y;
        text.x = this.input.x;
        text.y = this.input.y - 50;
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
    }
}