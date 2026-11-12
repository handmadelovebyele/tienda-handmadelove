/* =========================================================
   MOTOR DE DESCUENTOS Y CUPONES AVANZADOS | HANDMADE LOVE BY E.L.E
   ========================================================= */

let campanasPromocionales = [];
let cuponesDisponibles = [];
window.cuponAplicado = null;

function parsearFrontmatterPromo(texto) {
  if (!texto) return null;
  const match = texto.match(/^---([\s\S]*?)---/);
  if (!match) return null;
  const data = {};
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      let val = line.slice(colon + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  });
  return data;
}

function estaEnRangoFechas(inicioRaw, finRaw) {
  const ahora = new Date();
  if (inicioRaw) {
    const dInicio = new Date(inicioRaw);
    if (!isNaN(dInicio.getTime()) && ahora < dInicio) return false;
  }
  if (finRaw) {
    const dFin = new Date(finRaw);
    if (!isNaN(dFin.getTime()) && ahora > dFin) return false;
  }
  return true;
}

function calcularPrecioConDescuento(item) {
  const precioBase = parseFloat(item.precio) || 0;
  let porcentajeAplicable = 0;

  const descIndiv = parseInt(item.descuento) || 0;
  if (descIndiv > 0 && estaEnRangoFechas(item.fechaInicio, item.fechaFin)) {
    porcentajeAplicable = descIndiv;
  }

  const catItem = (item.categoria || 'talleres').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  campanasPromocionales.forEach(camp => {
    if (String(camp.activa) === 'false') return;
    if (!estaEnRangoFechas(camp.fechaInicio, camp.fechaFin)) return;

    const descCamp = parseInt(camp.descuento) || 0;
    const catCamp = (camp.categoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (descCamp > porcentajeAplicable && (catCamp === 'todas' || catItem.includes(catCamp))) {
      porcentajeAplicable = descCamp;
    }
  });

  if (porcentajeAplicable > 0 && precioBase > 0) {
    const precioFinal = precioBase * (1 - porcentajeAplicable / 100);
    return {
      tieneDescuento: true,
      porcentaje: porcentajeAplicable,
      precioOriginal: precioBase,
      precioFinal: Math.round(precioFinal * 100) / 100
    };
  }

  return {
    tieneDescuento: false,
    porcentaje: 0,
    precioOriginal: precioBase,
    precioFinal: precioBase
  };
}

function aplicarCodigoCupon() {
  const input = document.getElementById('input-cupon');
  const msg = document.getElementById('mensaje-cupon');
  if (!input || !msg) return;

  const codigoIngresado = input.value.trim().toUpperCase();
  if (!codigoIngresado) {
    window.cuponAplicado = null;
    msg.textContent = 'Escribe un código primero.';
    msg.style.color = '#d9534f';
    if (typeof actualizarCarrito === 'function') actualizarCarrito();
    return;
  }

  const encontrado = cuponesDisponibles.find(c => (c.title || '').trim().toUpperCase() === codigoIngresado);

  if (!encontrado || String(encontrado.activa) === 'false') {
    window.cuponAplicado = null;
    msg.textContent = '❌ Código inválido o inactivo.';
    msg.style.color = '#d9534f';
  } else if (!estaEnRangoFechas(null, encontrado.fechaFin)) {
    window.cuponAplicado = null;
    msg.textContent = '⏰ Este cupón ya expiró.';
    msg.style.color = '#d9534f';
  } else {
    window.cuponAplicado = {
      codigo: codigoIngresado,
      categoria: (encontrado.categoria || 'Todas').trim(),
      porcentaje: parseInt(encontrado.descuento) || 0,
      montoMinimo: parseFloat(encontrado.montoMinimo) || 0,
      acumulable: String(encontrado.acumulable) === 'true',
      usoUnico: String(encontrado.usoUnico) !== 'false'
    };

    const etiquetaCat = window.cuponAplicado.categoria.toLowerCase() === 'todas'
      ? 'toda la tienda'
      : window.cuponAplicado.categoria;

    msg.textContent = `✅ Cupón ${codigoIngresado} (-${window.cuponAplicado.porcentaje}% en ${etiquetaCat})`;
    msg.style.color = '#2e7d32';
  }

  if (typeof actualizarCarrito === 'function') actualizarCarrito();
}

async function cargarCampanasYCupones() {
  const cacheBuster = '?t=' + new Date().getTime();
  try {
    const resPromo = await fetch('https://api.github.com/repos/handmadelovebyele/tienda-handmadelove/contents/contenido/promociones' + cacheBuster);
    if (resPromo.ok) {
      const archivos = await resPromo.json();
      if (Array.isArray(archivos)) {
        const promesas = archivos.filter(f => f.name.endsWith('.md')).map(f => fetch(f.download_url + cacheBuster).then(r => r.text()));
        const textos = await Promise.all(promesas);
        campanasPromocionales = textos.map(parsearFrontmatterPromo).filter(Boolean);
        window.dispatchEvent(new Event('promocionesListas'));
      }
    }
  } catch (e) {}

  try {
    const resCup = await fetch('https://api.github.com/repos/handmadelovebyele/tienda-handmadelove/contents/contenido/cupones' + cacheBuster);
    if (resCup.ok) {
      const archivosC = await resCup.json();
      if (Array.isArray(archivosC)) {
        const promesasC = archivosC.filter(f => f.name.endsWith('.md')).map(f => fetch(f.download_url + cacheBuster).then(r => r.text()));
        const textosC = await Promise.all(promesasC);
        cuponesDisponibles = textosC.map(parsearFrontmatterPromo).filter(Boolean);
      }
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', cargarCampanasYCupones);
