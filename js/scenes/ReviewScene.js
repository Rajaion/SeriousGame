class ReviewScene extends Phaser.Scene {
    constructor() {
        super({ key: "ReviewScene" });
    }

    preload() {}

    create() {
        this.createBackground();
        this.createTitle();
        this.createEmailInput();
        this.createButton();
    }

    createBackground() {
        this.sceneBorder = this.add.graphics();
        this.sceneBorder.lineStyle(1, 0xffffff, 0.8);
        this.sceneBorder.strokeRect(0, 0, 1920, 1080);
        this.sceneBorder.fillStyle(0x2c3e50, 1);
        this.sceneBorder.fillRoundedRect(0, 0, 1920, 1080, 0);
    }

    createTitle() {
        this.add.text(960, 280, "Salva i risultati (facoltativo)", {
            fontSize: "52px",
            color: "#ecf0f1",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);

        this.add.text(960, 360, "Inserisci la tua email per inviare punteggio e dati di sessione al database.", {
            fontSize: "32px",
            color: "#bdc3c7",
            align: "center",
            wordWrap: { width: 800 },
            fontFamily: "Poppins",
            resolution: 2
        }).setOrigin(0.5);
    }

    createEmailInput() {
        var wrapper = document.getElementById("game-wrapper");
        if (!wrapper) wrapper = document.body;

        this.emailInput = document.createElement("input");
        this.emailInput.type = "email";
        this.emailInput.placeholder = "email@esempio.com (facoltativo)";
        this.emailInput.id = "review-email-input";
        this.emailInput.style.cssText = [
            "position:absolute",
            "left:50%",
            "top:46%",
            "transform:translate(-50%,-50%)",
            "width:420px",
            "padding:14px 18px",
            "font-size:22px",
            "font-family:Poppins,sans-serif",
            "border:2px solid #2c3e50",
            "border-radius:8px",
            "outline:none",
            "box-sizing:border-box"
        ].join(";");
        wrapper.style.position = "relative";
        wrapper.appendChild(this.emailInput);
    }

    createButton() {
        var self = this;
        this.reviewBtnBg = this.add.graphics();
        var btnW = 420;
        var btnH = 70;
        var btnX = 960 - btnW / 2;
        var btnY = 620;
        var drawBtn = function (color) {
            self.reviewBtnBg.clear();
            self.reviewBtnBg.fillStyle(color, 1);
            self.reviewBtnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);
            self.reviewBtnBg.lineStyle(3, 0x000000, 1);
            self.reviewBtnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 10);
        };

        drawBtn(0x3498db);

        this.reviewBtnText = this.add.text(960, btnY + btnH / 2, "Conferma ed invia", {
            fontSize: "42px",
            color: "#000000",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.reviewBtnText.on("pointerover", function () { drawBtn(0x5DADE2); self.reviewBtnText.setScale(1.05); });
        this.reviewBtnText.on("pointerout", function () { drawBtn(0x3498db); self.reviewBtnText.setScale(1); });
        this.reviewBtnText.on("pointerdown", function () {
            drawBtn(0x5DADE2);
            self.submitAndContinue();
        });
    }

    submitAndContinue() {
        var email = "";
        if (this.emailInput && this.emailInput.value) {
            email = this.emailInput.value.trim();
        }

        var sessionId = gameState.sessionId || ("session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9));
        var score = gameState.score || 0;
        var errors = gameState.errors || { Hospital: 0, Patient: 0, Cart: 0 };
        var errorLog = gameState.errorLog || [];

        if (typeof window.saveGameResults === "function") {
            window.saveGameResults(sessionId, email, score, errors, errorLog);
        }

        this.reviewBtnBg.setVisible(false);
        this.reviewBtnText.setVisible(false);
        if (this.emailInput && this.emailInput.parentNode) {
            this.emailInput.style.display = "none";
        }
        this.add.text(960, 580, "Grazie per le informazioni inviate.", {
            fontSize: "44px",
            color: "#ecf0f1",
            align: "center",
            fontFamily: "Poppins",
            fontStyle: "bold",
            resolution: 2
        }).setOrigin(0.5);
    }

    shutdown() {
        if (this.emailInput && this.emailInput.parentNode) {
            this.emailInput.parentNode.removeChild(this.emailInput);
        }
    }
}
