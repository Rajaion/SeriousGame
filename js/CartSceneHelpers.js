/** Helper per CartScene: logica farmaci (solo Adrenalina + NaCl) */
var CartMedications = {
    update: function (scene) {
        var check = function (a, b) { return Phaser.Geom.Intersects.RectangleToRectangle(a.getBounds(), b.getBounds()); };
        var move = function (obj, text) {
            obj.x = scene.input.x;
            obj.y = scene.input.y;
            text.x = scene.input.x;
            text.y = scene.input.y - 50;
        };
        var off = -550;
        var hide = function (obj, text) {
            obj.x = obj.y = text.x = text.y = off;
        };
        var logErr = function (desc) {
            if (typeof window.logGameError === "function") window.logGameError("Cart", desc);
        };

        if (!scene.gameEnded && scene.pickedAdrenaline && check(scene.adrenalina, scene.patientCart)) {
            scene.pickedAdrenaline = false;
            hide(scene.adrenalina, scene.adrenalinaText);
            scene.usedItems--;
            if (scene.updateInfoBattito) scene.updateInfoBattito();
            scene.showMessage("Corretto", true);
        }
        if (!scene.gameEnded && scene.pickedNacl && check(scene.nacl, scene.patientCart)) {
            if (scene.usedItems === 2) {
                scene.pickedNacl = false;
                scene.naclSpawn();
                scene.clickedWrongChoice();
                gameState.score -= 20;
                logErr("Ordine farmaci sbagliato: NaCl prima di Adrenalina");
                if (scene.pointsText) scene.pointsText.setText("Score: " + gameState.score);
                return;
            }
            scene.pickedNacl = false;
            hide(scene.nacl, scene.naclText);
            scene.usedItems--;
            if (scene.usedItems === 0) scene.medicationsGiven = true;
            if (scene.updateInfoBattito) scene.updateInfoBattito();
            scene.showMessage("Corretto", true);
        }
        if (scene.pickedAdrenaline) move(scene.adrenalina, scene.adrenalinaText);
        if (scene.pickedNacl) move(scene.nacl, scene.naclText);
    }
};
