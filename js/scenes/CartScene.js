class CartScene extends Phaser.Scene {
    constructor() {
        super({ key: "CartScene" });
        
        this.medicineOrder = 0;
        this.usedItems = 2;
        this.gameEnded = false;
        this.wrongMedicine = null;
        this.patientCart = null;
        this.pointsText = null;
        this.adrenalina = null;
        this.nacl = null;
        this.adrenalinaText = null;
        this.naclText = null;
        this.pickedAdrenaline = false;
        this.cart = null;
        this.pickedNacl = false;
        this.instructionText = null;
        this.bottomTextSpace = null;
        this.bottomText = "Clicca sul carrello per prendere le medicine";
        
        // Configurazione posizioni (riferimento 1920x1080)
        this.refPositions = {
            refCenter: { x: 960, y: 540 },
            elettro: { x: 192, y: 540 },
            patientCart: { x: 864, y: 756 },
            cart: { x: 1675, y: 860 },
            instruction: { x: 960, y: 162 }  // Posizione box istruzioni
        };
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
        this.textElements = [];
        
        // Reset variabili
        this.gameEnded = false;
        this.pickedNacl = false;
        this.pickedAdrenaline = false;
        this.usedItems = 2;
        this.medicineOrder = 0;

        const { width, height, centerX, centerY, scale } = this.getScreenMetrics();
        const { borderWidth, borderHeight } = this.getBorderDimensions(scale);

        this.createBackground(centerX, centerY, borderWidth, borderHeight, scale);
        this.createTopBottomBars(centerX, centerY, borderWidth, borderHeight, scale);
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
        const { refCenter } = this.refPositions;
        this.mainContainer = this.add.container(0, 0);

        // Immagine background
        const backGround = this.add.image(0, 0, "Sfondo").setOrigin(0, 0);

        // Scala lo sfondo per coprire l'area
        const backGroundScaleX = 1920 / backGround.width;
        const backGroundScaleY = 1080 / backGround.height;
        const backGroundScale = Math.max(backGroundScaleX, backGroundScaleY);
        backGround.setScale(backGroundScale);

        // Elettrocardiogramma
        const { elettro } = this.refPositions;
        const elettroImg = this.add.image(elettro.x, elettro.y, "Elettrocardiogramma")
            .setScale(0.4);

        // Area paziente (invisibile ma interattiva)
        const { patientCart: patientPos } = this.refPositions;
        this.patientCart = this.add.rectangle(patientPos.x, patientPos.y, 500, 500)
            .setScale(0.8)
            .setAlpha(0.01)
            .setInteractive({ useHandCursor: true });

        // Carrello
        const { cart: cartPos } = this.refPositions;
        this.cart = this.add.image(cartPos.x, cartPos.y, "Cart")
            .setScale(0.5)
            .setInteractive({ useHandCursor: true });

        // Medicine (inizialmente nascoste fuori schermo)
        const hiddenX = -550;
        const hiddenY = -550;

        this.adrenalina = this.add.image(hiddenX, hiddenY, "Adrenalina")
            .setScale(0.15)
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true });

        this.nacl = this.add.image(hiddenX, hiddenY, "Nacl")
            .setScale(0.15)
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true });

        // Box istruzioni (come infoBox in HospitalScene)
        const { instruction } = this.refPositions;
        const instructionBox = this.add.graphics();
        instructionBox.fillStyle(0xecf0f1, 1);
        instructionBox.fillRoundedRect(instruction.x - 400, instruction.y - 75, 800, 150, 0);
        instructionBox.lineStyle(2, 0x2c3e50, 1);
        instructionBox.strokeRoundedRect(instruction.x - 400, instruction.y - 75, 800, 150, 0);

        // Aggiungi elementi al container
        this.mainContainer.add([
            backGround,
            elettroImg,
            this.patientCart,
            this.cart,
            this.adrenalina,
            this.nacl,
            instructionBox
        ]);

        // Scala e posiziona container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenter.x * scale),
            centerY - (refCenter.y * scale)
        );

        // Salva la scala per calcoli successivi
        this.currentScale = scale;
        this.offsetX = centerX - (refCenter.x * scale);
        this.offsetY = centerY - (refCenter.y * scale);
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

    createGameContent(centerX, centerY, scale) {
        // Setup eventi
        this.setupEvents();
    }

    createTexts(centerX, centerY, scale) {
        const { refCenter, instruction } = this.refPositions;
        const minFontSize = 40 * scale;

        // Score text - dentro il rettangolo superiore (come HospitalScene)
        const scoreTextX = centerX;
        const scoreTextY = centerY - ((refCenter.y - 20) * scale);  // Posizione nel rettangolo superiore
        const scoreFontSize = Math.max(minFontSize, 40 * scale);
        
        this.pointsText = this.add.text(scoreTextX, scoreTextY,
            "Score: " + gameState.score, {
            fontSize: `${scoreFontSize}px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.pointsText);

        // Testo istruzioni dentro la box (come infoPaziente in HospitalScene)
        const instructionTextX = centerX + ((instruction.x - refCenter.x) * scale);
        const instructionTextY = centerY + ((instruction.y - refCenter.y) * scale);
        const instructionFontSize = Math.max(minFontSize, 60 * scale) * 0.8;
        
        this.instructionText = this.add.text(instructionTextX, instructionTextY, 
            "Somministra le medicine nell'ordine corretto", {
            fontSize: `${instructionFontSize}px`,
            color: '#2c3e50',
            align: 'center',
            fontFamily: "Poppins",
            wordWrap: {width: scale * 600},
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.instructionText);

        // Testo in basso - dentro il rettangolo inferiore
        const bottomTextSpaceX = centerX;
        const bottomTextSpaceY = centerY + ((refCenter.y - 20) * scale);  // Posizione nel rettangolo inferiore
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

        // Testi medicine (nascosti inizialmente)
        const medicineTextFontSize = Math.max(14, 22 * scale);
        const hiddenX = -550;
        const hiddenY = -550;
        
        this.adrenalinaText = this.add.text(hiddenX, hiddenY, "Adrenalina", {
            fontSize: `${medicineTextFontSize}px`,
            color: "#2c3e50",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.adrenalinaText);

        this.naclText = this.add.text(hiddenX, hiddenY, "Nacl", {
            fontSize: `${medicineTextFontSize}px`,
            color: "#2c3e50",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.naclText);
    }

    setupEvents() {
        // EVENTI CARRELLO
        this.cart.removeAllListeners();
        this.cart.on("pointerdown", () => {
            this.adrenSpawn();
            this.naclSpawn();
            this.cart.disableInteractive();
            this.showMessage("Trascina le medicine sul paziente nell'ordine corretto", true);
        });

        // EVENTI ADRENALINA
        this.adrenalina.removeAllListeners();
        this.adrenalina.on("pointerdown", () => {
            this.pickedAdrenaline = true;
        });

        this.adrenalina.on("pointerup", () => {
            this.pickedAdrenaline = false;
        });

        // EVENTI NACL
        this.nacl.removeAllListeners();
        this.nacl.on("pointerdown", () => {
            this.pickedNacl = true;
        });

        this.nacl.on("pointerup", () => {
            this.pickedNacl = false;
        });

        // Per mobile - gestione touch
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
            this.medicineOrder++;
            this.showMessage("Corretto! Ora somministra la seconda medicina", true);
        }

        if (!this.gameEnded && this.pickedNacl && this.checkCollision(this.nacl, this.patientCart)) {
            if (this.usedItems === 2) {
                // Ordine sbagliato - Nacl prima di Adrenalina
                this.pickedNacl = false;
                this.naclSpawn();
                this.clickedWrongChoice();
                gameState.score -= 20;
                gameState.errors.Cart = gameState.errors.Cart + 1;
                this.pointsText.setText("Score: " + gameState.score);
                return;
            }
            // Ordine corretto - Nacl dopo Adrenalina
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
        // Funzione che guarda i bordi dei rettangoli e restituisce se intersecano o meno
        const box1 = obj1.getBounds();
        const box2 = obj2.getBounds();

        return Phaser.Geom.Intersects.RectangleToRectangle(box1, box2);
    }

    adrenSpawn() {
        // Posiziona adrenalina a destra del carrello
        this.adrenalina.x = this.cart.x + 30;
        this.adrenalina.y = this.cart.y;

        // Converti posizione container in coordinate schermo per il testo
        const adrenalineWorldPos = this.adrenalina.getWorldTransformMatrix();
        this.adrenalinaText.x = adrenalineWorldPos.tx;
        this.adrenalinaText.y = adrenalineWorldPos.ty - (100 * this.currentScale);
    }

    naclSpawn() {
        // Posiziona nacl a sinistra del carrello
        this.nacl.x = this.cart.x - 30;
        this.nacl.y = this.cart.y;

        // Converti posizione container in coordinate schermo per il testo
        const naclWorldPos = this.nacl.getWorldTransformMatrix();
        this.naclText.x = naclWorldPos.tx;
        this.naclText.y = naclWorldPos.ty - (75 * this.currentScale);
    }

    clickedWrongChoice() {
        // Usa il testo fisso in basso invece di wrongMedicine
        this.showMessage("Attenzione! Le medicine devono essere date in ordine: prima Adrenalina, poi Nacl", false);
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
            
            // Ripristina il colore dopo 3 secondi (se non è l'ultimo messaggio)
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
        // Converti coordinate input (schermo) in coordinate container
        const localX = (this.input.x - this.offsetX) / this.currentScale;
        const localY = (this.input.y - this.offsetY) / this.currentScale;

        // Muovi l'oggetto nel container
        obj.x = localX;
        obj.y = localY;

        // Il testo è fuori dal container, usa coordinate schermo dirette
        text.x = this.input.x;
        text.y = this.input.y - (50 * this.currentScale);
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