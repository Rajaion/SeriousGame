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
        // Aspetta un frame prima di ricreare
        this.time.delayedCall(50, () => {
            if (this.scene.isActive()) {
                this.createContent();
            }
        });
    }
    
    createContent() {
        if (this.children) {
            this.children.removeAll();
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const isPortrait = height > width;
        const minDim = Math.min(width, height);
        
        // Background
        this.add.rectangle(centerX, centerY, width, height, 0xf2ccff);
        
        // Dimensioni box e font
        let boxWidth, boxHeight, iconSize, textFontSize, buttonFontSize;
        
        if (isPortrait) {
            boxWidth = Math.min(width * 0.85, 600);
            boxHeight = height * 0.45;
            iconSize = Math.max(40, Math.round(minDim * 0.08));
            textFontSize = Math.max(16, Math.round(minDim * 0.025));
            buttonFontSize = Math.max(18, Math.round(minDim * 0.03));
        } else {
            boxWidth = width * 0.7;
            boxHeight = height * 0.7;
            iconSize = Math.max(35, Math.round(height * 0.12));
            textFontSize = Math.max(16, Math.round(height * 0.045));
            buttonFontSize = Math.max(18, Math.round(height * 0.055));
        }
        
        // Box
        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(
            centerX - boxWidth / 2, 
            centerY - boxHeight / 2, 
            boxWidth, 
            boxHeight, 
            20
        );
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(
            centerX - boxWidth / 2, 
            centerY - boxHeight / 2, 
            boxWidth, 
            boxHeight, 
            20
        );
        
        // Icona
        this.add.text(centerX, centerY - boxHeight * 0.3, '🚨', {
            fontSize: `${iconSize}px`,
            resolution: 2
        }).setOrigin(0.5);
        
        // Testo
        const scenarioText = `\nSei un infermiere del pronto soccorso.\n` +
                           `Un paziente è appena arrivato in codice rosso.\n` +
                           `Devi agire velocemente e in modo corretto.\n\n` +
                           `Sei pronto?`;
        
        this.add.text(centerX, centerY, scenarioText, {
            fontSize: `${textFontSize}px`,
            color: "#2c3e50",
            align: "center",
            wordWrap: { width: boxWidth * 0.90 },
            lineSpacing: isPortrait ? 8 : 4,
            resolution: 2
        }).setOrigin(0.5);
        
        // Bottone
        const startButton = this.add.text(
            centerX, 
            centerY + boxHeight * 0.35, 
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
        this.scale.off('resize', this.handleResize, this);
    }
}