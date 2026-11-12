/* =========================================================
   MOTOR DE DESCUENTOS POR FECHAS | HANDMADE LOVE BY E.L.E
   ========================================================= */

let campanasPromocionales = [];

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

function calcularPrecioConDescuento(producto) {
  const precioBase = parseFloat(producto.precio) || 0;
  let porcentajeAplicable = 0;

  // 1. Descuento individual en el producto
  const descIndiv = parseInt(producto.descuento) || 0;
  if (descIndiv > 0 && estaEnRangoFechas(producto.fechaInicio, producto.fechaFin)) {
    porcentajeAplicable = descIndiv;
  }

  // 2. Descuento por campaña general o por categoría
  const catProd = (producto.categoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  campanasPromocionales.forEach(camp => {
    if (String(camp.activa) === 'false') return;
    if (!estaEnRangoFechas(camp.fechaInicio, camp.fechaFin)) return;

    const descCamp = parseInt(camp.descuento) || 0;
    const catCamp = (camp.categoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (descCamp > porcentajeAplicable && (catCamp === 'todas' || catProd.includes(catCamp))) {
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

async function cargarCampanasPromocionales() {
  const cacheBuster = '?t=' + new Date().getTime();
  try {
    const res = await fetch('https://api.github.com/repos/handmadelovebyele/tienda-handmadelove/contents/contenido/promociones' + cacheBuster);
    if (res.ok) {
      const archivos = await res.json();
      if (Array.isArray(archivos)) {
        const promesas = archivos.filter(f => f.name.endsWith('.md')).map(f => fetch(f.download_url + cacheBuster).then(r => r.text()));
        const textos = await Promise.all(promesas);
        campanasPromocionales = textos.map(parsearFrontmatterPromo).filter(Boolean);
        window.dispatchEvent(new Event('promocionesListas'));
      }
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', cargarCampanasPromocionales);
