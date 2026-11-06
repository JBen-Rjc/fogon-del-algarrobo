(() => {
  "use strict";

  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const $ = (sel) => document.querySelector(sel);
  const soles = (n) => "S/ " + n.toFixed(2).replace(/\.00$/, "");

  // ---------- Hora de Chiclayo (America/Lima), sin importar dónde esté el visitante ----------
  function ahoraLima() {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Lima", weekday: "short", hour: "2-digit", minute: "2-digit",
      year: "numeric", month: "2-digit", day: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
    const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    return { dia, minutos: Number(p.hour) * 60 + Number(p.minute), fecha: `${p.year}-${p.month}-${p.day}` };
  }

  const aMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const aTexto = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
  };

  // ---------- Estado abierto / cerrado ----------
  function pintarEstado() {
    const el = $("#estado");
    const { dia, minutos } = ahoraLima();
    const hoy = RESTAURANTE.horario[dia];
    if (hoy && minutos >= aMin(hoy.abre) && minutos < aMin(hoy.cierra)) {
      el.className = "estado abierto";
      el.innerHTML = `Abierto<span class="estado-detalle"> · cierra ${aTexto(aMin(hoy.cierra))}</span>`;
      return;
    }
    // Buscar la próxima apertura
    for (let i = 0; i < 7; i++) {
      const d = (dia + i) % 7;
      const h = RESTAURANTE.horario[d];
      if (!h) continue;
      if (i === 0 && minutos >= aMin(h.abre)) continue;
      el.className = "estado cerrado";
      el.innerHTML = `Cerrado<span class="estado-detalle"> · abre ${i === 0 ? "hoy" : i === 1 ? "mañana" : DIAS[d]} ${aTexto(aMin(h.abre))}</span>`;
      return;
    }
  }

  // ---------- Pedido (carrito) ----------
  const pedido = new Map(); // id -> cantidad
  const catalogo = new Map();
  CARTA.forEach((c) => c.platos.forEach((p) => catalogo.set(p.id, p)));

  const hoy = ahoraLima();
  const menu = MENU_DEL_DIA[hoy.dia];
  catalogo.set("menu-dia", { id: "menu-dia", nombre: `Menú del día: ${menu.plato}`, precio: menu.precio });

  try {
    const guardado = JSON.parse(localStorage.getItem("fogon-pedido") || "[]");
    guardado.forEach(([id, n]) => { if (catalogo.has(id) && n > 0) pedido.set(id, n); });
  } catch (_) { /* sin almacenamiento: el pedido empieza vacío */ }

  function guardar() {
    try { localStorage.setItem("fogon-pedido", JSON.stringify([...pedido])); } catch (_) {}
  }

  function cambiar(id, delta) {
    const n = Math.max(0, (pedido.get(id) || 0) + delta);
    n ? pedido.set(id, n) : pedido.delete(id);
    guardar();
    actualizar();
  }

  const subtotal = () => [...pedido].reduce((s, [id, n]) => s + catalogo.get(id).precio * n, 0);
  const unidades = () => [...pedido.values()].reduce((a, b) => a + b, 0);
  const esDelivery = () => $('input[name="entrega"]:checked').value === "delivery";
  const total = () => subtotal() + (esDelivery() && pedido.size ? RESTAURANTE.delivery : 0);

  function controlCantidad(id) {
    const n = pedido.get(id) || 0;
    const nombre = catalogo.get(id).nombre;
    if (!n) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "agregar"; b.textContent = "Agregar";
      b.setAttribute("aria-label", `Agregar ${nombre}`);
      b.addEventListener("click", () => { cambiar(id, 1); enfocar(id, "mas"); });
      return b;
    }
    const caja = document.createElement("div");
    caja.className = "contador";
    caja.innerHTML = `
      <button type="button" data-accion="menos" aria-label="Quitar uno de ${nombre}">−</button>
      <output aria-live="polite" aria-label="Cantidad de ${nombre}">${n}</output>
      <button type="button" data-accion="mas" aria-label="Agregar otro ${nombre}">+</button>`;
    caja.querySelector('[data-accion="menos"]').addEventListener("click", () => { cambiar(id, -1); enfocar(id, "menos"); });
    caja.querySelector('[data-accion="mas"]').addEventListener("click", () => { cambiar(id, 1); enfocar(id, "mas"); });
    return caja;
  }

  // Mantener el foco del teclado en el control después de redibujarlo
  function enfocar(id, accion) {
    requestAnimationFrame(() => {
      const ambito = dialogo.open ? dialogo : document;
      const raiz = ambito.querySelector(`[data-control="${id}"]`);
      if (!raiz) return;
      (raiz.querySelector(`[data-accion="${accion}"]`) || raiz.querySelector("button"))?.focus();
    });
  }

  // ---------- Carta ----------
  function pintarCarta() {
    const nav = $("#categorias");
    const lista = $("#carta-lista");
    nav.innerHTML = CARTA.map((c, i) =>
      `<a href="#cat-${c.id}" ${i === 0 ? 'aria-current="true"' : ""}>${c.nombre}</a>`).join("");
    lista.innerHTML = CARTA.map((c) => `
      <section class="grupo" id="cat-${c.id}" aria-labelledby="t-${c.id}">
        <h3 class="grupo-titulo" id="t-${c.id}">${c.nombre}</h3>
        <ul class="platos">
          ${c.platos.map((p) => `
            <li class="plato">
              <p class="plato-nombre">${p.nombre}${p.estrella ? '<span class="sello" title="De la casa" aria-label="De la casa">★</span>' : ""}</p>
              <p class="plato-precio">${soles(p.precio)}</p>
              <p class="plato-desc">${p.desc}</p>
              <div class="plato-accion" data-control="${p.id}"></div>
            </li>`).join("")}
        </ul>
      </section>`).join("");

    // Resaltar la categoría visible
    const enlaces = [...nav.querySelectorAll("a")];
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        enlaces.forEach((a) => a.setAttribute("aria-current", a.hash === "#" + e.target.id ? "true" : "false"));
        const activo = enlaces.find((a) => a.hash === "#" + e.target.id);
        activo?.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }, { rootMargin: "-140px 0px -60% 0px" });
    lista.querySelectorAll(".grupo").forEach((g) => obs.observe(g));
  }

  function pintarControles() {
    document.querySelectorAll("[data-control]").forEach((el) => {
      el.replaceChildren(controlCantidad(el.dataset.control));
    });
  }

  // ---------- Menú del día ----------
  function pintarMenuDia() {
    $("#dia-nombre").textContent = DIAS[hoy.dia];
    $("#menu-plato").textContent = menu.plato;
    $("#menu-detalle").textContent = `Con ${menu.entrada.toLowerCase()} de entrada y refresco.` + (menu.nota ? " " + menu.nota : "");
    $("#menu-precio").textContent = soles(menu.precio);
    $("#pedir-menu").addEventListener("click", () => cambiar("menu-dia", 1));
  }

  // ---------- Barra y diálogo del pedido ----------
  const dialogo = $("#pedido");
  let barraVisible = false;

  function actualizar() {
    pintarControles();

    const barra = $("#barra-pedido");
    const n = unidades();
    if (n) {
      $("#barra-resumen").textContent = `${n} ${n === 1 ? "plato" : "platos"} · ${soles(subtotal())}`;
      barra.hidden = false;
      if (!barraVisible) { barra.classList.add("aparece"); barraVisible = true; }
    } else {
      barra.hidden = true; barra.classList.remove("aparece"); barraVisible = false;
    }

    const menuBtn = $("#pedir-menu");
    const enMenu = pedido.get("menu-dia") || 0;
    menuBtn.textContent = enMenu ? `En tu pedido (${enMenu}) · agregar otro` : "Agregar al pedido";

    const ul = $("#pedido-lista");
    if (!pedido.size) {
      ul.innerHTML = '<li class="pedido-vacio">Todavía no agregaste platos. Elige algo de la carta para empezar.</li>';
    } else {
      ul.innerHTML = "";
      pedido.forEach((cant, id) => {
        const p = catalogo.get(id);
        const li = document.createElement("li");
        li.className = "pedido-item";
        li.innerHTML = `<span class="pedido-item-nombre">${p.nombre}</span>`;
        const ctrl = document.createElement("div");
        ctrl.dataset.control = id;
        ctrl.append(controlCantidad(id));
        const precio = document.createElement("span");
        precio.className = "pedido-item-precio";
        precio.textContent = soles(p.precio * cant);
        li.append(ctrl, precio);
        ul.append(li);
      });
    }
    $("#pedido-total").textContent = soles(total());
  }

  $("#abrir-pedido").addEventListener("click", () => dialogo.showModal());
  $("#costo-delivery").textContent = RESTAURANTE.delivery.toFixed(2);

  document.querySelectorAll('input[name="entrega"]').forEach((r) => r.addEventListener("change", () => {
    $("#campo-direccion").hidden = !esDelivery();
    $("#p-direccion").required = esDelivery();
    actualizar();
  }));

  function enviarWhatsApp(texto) {
    const url = `https://wa.me/${RESTAURANTE.whatsapp}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener");
  }

  function marcarError(input, mensaje, destino) {
    input.setAttribute("aria-invalid", "true");
    destino.textContent = mensaje;
    input.focus();
  }

  function limpiarErrores(form, destino) {
    form.querySelectorAll("[aria-invalid]").forEach((i) => i.removeAttribute("aria-invalid"));
    destino.textContent = "";
  }

  $("#form-pedido").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#p-error");
    limpiarErrores(e.target, err);
    const nombre = $("#p-nombre"), direccion = $("#p-direccion");
    if (!pedido.size) { err.textContent = "Agrega al menos un plato para enviar el pedido."; return; }
    if (!nombre.value.trim()) return marcarError(nombre, "Escribe tu nombre para que sepamos de quién es el pedido.", err);
    if (esDelivery() && !direccion.value.trim()) return marcarError(direccion, "Escribe la dirección de entrega.", err);

    const lineas = [...pedido].map(([id, n]) => `• ${n} × ${catalogo.get(id).nombre} — ${soles(catalogo.get(id).precio * n)}`);
    const texto = [
      `Hola, quiero hacer un pedido en ${RESTAURANTE.nombre}:`,
      "",
      ...lineas,
      esDelivery() ? `• Delivery — ${soles(RESTAURANTE.delivery)}` : null,
      "",
      `Total: ${soles(total())}`,
      `Entrega: ${esDelivery() ? "delivery a " + direccion.value.trim() : "recojo en el local"}`,
      `Nombre: ${nombre.value.trim()}`,
      $("#p-nota").value.trim() ? `Indicaciones: ${$("#p-nota").value.trim()}` : null,
    ].filter((l) => l !== null).join("\n");
    enviarWhatsApp(texto);
  });

  // ---------- Reservas ----------
  const fecha = $("#r-fecha"), hora = $("#r-hora");

  function pintarHoras() {
    hora.innerHTML = "";
    if (!fecha.value) { hora.innerHTML = "<option value=''>Elige una fecha</option>"; return; }
    const [y, m, d] = fecha.value.split("-").map(Number);
    const dia = new Date(y, m - 1, d).getDay();
    const h = RESTAURANTE.horario[dia];
    if (!h) { hora.innerHTML = `<option value=''>Cerrado los ${DIAS[dia]}</option>`; return; }
    let inicio = aMin(h.abre);
    const fin = aMin(h.cierra) - 60; // última reserva una hora antes del cierre
    if (fecha.value === hoy.fecha) inicio = Math.max(inicio, Math.ceil((hoy.minutos + 60) / 30) * 30);
    for (let t = inicio; t <= fin; t += 30) hora.add(new Option(aTexto(t), aTexto(t)));
    if (!hora.options.length) hora.innerHTML = "<option value=''>Sin horarios disponibles hoy</option>";
  }

  fecha.min = hoy.fecha;
  fecha.value = hoy.fecha;
  fecha.addEventListener("change", pintarHoras);

  $("#form-reserva").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#r-error");
    limpiarErrores(e.target, err);
    const nombre = $("#r-nombre"), personas = $("#r-personas");
    const n = Number(personas.value);
    if (!nombre.value.trim()) return marcarError(nombre, "Escribe tu nombre para la reserva.", err);
    if (!fecha.value || fecha.value < hoy.fecha) return marcarError(fecha, "Elige una fecha de hoy en adelante.", err);
    if (!hora.value) return marcarError(hora, "Ese día no hay horarios disponibles. Prueba con otra fecha.", err);
    if (!Number.isInteger(n) || n < 1 || n > 12) return marcarError(personas, "Indica entre 1 y 12 personas. Para grupos más grandes, escríbenos.", err);

    const [y, m, d] = fecha.value.split("-").map(Number);
    const fechaTexto = new Date(y, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
    const texto = [
      `Hola, quiero reservar una mesa en ${RESTAURANTE.nombre}:`,
      "",
      `• Fecha: ${fechaTexto}`,
      `• Hora: ${hora.value}`,
      `• Personas: ${n}`,
      `• Nombre: ${nombre.value.trim()}`,
      $("#r-nota").value.trim() ? `• Nota: ${$("#r-nota").value.trim()}` : null,
    ].filter((l) => l !== null).join("\n");
    enviarWhatsApp(texto);
  });

  // ---------- Ubicación y horario ----------
  function pintarUbicacion() {
    $("#direccion").textContent = RESTAURANTE.direccion;
    $("#referencia").textContent = RESTAURANTE.referencia;
    $("#mapa").src = RESTAURANTE.mapa;
    $("#mapa-enlace").href = RESTAURANTE.mapaEnlace;
    const orden = [1, 2, 3, 4, 5, 6, 0];
    $("#horario").innerHTML = "<tbody>" + orden.map((d) => {
      const h = RESTAURANTE.horario[d];
      const nombre = DIAS[d][0].toUpperCase() + DIAS[d].slice(1);
      return `<tr class="${d === hoy.dia ? "hoy" : ""}"><th scope="row">${nombre}</th>
        <td>${h ? `${aTexto(aMin(h.abre))} – ${aTexto(aMin(h.cierra))}` : "Cerrado"}</td></tr>`;
    }).join("") + "</tbody>";
  }

  // ---------- Inicio ----------
  pintarEstado();
  setInterval(pintarEstado, 60_000);
  pintarMenuDia();
  pintarCarta();
  pintarHoras();
  pintarUbicacion();
  actualizar();
})();
