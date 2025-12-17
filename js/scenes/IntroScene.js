class IntroScene extends Phaser.Scene {

    constructor() {
        super({ key: "IntroScene" });
    }
    
    preload() {
        // Carica eventuali risorse qui
    }
    
    create() {
        // Crea il contenuto iniziale
        this.createContent();
        
        // Listener per ridimensionamento
        this.scale.on('resize', this.resize, this);
    }
    
    resize(gameSize) {
        const { width, height } = gameSize;
        
        // CONTROLLA che la scena sia attiva e la camera esista
        if (!this.scene.isActive() || !this.cameras.main) {
            return;
        }
        
        // Aggiorna le dimensioni della camera
        this.cameras.main.setViewport(0, 0, width, height);
        
        // Ricrea tutto il contenuto
        this.createContent();
    }
    
    createContent() {
        // Pulisci tutto
        if (this.children) {
            this.children.removeAll();
        }
        
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Usa la dimensione minore per calcoli responsive
        const minDim = Math.min(width, height);
        
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
        
        // Dimensioni responsive per il box
        const boxWidth = Math.min(this.safeArea.width * 0.9, 600);
        const boxHeight = minDim * 0.5;
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
        const iconSize = Math.round(minDim * 0.08);
        this.add.text(centerX, centerY - boxHeight * 0.3, '🚨', {
            fontSize: `${iconSize}px`
        }).setOrigin(0.5);
        
        // Testo scenario
        const scenarioText = `Sei un infermiere del pronto soccorso.\n\n` +
                           `Un paziente è appena arrivato in codice rosso.\n` +
                           `Devi agire velocemente e in modo corretto.\n\n` +
                           `Sei pronto?`;
        
        const textFontSize = Math.round(minDim * 0.025);
        this.add.text(centerX, centerY, scenarioText, {
            fontSize: `${textFontSize}px`,
            color: "#2c3e50",
            align: "center",
            wordWrap: { width: boxWidth * 0.85 }
        }).setOrigin(0.5);
        
        // Bottone "Let's go"
        const buttonFontSize = Math.round(minDim * 0.03);
        const startButton = this.add.text(
            centerX, 
            centerY + boxHeight * 0.35, 
            "Inizia", 
            {
                fontSize: `${buttonFontSize}px`,
                color: "#ffffff",
                backgroundColor: "rgba(52, 219, 108, 1)",
                padding: { x: 30, y: 15 }
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
    
    // Rimuovi listener quando la scena si ferma
    shutdown() {
        this.scale.off('resize', this.resize, this);
    }
    
    update() {
        // Update logic se necessario
    }
}