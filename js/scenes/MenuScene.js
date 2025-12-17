class MenuScene extends Phaser.Scene {
    
    constructor() {
        super({ key: "MenuScene" });
    }
    
    preload() {
        this.load.image("IconaMenu", "img/Menu.png");
    }
    
    create() {
        this.createContent();
        
        // Usa scale event invece di resize
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
        
        // Background
        this.add.rectangle(centerX, centerY, width, height, 0x4D5B8C);
        
        // Calcola dimensioni
        const minDim = Math.min(width, height);
        const iconSize = minDim * 0.35;
        const buttonWidth = minDim * 0.35;
        const buttonHeight = minDim * 0.08;
        const fontSize = Math.round(minDim * 0.04);
        
        const spacing = minDim * 0.15;
        const iconY = centerY - spacing / 2;
        const buttonY = centerY + spacing / 2;
        
        // Icona
        this.add.image(centerX, iconY, 'IconaMenu')
            .setDisplaySize(iconSize, iconSize);
        
        // Bottone
        if (!this.graphics) {
            this.graphics = this.add.graphics();
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
        
        startText.setInteractive({ useHandCursor: true });
        
        const hitArea = new Phaser.Geom.Rectangle(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );
        startText.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        
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
    
    shutdown() {
        this.scale.off('resize', this.handleResize, this);
    }
}