class IntroScene extends Phaser.Scene {

    constructor() {
        super({ key: "IntroScene" });
    }
    
    preload() {
        // Carica eventuali risorse qui
    }
    
    create() {
        this.createContent();
        this.scale.on('resize', this.resize, this);
    }
    
    resize(gameSize) {
        const { width, height } = gameSize;
        
        if (!this.scene.isActive() || !this.cameras.main) {
            return;
        }
        
        this.cameras.main.setViewport(0, 0, width, height);
        this.createContent();
    }
    
    createContent() {
        if (this.children) {
            this.children.removeAll();
        }
        
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Determina orientamento
        const isPortrait = height > width;
        const minDim = Math.min(width, height);
        const maxDim = Math.max(width, height);
        
        // Safe area
        const safeMargin = width * 0.05;
        this.safeArea = new Phaser.Geom.Rectangle(
            safeMargin,
            0,
            width - safeMargin * 2,
            height
        );
        
        // Background
        const bg = this.add.rectangle(
            centerX, 
            centerY, 
            width, 
            height, 
            0xf2ccff
        );
        
        // Calcolo dimensioni responsive MIGLIORATE
        let boxWidth, boxHeight, iconSize, textFontSize, buttonFontSize;
        
        if (isPortrait) {
            // VERTICALE
            boxWidth = Math.min(this.safeArea.width * 0.9, 600);
            boxHeight = height * 0.45;
            iconSize = Math.round(minDim * 0.08);
            textFontSize = Math.max(16, Math.round(minDim * 0.025)); // Minimo 16px
            buttonFontSize = Math.max(18, Math.round(minDim * 0.03)); // Minimo 18px
        } else {
            // ORIZZONTALE - usa formule diverse
            boxWidth = width * 0.7;
            boxHeight = height * 0.7;
            iconSize = Math.round(height * 0.12);
            textFontSize = Math.max(14, Math.round(height * 0.035)); // Minimo 14px
            buttonFontSize = Math.max(16, Math.round(height * 0.045)); // Minimo 16px
        }
        
        const boxRadius = 20;
        
        // Box principale
        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(
            centerX - boxWidth / 2, 
            centerY - boxHeight / 2, 
            boxWidth, 
            boxHeight, 
            boxRadius
        );
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(
            centerX - boxWidth / 2, 
            centerY - boxHeight / 2, 
            boxWidth, 
            boxHeight, 
            boxRadius
        );
        
        // Icona emergenza
        this.add.text(centerX, centerY - boxHeight * 0.3, '🚨\n', {
            fontSize: `${iconSize * 0.9}px`,
            resolution: 2
        }).setOrigin(0.5);
        
        // Testo scenario
        const scenarioText = `Sei un infermiere del pronto soccorso.\n\n` +
                           `Un paziente è appena arrivato in codice rosso.\n` +
                           `Devi agire velocemente e in modo corretto.\n\n` +
                           `Sei pronto?`;
        
        this.add.text(centerX, centerY, scenarioText, {
            fontSize: `${textFontSize}px`,
            color: "#2c3e50",
            align: "center",
            wordWrap: { width: boxWidth * 0.85 },
            lineSpacing: isPortrait ? 8 : 4, // Più spazio in verticale
            resolution: 2
        }).setOrigin(0.5);
        
        // Bottone "Inizia"
        const startButton = this.add.text(
            centerX, 
            centerY + boxHeight * 0.49, 
            "Inizia", 
            {
                fontSize: `${buttonFontSize}px`,
                color: "#ffffff",
                backgroundColor: "rgba(52, 219, 108, 1)",
                padding: { x: 30, y: 15 },
                resolution: 2
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        // Eventi bottone
        startButton.on("pointerover", () => {
            startButton.setStyle({ backgroundColor: "rgba(46, 137, 64, 0.93)" });
        });
        
        startButton.on("pointerout", () => {
            startButton.setStyle({ backgroundColor: "rgba(52, 219, 108, 1)" });
        });
        
        startButton.on("pointerdown", () => {
            this.scene.start("HospitalScene");
        });
    }
    
    shutdown() {
        this.scale.off('resize', this.resize, this);
    }
    
    update() {
        // Update logic se necessario
    }
}