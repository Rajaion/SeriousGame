class ReviewScene extends Phaser.Scene {
    constructor() {
        super({ key: "ReviewScene" });
        
        // Configurazione posizioni (riferimento 1920x1080)
        this.refPositions = {
            title: { x: 960, y: 150 },
            box1: { x: 960, y: 340 },
            box2: { x: 960, y: 500 },
            box3: { x: 960, y: 660 }
        };
    }

    preload() {
        // Carica risorse se necessario
    }

    create() {
        this.createContent();
    }

    createContent() {
        this.children.removeAll();
        this.textElements = [];

        this.createBackground();
        this.createGameContent();
        this.createTexts();
    }

    createBackground() {
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(0, 0, 1920, 1080);
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(0, 0, 1920, 1080, 0);
    }

    createGameContent() {
        this.mainContainer = this.add.container(0, 0);

        // Box titolo
        this.createBoxInContainer(960, this.refPositions.title.y, 700, 80);

        // Box Ospedale
        this.createBoxInContainer(960, this.refPositions.box1.y, 900, 140);

        // Box Paziente
        this.createBoxInContainer(960, this.refPositions.box2.y, 900, 140);

        // Box Carro
        this.createBoxInContainer(960, this.refPositions.box3.y, 900, 140);
    }

    createTexts() {
        const { title, box1, box2, box3 } = this.refPositions;

        // Titolo principale
        const titleText = this.add.text(title.x, title.y, "Vediamo gli errori fatti:", {
            fontSize: `54px`,
            color: "#000000",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(titleText);

        // OSPEDALE - Header
        const ospedaleHeader = this.add.text(box1.x, box1.y - 15, "📞 Ospedale:\n", {
            fontSize: `44px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(ospedaleHeader);

        // OSPEDALE - Body
        const ospedaleBody = this.add.text(box1.x, box1.y + 10,
            gameState.errors.Hospital === 0
                ? "\nNon hai compiuto errori in ospedale\nnella sala del paziente, bravo!"
                : "\nAttento, dovevi prima scegliere la opzione corretta da telefono\nper poi cliccare sul paziente",
            {
                fontSize: `32px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
        this.textElements.push(ospedaleBody);

        // PAZIENTE - Header
        const patientHeader = this.add.text(box2.x, box2.y - 15, "👤 Paziente:\n", {
            fontSize: `44px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(patientHeader);

        // PAZIENTE - Body
        const patientBody = this.add.text(box2.x, box2.y + 10,
            gameState.errors.Patient === 0
                ? "\nHai selezionato la sequenza corretta, good job!"
                : "\nLa sequenza corretta è x, altrimenti (spiegare qui motivo ecc...)",
            {
                fontSize: `32px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
        this.textElements.push(patientBody);

        // CARRO - Header
        const cartHeader = this.add.text(box3.x, box3.y - 15, "🚑 Carro:\n", {
            fontSize: `44px`,
            color: "#e22222",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
        this.textElements.push(cartHeader);

        // CARRO - Body
        const cartBody = this.add.text(box3.x, box3.y + 10,
            gameState.errors.Cart === 0
                ? "\nCorretto devi dare al paziente in ordine:\nadrenalina e poi Nacl per X motivi"
                : "\nSbagliato, l'ordine corretto era Adrenalina → Nacl",
            {
                fontSize: `32px`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 800 },
                fontFamily: "Poppins",
                resolution: 2
            }).setOrigin(0.5);
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