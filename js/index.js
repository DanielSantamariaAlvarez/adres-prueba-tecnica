const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const cors = require('cors');


const app = express();
const port = 3000;
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];

const corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(express.json());
app.use(cors(corsOptions));
// Endpoint para crear una adquisición
app.post('/adquisiciones', (req, res) => {
    const { tipo, presupuesto, unidad, cantidad, valorUnitario, fechaAdquisicion, proveedor, documentacion, activo } = req.body;
    const valorTotal = cantidad * valorUnitario;
    const query = `INSERT INTO adquisiciones (tipo, presupuesto, unidad, cantidad, valorUnitario, valorTotal, fechaAdquisicion, proveedor, documentacion, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [tipo, presupuesto, unidad, cantidad, valorUnitario, valorTotal, fechaAdquisicion, proveedor, documentacion, activo], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Endpoint para obtener adquisiciones con filtros avanzados
app.get('/adquisiciones', (req, res) => {
    let sql = `SELECT * FROM adquisiciones WHERE 1=1`;  
    const params = [];

    if (req.query.tipo) {
        sql += ` AND tipo = ?`;
        params.push(req.query.tipo);
    }
    if (req.query.unidad) {
        sql += ` AND unidad = ?`;
        params.push(req.query.unidad);
    }
    if (req.query.proveedor) {
        sql += ` AND proveedor = ?`;
        params.push(req.query.proveedor);
    }
    if (req.query.presupuesto && req.query.presupuestoComp) {
        sql += ` AND presupuesto ${sqlComparator(req.query.presupuestoComp)} ?`;
        params.push(req.query.presupuesto);
    }
    if (req.query.valorUnitario && req.query.valorUnitarioComp) {
        sql += ` AND valorUnitario ${sqlComparator(req.query.valorUnitarioComp)} ?`;
        params.push(req.query.valorUnitario);
    }
    if (req.query.valorTotal && req.query.valorTotalComp) {
        sql += ` AND valorTotal ${sqlComparator(req.query.valorTotalComp)} ?`;
        params.push(req.query.valorTotal);
    }
    if (req.query.fechaInicio && req.query.fechaFin) {
        sql += ` AND fechaAdquisicion BETWEEN ? AND ?`;
        params.push(req.query.fechaInicio, req.query.fechaFin);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "Adquisiciones recuperadas con éxito",
            data: rows
        });
    });
});

// Función auxiliar para validar y convertir los comparadores a sintaxis SQL segura
function sqlComparator(comp) {
    switch (comp) {
        case 'gt':
            return '>';
        case 'lt':
            return '<';
        case 'eq':
            return '=';
        default:
            throw new Error('Comparador no válido');
    }
}



// Este es un ejemplo simplificado. Deberás ajustar según tu implementación específica.
app.put('/adquisiciones/:id', (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  const usuarioModificacion = "Daniel Santamaria"; // Asumiendo que tienes una forma de identificar al usuario
  const { tipo, presupuesto, unidad, cantidad, valorUnitario, fechaAdquisicion, proveedor, documentacion, activo } = req.body;
  console.log(activo);

  db.get('SELECT * FROM adquisiciones WHERE id = ?', [id], (err, row) => {
      if (err) {
          res.status(400).json({ error: err.message });
          return;
      }
      if (row) {
          db.run(`UPDATE adquisiciones SET tipo = ?, presupuesto = ?, unidad = ?, cantidad = ?, valorUnitario = ?, fechaAdquisicion = ?, proveedor = ?, documentacion = ?, activo = ? WHERE id = ?`,
              [tipo, presupuesto, unidad, cantidad, valorUnitario, fechaAdquisicion, proveedor, documentacion, activo, id], function(err) {
                  if (err) {
                      res.status(500).json({ error: err.message });
                      return;
                  }
                  // Asumiendo que todos los campos pueden haber cambiado, registramos cada cambio
                  const campos = ['tipo', 'presupuesto', 'unidad', 'cantidad', 'valorUnitario', 'fechaAdquisicion', 'proveedor', 'documentacion', 'activo'];
                  campos.forEach(campo => {
                      if (row[campo] !== req.body[campo]) {
                          db.run(`INSERT INTO historial_adquisiciones (adquisicion_id, campo_modificado, valor_anterior, valor_nuevo, usuario_modificacion) VALUES (?, ?, ?, ?, ?)`,
                              [id, campo, row[campo], req.body[campo], usuarioModificacion]);
                      }
                  });
                  res.json({ message: 'Adquisición actualizada con éxito', changes: this.changes });
              });
      } else {
          res.status(404).json({ error: "Adquisición no encontrada." });
      }
  });
});


// Endpoint para desactivar una adquisición
app.delete('/adquisiciones/:id', (req, res) => {
    const query = `UPDATE adquisiciones SET activo = 0 WHERE id = ?`;
    db.run(query, [req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Deleted successfully', changes: this.changes });
    });
});

app.get('/adquisiciones/:id/historial', (req, res) => {
    const sql = `SELECT * FROM historial_adquisiciones WHERE adquisicion_id = ? ORDER BY fecha_modificacion DESC`;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "Historial recuperado con éxito",
            data: rows
        });
    });
});


// Deactivate an acquisition
app.delete('/adquisiciones/:id', (req, res) => {
    const query = `UPDATE adquisiciones SET activo = 0 WHERE id = ?`;
    db.run(query, [req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Deleted successfully', changes: this.changes });
    });
});




app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
