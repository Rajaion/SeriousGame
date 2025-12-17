class MenuScene extends Phaser.Scene {
    
    constructor() {
        super({ key: "MenuScene" });
    }
    
    preload() {
        this.load.image("IconaMenu", "img/Menu.png");
    }
    
    create() {
        this.createContent();
        this.scale.on('resize', this.handleResize, this);
    }
    
    createContent() {
        // Pulisci elementi precedenti
        this.children.removeAll();
        
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Background
        this.add.rectangle(centerX, centerY, width, height, 0x4D5B8C);
        
        // Calcola dimensioni responsive basate sulla dimensione minore
        const minDim = Math.min(width, height);
        
        // Icona (più grande, centrata)
        const iconSize = minDim * 0.35;
        const icona = this.add.image(centerX, centerY, 'IconaMenu')
            .setDisplaySize(iconSize, iconSize);
        
        // Bottone START sotto l'icona
        const buttonWidth = minDim * 0.35;
        const buttonHeight = minDim * 0.08;
        const buttonY = centerY + (iconSize / 2) + (buttonHeight * 2);
        
        // Disegna il bottone
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
        
        // Testo START
        const startText = this.add.text(centerX, buttonY, "START", {
            fontSize: `${Math.round(minDim * 0.04)}px`,
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            color: "#4D5B8C"
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        // Area cliccabile più grande
        const hitArea = new Phaser.Geom.Rectangle(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );
        startText.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        
        // Eventi hover
        startText.on("pointerover", () => {
            drawButton(0xe0e0e0);
        });
        
        startText.on("pointerout", () => {
            drawButton(0xffffff);
        });
        
        startText.on("pointerdown", () => {
            this.scene.start("IntroScene");
        });
    }
    
    handleResize() {
        this.createContent();
    }
}