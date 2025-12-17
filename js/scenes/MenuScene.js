class MenuScene extends Phaser.Scene {
    
    constructor() {
        super({ key: "MenuScene" });
    }
    
    preload() {
        this.load.image("IconaMenu", "img/Menu.png");
    }
    
    create() {
        this.createContent();
        
        // Listener per il ridimensionamento
        this.scale.on('resize', this.handleResize, this);
    }
    
    createContent() {
        // Pulisci eventuali elementi precedenti
        this.children.removeAll();
        
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Calcola dimensioni responsive
        const minDimension = Math.min(width, height);
        const maxDimension = Math.max(width, height);
        
        // Background
        const bg = this.add.rectangle(
            centerX, 
            centerY, 
            width, 
            height, 
            0x4D5B8C
        );
        
        // Dimensioni responsive basate sulla dimensione minima
        const titleFontSize = Math.round(minDimension * 0.06);
        const iconSize = Math.round(minDimension * 0.45);
        const buttonWidth = Math.round(minDimension * 0.5);
        const buttonHeight = Math.round(minDimension * 0.1);
        const buttonFontSize = Math.round(minDimension * 0.05);
        
        // Posizionamento dinamico
        const titleY = centerY - (maxDimension * 0.35);
        const iconY = centerY - (maxDimension * 0.05);
        const buttonY = centerY + (maxDimension * 0.25);
        
        // Titolo
        const title = this.add.text(centerX, titleY, 'Emergenza medica', {
            fontSize: `${titleFontSize}px`,
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            color: "#2c3e50",
            align: "center",
            padding: { x: 20, y: 15 },
            backgroundColor: '#f0f0f0',
            stroke: '#888',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Icona ospedale
        const icona = this.add.image(centerX, iconY, 'IconaMenu')
            .setDisplaySize(iconSize, iconSize);
        
        // Bottone grafico
        this.graphics = this.add.graphics();
        
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
        
        // Testo del bottone
        const startText = this.add.text(centerX, buttonY, "Start", {
            fontSize: `${buttonFontSize}px`,
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            color: "#4D5B8C"
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        // Area interattiva più grande
        const hitArea = new Phaser.Geom.Rectangle(
            -buttonWidth / 2, 
            -buttonHeight / 2, 
            buttonWidth, 
            buttonHeight
        );
        startText.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        
        // Eventi
        startText.on("pointerover", () => {
            drawButton(0xDFE6F0);
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
    
    handleResize(gameSize) {
        // Ricrea tutto il contenuto con le nuove dimensioni
        this.createContent();
    }
}