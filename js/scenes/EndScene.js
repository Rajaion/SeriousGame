class EndScene extends Phaser.Scene{
    constructor(){
        super({key: "EndScene"});
    }

    preload(){

    }

    create(){
            const centerX = this.scale.width / 2;
            const centerY = this.scale.height / 2;

            const box = this.add.graphics();
            box.fillStyle(0xecf0f1, 1);
            box.fillRoundedRect(centerX - 400, centerY - 250, 800, 500, 5); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 10 (maggiore valore -> maggiore arrotondamento)
            box.lineStyle(2, 0x2c3e50, 1);
            box.strokeRoundedRect(centerX - 400, centerY - 250, 800, 500, 5);
    }

    Update(){

    }

}