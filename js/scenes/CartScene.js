class CartScene extends Phaser.Scene {
    constructor() {
        super({ key: "CartScene" });
    }

    medicineOrder;
    usedItems;
    gameEnded = false;
    wrongMedicine = null;
    patientCart = null;
    pointsText = null;
    adrenalina = null;
    nacl = null;
    adrenalinaText = null;
    naclText = null;
    pickedAdrenaline = false;
    cart = null;
    pickedNacl = false;

    preload() {
        this.load.image("Cart", "img/Cart.jpeg");
        this.load.image("Elettrocardiogramma", "img/Elettrocardiogramma.png");
        this.load.image("Adrenalina", "img/Adrenalina.png");
        this.load.image("Nacl", "img/Nacl.jpeg");
        this.load.image("Sfondo", "img/Mattone.png");
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

        // Reset variabili
        this.gameEnded = false;
        this.pickedNacl = false;
        this.pickedAdrenaline = false;
        this.usedItems = 2;
        this.medicineOrder = 0;

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

        // Immagine background
        const backGround = this.add.image(0, 0, "Sfondo").setOrigin(0, 0);

        // Scala lo sfondo per coprire l'area
        const backGroundScaleX = 1920 / backGround.width;
        const backGroundScaleY = 1080 / backGround.height;
        const backGroundScale = Math.max(backGroundScaleX, backGroundScaleY);
        backGround.setScale(backGroundScale);

        // Posizioni di riferimento (1920x1080)
        const elettroX = 192;    // 0.20 * 960
        const elettroY = 540;

        const patientCartX = 864;   // 0.90 * 960
        const patientCartY = 756;   // 1.40 * 540

        const cartX = 1650;     // 1.60 * 960
        const cartY = 918;      // 1.70 * 540

        // Elettrocardiogramma
        const elettro = this.add.image(elettroX, elettroY, "Elettrocardiogramma")
            .setScale(0.4);

        // Area paziente (invisibile ma interattiva)
        this.patientCart = this.add.rectangle(patientCartX, patientCartY, 500, 500)
            .setScale(0.8)
            .setAlpha(0.01)
            .setInteractive({ useHandCursor: true });

        // Carrello
        this.cart = this.add.image(cartX, cartY, "Cart")
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

        // Aggiungi elementi al container
        this.mainContainer.add([
            backGround,
            elettro,
            this.patientCart,
            this.cart,
            this.adrenalina,
            this.nacl
        ]);

        // Scala il container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenterX * scale),
            centerY - (refCenterY * scale)
        );

        // Salva la scala per calcoli successivi
        this.currentScale = scale;
        this.offsetX = centerX - (refCenterX * scale);
        this.offsetY = centerY - (refCenterY * scale);

        // TESTI FUORI DAL CONTAINER
        this.textElements = [];
        const minFontSize = 16;

        // Calcola posizioni reali
        const scoreTextX = centerX;
        const scoreTextY = centerY + ((54 - refCenterY) * scale); // 0.10 * 540

        const wrongTextX = centerX;
        const wrongTextY = centerY + ((162 - refCenterY) * scale); // 0.30 * 540

        // Score text
        const scoreFontSize = Math.max(minFontSize, 35 * scale);
        this.pointsText = this.add.text(scoreTextX, scoreTextY,
            "Score: " + gameState.score, {
            fontSize: `${scoreFontSize}px`,
            color: "#ff0000",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.textElements.push(this.pointsText);

        // Wrong medicine text
        const wrongFontSize = Math.max(minFontSize, 28 * scale);
        this.wrongMedicine = this.add.text(wrongTextX, wrongTextY,
            "Attento!\nLe medicine devono essere date in ordine!", {
            fontSize: `${wrongFontSize}px`,
            color: "#ff0000",
            align: "center",
            lineSpacing: -5,
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5).setAlpha(0);
        this.textElements.push(this.wrongMedicine);

        // Testi medicine (nascosti inizialmente)
        const medicineTextFontSize = Math.max(14, 22 * scale);
        this.adrenalinaText = this.add.text(hiddenX, hiddenY, "Adrenalina", {
            fontSize: `${medicineTextFontSize}px`,
            color: "#2c3e50",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.textElements.push(this.adrenalinaText);

        this.naclText = this.add.text(hiddenX, hiddenY, "Nacl", {
            fontSize: `${medicineTextFontSize}px`,
            color: "#2c3e50",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.textElements.push(this.naclText);

        // EVENTI
        this.cart.removeAllListeners();
        this.cart.on("pointerdown", () => {
            this.adrenSpawn();
            this.naclSpawn();
            this.cart.disableInteractive();
        });

        this.adrenalina.removeAllListeners();
        this.adrenalina.on("pointerdown", () => {
            this.pickedAdrenaline = true;
        });

        this.adrenalina.on("pointerup", () => {
            this.pickedAdrenaline = false;
        });

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
        }

        if (!this.gameEnded && this.pickedNacl && this.checkCollision(this.nacl, this.patientCart)) {
            if (this.usedItems === 2) {
                this.pickedNacl = false;
                this.naclSpawn();
                this.clickedWrongChoice();
                gameState.score -= 20;
                gameState.errors.Cart = gameState.errors.Cart + 1;
                this.pointsText.setText("Score: " + gameState.score);
                return;
            }
            this.pickedNacl = false;
            this.nacl.destroy();
            this.naclText.destroy();
            gameState.score += 20;
            this.pointsText.setText("Score: " + gameState.score);
            this.usedItems--;
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
        // Calcola posizione reale rispetto al carrello nel container
        const cartWorldPos = this.cart.getWorldTransformMatrix();
        const cartX = cartWorldPos.tx;
        const cartY = cartWorldPos.ty;

        // Posiziona adrenalina a destra del carrello
        this.adrenalina.x = this.cart.x + 30;
        this.adrenalina.y = this.cart.y;

        // Converti posizione container in coordinate schermo per il testo
        const adrenalineWorldPos = this.adrenalina.getWorldTransformMatrix();
        this.adrenalinaText.x = adrenalineWorldPos.tx;
        this.adrenalinaText.y = adrenalineWorldPos.ty - (50 * this.currentScale);
    }

    naclSpawn() {
        // Calcola posizione reale rispetto al carrello nel container
        const cartWorldPos = this.cart.getWorldTransformMatrix();
        const cartX = cartWorldPos.tx;
        const cartY = cartWorldPos.ty;

        // Posiziona nacl a sinistra del carrello
        this.nacl.x = this.cart.x - 30;
        this.nacl.y = this.cart.y;

        // Converti posizione container in coordinate schermo per il testo
        const naclWorldPos = this.nacl.getWorldTransformMatrix();
        this.naclText.x = naclWorldPos.tx;
        this.naclText.y = naclWorldPos.ty - (50 * this.currentScale);
    }

    clickedWrongChoice() {
        this.wrongMedicine.setAlpha(1);

        this.tweens.add({
            targets: this.wrongMedicine,
            alpha: 0,
            duration: 2000,
        });
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