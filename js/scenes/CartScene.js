class CartScene extends Phaser.Scene{
    constructor(){
        super({key: "CartScene"});
    }

    points = 0;
    pointsText = null;
    adrenalina = null;
    nacl = null;
    adrenalinaText = null;
    naclText = null;
    pickedAdrenaline = false;
    pickedNacl = false;

    preload(){
        this.load.image("Cart", "img/Cart.png");
        this.load.image("Elettrocardiogramma", "img/Elettrocardiogramma.png");
        this.load.image("Adrenalina", "img/Adrenalina.png");
        this.load.image("Nacl", "img/Nacl.png");
        this.load.image("PatientCart", "img/PatientCart.png");
    }

    create(){
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.image(centerX * 0.20, centerY, "Elettrocardiogramma").setScale(0.4);
        this.add.image(centerX * 0.90, centerY * 1.40, "PatientCart").setScale(0.8);
        const cart = this.add.image(centerX * 1.60, centerY * 1.70, "Cart").setScale(0.5).setInteractive({useHandCursor: "true"});

        this.adrenalina = this.add.image(cart.x - 30, cart.y - 50,  "Adrenalina").setScale(0.15).setOrigin(0.5, 0.5).setInteractive({useHandCursor: true});
        this.nacl = this.add.image(-550, -550, "Nacl").setScale(0.15).setOrigin(0.5, 0.5).setInteractive({useHandCursor: true});

        this.pointsText = this.add.text(centerX, centerY * 0.10, this.points, {
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

        cart.on("pointerdown", () => {
            this.adrenalina.x = cart.x + 30;
            this.adrenalina.y = cart.y;
            this.adrenalinaText.x = this.adrenalina.x;
            this.adrenalinaText.y = this.adrenalina.y - 50;
            this.nacl.x = cart.x - 30;
            this.nacl.y = cart.y;
            this.naclText.x = this.nacl.x;
            this.naclText.y = this.nacl.y - 30;
            cart.setInteractive({useHandCursor: false});
        });

        this.adrenalina.on("pointerdown", () => {
            this.pickedAdrenaline = !this.pickedAdrenaline;
        });

        this.nacl.on("pointerdown", () => {
            this.pickedNacl = !this.pickedNacl;
        })
        
    }
        
    update(){
        
        if(this.pickedAdrenaline){
            this.moveObjAndText(this.adrenalina, this.adrenalinaText);
        }
        if(this.pickedNacl){
            this.moveObjAndText(this.nacl, this.naclText);
        }
    }

    moveObjAndText(obj, text){
        obj.x = this.input.x;
        obj.y = this.input.y;
        text.x = obj.x;
        text.y = obj.y - 50;
    }

}