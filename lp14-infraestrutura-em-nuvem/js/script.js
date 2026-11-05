/* ============================================================
   LP14 — Infraestrutura em Nuvem · ON Solutions Brasil
   JavaScript puro (Vanilla JS). Nenhuma dependência externa.

   Funcionalidades:
   1. waLink()            - monta o link do WhatsApp com encodeURIComponent
   2. Origem de campanha  - captura utm_term / kw / utm_campaign / gclid
   3. Links WhatsApp      - aplica mensagem + origem em todos os [data-wa]
   4. Rastreamento        - carrega GTM / GA4 / Google Ads sob demanda
   5. onWhatsAppClick()   - dispara eventos whatsapp_click / generate_lead
   6. Header              - esconde ao rolar para baixo, reaparece ao subir
   7. Desafios            - seleção múltipla que atualiza a mensagem/prévia
   8. Carrossel           - loop infinito, pausa no toque, respeita reduced-motion
   ============================================================ */

/* 1. Número e link-base do WhatsApp -------------------------- */
var WA_NUMBER = "5511972243329";

function waLink(message) {
  return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message);
}

/* --- Configuração de rastreamento (vazio = nada é carregado) --- */
var ON_TRACKING = { gtmId: "", ga4Id: "", gadsId: "", gadsConversionLabel: "" };
var ON_APPEND_ORIGIN = true; // true = acrescenta termo e campanha do anúncio na mensagem

/* 2. Origem do clique (parâmetros do anúncio) ---------------- */
(function () {
  var qs = new URLSearchParams(window.location.search);
  var term = qs.get("utm_term") || qs.get("kw") || "";
  var camp = qs.get("utm_campaign") || "";
  var gclid = qs.get("gclid") || "";
  window.ON_ORIGIN = (ON_APPEND_ORIGIN && (term || camp || gclid))
    ? "\nOrigem: anúncio" + (term ? " | Termo: " + term : "") + (camp ? " | Campanha: " + camp : "")
    : "";
})();

/* 3. Aplica a mensagem + origem em todos os links de WhatsApp - */
document.querySelectorAll("[data-wa]").forEach(function (a) {
  a.href = waLink(a.getAttribute("data-wa") + (window.ON_ORIGIN || ""));
  a.target = "_blank";
  a.rel = "noopener";
});

/* 4. Carregamento opcional de GTM / GA4 / Google Ads --------- */
(function () {
  var T = ON_TRACKING;
  window.dataLayer = window.dataLayer || [];
  if (T.gtmId) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s);
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", T.gtmId);
  }
  var gid = T.ga4Id || T.gadsId;
  if (gid) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + gid;
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    if (T.ga4Id) window.gtag("config", T.ga4Id);
    if (T.gadsId) window.gtag("config", T.gadsId);
  }
})();

/* 5. Conversão: clique para o WhatsApp ----------------------- */
window.onWhatsAppClick = function (pos) {
  var v = document.querySelector(".view:not([hidden])");
  var svc = v ? (v.getAttribute("data-service") || "") : "";
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "whatsapp_click", service: svc, position: pos });
  if (typeof window.gtag === "function") {
    if (ON_TRACKING.gadsId && ON_TRACKING.gadsConversionLabel) {
      window.gtag("event", "conversion", { send_to: ON_TRACKING.gadsId + "/" + ON_TRACKING.gadsConversionLabel });
    }
    window.gtag("event", "generate_lead", { service: svc, position: pos });
  }
};

document.addEventListener("click", function (e) {
  var a = e.target.closest ? e.target.closest('a[href^="https://wa.me/"]') : null;
  if (a) window.onWhatsAppClick(a.getAttribute("data-pos") || "link");
}, true);

