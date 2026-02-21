/**
 * Helper per CartScene: ECG e logica farmaci per ridurre la lunghezza di CartScene.js
 */
var CartECG = {
    create: function (scene) {
        if (!scene.monitorImg) return;
        var monitorBounds = scene.monitorImg.getBounds();
        var ecgAreaWidth = monitorBounds.width * 0.55;
        var ecgAreaHeight = monitorBounds.height * 0.35;
        var ecgAreaX = monitorBounds.centerX - ecgAreaWidth / 2 - 25;
        var ecgAreaY = monitorBounds.centerY - ecgAreaHeight / 2 - 15;
        scene.ecgArea = { x: ecgAreaX, y: ecgAreaY, width: ecgAreaWidth, height: ecgAreaHeight, centerY: ecgAreaY + ecgAreaHeight / 2 };
        if (scene.ecgMaskGraphics) scene.ecgMaskGraphics.destroy();
        scene.ecgMaskGraphics = scene.add.graphics();
        scene.ecgMaskGraphics.fillStyle(0xffffff, 1);
        scene.ecgMaskGraphics.fillRect(ecgAreaX, ecgAreaY, ecgAreaWidth, ecgAreaHeight);
        scene.ecgGraphics.setMask(scene.ecgMaskGraphics.createGeometryMask());
        scene.ecgOffsetX = 0;
    },
    update: function (scene, delta) {
        if (!scene.ecgGraphics || !scene.ecgArea) return;
        scene.ecgGraphics.clear();
        scene.ecgGraphics.lineStyle(3, 0x00ff00, 1);
        var dt = (delta != null && delta > 0) ? delta / 1000 : 1 / 60;
        scene.ecgOffsetX += scene.ecgScrollSpeed * dt;
        var patternLength = 20;
        var patternPixelPeriod = patternLength * scene.ecgPatternStep;
        scene.ecgOffsetX = scene.ecgOffsetX % patternPixelPeriod;
        var pattern = CartECG.getPattern(scene);
        if (!pattern || pattern.length === 0) return;
        if (scene.ecgPatternPrev != null && scene.ecgPatternTarget != null && scene.ecgTransitionT < scene.ecgTransitionDuration) {
            scene.ecgTransitionT += dt;
            var t = Math.min(1, scene.ecgTransitionT / scene.ecgTransitionDuration);
            var smooth = t * t * (3 - 2 * t);
            pattern = pattern.map(function (_, i) {
                var a = scene.ecgPatternPrev[i] !== undefined ? scene.ecgPatternPrev[i] : 0;
                var b = scene.ecgPatternTarget[i] !== undefined ? scene.ecgPatternTarget[i] : 0;
                return a * (1 - smooth) + b * smooth;
            });
            if (scene.ecgTransitionT >= scene.ecgTransitionDuration) {
                scene.ecgPatternPrev = null;
                scene.ecgPatternTarget = null;
            }
        }
        var area = scene.ecgArea;
        var amplitude = area.height * 0.42;
        var step = scene.ecgPatternStep;
        var len = pattern.length;
        scene.ecgGraphics.beginPath();
        for (var i = 0; i < area.width; i++) {
            var x = area.x + i;
            var patternIndex = Math.floor((i + scene.ecgOffsetX) / step) % len;
            var y = Phaser.Math.Clamp(area.centerY + pattern[patternIndex] * amplitude, area.y, area.y + area.height);
            if (i === 0) scene.ecgGraphics.moveTo(x, y);
            else scene.ecgGraphics.lineTo(x, y);
        }
        scene.ecgGraphics.strokePath();
        var leftIdx = Math.floor(scene.ecgOffsetX / step) % len;
        var peakValue = pattern[leftIdx];
        var prevIdx = (leftIdx - 1 + len) % len;
        var prevValue = pattern[prevIdx];
        var maxVal = Math.max.apply(null, pattern);
        // Soglia per ritmo: PEA solo sui GRANDI rialzi (QRS ~0.6); VF solo picchi principali; VT standard
        var peakThreshold = (scene.rhythmType === 'PEA') ? 0.45
            : (scene.rhythmType === 'VF') ? 0.38
            : Math.max(0.01, maxVal * 0.28);
        var resetThreshold = Math.min(0, peakThreshold * 0.5) - 0.01;
        scene.ecgLastValue = peakValue;
        var risingEdge = peakValue > peakThreshold && prevValue <= peakThreshold;
        var justEntered = (scene.ecgLastLeftIdx === undefined || leftIdx !== scene.ecgLastLeftIdx);
        scene.ecgLastLeftIdx = leftIdx;
        if (justEntered && risingEdge && scene.sound && scene.scene.isActive()) {
            try { scene.sound.play("heartBeep", { volume: 0.7 }); } catch (e) {}
            scene.ecgLastWasPeak = true;
        }
        if (peakValue < resetThreshold) scene.ecgLastWasPeak = false;
    },
    /** Beep a intervalli fissi (BPM) per ritmo. Più affidabile del rilevamento picchi dallo scroll. */
    updateBeepTimer: function (scene, dt) {
        if (!scene.rhythmType || !scene.sound || !scene.scene.isActive()) return;
        if (scene.ecgLastBeepRhythm !== scene.rhythmType) {
            scene.ecgLastBeepRhythm = scene.rhythmType;
            scene.ecgBeepAccumulator = 0;
        }
        var bpmMap = { 'VT': 100, 'VF': 110, 'PEA': 55, 'Asystole': 0 };
        var bpm = bpmMap[scene.rhythmType];
        if (!bpm || bpm <= 0) return;
        var intervalSec = 60 / bpm;
        scene.ecgBeepAccumulator = (scene.ecgBeepAccumulator || 0) + dt;
        if (scene.ecgBeepAccumulator >= intervalSec) {
            scene.ecgBeepAccumulator -= intervalSec;
            try { scene.sound.play("heartBeep", { volume: 0.7 }); } catch (e) {}
        }
    },
    getPattern: function (scene) {
        var t = scene.rhythmType;
        if (t === 'VF') return [0, 0.4, -0.3, 0.5, -0.4, 0.3, -0.5, 0.6, -0.3, 0.4, -0.4, 0.5, -0.2, 0.3, -0.6, 0.4, -0.3, 0.5, -0.4, 0];
        if (t === 'VT') return [0, 0.05, 0.7, -0.32, 0.15, 0, 0, 0, 0.05, 0.7, -0.32, 0.15, 0, 0, 0, 0.05, 0.7, -0.32, 0.15, 0];
        if (t === 'PEA') return [0, 0.08, 0.06, 0, 0.6, -0.25, 0.05, 0.12, 0.08, 0, 0, 0, 0.08, 0.06, 0, 0.6, -0.25, 0.05, 0.12, 0];
        if (t === 'Asystole') return [0, 0, 0.01, 0, -0.01, 0, 0, 0.01, 0, 0, -0.01, 0, 0, 0.01, -0.01, 0, 0, 0, 0.01, 0];
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
};

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

        if (scene.medicationSet === 'adrenaline_nacl') {
            if (!scene.gameEnded && scene.pickedAdrenaline && check(scene.adrenalina, scene.patientCart)) {
                scene.pickedAdrenaline = false;
                hide(scene.adrenalina, scene.adrenalinaText);
                gameState.score += 20;
                scene.pointsText.setText("Score: " + gameState.score);
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
                    scene.pointsText.setText("Score: " + gameState.score);
                    return;
                }
                scene.pickedNacl = false;
                hide(scene.nacl, scene.naclText);
                gameState.score += 20;
                scene.pointsText.setText("Score: " + gameState.score);
                scene.usedItems--;
                scene.showMessage("Ok. Continua.", true);
            }
            if (!scene.gameEnded && (scene.pickedAmiodarone || scene.pickedSoluzione) &&
                (check(scene.amiodarone, scene.patientCart) || check(scene.soluzione, scene.patientCart))) {
                scene.showMessage("Farmaci non corretti", false);
                gameState.score -= 10;
                logErr("Farmaci non corretti (set Adrenalina/NaCl)");
                scene.pointsText.setText("Score: " + gameState.score);
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
                gameState.score += 20;
                scene.pointsText.setText("Score: " + gameState.score);
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
                    scene.pointsText.setText("Score: " + gameState.score);
                    return;
                }
                scene.pickedSoluzione = false;
                hide(scene.soluzione, scene.soluzioneText);
                gameState.score += 20;
                scene.pointsText.setText("Score: " + gameState.score);
                scene.usedItems--;
                scene.showMessage("Ok. Continua.", true);
            }
            if (!scene.gameEnded && (scene.pickedAdrenaline || scene.pickedNacl) &&
                (check(scene.adrenalina, scene.patientCart) || check(scene.nacl, scene.patientCart))) {
                scene.showMessage("Farmaci non corretti", false);
                gameState.score -= 10;
                logErr("Farmaci non corretti (set Amiodarone/SG 5%)");
                scene.pointsText.setText("Score: " + gameState.score);
                scene.pickedAdrenaline = scene.pickedNacl = false;
            }
            if (scene.pickedAmiodarone) move(scene.amiodarone, scene.amiodaroneText);
            if (scene.pickedSoluzione) move(scene.soluzione, scene.soluzioneText);
        }
    }
};
