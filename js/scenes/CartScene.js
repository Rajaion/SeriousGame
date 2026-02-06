class CartScene extends Phaser.Scene {
    constructor() {
        super({ key: "CartScene" });
        this.usedItems = 2;
        this.gameEnded = false;
        this.pickedAdrenaline = false;
        this.pickedNacl = false;
        this.bottomText = "Clicca sul carrello per prendere le medicine";
        this.monitorImg = null;
        this.ecgGraphics = null;
        this.defibrillator = null;
        this.currentRhythm = null; // 'shockable' o 'non-shockable'
        this.ecgOffsetX = 0; // Per animare la traccia che scorre
        this.ecgArea = null; // Area dove disegnare il cardiogramma
        this.rhythmType = null; // Tipo specifico: 'VF', 'VT', 'PEA', 'Asystole'
    }

    preload() {
        this.load.image("Cart", "img/Cart.png");
        this.load.image("Monitor", "img/Monitor.png");
        this.load.image("Adrenalina", "img/Adrenalina.png");
        this.load.image("Nacl", "img/Nacl.png");
        this.load.image("Sfondo", "img/Mattone.png");
        this.load.image("soluzione", "img/soluzione_glucosata.png");
        this.load.image("amiodarone", "img/amiodarone.png");
        this.load.image("defibrillatore", "img/Defibrillatore.png");
        
        // Carica i suoni (se hai i file audio, decommenta queste righe)
        // this.load.audio("compressionSound", "audio/compression.mp3");
        // this.load.audio("defibShock", "audio/defibrillator_shock.mp3");
        // this.load.audio("heartBeep", "audio/heart_monitor_beep.mp3");
    }

    create() {
        // Scegli randomicamente tra shockable (1) e non-shockable (0)
        const isShockable = Math.random() > 0.5 ? 1 : 0;
        console.log("create() chiamato, isShockable:", isShockable);
        this.createContent(isShockable);
    }

    createContent(isShockable) {
        console.log("createContent chiamato con isShockable:", isShockable);
        this.children.removeAll();
        this.textElements = [];
        this.gameEnded = false;
        this.pickedNacl = false;
        this.pickedAdrenaline = false;
        this.usedItems = 2;
        this.createBackground();
        this.createTopBottomBars();
        this.createTexts();
        
        // Chiama direttamente la funzione corretta (1 = shockable, 0 = non-shockable)
        if (isShockable) {
            console.log("Chiamando setupShockable");
            this.setupShockable();
        } else {
            console.log("Chiamando setupNonShockable");
            this.setupNonShockable();
        }
    }

    setupShockable() {
        console.log("Setup Shockable chiamato");
        // Imposta il tipo di ritmo corrente
        this.currentRhythm = 'shockable';
        
        // Scegli randomicamente tra VF (Fibrillazione Ventricolare) o VT (Tachicardia Ventricolare)
        this.rhythmType = Math.random() > 0.5 ? 'VF' : 'VT';
        console.log("Rhythm type:", this.rhythmType);
        
        // Usa time.delayedCall per assicurarsi che getBounds() funzioni
        this.time.delayedCall(100, () => {
            // Posiziona il defibrillatore visibile (a destra del monitor)
            if (!this.monitorImg) {
                console.error("monitorImg non è definito!");
                return;
            }
            const monitorBounds = this.monitorImg.getBounds();
            console.log("Monitor bounds:", monitorBounds);
            
            if (!this.defibrillator) {
                console.error("defibrillator non è definito!");
                return;
            }
            this.defibrillator.setVisible(true);
            this.defibrillator.x = monitorBounds.right + 80; // 80 pixel a destra del monitor
            this.defibrillator.y = monitorBounds.centerY;
            this.defibrillator.setInteractive({ useHandCursor: true });
            console.log("Defibrillatore posizionato a:", this.defibrillator.x, this.defibrillator.y);
            
            // Aggiungi evento click al defibrillatore
            this.defibrillator.removeAllListeners();
            this.defibrillator.on("pointerdown", () => {
                this.deliverShock();
            });
            
            // Crea la traccia ECG per ritmi shockable
            this.createECGTrace();
            console.log("ECG Area creata:", this.ecgArea);
        });
        
        // Testo di istruzione
        this.bottomText = "Valuta il ritmo sul monitor. Se è shockable, eroga lo shock con il DAE";
        this.showMessage(this.bottomText, false);
    }

    setupNonShockable() {
        console.log("Setup Non-Shockable chiamato");
        // Imposta il tipo di ritmo corrente
        this.currentRhythm = 'non-shockable';
        
        // Scegli randomicamente tra PEA (Pulseless Electrical Activity) o Asystole
        this.rhythmType = Math.random() > 0.5 ? 'PEA' : 'Asystole';
        console.log("Rhythm type:", this.rhythmType);
        
        // Nascondi il defibrillatore (non serve per ritmi non-shockable)
        if (this.defibrillator) {
            this.defibrillator.setVisible(false);
            this.defibrillator.disableInteractive();
        }
        
        // Usa time.delayedCall per assicurarsi che getBounds() funzioni
        this.time.delayedCall(100, () => {
            // Crea la traccia ECG per ritmi non-shockable
            this.createECGTrace();
            console.log("ECG Area creata:", this.ecgArea);
        });
        
        // Testo di istruzione
        this.bottomText = "Valuta il ritmo sul monitor. Se è non-shockable, somministra Adrenalina";
        this.showMessage(this.bottomText, false);
        
        // TODO: Preparare farmaci (Adrenalina)
    }

    createBackground() {

        const backGround = this.add.image(0, 0, "Sfondo").setOrigin(0, 0);
        backGround.setScale(Math.max(1920 / backGround.width, 1080 / backGround.height));

        // Salva riferimento al monitor per calcolare la posizione del cardiogramma
        this.monitorImg = this.add.image(192, 540, "Monitor").setScale(0.4);
        this.monitorImg.setDepth(1); // Depth del monitor
        
        // Crea grafica per il cardiogramma (sarà posizionata sopra il monitor)
        this.ecgGraphics = this.add.graphics();
        this.ecgGraphics.setDepth(2); // Depth superiore al monitor per essere visibile

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

        this.amiodarone = this.add.image(-550, -550, "amiodarone")
            .setScale(0.15)
            .setInteractive({ useHandCursor: true });

        this.soluzione = this.add.image(-550, -550, "soluzione")
            .setScale(0.15)
            .setInteractive({ useHandCursor: true });

        this.defibrillator = this.add.image(-550, -550, "defibrillatore")
            .setScale(0.15)
            .setInteractive({ useHandCursor: true });

        const instructionBox = this.add.graphics();
        instructionBox.fillStyle(0xecf0f1, 1);
        instructionBox.fillRoundedRect(560, 87, 800, 150, 0);
        instructionBox.lineStyle(2, 0x2c3e50, 1);
        instructionBox.strokeRoundedRect(560, 87, 800, 150, 0);

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
        // Aggiorna l'animazione del cardiogramma
        if (this.ecgGraphics && this.ecgArea) {
            this.updateECGTrace();
        }
        
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

    createECGTrace() {
        if (!this.monitorImg) {
            console.error("monitorImg non è definito in createECGTrace!");
            return;
        }
        
        // Calcola la posizione del monitor e l'area dove disegnare il cardiogramma
        const monitorBounds = this.monitorImg.getBounds();
        const monitorCenterX = monitorBounds.centerX;
        const monitorCenterY = monitorBounds.centerY;
        
        console.log("Monitor bounds:", monitorBounds);
        console.log("Monitor center:", monitorCenterX, monitorCenterY);
        
        // Area del cardiogramma (centrata nel monitor, con margini)
        // Lo schermo del monitor è circa il 70% dell'immagine totale
        const ecgAreaWidth = monitorBounds.width * 0.7;
        const ecgAreaHeight = monitorBounds.height * 0.4;
        const ecgAreaX = monitorCenterX - ecgAreaWidth / 2;
        const ecgAreaY = monitorCenterY - ecgAreaHeight / 2;
        
        // Salva le informazioni per l'animazione
        this.ecgArea = {
            x: ecgAreaX,
            y: ecgAreaY,
            width: ecgAreaWidth,
            height: ecgAreaHeight,
            centerY: monitorCenterY
        };
        
        this.ecgOffsetX = 0;
        console.log("ECG Area creata:", this.ecgArea);
    }

    updateECGTrace() {
        if (!this.ecgGraphics) {
            console.error("ecgGraphics non è definito!");
            return;
        }
        if (!this.ecgArea) {
            console.error("ecgArea non è definito!");
            return;
        }
        
        this.ecgGraphics.clear();
        this.ecgGraphics.lineStyle(3, 0x00ff00, 1); // Verde per la traccia ECG
        
        // Velocità di scorrimento
        this.ecgOffsetX += 2;
        if (this.ecgOffsetX >= this.ecgArea.width) {
            this.ecgOffsetX = 0;
        }
        
        // Ottieni il pattern del ritmo
        const pattern = this.getRhythmPattern();
        if (!pattern || pattern.length === 0) {
            console.error("Pattern non valido!");
            return;
        }
        const patternLength = pattern.length;
        const centerY = this.ecgArea.centerY;
        
        // Disegna la traccia che scorre
        this.ecgGraphics.beginPath();
        
        for (let i = 0; i < this.ecgArea.width; i++) {
            const x = this.ecgArea.x + i;
            // Usa il pattern per generare l'onda (ogni 15 pixel = 1 punto del pattern)
            const patternIndex = Math.floor((i + this.ecgOffsetX) / 15) % patternLength;
            const yOffset = pattern[patternIndex] * (this.ecgArea.height / 2);
            const y = centerY + yOffset;
            
            if (i === 0) {
                this.ecgGraphics.moveTo(x, y);
            } else {
                this.ecgGraphics.lineTo(x, y);
            }
        }
        
        this.ecgGraphics.strokePath();
    }

    getRhythmPattern() {
        // Restituisce il pattern basato sul rhythmType corrente
        switch(this.rhythmType) {
            case 'VF':
                // Fibrillazione Ventricolare: onde irregolari e caotiche
                return [0, 0.4, -0.3, 0.5, -0.4, 0.3, -0.5, 0.6, -0.3, 0.4, -0.4, 0.5, -0.2, 0.3, -0.6, 0.4, -0.3, 0.5, -0.4, 0.2];
            
            case 'VT':
                // Tachicardia Ventricolare: onde regolari ma rapide e ampie
                return [0, 0.7, -0.7, 0.7, -0.7, 0.7, -0.7, 0.7, -0.7, 0.7, -0.7, 0.7, -0.7, 0.7, -0.7, 0.7, -0.7, 0.7, -0.7, 0];
            
            case 'PEA':
                // PEA: piccola attività elettrica ma senza polso (onde piccole)
                return [0, 0.15, -0.15, 0.2, -0.2, 0.15, -0.15, 0.18, -0.18, 0.15, -0.15, 0.2, -0.2, 0.15, -0.15, 0.18, -0.18, 0.15, -0.15, 0];
            
            case 'Asystole':
                // Asystole: linea piatta (quasi nulla)
                return [0, 0.03, -0.03, 0.02, -0.02, 0.03, -0.03, 0.02, -0.02, 0.03, -0.03, 0.02, -0.02, 0.03, -0.03, 0.02, -0.02, 0.03, -0.03, 0];
            
            default:
                return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
    }

    deliverShock() {
        if (this.currentRhythm !== 'shockable') {
            // Errore: shock su ritmo non-shockable
            this.showMessage("Errore! Il ritmo non è shockable. Valuta meglio il monitor!", false);
            gameState.score -= 10;
            gameState.errors.Cart++;
            if (this.pointsText) {
                this.pointsText.setText("Score: " + gameState.score);
            }
            return;
        }
        
        // Shock corretto
        this.showMessage("Shock erogato correttamente! Procedi con i farmaci", true);
        gameState.score += 20;
        if (this.pointsText) {
            this.pointsText.setText("Score: " + gameState.score);
        }
        
        // Disabilita il defibrillatore dopo lo shock
        this.defibrillator.disableInteractive();
        
        // Effetto visivo: flash bianco
        const flash = this.add.rectangle(960, 540, 1920, 1080, 0xffffff, 0.8);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }
}