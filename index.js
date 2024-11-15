const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Leer datos
function leerDatos() {
    const datos = fs.readFileSync('./clientes.json');
    return JSON.parse(datos);
}

// Guardar datos
function guardarDatos(datos) {
    fs.writeFileSync('./clientes.json', JSON.stringify(datos, null, 2));
}

// Ruta para listar clientes con paginación
app.get('/clientes', (req, res) => {
    const datos = leerDatos();

    // Paginación: leer los parámetros de consulta 'page' y 'limit'
    const page = parseInt(req.query.page) || 1;  // Página predeterminada es la 1
    const limit = parseInt(req.query.limit) || 10;  // Límite predeterminado de 10 clientes por página

    // Calcular el índice de inicio y fin
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Filtrar los clientes según la paginación
    const clientesPaginados = datos.clientes.slice(startIndex, endIndex);

    // Verificar si la página solicitada está fuera del rango de clientes disponibles
    if (startIndex >= datos.clientes.length) {
        return res.status(404).json({ mensaje: 'Página fuera de rango' });
    }

    // Responder con los clientes paginados y la información de paginación
    res.json({
        total: datos.clientes.length,   // Total de clientes disponibles
        page: page,                     // Página actual
        limit: limit,                   // Límite de clientes por página
        clientes: clientesPaginados     // Clientes para la página actual
    });
});

// Rutas de clientes (sin cambios)
app.get('/clientes/:id', (req, res) => {
    const datos = leerDatos();
    const cliente = datos.clientes.find(c => c.id === parseInt(req.params.id));
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(cliente);
});

app.post('/clientes', (req, res) => {
    const datos = leerDatos();
    const nuevoCliente = {
        id: datos.clientes.length + 1,
        ...req.body,
        activo: true  // El cliente está activo por defecto
    };
    datos.clientes.push(nuevoCliente);
    guardarDatos(datos);
    res.status(201).json(nuevoCliente);
});

// Rutas para cambiar estado (activar/desactivar) sin cambios
app.put('/clientes/:id/activar', (req, res) => {
    const datos = leerDatos();
    const cliente = datos.clientes.find(c => c.id === parseInt(req.params.id));
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    cliente.activo = true;
    guardarDatos(datos);
    res.json({ mensaje: 'Cliente activado exitosamente', cliente });
});

app.put('/clientes/:id/desactivar', (req, res) => {
    const datos = leerDatos();
    const cliente = datos.clientes.find(c => c.id === parseInt(req.params.id));
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    cliente.activo = false;
    guardarDatos(datos);
    res.json({ mensaje: 'Cliente desactivado exitosamente', cliente });
});

// Ruta para eliminar cliente
app.delete('/clientes/:id', (req, res) => {
    const datos = leerDatos();
    const clienteIndex = datos.clientes.findIndex(c => c.id === parseInt(req.params.id));

    if (clienteIndex === -1) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Eliminar el cliente
    datos.clientes.splice(clienteIndex, 1);
    guardarDatos(datos);

    res.json({ mensaje: 'Cliente eliminado exitosamente' });
});

// Rutas para Interacciones (sin cambios)
app.get('/clientes/:id/interacciones', (req, res) => {
    const datos = leerDatos();
    const cliente = datos.clientes.find(c => c.id === parseInt(req.params.id));
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    // Filtrar interacciones por cliente ID
    const interacciones = datos.interacciones.filter(i => i.clienteId === cliente.id);
    res.json(interacciones);
});

app.post('/clientes/:id/interacciones', (req, res) => {
    const datos = leerDatos();
    const cliente = datos.clientes.find(c => c.id === parseInt(req.params.id));
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    const nuevaInteraccion = {
        id: datos.interacciones.length + 1,
        clienteId: cliente.id,
        ...req.body,
        fecha: new Date().toISOString()  // Fecha de la interacción
    };

    datos.interacciones.push(nuevaInteraccion);
    guardarDatos(datos);
    res.status(201).json(nuevaInteraccion);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
