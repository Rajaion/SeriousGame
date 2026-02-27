/**
 * PROTOCOLLO ALS (secondo PDF):
 *
 * VT (Tachicardia Ventricolare): Shock sempre. Adrenalina + Amiodarone solo se VT presente 3 volte di fila.
 * VF (Fibrillazione Ventricolare): Shock sempre. Adrenalina + Amiodarone solo se VF presente 3 volte di fila.
 * PEA: NO shock. Adrenalina solo a cicli dispari (1, 3, 5).
 * Asistolia: Solo compressioni (nessun farmaco per ora).
 *
 * L'avanzamento al ciclo successivo avviene solo premendo il bottone "Compressioni".
 */
class CartScene extends Phaser.Scene {
    constructor() {
        super({ key: "CartScene" });
        this.usedItems = 2;
        this.gameEnded = false;
        this.pickedAdrenaline = false;
        this.pickedNacl = false;
        this.bottomText = "Clicca sul carrello per le medicine";
        this.monitorImg = null;
        this.ecgGraphics = null;
        this.defibrillator = null;
        this.currentRhythm = null; // 'shockable' o 'non-shockable'
        this.ecgOffsetX = 0; // Per animare la traccia che scorre
        this.ecgArea = null; // Area dove disegnare il cardiogramma
        this.rhythmType = null; // Tipo specifico: 'VF', 'VT', 'PEA', 'Asystole'
        this.medicationSet = null; // PDF: Adrenalina+sol.fisiologica (NaCl) a seguire, oppure Amiodarone+SG 5% a seguire
        this.pickedAmiodarone = false;
        this.pickedSoluzione = false;
        this.currentCycle = 1; // Ciclo corrente
        this.maxCycles = 5; // Numero massimo di cicli (dal 4° in poi farmaci per shockable)
        this.shockDelivered = false; // Se lo shock è stato erogato nel ciclo corrente
        this.medicationsGiven = false; // Se i farmaci sono stati somministrati nel ciclo corrente
        this.heartBeatTimer = null; // Timer per ripetere il singolo beep del battito (se carichi heartBeep)
        this.initialMedicationSet = null; // Set farmaci scelto una sola volta per tutta la partita (stessi farmaci ogni ciclo)
        this.ecgScrollSpeed = 35; // pixel/sec per la traccia ECG (indipendente dal frame rate)
        this.ecgPatternStep = 15; // pixel per campione del pattern (loop perfetto quando offset % (length*step) === 0)
        this.ecgPatternPrev = null; // pattern precedente per transizione al cambio ritmo
        this.ecgPatternTarget = null;
        this.ecgTransitionT = 999; // tempo trascorso nella transizione (sec)
        this.ecgTransitionDuration = 1.8; // durata transizione in secondi
        this.ecgLastWasPeak = false; // per beep sincronizzato al picco del cardiogramma
        this.heartBeepLastTime = 0;  // cooldown per evitare beep sovrapposti (gracchio)
        this.consecutiveVTCount = 0; // VT presente N volte di fila
        this.consecutiveVFCount = 0; // VF presente N volte di fila
        this.medsRequiredThisCycle = false; // true se il carrello è visibile e servono farmaci prima di Compressioni
    }

    preload() {
        this.load.image("Monitor", "img/Monitor.png");
        this.load.image("Adrenalina", "img/Adrenalina.png");
        this.load.image("Nacl", "img/Nacl.png");
        this.load.image("Sfondo", "img/Mattone.png");
        this.load.image("soluzione", "img/soluzione_glucosata.png");
        this.load.image("amiodarone", "img/Amiodarone.png");
        this.load.image("defibrillatore", "img/defibrillatore.png");
        
        // Carica i suoni (percorso relativo alla pagina che carica il gioco, es. index.html)
        this.load.audio("heartBeep", "audio/heart_beep.mp3");
        this.load.audio("defibShock", "audio/defibrillator.mp3");
        this.load.on("loaderror", (file) => {
            if (file.key === "heartBeep" || file.key === "defibShock") {
                console.warn("Audio non trovato:", file.url, "- Verifica che la cartella audio/ contenga heart_beep.mp3 e defibrillator.mp3");
            }
        });
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
        this.pickedAmiodarone = false;
        this.pickedSoluzione = false;
        this.usedItems = 2;
        this.shockDelivered = false;
        this.medicationsGiven = false;
        this.medsRequiredThisCycle = false;
        this.consecutiveVTCount = 0;
        this.consecutiveVFCount = 0;
        this.createBackground();
        this.createTopBottomBars();
        this.createTexts();
        this.setupEvents();
        
        this.pickNewRhythmForCycle();
        if (this.currentRhythm === 'shockable') {
            this.setupShockable();
        } else {
            this.setupNonShockable();
        }

        // Beep sincronizzato al picco del cardiogramma (gestito in updateECGTrace)
        this.heartBeatTimer = null;
    }

