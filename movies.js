// app.js - Comentarios con fecha y hora de publicación

document.addEventListener('DOMContentLoaded', function() {
    const comentariosApp = document.getElementById('comentarios-app');

    // Crear estructura interna (lista + formulario)
    comentariosApp.innerHTML = `
        <div id="comentarios-lista" class="comentarios-lista"></div>
        <form id="form-nuevo-comentario" class="form-nuevo-comentario">
            <div class="form-grupo">
                <label for="nombre-input">Nombre</label>
                <input type="text" id="nombre-input" placeholder="Ejemplo: Pamela" required>
            </div>
            <div class="form-grupo">
                <label for="comentario-input">Comentario</label>
                <textarea id="comentario-input" rows="2" placeholder="¿Qué te pareció la película?" required></textarea>
            </div>
            <button type="submit" class="btn-publicar">Publicar comentario</button>
        </form>
    `;

    const listaComentarios = document.getElementById('comentarios-lista');
    const formComentario = document.getElementById('form-nuevo-comentario');
    const nombreInput = document.getElementById('nombre-input');
    const comentarioInput = document.getElementById('comentario-input');

    // ---- Estado inicial: comentarios con fecha (incluyendo a Pamela) ----
    let comentarios = [
        {
            id: 'c1',
            nombre: 'Pamela',
            texto: 'Hola, me encantó la película.',
            fecha: '2025-02-24 15:30'   // formato ISO sin segundos
        },
        {
            id: 'c2',
            nombre: 'Andrew',
            texto: 'Los efectos visuales son únicos.',
            fecha: '2025-02-24 16:15'
        },
        {
            id: 'c3',
            nombre: 'Lucas',
            texto: '¿Dónde puedo verla?',
            fecha: '2025-02-25 09:45'
        }
    ];

    // Funciones auxiliares
    function generarId() {
        return Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    }

    // Obtener fecha y hora actual formateada: YYYY-MM-DD HH:MM
    function obtenerFechaHoraActual() {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        return `${año}-${mes}-${dia} ${horas}:${minutos}`;
    }

    // Persistencia en localStorage
    function guardarEnStorage() {
        localStorage.setItem('comentariosPelicula', JSON.stringify(comentarios));
    }

    function cargarDeStorage() {
        const guardados = localStorage.getItem('comentariosPelicula');
        if (guardados) {
            try {
                const parsed = JSON.parse(guardados);
                // Asegurar que cada comentario tenga campo fecha (por si viejos no tienen)
                comentarios = parsed.map(c => ({
                    ...c,
                    fecha: c.fecha || '2025-01-01 12:00'  // fallback
                }));
            } catch (e) {}
        }
    }
    cargarDeStorage();

    // Renderizar comentarios mostrando fecha
    function renderizarComentarios() {
        if (!listaComentarios) return;
        listaComentarios.innerHTML = '';

        if (comentarios.length === 0) {
            listaComentarios.innerHTML = `<div class="comentario-item" style="text-align: center;">🎬 No hay comentarios. ¡Escribe el primero!</div>`;
            return;
        }

        comentarios.forEach(com => {
            const item = document.createElement('div');
            item.classList.add('comentario-item');
            item.dataset.id = com.id;

            // Header con nombre y fecha
            const header = document.createElement('div');
            header.classList.add('comentario-header');

            const nombreSpan = document.createElement('span');
            nombreSpan.classList.add('comentario-nombre');
            nombreSpan.textContent = com.nombre;

            const fechaSpan = document.createElement('span');
            fechaSpan.classList.add('comentario-fecha');
            fechaSpan.textContent = com.fecha;   // ej: "2025-02-24 15:30"

            header.appendChild(nombreSpan);
            header.appendChild(fechaSpan);

            // Texto
            const textoDiv = document.createElement('div');
            textoDiv.classList.add('comentario-texto');
            textoDiv.textContent = com.texto;

            // Acciones
            const acciones = document.createElement('div');
            acciones.classList.add('comentario-acciones');

            const btnResponder = document.createElement('button');
            btnResponder.classList.add('btn-accion', 'btn-responder');
            btnResponder.innerHTML = '🔁 Responder';

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn-accion', 'btn-borrar');
            btnBorrar.innerHTML = '🗑️ Borrar';

            acciones.appendChild(btnResponder);
            acciones.appendChild(btnBorrar);

            item.appendChild(header);
            item.appendChild(textoDiv);
            item.appendChild(acciones);
            listaComentarios.appendChild(item);
        });

        // Eventos de borrar y responder
        document.querySelectorAll('.btn-borrar').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const item = this.closest('.comentario-item');
                if (!item) return;
                const id = item.dataset.id;
                if (id && confirm('Eliminar comentario?')) {
                    comentarios = comentarios.filter(c => c.id !== id);
                    guardarEnStorage();
                    renderizarComentarios();
                }
            });
        });

        document.querySelectorAll('.btn-responder').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const item = this.closest('.comentario-item');
                if (!item) return;
                const id = item.dataset.id;
                const original = comentarios.find(c => c.id === id);
                if (original) {
                    comentarioInput.value = `@${original.nombre} `;
                    nombreInput.focus();
                }
            });
        });
    }

    // Publicar nuevo comentario (con fecha automática)
    function publicarComentario(e) {
        e.preventDefault();
        const nombre = nombreInput.value.trim();
        const texto = comentarioInput.value.trim();
        if (!nombre || !texto) {
            alert('Completa ambos campos.');
            return;
        }

        const nuevo = {
            id: generarId(),
            nombre: nombre,
            texto: texto,
            fecha: obtenerFechaHoraActual()   // <-- asignar fecha/hora actual
        };
        comentarios.push(nuevo);
        guardarEnStorage();
        nombreInput.value = '';
        comentarioInput.value = '';
        renderizarComentarios();
    }

    // Inicializar
    renderizarComentarios();
    formComentario.addEventListener('submit', publicarComentario);

    // Función helper para reset
    window.resetComentarios = function() {
        if (confirm('Reset a comentarios de ejemplo con fecha?')) {
            comentarios = [
                { id: 'c1', nombre: 'Pamela', texto: 'Hola, me encantó la película.', fecha: '2025-02-24 15:30' },
                { id: 'c2', nombre: 'Andrew', texto: 'Los efectos visuales son únicos.', fecha: '2025-02-24 16:15' },
                { id: 'c3', nombre: 'Lucas', texto: '¿Dónde puedo verla?', fecha: '2025-02-25 09:45' },
            ];
            guardarEnStorage();
            renderizarComentarios();
        }
    };
});