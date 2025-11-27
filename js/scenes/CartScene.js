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

        cart.on("pointerdown", () => {
            const adrenalina = this.add.image(cart.x, cart.y,  "Adrenalina").setScale(0.15);
        });
    }

    update(){

    }

}