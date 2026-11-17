/* =========================================================
   CARGADOR UNIFICADO DE CATEGORÍAS | HANDMADE LOVE BY E.L.E
   ========================================================= */

let productosCategoriaActual = [];
let configCategoriaActual = { carpeta: '', nombre: 'Creación', filtro: '' };

function abrirModalProducto(index) {
  const p = productosCategoriaActual[index];
  if (!p) return;
  const infoPrecio = typeof calcularPrecioConDescuento === 'function'
    ? calcularPrecioConDescuento(p)
    : { tieneDescuento: false, precioFinal: parseFloat(p.precio) || 0 };

  const catLabel = configCategoriaActual.nombre;
  document.getElementById('modal-categoria').textContent = p.subcategoria ? `${catLabel} · ${p.subcategoria}` : (p.categoria || catLabel);
  document.getElementById('modal-titulo').textContent = p.title || '';

  if (infoPrecio.tieneDescuento) {
    document.getElementById('modal-precio').innerHTML = `<span class="precio-tachado">$${infoPrecio.precioOriginal.toFixed(2)}</span> $${infoPrecio.precioFinal.toFixed(2)} <span style="font-size:0.75rem; background:#fdf2f2; padding:2px 8px; border-radius:10px;">-${infoPrecio.porcentaje}% OFF</span>`;
  } else {
    document.getElementById('modal-precio').textContent = `$${infoPrecio.precioFinal.toFixed(2)}`;
  }

  document.getElementById('modal-descripcion').textContent = p.descripcion || 'Sin descripción adicional.';

  let galeria = [];
  const portada = normalizarRutaImagen(p.imagen);
  if (portada) galeria.push(portada);
  if (p.fotos && Array.isArray(p.fotos)) {
    p.fotos.forEach(f => {
      let rutaNorm = normalizarRutaImagen(f);
      if (rutaNorm && !galeria.includes(rutaNorm)) galeria.push(rutaNorm);
    });
  }

  const imgPrincipal = document.getElementById('modal-img-principal');
  const thumbsContainer = document.getElementById('modal-galeria-thumbs');
  imgPrincipal.src = galeria[0] || 'logo.jpg';
  thumbsContainer.innerHTML = '';

  if (galeria.length > 1) {
    galeria.forEach((src, i) => {
      const thumb = document.createElement('img');
      thumb.src = src;
      thumb.className = `modal-thumb ${i === 0 ? 'active' : ''}`;
      thumb.onclick = () => {
        imgPrincipal.src = src;
        document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      };
      thumbsContainer.appendChild(thumb);
    });
  }

  const btnComprar = document.getElementById('modal-btn-comprar');
  btnComprar.onclick = (e) => {
    e.stopPropagation();
    agregarAlCarrito(p.title, infoPrecio.precioFinal, portada);
  };

  document.getElementById('modal-producto').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarModalProducto() {
  const modal = document.getElementById('modal-producto');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = 'auto';
}

function render(lista) {
  const grid = document.getElementById('grid-productos');
  if (!grid) return;
  if (lista.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); padding: 40px 0;">Próximamente nuevas creaciones en esta colección.</p>`;
    return;
  }
  grid.innerHTML = lista.map((p, index) => {
    const infoPrecio = typeof calcularPrecioConDescuento === 'function'
      ? calcularPrecioConDescuento(p)
      : { tieneDescuento: false, precioFinal: parseFloat(p.precio) || 0 };
    const fotoCard = normalizarRutaImagen(p.imagen);
    const badgeHTML = infoPrecio.tieneDescuento ? `<span class="badge-descuento">-${infoPrecio.porcentaje}% OFF</span>` : '';
    const precioHTML = infoPrecio.tieneDescuento
      ? `<span class="precio-tachado">$${infoPrecio.precioOriginal.toFixed(2)}</span>$${infoPrecio.precioFinal.toFixed(2)}`
      : `$${infoPrecio.precioFinal.toFixed(2)}`;

    return `
      <div class="card" onclick="abrirModalProducto(${index})">
        ${badgeHTML}
        <img src="${fotoCard}" alt="${p.title}" onerror="this.src='logo.jpg'">
        <div class="card-body">
          <h3 class="card-title" title="${p.title}">${p.title}</h3>
          <p class="card-desc">${p.descripcion || ''}</p>
          <div class="card-footer">
            <span class="card-price">${precioHTML}</span>
            <button class="card-btn" type="button" onclick="event.stopPropagation(); agregarAlCarrito('${p.title}', ${infoPrecio.precioFinal}, '${fotoCard}')">+ Agregar</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filtrarSubcat(sub, btnElement) {
  document.querySelectorAll('.subcat-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  if (sub === 'todas') {
    render(productosCategoriaActual);
  } else {
    const filtradas = productosCategoriaActual.filter(p => {
      const s = (p.subcategoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const target = sub.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const tit = (p.title || '').toLowerCase();
      return s === target || s.includes(target) || tit.includes(target);
    });
    render(filtradas);
  }
}

function construirBotonesSubcategorias() {
  const cont = document.getElementById('subcat-container');
  if (!cont) return;
  const subcategoriasDetectadas = new Set();
  productosCategoriaActual.forEach(p => {
    if (p.subcategoria && p.subcategoria.trim()) subcategoriasDetectadas.add(p.subcategoria.trim());
  });
  if (subcategoriasDetectadas.size === 0) {
    cont.innerHTML = '';
    return;
  }
  let htmlBotones = `<button class="subcat-btn active" onclick="filtrarSubcat('todas', this)">Todas</button>`;
  subcategoriasDetectadas.forEach(sub => {
    htmlBotones += `<button class="subcat-btn" onclick="filtrarSubcat('${sub}', this)">${sub}</button>`;
  });
  cont.innerHTML = htmlBotones;
}

function parsearMarkdownCompleto(texto) {
  if (!texto) return null;
  const match = texto.match(/^---([\s\S]*?)---([\s\S]*)$/);
  if (!match) return null;
  const frontmatter = match[1];
  const cuerpoMarkdown = match[2].trim();
  const lineas = frontmatter.split('\n');
  const data = { fotos: [] };
  let claveActual = null;
  let enFotos = false;

  lineas.forEach(line => {
    const lineaTrim = line.trim();
    if (!lineaTrim) return;
    if (lineaTrim.startsWith('fotos:')) {
      enFotos = true; claveActual = 'fotos';
      const resto = lineaTrim.replace('fotos:', '').trim();
      if (resto && !resto.startsWith('-') && resto !== '[]') data.fotos.push(resto.replace(/^["']|["']$/g, ''));
      return;
    }
    if (enFotos) {
      if (lineaTrim.startsWith('-')) {
        const fItem = lineaTrim.replace(/^[-*\s]+/, '').replace(/^foto:\s*/, '').replace(/^url:\s*/, '').replace(/^["']|["']$/g, '').trim();
        if (fItem) data.fotos.push(fItem);
        return;
      } else if (lineaTrim.startsWith('foto:') || lineaTrim.startsWith('url:')) {
        const fItem = lineaTrim.replace(/^(foto|url):\s*/, '').replace(/^["']|["']$/g, '').trim();
        if (fItem) data.fotos.push(fItem);
        return;
      } else if (/^[a-zA-Z0-9_-]+\s*:/.test(lineaTrim)) { enFotos = false; }
    }
    const matchClave = lineaTrim.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (matchClave) {
      claveActual = matchClave[1];
      let val = matchClave[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      data[claveActual] = (val === '>' || val === '|' || val === '>-' || val === '|-') ? '' : val;
    } else if (claveActual && !enFotos) {
      const textoContinuacion = lineaTrim.replace(/^["']|["']$/g, '');
      data[claveActual] = data[claveActual] ? (data[claveActual] + '\n' + textoContinuacion) : textoContinuacion;
    }
  });

  if (!data.descripcion && cuerpoMarkdown) data.descripcion = cuerpoMarkdown;
  data.precio = parseFloat(data.precio || data.price || 0) || 0;
  data.title = data.title || data.nombre || configCategoriaActual.nombre;
  data.imagen = data.imagen || data.foto || (data.fotos && data.fotos[0]) || '';
  return data;
}

async function leerCarpetaGitHub(ruta, cacheBuster) {
  try {
    const res = await fetch(`https://api.github.com/repos/handmadelovebyele/tienda-handmadelove/contents/${ruta}${cacheBuster}`);
    if (!res.ok) return [];
    const archivos = await res.json();
    if (!Array.isArray(archivos)) return [];
    const promesas = archivos.filter(f => f.name.endsWith('.md')).map(f => fetch(f.download_url + cacheBuster).then(r => r.text()));
    const contenidos = await Promise.all(promesas);
    return contenidos.map(parsearMarkdownCompleto).filter(Boolean);
  } catch (e) { return []; }
}

async function iniciarCatalogoCategoria(carpeta, nombreCategoria, palabraFiltro) {
  configCategoriaActual = { carpeta, nombre: nombreCategoria, filtro: palabraFiltro };
  const cacheBuster = '?t=' + new Date().getTime();

  const [nuevosSubcarpeta, anterioresRaiz] = await Promise.all([
    leerCarpetaGitHub(`contenido/productos/${carpeta}`, cacheBuster),
    leerCarpetaGitHub('contenido/productos', cacheBuster)
  ]);

  nuevosSubcarpeta.forEach(p => { p.categoria = nombreCategoria; });

  const filtradosAnteriores = anterioresRaiz.filter(p => {
    const c = (p.categoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const t = (p.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return c.includes(palabraFiltro) || t.includes(palabraFiltro);
  });

  productosCategoriaActual = [...nuevosSubcarpeta, ...filtradosAnteriores];
  construirBotonesSubcategorias();
  render(productosCategoriaActual);
}

window.addEventListener('promocionesListas', () => render(productosCategoriaActual));
