// ─────────────────────────────────────────────────────────────────
// api.js — Llamadas a Google Sheets via Apps Script usando JSONP
//
// fetch() falla desde localhost por CORS (el navegador bloquea
// requests cross-origin desde http://127.0.0.1).
// JSONP bypasea CORS cargando los datos como un <script> tag:
// el servidor devuelve  callback(data)  en vez de JSON puro.
// ─────────────────────────────────────────────────────────────────

window.App = window.App || {};

App.api = (() => {

  const ENDPOINT = 'https://script.google.com/macros/s/AKfycby_xVHxs8PflhHaSKmzWJ4Ynz3eB9wvh7QsLNROVrpmKeBzOMYYDl9SmHpPFlHx7JPq/exec';

  /**
   * Hace una llamada JSONP: inyecta un <script> con ?callback=_cbXXX
   * El servidor responde con  _cbXXX(data)  que ejecuta la función
   * y resuelve la promesa. No requiere CORS.
   */
  function call(params) {
    return new Promise((resolve, reject) => {
      // Nombre único para el callback global
      const cbName = '_apicb_' + Date.now() + '_' + Math.random().toString(36).slice(2);

      // Armar URL
      const url = new URL(ENDPOINT);
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
      url.searchParams.set('callback', cbName);

      // Registrar callback global que resolverá la promesa
      window[cbName] = (data) => {
        delete window[cbName];
        script.remove();
        resolve(data);
      };

      // Inyectar <script>
      const script = document.createElement('script');
      script.src = url.toString();
      script.onerror = () => {
        delete window[cbName];
        script.remove();
        reject(new Error('JSONP request failed: ' + url));
      };
      document.head.appendChild(script);
    });
  }

  return {
    /** Trae todas las filas de una hoja */
    getAll: (sheet) =>
      call({ sheet, action: 'getAll' }),

    /** Inserta una fila nueva */
    insert: (sheet, data) =>
      call({ sheet, action: 'insert', data: JSON.stringify(data) }),

    /** Actualiza la fila con el mismo id que data.id */
    update: (sheet, data) =>
      call({ sheet, action: 'update', data: JSON.stringify(data) }),

    /** Borra la fila con ese id */
    delete: (sheet, id) =>
      call({ sheet, action: 'delete', id }),
  };

})();
