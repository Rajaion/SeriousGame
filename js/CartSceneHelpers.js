/** Helper per CartScene: logica farmaci */
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

        if (scene.medicationSet === 'adrenaline_and_amiodarone') {
            // Fase 1: Adrenalina + NaCl. Fase 2: Amiodarone + SG 5% (spawnati dopo aver dato Adr+NaCl)
            if (scene.medicationPhase === 1) {
                if (!scene.gameEnded && scene.pickedAdrenaline && check(scene.adrenalina, scene.patientCart)) {
                    scene.pickedAdrenaline = false;
                    hide(scene.adrenalina, scene.adrenalinaText);
                    scene.usedItems--;
                    scene.showMessage("Corretto! Prosegui con NaCl", true);
                }
                if (!scene.gameEnded && scene.pickedNacl && check(scene.nacl, scene.patientCart)) {
                    if (scene.usedItems === 2) {
                        scene.pickedNacl = false;
                        scene.naclSpawn();
                        scene.showMessage("Ordine: prima Adrenalina, poi NaCl", false);
                        gameState.score -= 20;
                        logErr("Ordine farmaci sbagliato: NaCl prima di Adrenalina");
                        if (scene.pointsText) scene.pointsText.setText("Score: " + gameState.score);
                        return;
                    }
                    scene.pickedNacl = false;
                    hide(scene.nacl, scene.naclText);
                    scene.usedItems--;
                    scene.showMessage("Corretto! Ora Amiodarone e SG 5%", true);
                    scene.medicationPhase = 2;
                    scene.amiodaroneSpawn();
                    scene.soluzioneSpawn();
                    scene.usedItems = 2;
                }
                if (!scene.gameEnded && (scene.pickedAmiodarone || scene.pickedSoluzione) &&
                    (check(scene.amiodarone, scene.patientCart) || check(scene.soluzione, scene.patientCart))) {
                    scene.showMessage("Ordine: prima Adrenalina+NaCl, poi Amiodarone+SG 5%", false);
                    gameState.score -= 10;
                    logErr("Ordine farmaci sbagliato: Amiodarone/SG prima di Adrenalina/NaCl");
                    if (scene.pointsText) scene.pointsText.setText("Score: " + gameState.score);
                    scene.pickedAmiodarone = scene.pickedSoluzione = false;
                }
                if (scene.pickedAdrenaline) move(scene.adrenalina, scene.adrenalinaText);
                if (scene.pickedNacl) move(scene.nacl, scene.naclText);
                return;
            }
            // Fase 2: Amiodarone + SG 5%
            if (scene.medicationPhase === 2) {
                if (!scene.gameEnded && scene.pickedAmiodarone && check(scene.amiodarone, scene.patientCart)) {
                    scene.pickedAmiodarone = false;
                    hide(scene.amiodarone, scene.amiodaroneText);
                    scene.usedItems--;
                    scene.showMessage(scene.usedItems === 1 ? "Corretto! Ultima: SG 5%" : "Corretto! Prosegui", true);
                }
                if (!scene.gameEnded && scene.pickedSoluzione && check(scene.soluzione, scene.patientCart)) {
                    if (scene.usedItems === 2) {
                        scene.pickedSoluzione = false;
                        scene.soluzioneSpawn();
                        scene.clickedWrongChoice();
                        gameState.score -= 20;
                        logErr("Ordine farmaci sbagliato: SG 5% prima di Amiodarone");
                        if (scene.pointsText) scene.pointsText.setText("Score: " + gameState.score);
                        return;
                    }
                    scene.pickedSoluzione = false;
                    hide(scene.soluzione, scene.soluzioneText);
                    scene.usedItems--;
                    if (scene.usedItems === 0) scene.medicationsGiven = true;
                    scene.showMessage("Ok. Continua.", true);
                }
                if (scene.pickedAdrenaline) move(scene.adrenalina, scene.adrenalinaText);
                if (scene.pickedNacl) move(scene.nacl, scene.naclText);
                if (scene.pickedAmiodarone) move(scene.amiodarone, scene.amiodaroneText);
                if (scene.pickedSoluzione) move(scene.soluzione, scene.soluzioneText);
                return;
            }
        }

        if (scene.medicationSet === 'adrenaline_nacl') {
            if (!scene.gameEnded && scene.pickedAdrenaline && check(scene.adrenalina, scene.patientCart)) {
                scene.pickedAdrenaline = false;
                hide(scene.adrenalina, scene.adrenalinaText);
                scene.usedItems--;
                scene.showMessage("Corretto! Seconda medicina", true);
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
                scene.showMessage("Ok. Continua.", true);
            }
            if (!scene.gameEnded && (scene.pickedAmiodarone || scene.pickedSoluzione) &&
                (check(scene.amiodarone, scene.patientCart) || check(scene.soluzione, scene.patientCart))) {
                scene.showMessage("Farmaci non corretti", false);
                gameState.score -= 10;
                logErr("Farmaci non corretti (set Adrenalina/NaCl)");
                if (scene.pointsText) scene.pointsText.setText("Score: " + gameState.score);
                scene.pickedAmiodarone = scene.pickedSoluzione = false;
            }
            if (scene.pickedAdrenaline) move(scene.adrenalina, scene.adrenalinaText);
            if (scene.pickedNacl) move(scene.nacl, scene.naclText);
            return;
        }

        if (scene.medicationSet === 'amiodarone_glucose') {
            if (!scene.gameEnded && scene.pickedAmiodarone && check(scene.amiodarone, scene.patientCart)) {
                scene.pickedAmiodarone = false;
                hide(scene.amiodarone, scene.amiodaroneText);
                scene.usedItems--;
                scene.showMessage("Corretto! Seconda medicina", true);
            }
            if (!scene.gameEnded && scene.pickedSoluzione && check(scene.soluzione, scene.patientCart)) {
                if (scene.usedItems === 2) {
                    scene.pickedSoluzione = false;
                    scene.soluzioneSpawn();
                    scene.clickedWrongChoice();
                    gameState.score -= 20;
                    logErr("Ordine farmaci sbagliato: SG 5% prima di Amiodarone");
                    if (scene.pointsText) scene.pointsText.setText("Score: " + gameState.score);
                    return;
                }
                scene.pickedSoluzione = false;
                hide(scene.soluzione, scene.soluzioneText);
                scene.usedItems--;
                if (scene.usedItems === 0) scene.medicationsGiven = true;
                scene.showMessage("Ok. Continua.", true);
            }
            if (!scene.gameEnded && (scene.pickedAdrenaline || scene.pickedNacl) &&
                (check(scene.adrenalina, scene.patientCart) || check(scene.nacl, scene.patientCart))) {
                scene.showMessage("Farmaci non corretti", false);
                gameState.score -= 10;
                logErr("Farmaci non corretti (set Amiodarone/SG 5%)");
                if (scene.pointsText) scene.pointsText.setText("Score: " + gameState.score);
                scene.pickedAdrenaline = scene.pickedNacl = false;
            }
            if (scene.pickedAmiodarone) move(scene.amiodarone, scene.amiodaroneText);
            if (scene.pickedSoluzione) move(scene.soluzione, scene.soluzioneText);
        }
    }
};
