class ReviewScene extends Phaser.Scene {
    constructor() {
        super({ key: "ReviewScene" });
        
        // Configurazione posizioni (riferimento 1920x1080)
        this.refPositions = {
            refCenter: { x: 960, y: 540 },
            title: { x: 960, y: 150 },
            box1: { x: 960, y: 340 },  // Ospedale
            box2: { x: 960, y: 500 },  // Paziente
            box3: { x: 960, y: 660 }   // Carro
        };
    }

    preload() {
        // Carica risorse se necessario
    }

    create() {
        this.createContent();
        this.scale.on('resize', this.handleResize, this);
    }

    handleResize() {
        this.time.delayedCall(50, () => {
            if (this.scene.isActive()) {
                this.createContent();
            }
        });
    }

    createContent() {
        // Pulisci tutto
        this.children.removeAll();
        this.textElements = [];

        const { width, height, centerX, centerY, scale } = this.getScreenMetrics();
        const { borderWidth, borderHeight } = this.getBorderDimensions(scale);

        this.createBackground(centerX, centerY, borderWidth, borderHeight);
        this.createGameContent(centerX, centerY, scale);
        this.createTexts(centerX, centerY, scale);
    }

    getScreenMetrics() {
        const width = this.scale.width;
        const height = this.scale.height;
        const scale = Math.min(width / 1920, height / 1080);
        return {
            width,
            height,
            centerX: width / 2,
            centerY: height / 2,
            scale
        };
    }

    getBorderDimensions(scale) {
        return {
            borderWidth: 1920 * scale,
            borderHeight: 1080 * scale
        };
    }

    createBackground(centerX, centerY, borderWidth, borderHeight) {
        // Background con stesso colore di MenuScene e IntroScene
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight
        );
        this.sceneBorder.fillStyle(0x2c3e50, 1);  // Stesso colore di MenuScene/IntroScene
        this.sceneBorder.fillRoundedRect(
            centerX - borderWidth / 2,
            centerY - borderHeight / 2,
            borderWidth,
            borderHeight,
            0
        );
    }

    createGameContent(centerX, centerY, scale) {
        const { refCenter } = this.refPositions;
        this.mainContainer = this.add.container(0, 0);

        // Box titolo (più grande)
        this.createBoxInContainer(refCenter.x, this.refPositions.title.y, 700, 80);

        // Box Ospedale (più grande)
        this.createBoxInContainer(refCenter.x, this.refPositions.box1.y, 900, 140);

        // Box Paziente (più grande)
        this.createBoxInContainer(refCenter.x, this.refPositions.box2.y, 900, 140);

        // Box Carro (più grande)
        this.createBoxInContainer(refCenter.x, this.refPositions.box3.y, 900, 140);

        // Scala e posiziona container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenter.x * scale),
            centerY - (refCenter.y * scale)
        );
    }

    createTexts(centerX, centerY, scale) {
        const { refCenter, title, box1, box2, box3 } = this.refPositions;
        const minFontSize = 40 * scale;

        // Font sizes responsive (più grandi per utilizzare meglio lo spazio)
        const titleFontSize = Math.max(minFontSize, 60 * scale) * 0.9;
        const headerFontSize = Math.max(minFontSize, 55 * scale) * 0.8;
        const bodyFontSize = Math.max(minFontSize, 45 * scale) * 0.7;

        // Calcola posizioni reali
        const titleTextX = centerX + ((title.x - refCenter.x) * scale);
        const titleTextY = centerY + ((title.y - refCenter.y) * scale);

        const box1TextX = centerX + ((box1.x - refCenter.x) * scale);
        const box1HeaderY = centerY + (((box1.y - 15) - refCenter.y) * scale);  // Abbassato di 10px
        const box1BodyY = centerY + (((box1.y + 10) - refCenter.y) * scale);

        const box2TextX = centerX + ((box2.x - refCenter.x) * scale);
        const box2HeaderY = centerY + (((box2.y - 15) - refCenter.y) * scale);  // Abbassato di 10px
        const box2BodyY = centerY + (((box2.y + 10) - refCenter.y) * scale);

        const box3TextX = centerX + ((box3.x - refCenter.x) * scale);
        const box3HeaderY = centerY + (((box3.y - 15) - refCenter.y) * scale);  // Abbassato di 10px
        const box3BodyY = centerY + (((box3.y + 10) - refCenter.y) * scale);

        // Titolo principale
        const titleText = this.add.text(titleTextX, titleTextY,
            "Vediamo gli errori fatti:", {
            fontSize: `${titleFontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(titleText);

        // OSPEDALE - Header
        const ospedaleHeader = this.add.text(box1TextX, box1HeaderY,
            "📞 Ospedale:\n", {
            fontSize: `${headerFontSize}px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(ospedaleHeader);

        // OSPEDALE - Body
        let ospedaleBody;
        if (gameState.errors.Hospital === 0) {
            ospedaleBody = this.add.text(box1TextX, box1BodyY,
                "\nNon hai compiuto errori in ospedale\nnella sala del paziente, bravo!", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 * scale },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
        } else {
            ospedaleBody = this.add.text(box1TextX, box1BodyY,
                "\nAttento, dovevi prima scegliere la opzione corretta da telefono\nper poi cliccare sul paziente", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 * scale },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
        }
        this.textElements.push(ospedaleBody);

        // PAZIENTE - Header
        const patientHeader = this.add.text(box2TextX, box2HeaderY,
            "👤 Paziente:\n", {
            fontSize: `${headerFontSize}px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(patientHeader);

        // PAZIENTE - Body
        let patientBody;
        if (gameState.errors.Patient === 0) {
            patientBody = this.add.text(box2TextX, box2BodyY,
                "\nHai selezionato la sequenza corretta, good job!", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 * scale },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
        } else {
            patientBody = this.add.text(box2TextX, box2BodyY,
                "\nLa sequenza corretta è x, altrimenti (spiegare qui motivo ecc...)", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 * scale },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
        }
        this.textElements.push(patientBody);

        // CARRO - Header
        const cartHeader = this.add.text(box3TextX, box3HeaderY,
            "🚑 Carro:\n", {
            fontSize: `${headerFontSize}px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(cartHeader);

        // CARRO - Body
        let cartBody;
        if (gameState.errors.Cart === 0) {
            cartBody = this.add.text(box3TextX, box3BodyY,
                "\nCorretto devi dare al paziente in ordine:\nadrenalina e poi Nacl per X motivi", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 * scale },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
        } else {
            cartBody = this.add.text(box3TextX, box3BodyY,
                "\nSbagliato, l'ordine corretto era Adrenalina → Nacl", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 * scale },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
        }
        this.textElements.push(cartBody);
    }

    createBoxInContainer(x, y, width, height) {
        const box = this.add.graphics();
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(x - width / 2, y - height / 2, width, height, 5);
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 5);

        this.mainContainer.add(box);
        return box;
    }

    shutdown() {
        this.scale.off('resize', this.handleResize, this);
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
        if (this.textElements) {
            this.textElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
    }
}