/* =========================================================
   CARRITO UNIFICADO | HANDMADE LOVE BY E.L.E & EMOCION-ARTE
   ========================================================= */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxujxo4lfmDVvnXSwPvpLB9My-q-Ht10WKhpsqj8xCSoQ-EsaZqlZULlAbpJOAYyIypfQ/exec";
let carrito = JSON.parse(localStorage.getItem('carrito_hml') || '[]');

function guardarCarrito() {
  localStorage.setItem('carrito_hml', JSON.stringify(carrito));
}

function normalizarRutaImagen(ruta) {
  if (!ruta) return 'logo.jpg';
  let r = String(ruta).trim().replace(/^["']|["']$/g, '');
  if (r.startsWith('http://') || r.startsWith('https://')) return r;
  r = r.replace(/^\.?\/?img\/uploads\//, '').replace(/^\.?\//, '');
  return 'img/uploads/' + r;
}

function toggleCarrito() {
  const modal = document.getElementById('modal-carrito');
  if (modal) modal.classList.toggle('oculto');
}

function toggleDesplegableDatos() {
  const caja = document.getElementById('caja-formulario-entrega');
  const flecha = document.getElementById('flecha-acordeon');
  if (caja) {
    caja.classList.toggle('abierta');
    if (flecha) flecha.textContent = caja.classList.contains('abierta') ? '▴' : '▾';
  }
}

function cambiarModalidadEntrega() {
  const selectMod = document.getElementById('select-modalidad');
  const campoSector = document.getElementById('campo-sector-entrega');
  const resumenTexto = document.getElementById('resumen-envio-texto');
  if (!selectMod) return;

  if (selectMod.value === 'retiro') {
    if (campoSector) campoSector.style.display = 'none';
    if (resumenTexto) resumenTexto.textContent = 'Retiro en Taller (Gratis)';
  } else {
    if (campoSector) campoSector.style.display = 'block';
    if (resumenTexto) resumenTexto.textContent = 'Por cotizar según dirección';
  }
}

function mostrarAvisoToast(mensaje) {
  let toast = document.getElementById('toast-aviso');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-aviso';
    toast.style.cssText = `
      position: fixed; bottom: 25px; right: 25px;
      background: #231F1C; color: #FAF7F2; padding: 12px 20px;
      border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.25);
      font-size: 0.88rem; font-weight: 500; z-index: 4000;
      opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
      transform: translateY(10px); pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2000);
}

function agregarAlCarrito(nombre, precio, imagen, esTaller = false) {
  const precioNumerico = parseFloat(precio) || 0;
  const fotoItem = normalizarRutaImagen(imagen);
  const encontrado = carrito.find(item => item.nombre === nombre);
  
  if (encontrado) {
    encontrado.cantidad += 1;
    if (!encontrado.imagen && fotoItem) encontrado.imagen = fotoItem;
  } else {
    carrito.push({ nombre, precio: precioNumerico, cantidad: 1, imagen: fotoItem, esTaller: !!esTaller });
  }

  guardarCarrito();
  actualizarCarrito();
  
  const modalProd = document.getElementById('modal-producto');
  if (modalProd) modalProd.classList.remove('open');
  document.body.style.overflow = 'auto';

  mostrarAvisoToast(`"${nombre}" añadido al carrito 🛒`);
}

function cambiarCantidad(index, delta) {
  if (!carrito[index]) return;
  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  guardarCarrito();
  actualizarCarrito();
}

/* Cálculo Neto - Cero IVA */
function actualizarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const contadorDesktop = document.getElementById('cart-num');
  const contadorMobile = document.querySelector('.cart-num-mobile');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('total-precio');

  let totalItems = 0;
  carrito.forEach(item => totalItems += item.cantidad);
  
  if (contadorDesktop) contadorDesktop.textContent = totalItems;
  if (contadorMobile) contadorMobile.textContent = totalItems;

  if (carrito.length === 0) {
    if (lista) lista.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin: 1.5rem 0;">El carrito está vacío</p>';
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  let totalGeneral = 0;

  if (lista) {
    lista.innerHTML = carrito.map((item, index) => {
      const precioItem = parseFloat(item.precio) || 0;
      const totalLinea = precioItem * item.cantidad;
      totalGeneral += totalLinea;

      const miniatura = item.imagen || 'logo.jpg';
      return `
        <div class="item-carrito">
          <div class="item-izq">
            <img src="${miniatura}" alt="${item.nombre}" class="item-thumb-carrito" onerror="this.src='logo.jpg'">
            <div class="item-info">
              <strong title="${item.nombre}">${item.nombre}</strong>
              <span>$${totalLinea.toFixed(2)}</span>
            </div>
          </div>
          <div class="item-controls">
            <button type="button" onclick="cambiarCantidad(${index}, -1)">-</button>
            <span>${item.cantidad}</span>
            <button type="button" onclick="cambiarCantidad(${index}, 1)">+</button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (subtotalEl) subtotalEl.textContent = `$${totalGeneral.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${totalGeneral.toFixed(2)}`;
}

function validarYObtenerDatosCliente() {
  const nombre = (document.getElementById('input-nombre')?.value || '').trim();
  const telefono = (document.getElementById('input-telefono')?.value || '').trim();
  const correo = (document.getElementById('input-correo')?.value || '').trim();
  const selectMod = document.getElementById('select-modalidad');
  const modalidad = selectMod ? selectMod.value : 'envio';
  const ubicacion = (document.getElementById('input-ubicacion')?.value || '').trim();

  const caja = document.getElementById('caja-formulario-entrega');
  const flecha = document.getElementById('flecha-acordeon');

  if (!nombre || !telefono || !correo || (modalidad === 'envio' && !ubicacion)) {
    if (caja) caja.classList.add('abierta');
    if (flecha) flecha.textContent = '▴';

    if (!nombre) { alert('Por favor ingresa tu Nombre y Apellido para continuar.'); document.getElementById('input-nombre')?.focus(); return null; }
    if (!telefono) { alert('Por favor ingresa tu número de Celular o WhatsApp para coordinar.'); document.getElementById('input-telefono')?.focus(); return null; }
    if (!correo || !correo.includes('@')) { alert('Por favor ingresa un Correo Electrónico válido.'); document.getElementById('input-correo')?.focus(); return null; }
    if (modalidad === 'envio' && !ubicacion) { alert('Por favor ingresa tu Sector o Dirección de entrega.'); document.getElementById('input-ubicacion')?.focus(); return null; }
  }

  const entregaTexto = (modalidad === 'retiro') ? 'Retiro en Taller (Almax Center)' : `Envío a domicilio (${ubicacion})`;
  return { nombre, telefono, correo, modalidad, ubicacion, entregaTexto };
}

async function enviarBaseDatos(tipo, nombre, telefono, correo, detalle, total) {
  if (!SCRIPT_URL) return;
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, nombre, telefono, correo, detalle, total })
    });
  } catch (err) {}
}