    setupShockable() {
        console.log("Setup Shockable chiamato, rhythm:", this.rhythmType);
        
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
            this.defibrillator.y = monitorBounds.centerY - 100;
            this.defibrillator.disableInteractive();
            this.createShockButton(this.defibrillator.x, this.defibrillator.y);
            console.log("Defibrillatore posizionato a:", this.defibrillator.x, this.defibrillator.y);
            
            // Crea la traccia ECG per ritmi shockable
            this.createECGTrace();
            console.log("ECG Area creata:", this.ecgArea);
        });
        
        this.bottomText = "Shock con DAE, poi Compressioni";
        if (this.cycleText) this.cycleText.setText(this.getCycleLabel());
        this.hideCartHint(true);
        this.showMessage(this.getRhythmLabel() + " – " + this.bottomText, false);
    }

    setupNonShockable() {
        console.log("Setup Non-Shockable chiamato, rhythm:", this.rhythmType);
        
        // Per ritmi non-shockable usa sempre Adrenalina+NaCl
        this.medicationSet = 'adrenaline_nacl';
        console.log("Medication set:", this.medicationSet);
        
        // Usa time.delayedCall per assicurarsi che getBounds() funzioni
        this.time.delayedCall(100, () => {
            // Defibrillatore sempre visibile anche se non serve: l'utente può sbagliare cliccandolo (verrà punito)
            if (!this.monitorImg) {
                console.error("monitorImg non è definito!");
                return;
            }
            const monitorBounds = this.monitorImg.getBounds();
            
            if (!this.defibrillator) {
                console.error("defibrillator non è definito!");
                return;
            }
            this.defibrillator.setVisible(true);
            this.defibrillator.x = monitorBounds.right + 80;
            this.defibrillator.y = monitorBounds.centerY - 100;
            this.defibrillator.disableInteractive();
            this.createShockButton(this.defibrillator.x, this.defibrillator.y);
            
            this.createECGTrace();
            console.log("ECG Area creata:", this.ecgArea);
        });
        this.bottomText = "Ritmo non defibrillabile";
        if (this.cycleText) this.cycleText.setText(this.getCycleLabel());
        this.updateCartHintForNonShockable();
        this.showMessage(this.getRhythmLabel() + " – " + this.bottomText, false);
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

        this.cart = this.add.rectangle(1675, 790, 400, 400)
            .setAlpha(0.01)
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

        // Bottone "Compressioni" (animato come IntroScene: hover e click)
        this.compBtnW = 280;
        this.compBtnH = 70;
        this.compBtnX = 960 - this.compBtnW / 2;
        this.compBtnY = 920;
        this.compressioniButton = this.add.graphics();
        const drawCompressioniBtn = (color) => {
            this.compressioniButton.clear();
            this.compressioniButton.fillStyle(color, 1);
            this.compressioniButton.fillRoundedRect(this.compBtnX, this.compBtnY, this.compBtnW, this.compBtnH, 10);
            this.compressioniButton.lineStyle(3, 0x000000, 1);
            this.compressioniButton.strokeRoundedRect(this.compBtnX, this.compBtnY, this.compBtnW, this.compBtnH, 10);
        };
        drawCompressioniBtn(0x3498db);
        this.drawCompressioniBtn = drawCompressioniBtn;
        this.compressioniZone = this.add.rectangle(960, this.compBtnY + this.compBtnH / 2, this.compBtnW, this.compBtnH)
            .setInteractive({ useHandCursor: true });
        this.compressioniText = this.add.text(960, this.compBtnY + this.compBtnH / 2, "Compressioni", {
            fontSize: "32px",
            color: "#000000",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.textElements.push(this.compressioniText);

        // Freccia sopra il carrello che punta in basso (più grande)
        this.cartArrowHint = this.add.graphics();
        this.cartArrowBaseX = this.cart.x;
        this.cartArrowBaseY = this.cart.y - 290;
        this.cartHintVisible = false;
        this.arrowBobTween = null;
        this.updateCartArrowGraphics();
        this.cartArrowHint.setVisible(false).setDepth(10);

        const instructionBox = this.add.graphics();
        const boxW = 950, boxX = 960 - boxW / 2; // box più larga (~+150), centrata
        instructionBox.fillStyle(0xecf0f1, 1);
        instructionBox.fillRoundedRect(boxX, 87, boxW, 150, 0);
        instructionBox.lineStyle(2, 0x2c3e50, 1);
        instructionBox.strokeRoundedRect(boxX, 87, boxW, 150, 0);

        // Bottone Shock (creato e posizionato sotto il defibrillatore in setupShockable/setupNonShockable)
        this.shockBtnW = 170;
        this.shockBtnH = 58;
        this.shockButton = this.add.graphics();
        this.shockBtnZone = this.add.rectangle(0, 0, this.shockBtnW, this.shockBtnH).setInteractive({ useHandCursor: true }).setVisible(false);
        this.shockBtnText = this.add.text(0, 0, "Shock", {
            fontSize: "28px",
            color: "#000000",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);
        this.textElements.push(this.shockBtnText);
    }

    createShockButton(defibX, defibY) {
        const centerX = defibX;
        const centerY = defibY + 105;
        this.shockButton.x = 0;
        this.shockButton.y = 0;
        this.shockButton.setVisible(true);
        const drawShockBtn = (color) => {
            this.shockButton.clear();
            this.shockButton.fillStyle(color, 1);
            this.shockButton.fillRoundedRect(centerX - this.shockBtnW / 2, centerY - this.shockBtnH / 2, this.shockBtnW, this.shockBtnH, 10);
            this.shockButton.lineStyle(3, 0x000000, 1);
            this.shockButton.strokeRoundedRect(centerX - this.shockBtnW / 2, centerY - this.shockBtnH / 2, this.shockBtnW, this.shockBtnH, 10);
        };
        this.drawShockBtn = drawShockBtn;
        drawShockBtn(0x3498db);
        this.shockBtnZone.x = centerX;
        this.shockBtnZone.y = centerY;
        this.shockBtnZone.setVisible(true);
        this.shockBtnText.x = centerX;
        this.shockBtnText.y = centerY;
        this.shockBtnText.setVisible(true);
        const shockNormal = 0x3498db, shockHover = 0x5DADE2;
        const onShock = () => this.deliverShock();
        this.shockBtnZone.removeAllListeners();
        this.shockBtnText.removeAllListeners();
        this.shockBtnZone.on("pointerover", () => { this.drawShockBtn(shockHover); this.shockBtnText.setScale(1.05); });
        this.shockBtnZone.on("pointerout", () => { this.drawShockBtn(shockNormal); this.shockBtnText.setScale(1); });
        this.shockBtnZone.on("pointerdown", () => { this.drawShockBtn(shockHover); onShock(); });
        this.shockBtnText.on("pointerover", () => { this.drawShockBtn(shockHover); this.shockBtnText.setScale(1.05); });
        this.shockBtnText.on("pointerout", () => { this.drawShockBtn(shockNormal); this.shockBtnText.setScale(1); });
        this.shockBtnText.on("pointerdown", () => { this.drawShockBtn(shockHover); onShock(); });
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

        // --- TESTO CICLI: creato qui, aggiornato in completeCycle(); font e wordWrap ridotti per restare nella box ---
        this.cycleText = this.add.text(100, 10, this.getCycleLabel(), {
            fontSize: `24px`,
            color: "#000000ff",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2,
            wordWrap: { width: 380 },
            lineSpacing: 2
        }).setOrigin(0, 0);
        this.textElements.push(this.cycleText);

        // Indicazione che le compressioni sono in corso
        this.textElements.push(this.add.text(960, 162, "Shock e compressioni oppure solo compressioni.", {
            fontSize: `38px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            wordWrap: { width: 1400 },
            resolution: 2
        }).setOrigin(0.5));

        this.bottomTextSpace = this.add.text(960, 1060, this.bottomText, {
            fontSize: `34px`,
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
        // Carrello: disponibile in base al ramo e al ciclo (protocollo ALS)
        this.cart.on("pointerdown", () => {
            if (this.currentRhythm === 'shockable') {
                if (!this.shockDelivered) {
                    this.showMessage("Eroga prima lo shock", false);
                    return;
                }
                if (this.rhythmType === 'VT' && this.consecutiveVTCount < 3) {
                    this.showMessage("Adrenalina e Amiodarone solo dopo VT 3 volte di fila", false);
                    return;
                }
                if (this.rhythmType === 'VF' && this.consecutiveVFCount < 3) {
                    this.showMessage("Adrenalina e Amiodarone solo dopo VF 3 volte di fila", false);
                    return;
                }
            } else {
                if (this.rhythmType === 'PEA') {
                if (this.currentCycle % 2 === 0) {
                    this.showMessage("Solo Adrenalina a cicli dispari (1, 3, 5)", false);
                        return;
                    }
                } else if (this.rhythmType === 'Asystole') {
                    this.showMessage("Asistolia: solo compressioni", false);
                    return;
                }
            }
            if (this.medicationSet === 'adrenaline_only') {
                this.adrenSpawn();
                this.naclSpawn();
                this.usedItems = 1;
            } else if (this.medicationSet === 'adrenaline_nacl') {
                this.adrenSpawn();
                this.naclSpawn();
            } else if (this.medicationSet === 'amiodarone_glucose') {
                this.amiodaroneSpawn();
                this.soluzioneSpawn();
            } else if (this.medicationSet === 'adrenaline_and_amiodarone') {
                this.adrenSpawn();
                this.naclSpawn();
                this.amiodaroneSpawn();
                this.soluzioneSpawn();
                this.usedItems = 4;
            }
            this.cart.disableInteractive();
            this.hideCartHint();
            this.showMessage("Somministra i farmaci", true);
        });

        this.compressioniZone.removeAllListeners();
        this.compressioniText.removeAllListeners();
        const onCompressioni = () => this.onCompressioniClick();
        const compNormal = 0x3498db, compHover = 0x5DADE2, compDown = 0x5DADE2;
        const compOver = () => { this.drawCompressioniBtn(compHover); this.compressioniText.setScale(1.05); };
        const compOut = () => { this.drawCompressioniBtn(compNormal); this.compressioniText.setScale(1); };
        const compDownEv = () => { this.drawCompressioniBtn(compDown); onCompressioni(); };
        this.compressioniZone.on("pointerover", compOver).on("pointerout", compOut).on("pointerdown", compDownEv);
        this.compressioniText.on("pointerover", compOver).on("pointerout", compOut).on("pointerdown", compDownEv);

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

    update(time, delta) {
        if (this.ecgGraphics && this.ecgArea && typeof CartECG !== "undefined") CartECG.update(this, delta);
        if (typeof CartMedications !== "undefined") CartMedications.update(this);
    }

    updateCartArrowGraphics() {
        this.cartArrowHint.clear();
        this.cartArrowHint.fillStyle(0xe74c3c, 0.95);
        this.cartArrowHint.lineStyle(2, 0xc0392b, 1);
        // Triangolo verso il basso (punta al carrello), più grande: punta (0,20), base (-24,-20) e (24,-20)
        this.cartArrowHint.fillTriangle(0, 20, -24, -20, 24, -20);
        this.cartArrowHint.strokeTriangle(0, 20, -24, -20, 24, -20);
    }

    showCartHint() {
        if (!this.cartArrowHint) return;
        this.medsRequiredThisCycle = true;
        this.cartHintVisible = true;
        this.cartArrowHint.setVisible(true);
        this.cartArrowHint.x = this.cartArrowBaseX;
        this.cartArrowHint.y = this.cartArrowBaseY;
        if (this.arrowBobTween) this.arrowBobTween.remove();
        this.arrowBobTween = this.tweens.add({
            targets: this.cartArrowHint,
            y: this.cartArrowBaseY + 16,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    hideCartHint(clearMedsRequired = false) {
        if (!this.cartArrowHint) return;
        if (clearMedsRequired) this.medsRequiredThisCycle = false;
        this.cartHintVisible = false;
        this.cartArrowHint.setVisible(false);
        if (this.arrowBobTween) {
            this.arrowBobTween.remove();
            this.arrowBobTween = null;
        }
    }

    updateCartHintForNonShockable() {
        if (this.rhythmType === 'PEA') {
            if (this.currentCycle % 2 === 1) {
                this.medicationSet = 'adrenaline_only';
                this.bottomText = "PEA. Solo Adrenalina a cicli dispari. Clicca sul carrello.";
                this.showCartHint();
            } else {
                this.hideCartHint(true);
                this.bottomText = "PEA. Solo Adrenalina a cicli dispari (1, 3, 5).";
            }
        } else if (this.rhythmType === 'Asystole') {
            this.hideCartHint(true);
            this.bottomText = "Asistolia: solo compressioni.";
        }
    }

    /** Clic sul bottone Compressioni: avanza al ciclo successivo (dopo shock nei cicli 1-3 shockable). */
    onCompressioniClick() {
        this.drawCompressioniBtn(0x3498db);
        this.compressioniText.setScale(1);
        if (this.gameEnded) return;
        if (this.currentRhythm === 'shockable' && !this.shockDelivered) {
            this.showMessage("Eroga lo shock, poi compressioni", false);
            return;
        }
        if (this.medsRequiredThisCycle && !this.medicationsGiven) {
            this.showMessage("Somministra prima i farmaci dal carrello", false);
            return;
        }
        this.completeCycle();
    }

    checkCollision(obj1, obj2) {
        return Phaser.Geom.Intersects.RectangleToRectangle(obj1.getBounds(), obj2.getBounds());
    }

    adrenSpawn() {
        this.adrenalina.setDepth(15);
        this.adrenalinaText.setDepth(15);
        this.adrenalina.x = this.cart.x + 30;
        this.adrenalina.y = this.cart.y;
        const pos = this.adrenalina.getWorldTransformMatrix();
        this.adrenalinaText.x = pos.tx;
        this.adrenalinaText.y = pos.ty - 100;
    }

    naclSpawn() {
        this.nacl.setDepth(15);
        this.naclText.setDepth(15);
        this.nacl.x = this.cart.x - 30;
        this.nacl.y = this.cart.y;
        const pos = this.nacl.getWorldTransformMatrix();
        this.naclText.x = pos.tx;
        this.naclText.y = pos.ty - 75;
    }

    amiodaroneSpawn() {
        this.amiodarone.setDepth(15);
        this.amiodaroneText.setDepth(15);
        this.amiodarone.x = this.cart.x + 30;
        this.amiodarone.y = this.cart.y;
        const pos = this.amiodarone.getWorldTransformMatrix();
        this.amiodaroneText.x = pos.tx;
        this.amiodaroneText.y = pos.ty - 100;
    }

    soluzioneSpawn() {
        this.soluzione.setDepth(15);
        this.soluzioneText.setDepth(15);
        this.soluzione.x = this.cart.x - 30;
        this.soluzione.y = this.cart.y;
        const pos = this.soluzione.getWorldTransformMatrix();
        this.soluzioneText.x = pos.tx;
        this.soluzioneText.y = pos.ty - 75;
    }

    clickedWrongChoice() {
        if (this.medicationSet === 'adrenaline_nacl') {
            this.showMessage("Ordine: prima Adrenalina, poi Nacl", false);
        } else if (this.medicationSet === 'amiodarone_glucose') {
            this.showMessage("Ordine: prima Amiodarone, poi SG 5%", false);
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
        if (!this.monitorImg) return;
        if (typeof CartECG !== "undefined") CartECG.create(this);
    }

    getRhythmPattern() {
        return (typeof CartECG !== "undefined" && CartECG.getPattern) ? CartECG.getPattern(this) : [];
    }

    deliverShock() {
        if (this.currentRhythm !== 'shockable') {
            this.showMessage("Ritmo non shockable", false);
            gameState.score -= 10;
            if (typeof window.logGameError === "function") window.logGameError("Cart", "Shock su ritmo non defibrillabile");
            if (this.pointsText) {
                this.pointsText.setText("Score: " + gameState.score);
            }
            return;
        }
        
        // Shock corretto
        this.shockDelivered = true;
        gameState.score += 20;
        if (this.pointsText) {
            this.pointsText.setText("Score: " + gameState.score);
        }
        try {
            if (this.sound) this.sound.play("defibShock");
        } catch (e) { /* ignora */ }
        this.showMessage("Shock erogato. Continua.", true);
        this.defibrillator.disableInteractive();
        if (this.shockBtnZone) this.shockBtnZone.disableInteractive();
        if (this.shockBtnText) this.shockBtnText.disableInteractive();
        const flash = this.add.rectangle(960, 540, 1920, 1080, 0xffffff, 0.8);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 80,
            onComplete: () => flash.destroy()
        });
    }

    completeCycle() {
        console.log("Ciclo completato:", this.currentCycle, "ritmo:", this.rhythmType);
        if (this.rhythmType === 'VT') {
            this.consecutiveVTCount++;
            this.consecutiveVFCount = 0;
        } else if (this.rhythmType === 'VF') {
            this.consecutiveVFCount++;
            this.consecutiveVTCount = 0;
        } else {
            this.consecutiveVTCount = 0;
            this.consecutiveVFCount = 0;
        }
        
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
        
        if (this.cycleText) {
            this.cycleText.setText(this.getCycleLabel());
        }
        
        // Reset dello stato per il nuovo ciclo
        this.time.delayedCall(2000, () => {
            this.resetCycleState();
        });
    }

    // Cambia il ritmo (battito) a ogni nuovo ciclo - completamente random tra VT, VF, PEA, Asystole
    pickNewRhythmForCycle() {
        const rhythms = ['VT', 'VF', 'PEA', 'Asystole'];
        this.rhythmType = rhythms[Math.floor(Math.random() * rhythms.length)];
        this.currentRhythm = (this.rhythmType === 'VT' || this.rhythmType === 'VF') ? 'shockable' : 'non-shockable';
        console.log("Nuovo ritmo per ciclo:", this.rhythmType);
    }

    getRhythmLabel() {
        const labels = { VF: "Fibrillazione ventricolare (VF)", VT: "Tachicardia ventricolare (VT)", PEA: "PEA", Asystole: "Asistolia" };
        return labels[this.rhythmType] || this.rhythmType || "";
    }

    getCycleLabel() {
        return `Ciclo ${this.currentCycle}/${this.maxCycles}`;
    }

    resetCycleState() {
        this.ecgPatternPrev = this.getRhythmPattern().slice();
        this.pickNewRhythmForCycle();
        this.ecgPatternTarget = this.getRhythmPattern().slice();
        console.log("Reset stato ciclo (ritmo:", this.rhythmType, ", ciclo:", this.currentCycle, ")");
        this.ecgTransitionT = 0;
        this.ecgLastWasPeak = false;
        this.ecgLastValue = undefined;
        this.ecgLastLeftIdx = undefined;  // reset per beep a ogni gradino

        this.usedItems = 2;
        this.shockDelivered = false;
        this.medicationsGiven = false;
        this.pickedAdrenaline = false;
        this.pickedNacl = false;
        this.pickedAmiodarone = false;
        this.pickedSoluzione = false;

        this.cart.setInteractive({ useHandCursor: true });

        if (this.defibrillator) {
            this.defibrillator.setVisible(true);
            this.defibrillator.setInteractive({ useHandCursor: true });
        }
        if (this.shockBtnZone && this.shockBtnZone.visible) {
            this.shockBtnZone.setInteractive({ useHandCursor: true });
            this.shockBtnText.setInteractive({ useHandCursor: true });
            if (this.drawShockBtn) this.drawShockBtn(0x3498db);
            this.shockBtnText.setScale(1);
        }

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

        if (this.currentRhythm === 'shockable') {
            this.bottomText = "Shock con DAE, poi Compressioni";
            if ((this.rhythmType === 'VT' && this.consecutiveVTCount >= 3) ||
                (this.rhythmType === 'VF' && this.consecutiveVFCount >= 3)) {
                this.medicationSet = 'adrenaline_and_amiodarone';
                this.bottomText = "Shock, farmaci (carrello), poi Compressioni";
                this.showCartHint();
            } else {
                this.hideCartHint(true);
            }
        } else {
            this.updateCartHintForNonShockable();
        }
        this.showMessage(this.getRhythmLabel() + " – " + this.bottomText, false);
    }
}