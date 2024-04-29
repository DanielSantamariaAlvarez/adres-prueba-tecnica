// Mantiene un registro de todas las adquisiciones.
let adquisitions = [];

// Previene la acción predeterminada de un formulario y maneja la lógica de envío de datos.
function handleSubmit(event) {
    event.preventDefault();

    // Extraer los valores del formulario
    const adquisition = {
        id: document.getElementById('id').value,
        tipo: document.getElementById('tipo').value.trim(),
        presupuesto: parseFloat(document.getElementById('presupuesto').value),
        unidad: document.getElementById('unidad').value.trim(),
        cantidad: parseInt(document.getElementById('cantidad').value, 10),
        valorUnitario: parseFloat(document.getElementById('valorUnitario').value),
        valorTotal: parseFloat(parseInt(document.getElementById('cantidad').value, 10) * parseFloat(document.getElementById('valorUnitario').value)),
        fechaAdquisicion: document.getElementById('fechaAdquisicion').value,
        proveedor: document.getElementById('proveedor').value.trim(),
        documentacion: document.getElementById('documentacion').value.trim(),
    };

    const validationResult = isValidAdquisition(adquisition);
    if (!validationResult.isValid) {
        alert(`Error: ${validationResult.message}`);
        return;
    }

    const url = adquisition.id ? `http://localhost:3000/adquisiciones/${adquisition.id}` : 'http://localhost:3000/adquisiciones';
    const method = adquisition.id ? 'PUT' : 'POST';
    const activo = adquisition.id ? adquisition.activo : 1;
    adquisition.activo = activo;
    console.log(adquisition);
    

    // Envío de la adquisición
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(adquisition)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadData();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Valida los datos de adquisición.
function isValidAdquisition(adquisition) {
    if (!adquisition.tipo || adquisition.tipo.length < 3)
        return { isValid: false, message: "El tipo de bien o servicio debe tener al menos 3 caracteres." };
    if (isNaN(adquisition.presupuesto) || adquisition.presupuesto <= 0)
        return { isValid: false, message: "El presupuesto debe ser un número positivo." };
    if (!adquisition.unidad || adquisition.unidad.length < 3)
        return { isValid: false, message: "La unidad administrativa debe tener al menos 3 caracteres." };
    if (isNaN(adquisition.cantidad) || adquisition.cantidad <= 0)
        return { isValid: false, message: "La cantidad debe ser un número positivo." };
    if (isNaN(adquisition.valorUnitario) || adquisition.valorUnitario <= 0)
        return { isValid: false, message: "El valor unitario debe ser un número positivo." };
    if (!adquisition.fechaAdquisicion.match(/^\d{4}-\d{2}-\d{2}$/))
        return { isValid: false, message: "La fecha de adquisición debe estar en formato AAAA-MM-DD." };
    if (!adquisition.proveedor || adquisition.proveedor.length < 3)
        return { isValid: false, message: "El proveedor debe tener al menos 3 caracteres." };
    if (!adquisition.documentacion || adquisition.documentacion.length < 3)
        return { isValid: false, message: "La documentación debe tener al menos 3 caracteres." };
    return { isValid: true, message: "Validación exitosa." };
}

// Muestra la lista de adquisiciones en la interfaz de usuario.
function displayAdquisitions(pAdquisitions) {
    const list = document.getElementById('adquisitionList');
    list.innerHTML = pAdquisitions.map(adq =>
        `<div class="adquisition-card" id="adq-${adq.id}">
            <div class="field">
                <label for="tipo-${adq.id}">Tipo:</label>
                <input type="text" id="tipo-${adq.id}" value="${adq.tipo}" disabled />
            </div>
            <div class="field">
                <label for="presupuesto-${adq.id}">Presupuesto:</label>
                <input type="number" id="presupuesto-${adq.id}" value="${adq.presupuesto}" disabled />
            </div>
            <div class="field">
                <label for="unidad-${adq.id}">Unidad:</label>
                <input type="text" id="unidad-${adq.id}" value="${adq.unidad}" disabled />
            </div>
            <div class="field">
                <label for="cantidad-${adq.id}">Cantidad:</label>
                <input type="number" id="cantidad-${adq.id}" value="${adq.cantidad}" disabled />
            </div>
            <div class="field">
                <label for="valorUnitario-${adq.id}">Valor Unitario:</label>
                <input type="number" id="valorUnitario-${adq.id}" value="${adq.valorUnitario}" disabled />
            </div>
            <div class="field">
                <label for="valorTotal-${adq.id}">Valor Total:</label>
                <input type="text" id="valorTotal-${adq.id}" value="${adq.valorTotal}" disabled />
            </div>
            <div class="field">
                <label for="fechaAdquisicion-${adq.id}">Fecha de Adquisición:</label>
                <input type="date" id="fechaAdquisicion-${adq.id}" value="${adq.fechaAdquisicion}" disabled />
            </div>
            <div class="field">
                <label for="proveedor-${adq.id}">Proveedor:</label>
                <input type="text" id="proveedor-${adq.id}" value="${adq.proveedor}" disabled />
            </div>
            <div class="field">
                <label for="documentacion-${adq.id}">Documentación:</label>
                <input type="text" id="documentacion-${adq.id}" value="${adq.documentacion}" disabled />
            </div>
            <div class="buttons">
                ${adq.activo ? `<button onclick="toggleEdit('${adq.id}')">Editar</button>
                               <button onclick="saveAdquisition('${adq.id}')">Guardar Cambios</button>` : ''}
                <button onclick="toggleAdquisitionStatus('${adq.id}', ${adq.activo})">${adq.activo ? 'Desactivar' : 'Activar'}</button>
                <button onclick="cargarHistorialAdquisicion('${adq.id}')">Historial de cambios</button>
            </div>
        </div>`
    ).join('');
}

// Función para alternar el estado de activo/inactivo de una adquisición
function toggleAdquisitionStatus(id, activo) {
    const adq = adquisitions.find(a => a.id == id);
    if (!adq) {
        return console.error('Adquisición no encontrada');
    }
    
    // Cambia el estado de activo a inactivo y viceversa
    adq.activo = activo ? 0 : 1;

    // Aquí realizarías la actualización en la base de datos o servidor
    fetch(`http://localhost:3000/adquisiciones/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...adq, activo: adq.activo })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Adquisición actualizada:', data);
        loadData();
    })
    .catch(error => {
        console.error('Error al actualizar el estado de la adquisición:', error);
    });
}


// Permite la edición de los campos de una adquisición.
function toggleEdit(id) {
    const fields = ['presupuesto', 'unidad', 'tipo', 'cantidad', 'valorUnitario', 'valorTotal', 'fechaAdquisicion', 'proveedor', 'documentacion'];
    const isDisabled = document.getElementById(`tipo-${id}`).disabled; // Usamos cualquier campo para verificar el estado

    fields.forEach(field => {
        const inputField = document.getElementById(`${field}-${id}`);
        inputField.disabled = !isDisabled; // Alternar el estado de deshabilitado
    });

    const editButton = document.querySelector(`#adq-${id} button`); // Suponiendo que es el primer botón
    editButton.textContent = isDisabled ? "Cancelar" : "Editar"; // Cambiar el texto del botón según el estado
}

// Guarda los cambios realizados en una adquisición existente.
function saveAdquisition(id) {
    const adquisition = {
        id: id,
        tipo: document.getElementById(`tipo-${id}`).value,
        presupuesto: parseFloat(document.getElementById(`presupuesto-${id}`).value),
        unidad: document.getElementById(`unidad-${id}`).value,
        cantidad: parseInt(document.getElementById(`cantidad-${id}`).value),
        valorUnitario: parseFloat(document.getElementById(`valorUnitario-${id}`).value),
        valorTotal: parseFloat(document.getElementById(`valorUnitario-${id}`).value) * parseInt(document.getElementById(`cantidad-${id}`).value),
        fechaAdquisicion: document.getElementById(`fechaAdquisicion-${id}`).value,
        proveedor: document.getElementById(`proveedor-${id}`).value,
        documentacion: document.getElementById(`documentacion-${id}`).value,
        activo: 1
    };

    fetch(`http://localhost:3000/adquisiciones/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(adquisition)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        loadData();  // Recargar lista para reflejar cambios
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Rellena el formulario de edición con los datos de una adquisición existente.
function editAdquisition(id) {
    const adq = adquisitions.find(a => a.id == id);
    if (!adq) {
        return console.error('Adquisición no encontrada');
    }
    document.getElementById('id').value = adq.id;
    document.getElementById('tipo').value = adq.tipo;
    document.getElementById('presupuesto').value = adq.presupuesto;
    document.getElementById('unidad').value = adq.unidad;
    document.getElementById('cantidad').value = adq.cantidad;
    document.getElementById('valorUnitario').value = adq.valorUnitario;
    document.getElementById('fechaAdquisicion').value = adq.fechaAdquisicion;
    document.getElementById('proveedor').value = adq.proveedor;
    document.getElementById('documentacion').value = adq.documentacion;
}


// Carga el historial de una adquisición específica y cambia los estilos de fondo apropiadamente.
function cargarHistorialAdquisicion(id) {
    const todasLasTarjetas = document.querySelectorAll('.adquisition-card');
    todasLasTarjetas.forEach(card => {
        card.style.border = "1px solid #5068B2"; // Setea el color de fondo blanco
        const inputs = card.querySelectorAll('input');
                inputs.forEach(input => {
                    input.style.backgroundColor = 'rgba(239, 239, 239, 0.3)';
                });
    });
    fetch(`http://localhost:3000/adquisiciones/${id}/historial`)
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.length > 0) {

                const card = document.getElementById("adq-" + id);
                card.style.border = "5px solid #5068B2"; // Cambia el color del borde en lugar del fondo
                const inputs = card.querySelectorAll('input');
                inputs.forEach(input => {
                    input.style.borderColor = '#5068B2'; // Cambia el color del borde de los inputs
                });
                mostrarHistorial(data.data);
            } else {
                const card = document.getElementById("adq-" + id);
                card.style.border = "5px solid #5068B2"; // Cambia el color del borde en lugar del fondo
                const inputs = card.querySelectorAll('input');
                inputs.forEach(input => {
                    input.style.borderColor = '#5068B2'; // Cambia el color del borde de los inputs
                });
                const historialDiv = document.getElementById('historialAdquisiciones');
                historialDiv.innerHTML = '<hr><p>No hay historial disponible para esta adquisición</p>'
            }
        })
        .catch(error => console.error('Error al recuperar el historial:', error));
}


