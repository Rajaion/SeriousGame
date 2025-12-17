class MenuScene extends Phaser.Scene {
    
    constructor() {
        super({ key: "MenuScene" });
    }
    
    preload() {
        this.load.image("IconaMenu", "img/Menu.png");
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
        
        // Background che copre tutto
        this.add.rectangle(centerX, centerY, width, height, 0x4D5B8C);
        
        // Usa la dimensione minore per il calcolo
        const minDim = Math.min(width, height);
        
        // Dimensioni responsive
        const iconSize = minDim * 0.35;
        const buttonWidth = minDim * 0.35;
        const buttonHeight = minDim * 0.08;
        const fontSize = Math.round(minDim * 0.04);
        
        // Posizionamento
        const spacing = minDim * 0.15;
        const iconY = centerY - spacing / 2;
        const buttonY = centerY + spacing / 2;
        
        // Icona
        const icona = this.add.image(centerX, iconY, 'IconaMenu')
            .setDisplaySize(iconSize, iconSize);
        
        // Bottone grafico
        if (!this.graphics) {
            this.graphics = this.add.graphics();
        } else {
            this.graphics.clear();
        }
        
        const drawButton = (color) => {
            this.graphics.clear();
            this.graphics.fillStyle(color, 1);
            this.graphics.fillRoundedRect(
                centerX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                buttonHeight / 2
            );
        };
        
        drawButton(0xffffff);
        
        // Testo START
        const startText = this.add.text(centerX, buttonY, "START", {
            fontSize: `${fontSize}px`,
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            color: "#4D5B8C",
            resolution: 2
        }).setOrigin(0.5);
        
        // Rendi il testo interattivo
        startText.setInteractive({ useHandCursor: true });
        
        // Crea area interattiva più grande
        const hitArea = new Phaser.Geom.Rectangle(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );
        startText.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        
        // Eventi
        startText.on("pointerover", () => {
            drawButton(0xe0e0e0);
            startText.setColor("#2c3e50");
        });
        
        startText.on("pointerout", () => {
            drawButton(0xffffff);
            startText.setColor("#4D5B8C");
        });
        
        startText.on("pointerdown", () => {
            this.scene.start("IntroScene");
        });
    }
    
    // Quando la scena viene messa in pausa/fermata
    shutdown() {
        // Rimuovi il listener del resize
        this.scale.off('resize', this.resize, this);
    }
}