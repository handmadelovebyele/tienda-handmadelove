/* =========================================================
   HEADER UNIFICADO | HANDMADE LOVE BY E.L.E & EMOCION-ARTE
   ========================================================= */

function renderHeaderGlobal() {
  const contenedor = document.getElementById('header-global');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="header-fijo">
      <div class="top-banner">✨ Envíos a todo el país | Talleres presenciales EMOCION-ARTE en Almax Center, Samborondón ✨</div>

      <header class="navbar">
        <a href="index.html" class="logo-container">
          <div class="logo-card"><img src="logo.jpg" alt="Logo" onerror="this.style.display='none'"></div>
          <div class="brand-text">
            <span class="brand-main">handmade love</span>
            <span class="brand-sub">BY E.L.E · EMOCION-ARTE</span>
          </div>
        </a>

        <div class="mobile-controls">
          <button type="button" class="cart-btn" onclick="toggleCarrito()">
            🛒 <span class="cart-badge cart-num-mobile">0</span>
          </button>
          <button type="button" class="btn-menu-hamburguesa" onclick="toggleMenuMovil()" aria-label="Abrir Menú">
            ☰
          </button>
        </div>

        <nav class="nav-wrapper">
          <ul class="nav-links" id="menu-navegacion">
            <li><a href="index.html#catalogo" onclick="cerrarMenuMovil();">Catálogo</a></li>
            <li class="dropdown">
              <a href="javascript:void(0)" class="dropbtn" onclick="toggleDropdownMovil(event)">Categorías ▾</a>
              <div class="dropdown-content" id="submenu-categorias">
                <a href="velas.html" onclick="cerrarMenuMovil()">Velas</a>
                <a href="bisuteria.html" onclick="cerrarMenuMovil()">Bisutería</a>
                <a href="bordado.html" onclick="cerrarMenuMovil()">Bordado</a>
                <a href="pintura.html" onclick="cerrarMenuMovil()">Pintura</a>
                <a href="crochet.html" onclick="cerrarMenuMovil()">Crochet</a>
              </div>
            </li>
            <li><a href="blog.html" onclick="cerrarMenuMovil()">Blog</a></li>
            <li><a href="index.html#talleres" class="pill-talleres" onclick="cerrarMenuMovil()">Talleres EMOCION-ARTE</a></li>
            <li>
              <button type="button" class="cart-btn" onclick="toggleCarrito()">
                🛒 <span class="cart-badge" id="cart-num">0</span>
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  `;
}

function toggleMenuMovil() {
  const menu = document.getElementById('menu-navegacion');
  if (menu) menu.classList.toggle('open');
}

function cerrarMenuMovil() {
  const menu = document.getElementById('menu-navegacion');
  if (menu) menu.classList.remove('open');
}

function toggleDropdownMovil(e) {
  if (window.innerWidth <= 768) {
    e.preventDefault();
    const sub = document.getElementById('submenu-categorias');
    if (sub) {
      sub.style.display = (sub.style.display === 'block') ? 'none' : 'block';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeaderGlobal();
  if (typeof actualizarCarrito === 'function') {
    actualizarCarrito();
  }
});
