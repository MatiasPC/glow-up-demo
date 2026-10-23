# Glow Up · Showroom (demo)

Sitio de una sola página para un showroom de indumentaria. HTML, CSS y JavaScript puros: sin frameworks, sin build, sin npm. Pensado para GitHub Pages (`https://matiaspc.github.io/glow-up-demo/`) y funciona también abriendo `index.html` directo.

## Cambiar productos y precios
Editá `js/products.js`. Toda la página (grilla, filtros, fichas, descuentos y cuotas) se arma a partir de esa lista. Los precios van en pesos, sin puntos ni símbolo (`89900`). Para marcar una oferta, agregá `oldPrice` y `badge: "Oferta"`.

## Configurar el WhatsApp real
En `js/products.js`, completá `contact.whatsapp` con el número en formato internacional, sin `+` ni espacios (por ejemplo `"5491122334455"`). Mientras esté vacío, los botones abren WhatsApp para elegir el contacto.

## Verlo en local
Abrí `index.html` en el navegador. Opcional: `python3 -m http.server 8765` y entrá a `http://localhost:8765`.

## Imágenes
Van en `img/`: `img/products/<id>.webp`, `img/hero.webp` y `img/og.jpg`.
