class IntroScene extends Phaser.Scene {

    constructor() {
        super({ key: "IntroScene" });
    }
    
    preload() {
        // Carica risorse
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

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background - STESSO COLORE DELLA MENUSCENE
        this.add.rectangle(centerX, centerY, width, height, 0x104D5B);

        // CREA CONTAINER con coordinate fisse (riferimento 1920x1080)
        this.mainContainer = this.add.container(0, 0);

        const refCenterX = 960;  // Centro di 1920
        const refCenterY = 540;  // Centro di 1080

        // Dimensioni di riferimento per il box
        const boxWidth = 1344;   // 70% di 1920
        const boxHeight = 756;   // 70% di 1080

        // Box con grafica
        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(
            refCenterX - boxWidth / 2, 
            refCenterY - boxHeight / 2, 
            boxWidth, 
            boxHeight, 
            20
        );
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(
            refCenterX - boxWidth / 2, 
            refCenterY - boxHeight / 2, 
            boxWidth, 
            boxHeight, 
            20
        );
        
        // Icona emoji
        const icon = this.add.text(refCenterX, refCenterY - boxHeight * 0.3, '🚨', {
            fontSize: '130px',
            resolution: 2
        }).setOrigin(0.5);
        
        // Testo scenario
        const scenarioText = `\nSei un infermiere del pronto soccorso.\n` +
                           `Un paziente è appena arrivato in codice rosso.\n` +
                           `Devi agire velocemente e in modo corretto.\n\n` +
                           `Sei pronto?`;
        
        const textContent = this.add.text(refCenterX, refCenterY, scenarioText, {
            fontSize: '50px',  
            color: "#2c3e50",
            align: "center",
            wordWrap: { width: boxWidth * 0.90 },
            lineSpacing: 4,
            resolution: 8
        }).setOrigin(0.5);
        
        // Bottone "Inizia"
        const buttonBg = this.add.graphics();
        const buttonWidth = 200;
        const buttonHeight = 70;
        const buttonX = refCenterX - buttonWidth / 2;
        const buttonY = refCenterY + boxHeight * 0.35 - buttonHeight / 2;
        
        const drawButton = (color) => {
            buttonBg.clear();
            buttonBg.fillStyle(color, 1);
            buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        };
        
        drawButton(0x34DB6C); // Verde iniziale
        
        const startButton = this.add.text(
            refCenterX, 
            refCenterY + boxHeight * 0.35, 
            "Inizia", 
            {
                fontSize: '59px', // ~5.5% di 1080
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                resolution: 2
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        startButton.on("pointerover", () => {
            drawButton(0x2E8940); // Verde scuro
            startButton.setScale(1.05);
        });
        
        startButton.on("pointerout", () => {
            drawButton(0x34DB6C); // Verde normale
            startButton.setScale(1);
        });
        
        startButton.on("pointerdown", () => {
            drawButton(0x27ae60); // Verde click
            this.time.delayedCall(100, () => {
                this.scene.start("HospitalScene");
            });
        });
        
        // Aggiungi tutto al container
        this.mainContainer.add([box, buttonBg, icon, textContent, startButton]);

        // SCALA il container per adattarlo allo schermo
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        const scale = Math.min(scaleX, scaleY); // Mantieni proporzioni

        this.mainContainer.setScale(scale);

        // Centra il container scalato
        this.mainContainer.setPosition(
            centerX - (960 * scale),
            centerY - (540 * scale)
        );
    }
    
    shutdown() {
        this.scale.off('resize', this.handleResize, this);
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
    }
}