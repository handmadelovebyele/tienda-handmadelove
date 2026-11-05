/* =========================================================
   FOOTER UNIFICADO | HANDMADE LOVE BY E.L.E & EMOCION-ARTE
   ========================================================= */

function renderFooterGlobal() {
  const contenedor = document.getElementById('footer-global');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-col">
          <h4>Handmade Love by E.L.E</h4>
          <p class="footer-desc">
            Creaciones artesanales hechas con el corazón y talleres presenciales EMOCION-ARTE en Samborondón.
          </p>
        </div>
        <div class="footer-col">
          <h4>CATEGORÍAS</h4>
          <ul class="footer-links">
            <li><a href="velas.html">Velas</a></li>
            <li><a href="bisuteria.html">Bisutería</a></li>
            <li><a href="bordado.html">Bordado</a></li>
            <li><a href="pintura.html">Pintura</a></li>
            <li><a href="crochet.html">Crochet</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>TALLERES</h4>
          <ul class="footer-links">
            <li><a href="index.html#talleres">Almax Center, Samborondón</a></li>
            <li><a href="index.html#talleres">Experiencias EMOCION-ARTE</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>SÍGUENOS Y CONTACTO</h4>
          <p style="color: #B5ACA0; font-size: 0.85rem; margin-bottom: 6px;">
            Encuentra inspiración y novedades:
          </p>
          <p style="margin-bottom: 10px;">
            <a href="mailto:hadmadelovebyele@gmail.com" style="color: #FAF7F2; text-decoration: underline; font-size: 0.86rem; font-weight: 500;">
              ✉️ hadmadelovebyele@gmail.com
            </a>
          </p>
          <a href="https://instagram.com/handmadelovebyele" target="_blank" rel="noopener noreferrer" class="btn-footer-social btn-instagram-footer">
            <span>📷 @handmadelovebyele</span>
          </a>
          <a href="https://wa.me/593980526007?text=Hola%20Handmade%20Love!%20Quisiera%20hacer%20una%20consulta" target="_blank" rel="noopener noreferrer" class="btn-footer-social btn-wa-footer">
            <span>💬 WhatsApp de Atención</span>
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        © 2026 Handmade Love by E.L.E & EMOCION-ARTE. Todos los derechos reservados.
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooterGlobal();
});
