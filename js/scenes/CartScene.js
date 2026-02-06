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
        this.medicationSet = null; // 'adrenaline_nacl' o 'amiodarone_glucose'
        this.pickedAmiodarone = false;
        this.pickedSoluzione = false;
        this.currentCycle = 1; // Ciclo corrente (1, 2, 3)
        this.maxCycles = 3; // Numero massimo di cicli
        this.shockDelivered = false; // Se lo shock è stato erogato nel ciclo corrente
        this.medicationsGiven = false; // Se i farmaci sono stati somministrati nel ciclo corrente
        this.heartBeatTimer = null; // Timer per ripetere il singolo beep del battito (se carichi heartBeep)
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
        
        // Carica i suoni (se hai i file audio, decommenta)
        // Singolo battito/beep del monitor (si ripete a intervalli): ideale per simulare il monitor
        this.load.audio("heartBeep", "audio/heart_beep.mp3");
        this.load.audio("defibShock", "audio/defibrillator.mp3");
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
        this.pickedAmiodarone = false;
        this.pickedSoluzione = false;
        this.usedItems = 2;
        this.shockDelivered = false;
        this.medicationsGiven = false;
        this.createBackground();
        this.createTopBottomBars();
        this.createTexts();
        this.setupEvents();
        
        // Chiama direttamente la funzione corretta (1 = shockable, 0 = non-shockable)
        if (isShockable) {
            console.log("Chiamando setupShockable");
            this.setupShockable();
        } else {
            console.log("Chiamando setupNonShockable");
            this.setupNonShockable();
        }

        // Opzionale: singolo battito del cuore ripetuto (decommenta quando carichi audio/heart_beep.mp3)
        // this.heartBeatTimer = this.time.addEvent({ delay: 1000, callback: () => { if (this.sound && this.sound.get("heartBeep")) this.sound.play("heartBeep"); }, loop: true });
    }

    setupShockable() {
        console.log("Setup Shockable chiamato");
        // Imposta il tipo di ritmo corrente
        this.currentRhythm = 'shockable';
        
        // Scegli randomicamente tra VF (Fibrillazione Ventricolare) o VT (Tachicardia Ventricolare)
        this.rhythmType = Math.random() > 0.5 ? 'VF' : 'VT';
        console.log("Rhythm type:", this.rhythmType);
        
        // Scegli randomicamente il set di farmaci: Adrenalina+NaCl o Amiodarone+SG5%
        this.medicationSet = Math.random() > 0.5 ? 'adrenaline_nacl' : 'amiodarone_glucose';
        console.log("Medication set:", this.medicationSet);
        
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
        
        // Per ritmi non-shockable usa sempre Adrenalina+NaCl
        this.medicationSet = 'adrenaline_nacl';
        console.log("Medication set:", this.medicationSet);
        
        // Usa time.delayedCall per assicurarsi che getBounds() funzioni
        this.time.delayedCall(100, () => {
            // Mostra il defibrillatore ma sarà punito se usato
            if (!this.monitorImg) {
                console.error("monitorImg non è definito!");
                return;
            }
            const monitorBounds = this.monitorImg.getBounds();
            
            if (!this.defibrillator) {
                console.error("defibrillator non è definito!");
                return;
            }
            // Mostra il defibrillatore anche se non serve (per testare l'utente)
            this.defibrillator.setVisible(true);
            this.defibrillator.x = monitorBounds.right + 80;
            this.defibrillator.y = monitorBounds.centerY;
            this.defibrillator.setInteractive({ useHandCursor: true });
            
            // Aggiungi evento click al defibrillatore (verrà punito se usato)
            this.defibrillator.removeAllListeners();
            this.defibrillator.on("pointerdown", () => {
                this.deliverShock();
            });
            
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

        // Indicatore del ciclo: chiarisce che bisogna ripetere la stessa sequenza
        this.cycleText = this.add.text(100, 20, `Ciclo ${this.currentCycle}/${this.maxCycles} – Ripeti la stessa sequenza`, {
            fontSize: `36px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2,
            wordWrap: { width: 500 }
        }).setOrigin(0, 0.5);
        this.textElements.push(this.cycleText);

        // Indicazione che le compressioni sono in corso (avvengono mentre il giocatore agisce)
        this.textElements.push(this.add.text(960, 162, "Le compressioni toraciche sono in corso. Valuta il ritmo, agisci (shock/farmaci), poi ripeti.", {
            fontSize: `38px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            wordWrap: { width: 1400 },
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

        this.amiodaroneText = this.add.text(-550, -550, "Amiodarone", {
            fontSize: `22px`,
            color: "#2c3e50",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.amiodaroneText);

        this.soluzioneText = this.add.text(-550, -550, "SG 5%", {
            fontSize: `22px`,
            color: "#2c3e50",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.soluzioneText);
    }

    setupEvents() {
        this.cart.removeAllListeners();
        this.cart.on("pointerdown", () => {
            // Per ritmi shockable, verifica che lo shock sia stato erogato prima
            if (this.currentRhythm === 'shockable' && !this.shockDelivered) {
                this.showMessage("Prima devi erogare lo shock con il DAE!", false);
                return;
            }
            
            // Mostra i farmaci corretti in base al medicationSet
            if (this.medicationSet === 'adrenaline_nacl') {
                this.adrenSpawn();
                this.naclSpawn();
            } else if (this.medicationSet === 'amiodarone_glucose') {
                this.amiodaroneSpawn();
                this.soluzioneSpawn();
            }
            this.cart.disableInteractive();
            this.showMessage("Trascina le medicine sul paziente nell'ordine corretto", true);
        });

        // Eventi per Adrenalina
        this.adrenalina.removeAllListeners();
        this.adrenalina.on("pointerdown", () => { this.pickedAdrenaline = true; });
        this.adrenalina.on("pointerup", () => { this.pickedAdrenaline = false; });

        // Eventi per NaCl
        this.nacl.removeAllListeners();
        this.nacl.on("pointerdown", () => { this.pickedNacl = true; });
        this.nacl.on("pointerup", () => { this.pickedNacl = false; });

        // Eventi per Amiodarone
        this.amiodarone.removeAllListeners();
        this.amiodarone.on("pointerdown", () => { this.pickedAmiodarone = true; });
        this.amiodarone.on("pointerup", () => { this.pickedAmiodarone = false; });

        // Eventi per Soluzione Glucosata
        this.soluzione.removeAllListeners();
        this.soluzione.on("pointerdown", () => { this.pickedSoluzione = true; });
        this.soluzione.on("pointerup", () => { this.pickedSoluzione = false; });

        this.input.on('pointerup', () => {
            this.pickedAdrenaline = false;
            this.pickedNacl = false;
            this.pickedAmiodarone = false;
            this.pickedSoluzione = false;
        });
    }

    update() {
        // Aggiorna l'animazione del cardiogramma
        if (this.ecgGraphics && this.ecgArea) {
            this.updateECGTrace();
        }
        
        if (!this.gameEnded && this.usedItems === 0 && this.medicationsGiven === false) {
            this.medicationsGiven = true;
            this.completeCycle();
        }

        // Gestione per set Adrenalina + NaCl
        if (this.medicationSet === 'adrenaline_nacl') {
            if (!this.gameEnded && this.pickedAdrenaline && this.checkCollision(this.adrenalina, this.patientCart)) {
                this.pickedAdrenaline = false;
                // Nascondi invece di distruggere per riutilizzarli nei cicli successivi
                this.adrenalina.x = -550;
                this.adrenalina.y = -550;
                this.adrenalinaText.x = -550;
                this.adrenalinaText.y = -550;
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
                // Nascondi invece di distruggere per riutilizzarli nei cicli successivi
                this.nacl.x = -550;
                this.nacl.y = -550;
                this.naclText.x = -550;
                this.naclText.y = -550;
                gameState.score += 20;
                this.pointsText.setText("Score: " + gameState.score);
                this.usedItems--;
                if (this.currentCycle < this.maxCycles) {
                    this.showMessage("Perfetto! Ciclo completato. Procedi con il prossimo ciclo", true);
                } else {
                    this.showMessage("Perfetto! Hai completato tutte le somministrazioni!", true);
                }
            }

            // Punizione se prova a usare farmaci sbagliati
            if (!this.gameEnded && (this.pickedAmiodarone || this.pickedSoluzione) && 
                (this.checkCollision(this.amiodarone, this.patientCart) || this.checkCollision(this.soluzione, this.patientCart))) {
                this.showMessage("Errore! Questi farmaci non sono corretti per questo caso", false);
                gameState.score -= 10;
                gameState.errors.Cart++;
                this.pointsText.setText("Score: " + gameState.score);
                this.pickedAmiodarone = false;
                this.pickedSoluzione = false;
            }

            if (this.pickedAdrenaline) {
                this.moveObjAndText(this.adrenalina, this.adrenalinaText);
            }

            if (this.pickedNacl) {
                this.moveObjAndText(this.nacl, this.naclText);
            }
        }

        // Gestione per set Amiodarone + Soluzione Glucosata
        if (this.medicationSet === 'amiodarone_glucose') {
            if (!this.gameEnded && this.pickedAmiodarone && this.checkCollision(this.amiodarone, this.patientCart)) {
                this.pickedAmiodarone = false;
                // Nascondi invece di distruggere per riutilizzarli nei cicli successivi
                this.amiodarone.x = -550;
                this.amiodarone.y = -550;
                this.amiodaroneText.x = -550;
                this.amiodaroneText.y = -550;
                gameState.score += 20;
                this.pointsText.setText("Score: " + gameState.score);
                this.usedItems--;
                this.showMessage("Corretto! Ora somministra la seconda medicina", true);
            }

            if (!this.gameEnded && this.pickedSoluzione && this.checkCollision(this.soluzione, this.patientCart)) {
                if (this.usedItems === 2) {
                    this.pickedSoluzione = false;
                    this.soluzioneSpawn();
                    this.clickedWrongChoice();
                    gameState.score -= 20;
                    gameState.errors.Cart++;
                    this.pointsText.setText("Score: " + gameState.score);
                    return;
                }
                this.pickedSoluzione = false;
                // Nascondi invece di distruggere per riutilizzarli nei cicli successivi
                this.soluzione.x = -550;
                this.soluzione.y = -550;
                this.soluzioneText.x = -550;
                this.soluzioneText.y = -550;
                gameState.score += 20;
                this.pointsText.setText("Score: " + gameState.score);
                this.usedItems--;
                if (this.currentCycle < this.maxCycles) {
                    this.showMessage("Perfetto! Ciclo completato. Procedi con il prossimo ciclo", true);
                } else {
                    this.showMessage("Perfetto! Hai completato tutte le somministrazioni!", true);
                }
            }

            // Punizione se prova a usare farmaci sbagliati
            if (!this.gameEnded && (this.pickedAdrenaline || this.pickedNacl) && 
                (this.checkCollision(this.adrenalina, this.patientCart) || this.checkCollision(this.nacl, this.patientCart))) {
                this.showMessage("Errore! Questi farmaci non sono corretti per questo caso", false);
                gameState.score -= 10;
                gameState.errors.Cart++;
                this.pointsText.setText("Score: " + gameState.score);
                this.pickedAdrenaline = false;
                this.pickedNacl = false;
            }

            if (this.pickedAmiodarone) {
                this.moveObjAndText(this.amiodarone, this.amiodaroneText);
            }

            if (this.pickedSoluzione) {
                this.moveObjAndText(this.soluzione, this.soluzioneText);
            }
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

    amiodaroneSpawn() {
        this.amiodarone.x = this.cart.x + 30;
        this.amiodarone.y = this.cart.y;
        const pos = this.amiodarone.getWorldTransformMatrix();
        this.amiodaroneText.x = pos.tx;
        this.amiodaroneText.y = pos.ty - 100;
    }

    soluzioneSpawn() {
        this.soluzione.x = this.cart.x - 30;
        this.soluzione.y = this.cart.y;
        const pos = this.soluzione.getWorldTransformMatrix();
        this.soluzioneText.x = pos.tx;
        this.soluzioneText.y = pos.ty - 75;
    }

    clickedWrongChoice() {
        if (this.medicationSet === 'adrenaline_nacl') {
            this.showMessage("Attenzione! Le medicine devono essere date in ordine: prima Adrenalina, poi Nacl", false);
        } else if (this.medicationSet === 'amiodarone_glucose') {
            this.showMessage("Attenzione! Le medicine devono essere date in ordine: prima Amiodarone, poi Soluzione Glucosata", false);
        }
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
        
        // Area del cardiogramma (leggermente in alto e leggermente più larga per uscire dal monitor)
        // Lo schermo del monitor è circa il 70% dell'immagine totale
        const ecgAreaWidth = monitorBounds.width * 0.65; // Ridotto per non uscire troppo
        const ecgAreaHeight = monitorBounds.height * 0.4;
        const ecgAreaX = monitorCenterX - ecgAreaWidth / 2;
        const ecgAreaY = monitorCenterY - ecgAreaHeight / 2 - 30; // Spostato 30 pixel più in alto
        
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
        this.shockDelivered = true;
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

    completeCycle() {
        console.log("Ciclo completato:", this.currentCycle);
        
        // Se siamo all'ultimo ciclo, termina
        if (this.currentCycle >= this.maxCycles) {
            this.time.delayedCall(2000, () => {
                this.gameEnded = true;
                this.scene.start("EndScene");
            });
            return;
        }
        
        // Passa al ciclo successivo
        this.currentCycle++;
        console.log("Passaggio al ciclo:", this.currentCycle);
        
        // Aggiorna l'indicatore del ciclo
        if (this.cycleText) {
            this.cycleText.setText(`Ciclo ${this.currentCycle}/${this.maxCycles} – Ripeti la stessa sequenza`);
        }
        
        // Reset dello stato per il nuovo ciclo
        this.time.delayedCall(2000, () => {
            this.resetCycleState();
        });
    }

    resetCycleState() {
        console.log("Reset stato ciclo");
        
        // Reset variabili
        this.usedItems = 2;
        this.shockDelivered = false;
        this.medicationsGiven = false;
        this.pickedAdrenaline = false;
        this.pickedNacl = false;
        this.pickedAmiodarone = false;
        this.pickedSoluzione = false;
        
        // Riabilita il carrello
        this.cart.setInteractive({ useHandCursor: true });
        
        // Riabilita il defibrillatore se necessario
        if (this.currentRhythm === 'shockable' && this.defibrillator) {
            this.defibrillator.setInteractive({ useHandCursor: true });
        }
        
        // Reset farmaci (li nasconde)
        this.adrenalina.x = -550;
        this.adrenalina.y = -550;
        this.adrenalinaText.x = -550;
        this.adrenalinaText.y = -550;
        
        this.nacl.x = -550;
        this.nacl.y = -550;
        this.naclText.x = -550;
        this.naclText.y = -550;
        
        this.amiodarone.x = -550;
        this.amiodarone.y = -550;
        this.amiodaroneText.x = -550;
        this.amiodaroneText.y = -550;
        
        this.soluzione.x = -550;
        this.soluzione.y = -550;
        this.soluzioneText.x = -550;
        this.soluzioneText.y = -550;
        
        // Aggiorna il messaggio
        if (this.currentRhythm === 'shockable') {
            this.bottomText = "Ripeti: valuta il ritmo, se shockable eroga lo shock, poi clicca il carrello e somministra i farmaci.";
        } else {
            this.bottomText = "Ripeti: valuta il ritmo (non-shockable), clicca il carrello e somministra Adrenalina e Nacl.";
        }
        this.showMessage("Ciclo " + this.currentCycle + " – " + this.bottomText, false);
    }
}