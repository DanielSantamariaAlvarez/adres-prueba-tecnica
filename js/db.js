const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos SQLite en un archivo
const db = new sqlite3.Database('./mydatabase.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

// Crear tabla de adquisiciones si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS adquisiciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      presupuesto REAL NOT NULL,
      unidad TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      valorUnitario REAL NOT NULL,
      valorTotal REAL NOT NULL,
      fechaAdquisicion TEXT NOT NULL,
      proveedor TEXT NOT NULL,
      documentacion TEXT NOT NULL,
      activo INTEGER DEFAULT 1
  )`);

  // Crear tabla de historial de adquisiciones si no existe
  db.run(`CREATE TABLE IF NOT EXISTS historial_adquisiciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adquisicion_id INTEGER NOT NULL,
      campo_modificado TEXT NOT NULL,
      valor_anterior TEXT,
      valor_nuevo TEXT,
      fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      usuario_modificacion TEXT,
      FOREIGN KEY(adquisicion_id) REFERENCES adquisiciones(id)
  )`);
});




module.exports = db;
