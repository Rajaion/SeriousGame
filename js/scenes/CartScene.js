/**
 * PROTOCOLLO ALS (secondo PDF):
 *
 * VT (Tachicardia Ventricolare): Shock sempre. Adrenalina + NaCl sempre; dopo averli dati, anche Amiodarone + SG 5% se VT presente 3 volte di fila.
 * VF (Fibrillazione Ventricolare): Shock sempre. Adrenalina + NaCl sempre; dopo averli dati, anche Amiodarone + SG 5% se VF presente 3 volte di fila.
 * PEA/Asistolia: NO shock. Adrenalina + NaCl: prima volta che si presenta, poi a cicli alterni.
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
        this.bottomText = "";
        this.monitorImg = null;
        this.ecgImage = null; // Immagine ECG nello spazio del monitor
        this.defibrillator = null;
        this.currentRhythm = null; // 'shockable' o 'non-shockable'
        this.rhythmType = null; // Tipo specifico: 'VF', 'VT', 'PEA', 'Asystole'
        this.medicationSet = null; // PDF: Adrenalina+sol.fisiologica (NaCl) a seguire, oppure Amiodarone+SG 5% a seguire
        this.pickedAmiodarone = false;
        this.pickedSoluzione = false;
        this.currentCycle = 1; // Ciclo corrente
        this.maxCycles = 5; // Numero massimo di cicli (dal 4° in poi farmaci per shockable)
        this.shockDelivered = false; // Se lo shock è stato erogato nel ciclo corrente
        this.medicationsGiven = false; // Se i farmaci sono stati somministrati nel ciclo corrente
        this.ecgBeepAccumulator = 0;
        this.ecgLastBeepRhythm = null;
        this.ecgArea = null; // { x, y, w, h } per sweep
        this.ecgSweepX = 0;
        this.ecgSweepSpeed = 35; // px/sec
        this.initialMedicationSet = null; // Set farmaci scelto una sola volta per tutta la partita (stessi farmaci ogni ciclo)
        this.consecutiveVTCount = 0; // VT presente N volte di fila
        this.consecutiveVFCount = 0; // VF presente N volte di fila
        this.medsRequiredThisCycle = false; // true se il carrello è visibile e servono farmaci prima di Compressioni
        this.medicationPhase = 1; // Per VT/VF 3x: 1=Adr+NaCl, 2=Amiodarone+SG 5%
        this.compressionsInProgress = false; // true durante la pausa 2s tra cicli (blocca spam)
        this.peaOrAsystoleAppearanceCount = 0;
        this.medsTaken = false; // true se farmaci già prelevati dal bottone in questo ciclo
    }

    preload() {
        this.load.image("Monitor", "img/Monitor.png");
        // ECG: ECG_TV, ECG_FV, ECG_PEA, ECG_Asystole
        this.load.image("ECG_VT", "img/ECG_TV.png");
        this.load.image("ECG_VF", "img/ECG_FV.png");
        this.load.image("ECG_PEA", "img/ECG_PEA.png");
        this.load.image("ECG_Asystole", "img/ECG_Asystole.png");
        this.load.image("Adrenalina", "img/Adrenalina.png");
        this.load.image("Nacl", "img/Nacl.png");
        this.load.image("Sfondo", "img/Mattone.png");
        this.load.image("soluzione", "img/soluzione_glucosata.png");
        this.load.image("amiodarone", "img/Amiodarone.png");
        this.load.image("defibrillatore", "img/defibrillatore.png");
        
        // Carica i suoni (percorso relativo alla pagina che carica il gioco, es. index.html)
        this.load.audio("heartBeep", "audio/heart_beep.mp3");
        this.load.audio("defibShock", "audio/defibrillator.mp3");
        this.load.on("loaderror", (f) => {
            if (f.key && (f.key === "heartBeep" || f.key === "defibShock" || f.key.startsWith("ECG_"))) {
                console.warn("Asset non trovato:", f.key);
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
        this.medicationPhase = 1;
        this.compressionsInProgress = false;
        this.peaOrAsystoleAppearanceCount = 0;
        this.medsTaken = false;
        this.createBackground();
        this.createTopBottomBars();
        this.createTexts();
        this.setupEvents();
        
        this.pickNewRhythmForCycle();
        if (this.rhythmType === 'PEA' || this.rhythmType === 'Asystole') {
            this.peaOrAsystoleAppearanceCount++;
        }
        this.updateInfoBattito();
        if (this.currentRhythm === 'shockable') {
            this.setupShockable();
        } else {
            this.setupNonShockable();
        }

    }

    updateInfoBattito() {
        if (this.infoBattitoText && this.rhythmType) {
            var label = this.getRhythmLabel();
            this.infoBattitoText.setText("Battito: " + label + " - decidere come agire");
        }
    }

    setupShockable() {
        this.updateInfoBattito();
        this.time.delayedCall(100, () => this.positionDefibrillator());
        if (this.cycleText) this.cycleText.setText(this.getCycleLabel());
        this.hideCartHint(true);
    }

    setupNonShockable() {
        this.updateInfoBattito();
        this.medicationSet = 'adrenaline_nacl';
        this.time.delayedCall(100, () => this.positionDefibrillator());
        if (this.cycleText) this.cycleText.setText(this.getCycleLabel());
        this.updateCartHintForNonShockable();
    }

    createBackground() {

        const backGround = this.add.image(0, 0, "Sfondo").setOrigin(0, 0);
        backGround.setScale(Math.max(1920 / backGround.width, 1080 / backGround.height));

        this.monitorImg = this.add.image(192, 540, "Monitor").setScale(0.4);
        this.monitorImg.setDepth(1);

        this.patientCart = this.add.rectangle(864, 756, 500, 500)
            .setScale(0.8)
            .setAlpha(0.01)
            .setInteractive({ useHandCursor: true });

        // Posizione bottone Farmaci (+30px a destra: 1525+30=1555)
        this.medsAreaX = 1580;
        this.medsAreaY = 760;
        // Spawn medicine (+50px sotto: 790+50=840)
        this.medsSpawnY = 500;

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

        // Freccia sotto il bottone Farmaci che punta verso l'alto (al bottone)
        this.cartArrowHint = this.add.graphics();
        this.cartArrowBaseX = this.medsAreaX;
        this.cartArrowBaseY = this.medsAreaY - 25;
        this.cartHintVisible = false;
        this.arrowBobTween = null;
        this.updateCartArrowGraphics();
        this.cartArrowHint.setVisible(false).setDepth(10);

        const instructionBox = this.add.graphics();
        const boxW = 1100, boxX = 960 - boxW / 2; // box InfoBattito: +150px in orizzontale
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

        // Bottone "Farmaci" visibile (come Compressioni e Shock) - identifica dove interagire per i farmaci
        this.farmaciBtnW = 200;
        this.farmaciBtnH = 60;
        this.farmaciBtnX = this.medsAreaX - this.farmaciBtnW / 2;
        this.farmaciBtnY = this.medsAreaY - 120;
        this.farmaciButton = this.add.graphics();
        const drawFarmaciBtn = (color) => {
            this.farmaciButton.clear();
            this.farmaciButton.fillStyle(color, 1);
            this.farmaciButton.fillRoundedRect(this.farmaciBtnX, this.farmaciBtnY, this.farmaciBtnW, this.farmaciBtnH, 10);
            this.farmaciButton.lineStyle(3, 0x000000, 1);
            this.farmaciButton.strokeRoundedRect(this.farmaciBtnX, this.farmaciBtnY, this.farmaciBtnW, this.farmaciBtnH, 10);
        };
        drawFarmaciBtn(0x3498db);
        this.drawFarmaciBtn = drawFarmaciBtn;
        this.farmaciBtnZone = this.add.rectangle(this.medsAreaX, this.farmaciBtnY + this.farmaciBtnH / 2, this.farmaciBtnW, this.farmaciBtnH)
            .setInteractive({ useHandCursor: true });
        this.farmaciBtnText = this.add.text(this.medsAreaX, this.farmaciBtnY + this.farmaciBtnH / 2, "Farmaci", {
            fontSize: "28px",
            color: "#000000",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.textElements.push(this.farmaciBtnText);
        this.updateFarmaciButtonState();
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

        // Info battito: tipo di ritmo corrente, aggiornato ad ogni nuovo ciclo
        this.infoBattitoText = this.add.text(960, 162, "", {
            fontSize: `38px`,
            color: '#2c3e50',
            fontFamily: "Poppins",
            wordWrap: { width: 1050 },
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(this.infoBattitoText);

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
        var onFarmaciClick = () => this.onFarmaciClick();

        // Pulsante Farmaci: unico punto di interazione per prelevare i farmaci
        this.farmaciBtnZone.removeAllListeners();
        this.farmaciBtnText.removeAllListeners();
        var farmaciOver = () => { if (this.medsRequiredThisCycle && !this.medsTaken) { this.drawFarmaciBtn(0x5DADE2); this.farmaciBtnText.setScale(1.05); } };
        var farmaciOut = () => { this.updateFarmaciButtonState(); this.farmaciBtnText.setScale(1); };
        this.farmaciBtnZone.on("pointerover", farmaciOver).on("pointerout", farmaciOut).on("pointerdown", onFarmaciClick);
        this.farmaciBtnText.on("pointerover", farmaciOver).on("pointerout", farmaciOut).on("pointerdown", onFarmaciClick);

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
        this.updateECGBeep(delta);
        this.updateECGSweep(delta);
        if (typeof CartMedications !== "undefined") CartMedications.update(this);
    }

    updateECGSweep(delta) {
        if (!this.ecgArea || !this.ecgSweepBar) return;
        var dt = (delta || 0) / 1000;
        var margin = 8;
        this.ecgSweepX += this.ecgSweepSpeed * dt;
        if (this.ecgSweepX > this.ecgArea.x + this.ecgArea.w - margin) this.ecgSweepX = this.ecgArea.x;
        this.ecgSweepBar.x = this.ecgSweepX;
    }

    updateCartArrowGraphics() {
        this.cartArrowHint.clear();
        this.cartArrowHint.fillStyle(0xe74c3c, 0.95);
        this.cartArrowHint.lineStyle(2, 0xc0392b, 1);
        // Triangolo verso l'alto (punta al bottone Farmaci): punta (0,-20), base (-24,20) e (24,20)
        this.cartArrowHint.fillTriangle(0, -20, -24, 20, 24, 20);
        this.cartArrowHint.strokeTriangle(0, -20, -24, 20, 24, 20);
    }

    showCartHint() {
        if (!this.cartArrowHint) return;
        this.medsRequiredThisCycle = true;
        this.updateFarmaciButtonState();
        this.cartHintVisible = true;
        this.cartArrowHint.setVisible(true);
        this.cartArrowHint.x = this.cartArrowBaseX;
        this.cartArrowHint.y = this.cartArrowBaseY;
        if (this.arrowBobTween) this.arrowBobTween.remove();
        this.arrowBobTween = this.tweens.add({
            targets: this.cartArrowHint,
            y: this.cartArrowBaseY - 16,
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
        this.updateFarmaciButtonState();
    }

    updateFarmaciButtonState() {
        if (!this.farmaciButton || !this.farmaciBtnZone) return;
        var canUse = this.medsRequiredThisCycle && !this.medsTaken;
        if (canUse) {
            this.farmaciButton.setVisible(true).setAlpha(1);
            this.farmaciBtnZone.setInteractive({ useHandCursor: true }).setAlpha(1);
            this.farmaciBtnText.setInteractive({ useHandCursor: true }).setAlpha(1);
            this.drawFarmaciBtn(0x3498db);
        } else {
            this.farmaciButton.setVisible(true).setAlpha(1);
            this.farmaciBtnZone.setAlpha(1);
            this.farmaciBtnText.setAlpha(1);
            this.drawFarmaciBtn(0x3498db);
        }
    }

    updateCartHintForNonShockable() {
        // PEA/Asystole: farmaci ogni volta che si presenta (es. ciclo 2 e ciclo 4 se ricompare)
        if (this.rhythmType === 'PEA' || this.rhythmType === 'Asystole') {
            this.medicationSet = 'adrenaline_nacl';
            this.showCartHint();
        }
    }

    onFarmaciClick() {
        if (this.medsTaken) return; // Farmaci già prelevati
        if (this.currentRhythm === 'shockable') {
            if (!this.shockDelivered) {
                this.showMessage("Azione non possibile", false);
                return;
            }
            if (this.rhythmType === 'VT' && this.consecutiveVTCount < 3) {
                this.showMessage("Azione non possibile", false);
                return;
            }
            if (this.rhythmType === 'VF' && this.consecutiveVFCount < 3) {
                this.showMessage("Azione non possibile", false);
                return;
            }
            }
        if (this.medicationSet === 'adrenaline_nacl') {
            this.adrenSpawn();
            this.naclSpawn();
        } else if (this.medicationSet === 'amiodarone_glucose') {
            this.amiodaroneSpawn();
            this.soluzioneSpawn();
        } else if (this.medicationSet === 'adrenaline_and_amiodarone') {
            this.adrenSpawn();
            this.naclSpawn();
            this.usedItems = 2;
        }
        this.medsTaken = true;
        this.updateFarmaciButtonState();
        this.hideCartHint();
    }

    /** Clic sul bottone Compressioni: avanza al ciclo successivo (dopo shock nei cicli 1-3 shockable). */
    onCompressioniClick() {
        this.drawCompressioniBtn(0x3498db);
        this.compressioniText.setScale(1);
        if (this.gameEnded) return;
        if (this.compressionsInProgress) return; // Blocca spam durante la pausa tra cicli
        if (this.currentRhythm === 'shockable' && !this.shockDelivered) {
            this.showMessage("Azione non possibile", false);
            return;
        }
        if (this.medsRequiredThisCycle && !this.medicationsGiven) {
            this.showMessage("Azione non possibile", false);
            return;
        }
        this.completeCycle();
    }

    adrenSpawn() {
        this.adrenalina.setDepth(15);
        this.adrenalinaText.setDepth(15);
        this.adrenalina.x = this.medsAreaX + 70;
        this.adrenalina.y = this.medsSpawnY;
        const pos = this.adrenalina.getWorldTransformMatrix();
        this.adrenalinaText.x = pos.tx;
        this.adrenalinaText.y = pos.ty - 100;
    }

    naclSpawn() {
        this.nacl.setDepth(15);
        this.naclText.setDepth(15);
        this.nacl.x = this.medsAreaX - 20;
        this.nacl.y = this.medsSpawnY;
        const pos = this.nacl.getWorldTransformMatrix();
        this.naclText.x = pos.tx;
        this.naclText.y = pos.ty - 75;
    }

    amiodaroneSpawn() {
        this.amiodarone.setDepth(15);
        this.amiodaroneText.setDepth(15);
        this.amiodarone.x = this.medsAreaX + 30;
        this.amiodarone.y = this.medsSpawnY;
        const pos = this.amiodarone.getWorldTransformMatrix();
        this.amiodaroneText.x = pos.tx;
        this.amiodaroneText.y = pos.ty - 100;
    }

    soluzioneSpawn() {
        this.soluzione.setDepth(15);
        this.soluzioneText.setDepth(15);
        this.soluzione.x = this.medsAreaX - 30;
        this.soluzione.y = this.medsSpawnY;
        const pos = this.soluzione.getWorldTransformMatrix();
        this.soluzioneText.x = pos.tx;
        this.soluzioneText.y = pos.ty - 75;
    }

    clickedWrongChoice() {
        this.showMessage("Ordine sbagliato", false);
    }

    showMessage(message, isSuccess) {
        if (this.bottomTextSpace) {
            this.bottomTextSpace.setColor(isSuccess ? "#167e30ff" : "#ff0000");
            this.bottomTextSpace.setText(message);
        }
    }

    moveObjAndText(obj, text) {
        obj.x = this.input.x;
        obj.y = this.input.y;
        text.x = this.input.x;
        text.y = this.input.y - 50;
    }

    positionDefibrillator() {
        if (!this.monitorImg || !this.defibrillator) return;
        var b = this.monitorImg.getBounds();
        this.defibrillator.setVisible(true);
        this.defibrillator.x = b.right + 110;
        this.defibrillator.y = b.centerY - 180;
        this.defibrillator.disableInteractive();
        this.createShockButton(this.defibrillator.x, this.defibrillator.y);
        this.createECGImage();
    }

    createECGImage() {
        if (!this.monitorImg) return;
        var b = this.monitorImg.getBounds();
        var w = b.width * 0.54;
        var h = b.height * 0.30;
        var x = b.centerX - w / 2 - 26;
        var y = b.centerY - h / 2 - 30;
        this.ecgArea = { x: x, y: y, w: w, h: h };
        this.ecgSweepX = x;
        var key = "ECG_" + (this.rhythmType || "VT");
        if (this.ecgImage) this.ecgImage.destroy();
        if (this.ecgSweepBar) this.ecgSweepBar.destroy();
        if (this.textures.exists(key)) {
            this.ecgImage = this.add.image(x + w / 2, y + h / 2, key);
            this.ecgImage.setDisplaySize(w, h);
        } else {
            var g = this.add.graphics();
            g.fillStyle(0x1a1a1a, 0.9);
            g.fillRect(x, y, w, h);
            g.setDepth(2);
            this.ecgImage = g;
        }
        this.ecgImage.setDepth(2);
        this.ecgSweepBar = this.add.rectangle(x, y + h / 2, 8, h, 0x000000, 0.65);
        this.ecgSweepBar.setDepth(3);
    }

    updateECGImage() {
        if (!this.ecgImage || !this.rhythmType) return;
        var key = "ECG_" + this.rhythmType;
        if (this.ecgImage.setTexture && this.textures.exists(key)) this.ecgImage.setTexture(key);
    }

    updateECGBeep(delta) {
        if (!this.rhythmType || !this.sound || !this.scene.isActive()) return;
        if (this.ecgLastBeepRhythm !== this.rhythmType) {
            this.ecgLastBeepRhythm = this.rhythmType;
            this.ecgBeepAccumulator = 0;
        }
        var bpmMap = { VT: 100, VF: 110, PEA: 55, Asystole: 0 };
        var bpm = bpmMap[this.rhythmType];
        if (!bpm || bpm <= 0) return;
        var intervalSec = 60 / bpm;
        this.ecgBeepAccumulator = (this.ecgBeepAccumulator || 0) + (delta / 1000);
        if (this.ecgBeepAccumulator >= intervalSec) {
            this.ecgBeepAccumulator -= intervalSec;
            try { this.sound.play("heartBeep", { volume: 0.7 }); } catch (e) {}
        }
    }

    deliverShock() {
        if (this.currentRhythm !== 'shockable') {
            this.showMessage("Sbagliato", false);
            if (typeof window.logGameError === "function") window.logGameError("Cart", "Shock su ritmo non defibrillabile");
            return;
        }
        
        // Shock corretto
        this.shockDelivered = true;
        try {
            if (this.sound) this.sound.play("defibShock");
        } catch (e) { /* ignora */ }
        this.showMessage("Corretto", true);
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
        this.compressionsInProgress = true;
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
        
        // Se siamo all'ultimo ciclo, termina (punti garantiti anche per l'ultimo)
        if (this.currentCycle >= this.maxCycles) {
            gameState.score += 20;
            if (this.pointsText) this.pointsText.setText("Score: " + gameState.score);
            this.time.delayedCall(2000, () => {
                this.compressionsInProgress = false;
                this.gameEnded = true;
                this.scene.start("EndScene");
            });
            return;
        }
        
        // Passa al ciclo successivo: punti garantiti
        this.currentCycle++;
        gameState.score += 20;
        if (this.pointsText) this.pointsText.setText("Score: " + gameState.score);
        
        if (this.cycleText) {
            this.cycleText.setText(this.getCycleLabel());
        }
        
        // Reset dello stato per il nuovo ciclo
        this.time.delayedCall(2000, () => {
            this.compressionsInProgress = false;
            this.resetCycleState();
        });
    }

    // Cambia il ritmo (battito) a ogni nuovo ciclo - completamente random tra VT, VF, PEA, Asystole
    pickNewRhythmForCycle() {
        const rhythms = ['VT', 'VF', 'PEA', 'Asystole'];
        this.rhythmType = rhythms[Math.floor(Math.random() * rhythms.length)];
        this.currentRhythm = (this.rhythmType === 'VT' || this.rhythmType === 'VF') ? 'shockable' : 'non-shockable';
    }

    getRhythmLabel() {
        const labels = { VF: "Fibrillazione ventricolare (VF)", VT: "Tachicardia ventricolare (VT)", PEA: "PEA", Asystole: "Asistolia" };
        return labels[this.rhythmType] || this.rhythmType || "";
    }

    getCycleLabel() {
        return `Ciclo ${this.currentCycle}/${this.maxCycles}`;
    }

    resetCycleState() {
        this.pickNewRhythmForCycle();
        if (this.rhythmType === 'PEA' || this.rhythmType === 'Asystole') {
            this.peaOrAsystoleAppearanceCount++;
        }
        this.updateECGImage();

        this.usedItems = 2;
        this.shockDelivered = false;
        this.medicationsGiven = false;
        this.medicationPhase = 1;
        this.pickedAdrenaline = false;
        this.pickedNacl = false;
        this.pickedAmiodarone = false;
        this.pickedSoluzione = false;

        this.medsTaken = false;

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
            if ((this.rhythmType === 'VT' && this.consecutiveVTCount >= 3) ||
                (this.rhythmType === 'VF' && this.consecutiveVFCount >= 3)) {
                this.medicationSet = 'adrenaline_and_amiodarone';
                this.showCartHint();
            } else {
                this.hideCartHint(true);
            }
        } else {
            this.updateCartHintForNonShockable();
        }
        this.updateFarmaciButtonState();
        this.updateInfoBattito();
        this.showMessage("Nuovo ciclo - Ciclo " + this.currentCycle, true);
    }
}