/* =========================================================
   CARRITO DE COMPRAS UNIFICADO + CUPONES INTELIGENTES
   ========================================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxujxo4lfmDVvnXSwPvpLB9My-q-Ht10WKhpsqj8xCSoQ-EsaZqlZULlAbpJOAYyIypfQ/exec";
let carrito = JSON.parse(localStorage.getItem('carrito_handmadelove')) || [];

function normalizarRutaImagen(ruta) {
  if (!ruta) return 'logo.jpg';
  const r = String(ruta).trim();
  if (r.startsWith('http') || r.startsWith('data:')) return r;
  if (r.startsWith('img/uploads/')) return r;
  if (r.startsWith('/img/uploads/')) return r.slice(1);
  if (r === 'logo.jpg' || r === 'pulsera-secundaria.jpg') return r;
  return 'img/uploads/' + r.replace(/^.*[\\\/]/, '');
}

function detectarCategoriaItem(nombre, esTaller) {
  if (esTaller || (nombre || '').toLowerCase().startsWith('taller:')) return 'Talleres';
  const ruta = window.location.pathname.toLowerCase();
  if (ruta.includes('velas')) return 'Velas';
  if (ruta.includes('bisuteria')) return 'Bisutería';
  if (ruta.includes('bordado')) return 'Bordado';
  if (ruta.includes('pintura')) return 'Pintura';
  if (ruta.includes('crochet')) return 'Crochet';

  const n = (nombre || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes('vela')) return 'Velas';
  if (n.includes('pulsera') || n.includes('collar') || n.includes('arete')) return 'Bisutería';
  if (n.includes('bordad') || n.includes('bastidor')) return 'Bordado';
  if (n.includes('pintur') || n.includes('concreto') || n.includes('joyero')) return 'Pintura';
  if (n.includes('bolso') || n.includes('granny') || n.includes('crochet')) return 'Crochet';
  return 'Todas';
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

function guardarCarritoStorage() {
  localStorage.setItem('carrito_handmadelove', JSON.stringify(carrito));
}

function toggleCarrito() {
  const modal = document.getElementById('modal-carrito');
  if (modal) modal.classList.toggle('oculto');
}

function toggleDesplegableDatos() {
  const caja = document.getElementById('caja-formulario-entrega');
  const flecha = document.getElementById('flecha-acordeon');
  if (!caja) return;
  caja.classList.toggle('abierto');
  if (flecha) flecha.textContent = caja.classList.contains('abierto') ? '▴' : '▾';
}

function cambiarModalidadEntrega() {
  const select = document.getElementById('select-modalidad');
  const campoSector = document.getElementById('campo-sector-entrega');
  const resumenEnvio = document.getElementById('resumen-envio-texto');
  if (!select) return;

  if (select.value === 'retiro') {
    if (campoSector) campoSector.style.display = 'none';
    if (resumenEnvio) resumenEnvio.textContent = 'Retiro en Taller ($0.00)';
  } else {
    if (campoSector) campoSector.style.display = 'block';
    if (resumenEnvio) resumenEnvio.textContent = 'Por cotizar según dirección';
  }
}

function inyectarCajaCuponEnCarrito() {
  const resumenEl = document.querySelector('.carrito-resumen');
  if (!resumenEl || document.getElementById('bloque-cupon-carrito')) return;

  const divCupon = document.createElement('div');
  divCupon.id = 'bloque-cupon-carrito';
  divCupon.style.cssText = 'margin: 12px 0; padding: 10px; background: #fdf8f8; border: 1px dashed #e2bcbc; border-radius: 10px;';
  divCupon.innerHTML = `
    <label for="input-cupon" style="display:block; font-size:0.78rem; font-weight:600; color:#555; margin-bottom:6px;">🎟️ ¿Tienes un código promocional?</label>
    <div style="display:flex; gap:6px;">
      <input type="text" id="input-cupon" placeholder="Ej: VELAS15" style="flex:1; padding:6px 10px; border:1px solid #ccc; border-radius:8px; font-size:0.82rem; text-transform:uppercase; font-family:'Poppins', sans-serif;">
      <button type="button" onclick="if(typeof aplicarCodigoCupon === 'function') aplicarCodigoCupon()" style="background:var(--brand-red); color:#fff; border:none; padding:6px 14px; border-radius:8px; font-size:0.8rem; font-weight:600; cursor:pointer;">Aplicar</button>
    </div>
    <p id="mensaje-cupon" style="font-size:0.75rem; margin:5px 0 0 0; font-weight:500;"></p>
  `;
  resumenEl.parentNode.insertBefore(divCupon, resumenEl);
}

function agregarAlCarrito(nombre, precio, imagen = 'logo.jpg', esTaller = false) {
  const precioNum = parseFloat(precio) || 0;
  const imgNorm = normalizarRutaImagen(imagen);
  const categoria = detectarCategoriaItem(nombre, esTaller);
  const existente = carrito.find(item => item.nombre === nombre);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ nombre, precio: precioNum, imagen: imgNorm, cantidad: 1, esTaller, categoria });
  }

  guardarCarritoStorage();
  actualizarCarrito();

  if (typeof cerrarModalProducto === 'function') cerrarModalProducto();
  const modalCarrito = document.getElementById('modal-carrito');
  if (modalCarrito && modalCarrito.classList.contains('oculto')) {
    modalCarrito.classList.remove('oculto');
  }
}

function cambiarCantidad(index, delta) {
  if (!carrito[index]) return;
  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  guardarCarritoStorage();
  actualizarCarrito();
}

function calcularTotalesCarrito() {
  let subtotal = 0;
  carrito.forEach(item => {
    subtotal += (parseFloat(item.precio) || 0) * item.cantidad;
  });

  let descuentoCupon = 0;
  let porcentajeCupon = 0;
  let codigoCupon = '';
  const msgEl = document.getElementById('mensaje-cupon');

  if (window.cuponAplicado && window.cuponAplicado.porcentaje > 0 && subtotal > 0) {
    const cup = window.cuponAplicado;
    const catCup = (cup.categoria || 'Todas').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (cup.montoMinimo > 0 && subtotal < cup.montoMinimo) {
      if (msgEl) {
        msgEl.textContent = `⚠️ El cupón ${cup.codigo} requiere una compra mínima de $${cup.montoMinimo.toFixed(2)}.`;
        msgEl.style.color = '#d97706';
      }
    } else {
      let baseAplicable = 0;
      carrito.forEach(item => {
        const catItem = (item.categoria || detectarCategoriaItem(item.nombre, item.esTaller))
          .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (catCup === 'todas' || catItem.includes(catCup) || catCup.includes(catItem)) {
          baseAplicable += (parseFloat(item.precio) || 0) * item.cantidad;
        }
      });

      if (baseAplicable <= 0) {
        if (msgEl) {
          msgEl.textContent = `⚠️ El cupón ${cup.codigo} solo aplica a productos de ${cup.categoria}.`;
          msgEl.style.color = '#d97706';
        }
      } else {
        porcentajeCupon = cup.porcentaje;
        codigoCupon = cup.codigo;
        descuentoCupon = Math.round((baseAplicable * (porcentajeCupon / 100)) * 100) / 100;
        if (msgEl) {
          const alcance = catCup === 'todas' ? 'toda la tienda' : cup.categoria;
          msgEl.textContent = `✅ Cupón ${cup.codigo} aplicado (-${porcentajeCupon}% en ${alcance})`;
          msgEl.style.color = '#2e7d32';
        }
      }
    }
  }

  const totalFinal = Math.max(0, subtotal - descuentoCupon);
  return { subtotal, descuentoCupon, porcentajeCupon, codigoCupon, totalFinal };
}

function actualizarCarrito() {
  inyectarCajaCuponEnCarrito();

  const lista = document.getElementById('lista-carrito');
  const contador = document.getElementById('cart-num');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('total-precio');
  const resumenEl = document.querySelector('.carrito-resumen');

  let totalItems = 0;
  carrito.forEach(item => totalItems += item.cantidad);
  if (contador) contador.textContent = totalItems;

  if (carrito.length === 0) {
    if (lista) lista.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin: 1.5rem 0;">El carrito está vacío</p>';
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
    const filaDesc = document.getElementById('fila-descuento-cupon');
    if (filaDesc) filaDesc.remove();
    return;
  }

  if (lista) {
    lista.innerHTML = carrito.map((item, index) => {
      const precioUnit = parseFloat(item.precio) || 0;
      const totalLinea = precioUnit * item.cantidad;
      return `
        <div class="item-carrito">
          <img src="${normalizarRutaImagen(item.imagen)}" alt="${item.nombre}" onerror="this.src='logo.jpg'">
          <div class="item-info">
            <div class="item-nombre">${item.nombre}</div>
            <div class="item-precio">$${totalLinea.toFixed(2)}</div>
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

  const totales = calcularTotalesCarrito();
  if (subtotalEl) subtotalEl.textContent = `$${totales.subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${totales.totalFinal.toFixed(2)}`;

  if (resumenEl) {
    let filaDesc = document.getElementById('fila-descuento-cupon');
    if (totales.descuentoCupon > 0) {
      if (!filaDesc) {
        filaDesc = document.createElement('div');
        filaDesc.id = 'fila-descuento-cupon';
        filaDesc.style.cssText = 'color:#2e7d32; font-weight:600;';
        resumenEl.insertBefore(filaDesc, resumenEl.children[1]);
      }
      filaDesc.innerHTML = `<span>Cupón (${totales.codigoCupon} -${totales.porcentajeCupon}%):</span> <span>-$${totales.descuentoCupon.toFixed(2)}</span>`;
    } else if (filaDesc) {
      filaDesc.remove();
    }
  }
}

function verificarUsoUnicoCupon(correo, totales) {
  if (!window.cuponAplicado || !window.cuponAplicado.usoUnico || totales.descuentoCupon <= 0) return true;
  const usados = JSON.parse(localStorage.getItem('cupones_usados_handmadelove') || '{}');
  const clave = `${window.cuponAplicado.codigo}_${correo.toLowerCase()}`;
  if (usados[clave]) {
    alert(`El cupón ${window.cuponAplicado.codigo} ya fue utilizado anteriormente con el correo ${correo}.`);
    window.cuponAplicado = null;
    actualizarCarrito();
    return false;
  }
  usados[clave] = true;
  localStorage.setItem('cupones_usados_handmadelove', JSON.stringify(usados));
  return true;
}

function validarDatosCliente() {
  const modalidad = document.getElementById('select-modalidad')?.value || 'envio';
  const nombre = document.getElementById('input-nombre')?.value.trim() || '';
  const telefono = document.getElementById('input-telefono')?.value.trim() || '';
  const correo = document.getElementById('input-correo')?.value.trim() || '';
  const ubicacion = document.getElementById('input-ubicacion')?.value.trim() || '';

  if (!nombre || !telefono || !correo || (modalidad === 'envio' && !ubicacion)) {
    const caja = document.getElementById('caja-formulario-entrega');
    const flecha = document.getElementById('flecha-acordeon');
    if (caja && !caja.classList.contains('abierto')) {
      caja.classList.add('abierto');
      if (flecha) flecha.textContent = '▴';
    }
    alert('Por favor completa tus datos de entrega (Nombre, Teléfono, Correo y Dirección) antes de continuar.');
    return null;
  }

  return {
    modalidad: modalidad === 'retiro' ? 'Retiro en Taller (Almax Center, Samborondón)' : `Envío a Domicilio (${ubicacion})`,
    nombre,
    telefono,
    correo,
    ubicacion
  };
}

function procesarCompraWhatsApp() {
  if (carrito.length === 0) return alert('Tu carrito está vacío.');
  const cliente = validarDatosCliente();
  if (!cliente) return;

  const totales = calcularTotalesCarrito();
  if (!verificarUsoUnicoCupon(cliente.correo, totales)) return;

  let detalleItems = '';
  let mensaje = `¡Hola Handmade Love! ✨ Mi nombre es *${cliente.nombre}*.\n`;
  mensaje += `📱 Tel: ${cliente.telefono}\n📧 Correo: ${cliente.correo}\n🚚 Entrega: ${cliente.modalidad}\n\n*Detalle de mi pedido:*\n`;

  carrito.forEach(item => {
    const linea = (parseFloat(item.precio) || 0) * item.cantidad;
    detalleItems += `${item.nombre} (x${item.cantidad}) - $${linea.toFixed(2)}; `;
    mensaje += `• ${item.nombre} (x${item.cantidad}) - $${linea.toFixed(2)}\n`;
  });

  mensaje += `\nSubtotal: $${totales.subtotal.toFixed(2)}`;
  if (totales.descuentoCupon > 0) {
    mensaje += `\n🎟️ Cupón ${totales.codigoCupon} (-${totales.porcentajeCupon}%): -$${totales.descuentoCupon.toFixed(2)}`;
    detalleItems += `[Cupón ${totales.codigoCupon}: -$${totales.descuentoCupon.toFixed(2)}]`;
  }
  mensaje += `\n*TOTAL COMPRA: $${totales.totalFinal.toFixed(2)}*`;

  enviarBaseDatos('Pedido Web (WhatsApp)', cliente.nombre, cliente.telefono, cliente.correo, `${cliente.modalidad} | ${detalleItems}`, `$${totales.totalFinal.toFixed(2)}`);
  window.open(`https://wa.me/593980526007?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function pagarPayphone() {
  if (carrito.length === 0) return alert('Tu carrito está vacío.');
  const cliente = validarDatosCliente();
  if (!cliente) return;

  const totales = calcularTotalesCarrito();
  if (!verificarUsoUnicoCupon(cliente.correo, totales)) return;

  let detalleItems = '';
  let mensaje = `¡Hola Handmade Love! 💳 Deseo pagar mi pedido de *$${totales.totalFinal.toFixed(2)}* con tarjeta (Payphone).\n\n`;
  mensaje += `👤 Cliente: *${cliente.nombre}*\n📱 Tel: ${cliente.telefono}\n🚚 Entrega: ${cliente.modalidad}\n\n*Detalle:*\n`;

  carrito.forEach(item => {
    const linea = (parseFloat(item.precio) || 0) * item.cantidad;
    detalleItems += `${item.nombre} (x${item.cantidad}); `;
    mensaje += `• ${item.nombre} (x${item.cantidad}) - $${linea.toFixed(2)}\n`;
  });

  if (totales.descuentoCupon > 0) {
    mensaje += `\n🎟️ Cupón aplicado: *${totales.codigoCupon}* (-$${totales.descuentoCupon.toFixed(2)})\n`;
  }
  mensaje += `\n¿Me envían el link de cobro de Payphone por *$${totales.totalFinal.toFixed(2)}*, por favor?`;

  enviarBaseDatos('Pedido Web (Payphone)', cliente.nombre, cliente.telefono, cliente.correo, `${cliente.modalidad} | ${detalleItems}`, `$${totales.totalFinal.toFixed(2)}`);
  window.open(`https://wa.me/593980526007?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function mostrarDatosBancarios() {
  const m = document.getElementById('modal-banco');
  if (m) m.classList.add('open');
}

function cerrarDatosBancarios() {
  const m = document.getElementById('modal-banco');
  if (m) m.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', actualizarCarrito);
