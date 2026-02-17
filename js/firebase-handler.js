// Riferimento al database (lazy: si inizializza alla prima chiamata)
var database = null;

function getDatabase() {
  if (database) return database;
  if (typeof firebase !== 'undefined' && firebase.database) {
    database = firebase.database();
    return database;
  }
  return null;
}

// Funzione per salvare lo score (formato richiesto: sessionId, email, score)
function saveScore(sessionId, email, score) {
  var db = getDatabase();
  if (!db) {
    console.warn('Firebase non disponibile, score non inviato.');
    return;
  }
  var scoresRef = db.ref('scores');
  var newScoreRef = scoresRef.push();
  newScoreRef.set({
    sessionId: sessionId,
    email: email,
    score: score,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  })
  .then(function () {
    console.log('Score salvato con successo!');
  })
  .catch(function (error) {
    console.error('Errore nel salvare lo score:', error);
  });
}

// Salva tutti i dati di gioco (sessionId, email facoltativa, score, errors, errorLog)
function saveGameResults(sessionId, email, score, errors, errorLog) {
  var db = getDatabase();
  if (!db) {
    console.warn('Firebase non disponibile, risultati non inviati.');
    return;
  }
  var ref = db.ref('gameResults');
  var newRef = ref.push();
  newRef.set({
    sessionId: sessionId,
    email: email || '',
    score: score,
    errors: errors || {},
    errorLog: errorLog || [],
    timestamp: firebase.database.ServerValue.TIMESTAMP
  })
  .then(function () {
    console.log('Risultati salvati su Firebase.');
  })
  .catch(function (err) {
    console.error('Errore nel salvare i risultati:', err);
  });
}

// Esponi funzioni globalmente
window.saveScore = saveScore;
window.saveGameResults = saveGameResults;