// Muestra el historial de modificaciones para una adquisición.
function mostrarHistorial(historial) {
    const historialDiv = document.getElementById('historialAdquisiciones');
    historialDiv.style.display = "block"; // Asegúrate de que el div sea visible
    historialDiv.innerHTML = ''; // Limpiar el contenido existente

    historial.forEach(h => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <p><strong>Campo Modificado:</strong> ${h.campo_modificado}</p>
            <p><strong>Valor Anterior:</strong> ${h.valor_anterior}</p>
            <p><strong>Valor Nuevo:</strong> ${h.valor_nuevo}</p>
            <p><strong>Usuario de Modificación:</strong> ${h.usuario_modificacion}</p>
            <p><strong>Fecha de Modificación:</strong> ${new Date(h.fecha_modificacion).toLocaleString()}</p>
        `;
        historialDiv.appendChild(card);
    });
}


// Carga los datos cuando se completa la carga del documento.
document.addEventListener('DOMContentLoaded', function() {
    loadData(); 
});

// Carga datos de adquisiciones desde el servidor y actualiza la interfaz de usuario.
function loadData(filtros = {}) {
    const queryParams = new URLSearchParams(filtros);
    fetch(`http://localhost:3000/adquisiciones?${queryParams}`)
        .then(response => response.json())
        .then(data => {
            adquisitions = data.data;
            displayAdquisitions(adquisitions);
            updateFilterDropdowns(adquisitions); 
        })
        .catch(error => console.error('Error:', error));
}

// Actualiza los dropdowns con valores únicos de las adquisiciones.
function updateFilterDropdowns(adquisitions) {
    const tipos = getUniqueValues(adquisitions, 'tipo');
    const unidades = getUniqueValues(adquisitions, 'unidad');
    const proveedores = getUniqueValues(adquisitions, 'proveedor');
    populateDropdown('tipoFilter', tipos);
    populateDropdown('unidadFilter', unidades);
    populateDropdown('proveedorFilter', proveedores);
}

// Extrae valores únicos de una lista de elementos.
function getUniqueValues(items, key) {
    const unique = [...new Set(items.map(item => item[key]))].filter(Boolean);
    return unique;
}

// Rellena un dropdown con opciones.
function populateDropdown(elementId, options) {
    const select = document.getElementById(elementId);
    select.innerHTML = `<option value="">Seleccione una opción</option>`;
    options.forEach(option => {
        select.appendChild(new Option(option, option));
    });
}

// Permite alternar la visibilidad de un formulario.
function toggleFormVisibility() {
    var form = document.querySelector('#adquisitionForm form');
    var button = document.querySelector('#adquisitionForm > button');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        button.textContent = 'Ocultar';
    } else {
        form.style.display = 'none';
        button.textContent = 'Agregar Adquisición';
    }
}

document.getElementById('filtroAdquisiciones').addEventListener('submit', function(event) {
    event.preventDefault();
    const filtros = {
        tipo: document.getElementById('tipoFilter').value,
        unidad: document.getElementById('unidadFilter').value,
        proveedor: document.getElementById('proveedorFilter').value,
        fechaInicio: document.getElementById('fechaInicioFilter').value,
        fechaFin: document.getElementById('fechaFinFilter').value,
        presupuesto: document.getElementById('presupuestoFilter').value,
        presupuestoComp: document.getElementById('presupuestoComparator').value,
        valorUnitario: document.getElementById('valorUnitarioFilter').value,
        valorUnitarioComp: document.getElementById('valorUnitarioComparator').value,
        valorTotal: document.getElementById('valorTotalFilter').value,
        valorTotalComp: document.getElementById('valorTotalComparator').value
    };
    loadData(filtros);
});