function procesarCompraWhatsApp() {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const cliente = validarYObtenerDatosCliente();
  if (!cliente) return;

  let totalFinal = 0;
  let detalleStr = "";

  carrito.forEach(item => {
    const pVal = parseFloat(item.precio) || 0;
    const totalLinea = pVal * item.cantidad;
    detalleStr += `${item.nombre} (x${item.cantidad}) - $${totalLinea.toFixed(2)}; `;
    totalFinal += totalLinea;
  });

  enviarBaseDatos(
    'Compra Web (WhatsApp)',
    cliente.nombre,
    cliente.telefono,
    cliente.correo,
    `[Entrega: ${cliente.entregaTexto}] ${detalleStr}`,
    `$${totalFinal.toFixed(2)} ${cliente.modalidad === 'envio' ? '+ Envío por cotizar' : '(Retiro)'}`
  );

  let mensaje = `Hola Handmade Love! Mi nombre es *${cliente.nombre}* (Tel: ${cliente.telefono}). Deseo realizar el siguiente pedido:%0A%0A`;

  carrito.forEach(item => {
    const pVal = parseFloat(item.precio) || 0;
    mensaje += `- ${item.nombre} (x${item.cantidad}) - $${(pVal * item.cantidad).toFixed(2)}%0A`;
  });

  mensaje += `%0A*TOTAL: $${totalFinal.toFixed(2)}*%0A`;
  mensaje += `%0AModalidad de Entrega: *${cliente.entregaTexto}*`;

  if (cliente.modalidad === 'envio') {
    mensaje += `%0A¿Me podrían cotizar el valor del envío para concretar el pago?`;
  } else {
    mensaje += `%0A¿Me podrían indicar los horarios disponibles para coordinar la entrega o asistencia a taller?`;
  }

  window.open(`https://wa.me/593980526007?text=${mensaje}`, '_blank');
}

function pagarPayphone() {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const cliente = validarYObtenerDatosCliente();
  if (!cliente) return;

  let totalFinal = 0;
  let detalleStr = "";

  carrito.forEach(item => {
    const pVal = parseFloat(item.precio) || 0;
    const totalLinea = pVal * item.cantidad;
    detalleStr += `${item.nombre} (x${item.cantidad}); `;
    totalFinal += totalLinea;
  });

  enviarBaseDatos(
    'Solicitud Link Payphone (WhatsApp)',
    cliente.nombre,
    cliente.telefono,
    cliente.correo,
    `[Entrega: ${cliente.entregaTexto}] ${detalleStr}`,
    `$${totalFinal.toFixed(2)} ${cliente.modalidad === 'envio' ? '+ Envío por cotizar' : '(Retiro)'}`
  );

  let mensaje = `Hola Handmade Love! Mi nombre es *${cliente.nombre}* (Tel: ${cliente.telefono}). Deseo pagar con *Tarjeta de Crédito/Débito (Payphone)*:%0A%0A`;
  carrito.forEach(item => {
    const pVal = parseFloat(item.precio) || 0;
    mensaje += `- ${item.nombre} (x${item.cantidad}) - $${(pVal * item.cantidad).toFixed(2)}%0A`;
  });

  mensaje += `%0A*TOTAL PRODUCTOS: $${totalFinal.toFixed(2)}*%0A`;
  mensaje += `%0AModalidad: *${cliente.entregaTexto}*%0A`;

  if (cliente.modalidad === 'envio') {
    mensaje += `¿Me podrían cotizar el valor del envío y enviarme el link de cobro cerrado de Payphone con el total incluido?`;
  } else {
    mensaje += `¿Me podrían enviar el link de Payphone por este valor para realizar el pago?`;
  }

  window.open(`https://wa.me/593980526007?text=${mensaje}`, '_blank');
}

function mostrarDatosBancarios() {
  const m = document.getElementById('modal-banco');
  if (m) m.classList.add('open');
}

function cerrarDatosBancarios() {
  const m = document.getElementById('modal-banco');
  if (m) m.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarCarrito();
});
