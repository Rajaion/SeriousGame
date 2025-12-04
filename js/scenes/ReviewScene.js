// Deve essere esattamente così
class ReviewScene extends Phaser.Scene{
    constructor(){
        super({key: "ReviewScene"});  // ← Controlla che sia "ReviewScene"
    
    }

    preload(){

    }

    create(){
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2; 

        this.createBox(centerX, centerY / 2, 450, 60);

        this.add.text(centerX, centerY / 2, "Vediamo gli errori fatti:", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:20}
        }).setOrigin(0.5);

        this.createBox(centerX, centerY / 2 + 100, 600, 100);

            this.add.text(centerX, centerY / 2 + 92, "Ospedale:\n\n", {
                fontSize: "24px",
                color: "#e22222ff",
                align: "center",
                padding: {x:30, y:30}
           }).setOrigin(0.5);

        if(gameState.errors.Hospital === 0){
           this.add.text(centerX, centerY / 2 + 100, "\nNon hai compiuto errori in ospedale \n nella sala del paziente, bravo!", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:20}
           }).setOrigin(0.5);
        }else{
            this.add.text(centerX, centerY / 2 + 100, "\nAttento, dovevi prima scegliere la opzione corretta da telefono \n per poi cliccare sul paziente ", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:20}
           }).setOrigin(0.5);
        }

        this.createBox(centerX, centerY / 2 + 200, 700, 80);

            this.add.text(centerX, centerY / 2 + 198, "Paziente:\n\n", {
                fontSize: "24px",
                color: "#e22222ff",
                align: "center",
                padding: {x:30, y:20}
           }).setOrigin(0.5);

        if(gameState.errors.Patient === 0){
          this.add.text(centerX, centerY / 2 + 200, "\nHai selezionato la sequenza corretta, good job! ", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:20}
           }).setOrigin(0.5);  
        }else{
            this.add.text(centerX, centerY / 2 + 200, "\nLa sequenza corretta è x, altrimenti (spiegare qui motivo ecc...)", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:20}
           }).setOrigin(0.5);    
        }

        this.createBox(centerX, centerY / 2 + 300, 750, 100);

            this.add.text(centerX, centerY / 2 + 290, "Carro:\n\n", {
                fontSize: "24px",
                color: "#e22222ff",
                align: "center",
                padding: {x:30, y:20}
           }).setOrigin(0.5);

        if(gameState.errors.Cart === 0){
          this.add.text(centerX, centerY / 2 + 300, "\nCorretto devi dare al paziente in ordine: \n adrenalina e poi Nacl per X motivi ", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:20}
           }).setOrigin(0.5);  
        }else{
            this.add.text(centerX, centerY / 2 + 300, "\nSbagliato, l'ordine corretto era Adrenalina -> Nacl", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:20}
           }).setOrigin(0.5);    
        }


    }

    Update(){

    }

    createBox(valueX, valueY, width, height){
        const box = this.add.graphics(valueX, valueY, width, height);
        box.fillStyle(0xecf0f1, 1);
        box.fillRoundedRect(valueX - (width / 2), valueY - (height / 2), width, height, 5); //disegna rettangolo nella posizione 600x e 300y con angolo arrotondati di 5 (maggiore valore -> maggiore arrotondamento)
        box.lineStyle(2, 0x2c3e50, 1);
        box.strokeRoundedRect(valueX - (width / 2), valueY - (height / 2), width , height, 5);
        return box;
    }

}