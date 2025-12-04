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

        this.add.text(centerX, centerY / 2, "Vediamo gli errori fatti:", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
        }).setOrigin(0.5);

        if(gameState.errors.Hospital === 0){
           this.add.text(centerX, centerY / 2 + 100, "Non hai compiuto errori in ospedale \n nella sala del paziente, bravo!", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
           }).setOrigin(0.5);
        }else{
            this.add.text(centerX, centerY / 2 + 100, "Attento, devi prima scegliere la opzione corretta da telefono \n per poi cliccare sul paziente ", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
           }).setOrigin(0.5);
        }

        if(gameState.errors.Patient === 0){
          this.add.text(centerX, centerY / 2 + 200, "Hai selezionato la sequenza corretta, good job! ", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
           }).setOrigin(0.5);  
        }else{
            this.add.text(centerX, centerY / 2 + 200, "La sequenza corretta è x, altrimenti (spiegare qui motivo ecc...)", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
           }).setOrigin(0.5);    
        }

        if(gameState.errors.Cart === 0){
          this.add.text(centerX, centerY / 2 + 300, "Corretto devi dare al paziente in ordine: \n adrenalina e poi Nacl per X motivi ", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
           }).setOrigin(0.5);  
        }else{
            this.add.text(centerX, centerY / 2 + 300, "Sbagliato, l'ordine corretto era Adrenalina -> Nacl", {
            fontSize: "24px",
            color: "#000000ff",
            align: "center",
            padding: {x:30, y:15}
           }).setOrigin(0.5);    
        }


    }

    Update(){

    }

}