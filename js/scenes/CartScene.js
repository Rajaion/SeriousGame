class CartScene extends Phaser.Scene{
    constructor(){
        super({key: "CartScene"});
    }

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

        const adrenalina = this.add.image(cart.x - 30, cart.y - 50,  "Adrenalina").setScale(0.15).setInteractive({useHandCursor: true});
        const nacl = this.add.image(cart.x + 30, cart.y - 50, "Nacl").setScale(0.15).setInteractive({useHandCursor: true});

        cart.on("pointerdown", () => {
            adrenalina.x = cart.x + 30;
            adrenalina.y = cart.y;
            nacl.x = cart.x - 30;
            nacl.y = cart.y;
        });
        
    }

    update(){

    }

}