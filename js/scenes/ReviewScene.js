class ReviewScene extends Phaser.Scene {
    constructor() {
        super({ key: "ReviewScene" });
    }

    preload() {
        // Carica risorse se necessario
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
        if (this.textElements) {
            this.textElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
        if (this.children) {
            this.children.removeAll();
        }

        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        this.add.rectangle(centerX, centerY, width, height, 0x104D5B);

        // Calcola scala
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        const scale = Math.min(scaleX, scaleY);

        // CONTAINER
        this.mainContainer = this.add.container(0, 0);

        const refCenterX = 960;
        const refCenterY = 540;

        // Posizioni di riferimento (1920x1080)
        const titleY = 162;    // 0.3 * 540
        const box1Y = 370;     // centerY/2 + 100
        const box2Y = 470;     // centerY/2 + 200
        const box3Y = 570;     // centerY/2 + 300

        // Box titolo
        this.createBoxInContainer(refCenterX, titleY, 450, 60);

        // Box Ospedale
        this.createBoxInContainer(refCenterX, box1Y, 600, 100);

        // Box Paziente
        this.createBoxInContainer(refCenterX, box2Y, 700, 80);

        // Box Carro
        this.createBoxInContainer(refCenterX, box3Y, 750, 100);

        // Scala container
        this.mainContainer.setScale(scale);
        this.mainContainer.setPosition(
            centerX - (refCenterX * scale),
            centerY - (refCenterY * scale)
        );

        // TESTI FUORI DAL CONTAINER
        this.textElements = [];
        const minFontSize = 14;

        // Font sizes responsive
        const titleFontSize = Math.max(minFontSize, 28 * scale);
        const headerFontSize = Math.max(minFontSize, 24 * scale);
        const bodyFontSize = Math.max(minFontSize, 22 * scale);

        // Calcola posizioni reali
        const titleTextX = centerX;
        const titleTextY = centerY + ((titleY - refCenterY) * scale);

        const box1TextX = centerX;
        const box1HeaderY = centerY + ((box1Y - 8 - refCenterY) * scale);
        const box1BodyY = centerY + ((box1Y - refCenterY) * scale);

        const box2TextX = centerX;
        const box2HeaderY = centerY + ((box2Y - 2 - refCenterY) * scale);
        const box2BodyY = centerY + ((box2Y - refCenterY) * scale);

        const box3TextX = centerX;
        const box3HeaderY = centerY + ((box3Y - 10 - refCenterY) * scale);
        const box3BodyY = centerY + ((box3Y - refCenterY) * scale);

        // Titolo principale
        const titleText = this.add.text(titleTextX, titleTextY,
            "Vediamo gli errori fatti:", {
            fontSize: `${titleFontSize}px`,
            color: "#000000",
            align: "center",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
        }).setOrigin(0.5);
        this.textElements.push(titleText);

        // OSPEDALE - Header
        const ospedaleHeader = this.add.text(box1TextX, box1HeaderY,
            "Ospedale:\n", {
            fontSize: `${headerFontSize}px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
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
                wordWrap: { width: 550 * scale },
                fontFamily: "Arial, sans-serif"
            }).setOrigin(0.5);
        } else {
            ospedaleBody = this.add.text(box1TextX, box1BodyY,
                "\nAttento, dovevi prima scegliere la opzione corretta da telefono\nper poi cliccare sul paziente", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 550 * scale },
                fontFamily: "Arial, sans-serif"
            }).setOrigin(0.5);
        }
        this.textElements.push(ospedaleBody);

        // PAZIENTE - Header
        const patientHeader = this.add.text(box2TextX, box2HeaderY,
            "Paziente:\n", {
            fontSize: `${headerFontSize}px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
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
                wordWrap: { width: 650 * scale },
                fontFamily: "Arial, sans-serif"
            }).setOrigin(0.5);
        } else {
            patientBody = this.add.text(box2TextX, box2BodyY,
                "\nLa sequenza corretta è x, altrimenti (spiegare qui motivo ecc...)", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 650 * scale },
                fontFamily: "Arial, sans-serif"
            }).setOrigin(0.5);
        }
        this.textElements.push(patientBody);

        // CARRO - Header
        const cartHeader = this.add.text(box3TextX, box3HeaderY,
            "Carro:\n", {
            fontSize: `${headerFontSize}px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold"
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
                wordWrap: { width: 700 * scale },
                fontFamily: "Arial, sans-serif"
            }).setOrigin(0.5);
        } else {
            cartBody = this.add.text(box3TextX, box3BodyY,
                "\nSbagliato, l'ordine corretto era Adrenalina → Nacl", {
                fontSize: `${bodyFontSize}px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 700 * scale },
                fontFamily: "Arial, sans-serif"
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