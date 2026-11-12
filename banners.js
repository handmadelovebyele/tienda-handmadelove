/* =========================================================
   BANNERS DINÁMICOS UNIFICADOS | HANDMADE LOVE BY E.L.E
   ========================================================= */

async function cargarBannerDinamico() {
  const bannerEl = document.getElementById('banner-categoria');
  if (!bannerEl) return;

  const ruta = window.location.pathname.toLowerCase();
  let paginaActual = '';
  if (ruta.includes('velas')) paginaActual = 'velas';
  else if (ruta.includes('bisuteria')) paginaActual = 'bisuteria';
  else if (ruta.includes('bordado')) paginaActual = 'bordado';
  else if (ruta.includes('pintura')) paginaActual = 'pintura';
  else if (ruta.includes('crochet')) paginaActual = 'crochet';
  else if (ruta.includes('blog')) paginaActual = 'blog';

  if (!paginaActual) return;

  const cacheBuster = '?t=' + new Date().getTime();
  try {
    const res = await fetch('https://api.github.com/repos/handmadelovebyele/tienda-handmadelove/contents/contenido/banners' + cacheBuster);
    if (!res.ok) return;

    const archivos = await res.json();
    if (!Array.isArray(archivos)) return;

    const archivoBanner = archivos.find(f => f.name.toLowerCase().includes(paginaActual));
    if (!archivoBanner) return;

    const texto = await fetch(archivoBanner.download_url + cacheBuster).then(r => r.text());
    const match = texto.match(/^---([\s\S]*?)---/);
    if (!match) return;

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

    if (data.imagen) {
      const imgUrl = typeof normalizarRutaImagen === 'function' ? normalizarRutaImagen(data.imagen) : data.imagen;
      bannerEl.style.background = `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('${imgUrl}') center/cover no-repeat`;
    }

    const h1 = bannerEl.querySelector('h1');
    const p = bannerEl.querySelector('p');
    if (h1 && data.titulo !== undefined) h1.textContent = data.titulo;
    if (p && data.descripcion !== undefined) p.textContent = data.descripcion;

  } catch (err) {}
}

document.addEventListener('DOMContentLoaded', cargarBannerDinamico);
