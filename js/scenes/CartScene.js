class CartScene extends Phaser.Scene{
    constructor(){
        super({key: "CartScene"});
    }

    medicineOrder;
    usedItems;
    gameEnded = false;
    patientCart = null;
    pointsText = null;
    adrenalina = null;
    nacl = null;
    adrenalinaText = null;
    naclText = null;
    pickedAdrenaline = false;
    cart = null;
    pickedNacl;

    preload(){
        this.load.image("Cart", "img/Cart.png");
        this.load.image("Elettrocardiogramma", "img/Elettrocardiogramma.png");
        this.load.image("Adrenalina", "img/Adrenalina.png");
        this.load.image("Nacl", "img/Nacl.png");
        this.load.image("PatientCart", "img/PatientCart.png");
    }

    create(){
        this.gameEnded = false;
        this.pickedNacl = false;
        this.usedItems = 2;
        this.medicineOrder = 0;

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.image(centerX * 0.20, centerY, "Elettrocardiogramma").setScale(0.4);
        this.patientCart = this.add.image(centerX * 0.90, centerY * 1.40, "PatientCart").setScale(0.8).setInteractive({useHandCursor: "true"});
        this.cart = this.add.image(centerX * 1.60, centerY * 1.70, "Cart").setScale(0.5).setInteractive({useHandCursor: "true"});

        this.adrenalina = this.add.image(-550, - 550,  "Adrenalina").setScale(0.15).setOrigin(0.5, 0.5).setInteractive({useHandCursor: true});
        this.nacl = this.add.image(-550, -550, "Nacl").setScale(0.15).setOrigin(0.5, 0.5).setInteractive({useHandCursor: true});

        this.pointsText = this.add.text(centerX, centerY * 0.10,"Score: " + gameState.score, {
            fontSize: "24px",
            color: "#2c3e50",
            fontFamily: "Arial"
        })

        this.adrenalinaText = this.add.text(-550, -550, "Adrenalina", {
            fontSize: "18px",
            color: "#2c3e50",
            fontFamily: "Arial"
        }).setOrigin(0.5, 0.5);

        this.naclText = this.add.text(-550, -550, "Nacl", {
            fontSize: "18px",
            color: "#2c3e50",
            fontFamily: "Arial"
        }).setOrigin(0.5, 0.5);

        this.cart.on("pointerdown", () => {
            this.adrenSpawn();
            this.naclSpawn();
            this.cart.setInteractive({useHandCursor: false});
        });

        this.adrenalina.on("pointerdown", () => {
            this.pickedAdrenaline = !this.pickedAdrenaline;
        });

        this.nacl.on("pointerdown", () => {
            this.pickedNacl = !this.pickedNacl;
        })
        
    }
        
    update(){

        if(!this.gameEnded && this.usedItems === 0){
            this.GameEnded = true;
            this.scene.start("EndScene");
        }

        if(!this.GameEnded && this.pickedAdrenaline && this.checkCollision(this.adrenalina, this.patientCart)){
            this.pickedAdrenaline = false;
            this.adrenalina.destroy();
            this.adrenalinaText.destroy();
            gameState.score += 20;
            this.pointsText.setText("Score: " + gameState.score);
            this.usedItems --;
            this.medicineOrder ++;
        }
        if(!this.GameEnded && this.pickedNacl && this.checkCollision(this.nacl, this.patientCart)){
            if(this.usedItems === 2){
                this.pickedNacl = false;
                this.naclSpawn();
                gameState.score -= 20;
                gameState.errors.Cart = gameState.errors.Cart + 1;
                this.pointsText.setText("Score: " + gameState.score);
                return;
            }
            this.pickedNacl = false;
            this.nacl.destroy();
            this.naclText.destroy();
            gameState.score += 20;
            this.pointsText.setText("Score: " + gameState.score);
            this.usedItems --;
        }

        if(this.pickedAdrenaline){
            this.moveObjAndText(this.adrenalina, this.adrenalinaText);
            this.pickedNacl = false;
        }
        if(this.pickedNacl){
            this.moveObjAndText(this.nacl, this.naclText);
            this.adrenalina = false;
        }
    }

    checkCollision(obj1, obj2){ //Funzione che guarda i bordi dei rettangoli e restituisce se intersecano o meno
        const box1 = obj1.getBounds();
        const box2 = obj2.getBounds();

        return Phaser.Geom.Intersects.RectangleToRectangle(box1, box2); 
    }

    adrenSpawn(){
        this.adrenalina.x = this.cart.x + 30;
        this.adrenalina.y = this.cart.y;
        this.adrenalinaText.x = this.adrenalina.x;
        this.adrenalinaText.y = this.adrenalina.y - 50;
    }

    naclSpawn(){
        this.nacl.x = this.cart.x - 30;
        this.nacl.y = this.cart.y;
        this.naclText.x = this.nacl.x;
        this.naclText.y = this.nacl.y - 50;
    }

    moveObjAndText(obj, text){
        obj.x = this.input.x;
        obj.y = this.input.y;
        text.x = obj.x;
        text.y = obj.y - 50;
    }

}