/* 6. Header: esconde ao rolar para baixo, volta ao subir ----- */
(function () {
  var topBar = document.querySelector(".top");
  if (!topBar) return;
  var lastY = window.scrollY, acc = 0, ticking = false;

  function onScroll() {
    var y = window.scrollY, d = y - lastY;
    lastY = y;
    ticking = false;
    if (y < 80) { topBar.classList.remove("hide"); acc = 0; return; }
    if ((d > 0 && acc < 0) || (d < 0 && acc > 0)) acc = 0;
    acc += d;
    if (acc > 24) topBar.classList.add("hide");
    else if (acc < -24) topBar.classList.remove("hide");
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });

  topBar.addEventListener("focusin", function () { topBar.classList.remove("hide"); });
})();

/* 7. Desafios: seleção múltipla que compõe a mensagem -------- */
(function () {
  function baseMsg(view) {
    var svc = view.getAttribute("data-service") || "";
    return svc
      ? "Olá, vim do site e gostaria de saber mais sobre os serviços de " + svc + "."
      : "Olá, vim do site e gostaria de saber mais sobre os serviços da ON Solutions.";
  }

  function apply(view, msg) {
    document.querySelectorAll("[data-wa-main]").forEach(function (a) {
      a.setAttribute("data-wa", msg);
      a.href = waLink(msg + (window.ON_ORIGIN || ""));
    });
    var b = view.querySelector("[data-bubble]");
    if (b) b.textContent = msg;
  }

  function sync(view) {
    var sel = [].slice.call(view.querySelectorAll(".pain[aria-pressed=true]")).map(function (p) {
      return p.getAttribute("data-q").replace(/[.!?]+$/, "");
    });
    var msg = baseMsg(view);
    if (sel.length) {
      msg += (sel.length > 1 ? " Meus maiores desafios hoje: " : " Meu maior desafio hoje: ") + sel.join("; ") + ".";
    }
    apply(view, msg);
    var hint = view.querySelector("[data-hint]");
    if (hint) {
      hint.textContent = sel.length === 0 ? "" : (sel.length === 1
        ? "Pronto! Agora toque em \u201cPedir orçamento no WhatsApp\u201d para enviar."
        : "Você marcou " + sel.length + ". Isso tem solução: toque em \u201cPedir orçamento no WhatsApp\u201d para enviar.");
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".pain") : null;
    if (!btn) return;
    var view = btn.closest(".view");
    if (!view) return;
    btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
    sync(view);
  });

  window.addEventListener("hashchange", function () {
    document.querySelectorAll(".pain[aria-pressed=true]").forEach(function (p) {
      p.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll("[data-hint]").forEach(function (h) { h.textContent = ""; });
  });
})();

/* 8. Carrossel infinito de clientes -------------------------- */
(function () {
  var homeTrack = document.getElementById("cases-track");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".marquee[data-marquee]").forEach(function (mq) {
    var track = mq.querySelector("[data-track]");
    if (!track.children.length && homeTrack) {
      [].slice.call(homeTrack.children)
        .filter(function (c) { return !c.hasAttribute("aria-hidden"); })
        .forEach(function (c) { track.appendChild(c.cloneNode(true)); });
    }
    if (reduce) return;

    // Duplica os elementos para criar a continuidade do loop
    [].slice.call(track.children).forEach(function (c) {
      var k = c.cloneNode(true);
      k.setAttribute("aria-hidden", "true");
      track.appendChild(k);
    });

    // Velocidade proporcional à largura do conteúdo
    function setSpeed() {
      var half = track.scrollWidth / 2;
      if (half > 0) mq.style.setProperty("--dur", Math.max(30, half / 40) + "s");
    }
    setSpeed();
    window.addEventListener("resize", setSpeed);
    mq.classList.add("is-looping");

    // Pausa durante o toque; retoma pouco depois
    var t;
    mq.addEventListener("touchstart", function () {
      clearTimeout(t);
      mq.classList.add("is-paused");
    }, { passive: true });
    mq.addEventListener("touchend", function () {
      t = setTimeout(function () { mq.classList.remove("is-paused"); }, 1500);
    }, { passive: true });
  });
})();
