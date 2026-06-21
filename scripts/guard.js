/* ╔══════════════════════════════════════════════════════════════╗
   ║  STK VISION — guard.js                                          ║
   ║  Couche DISSUASIVE : décourage clic-droit / inspection.         ║
   ║  Honnêteté : ça gêne le curieux, ça n'arrête pas un déterminé   ║
   ║  (View-Source, proxy, JS off restent possibles). La vraie       ║
   ║  protection reste : ne jamais envoyer le code secret — le site  ║
   ║  ne sert que des vidéos.                                        ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function () {
  "use strict";

  // ── 1. Clic droit (menu contextuel) coupé partout ──
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    return false;
  }, { capture: true });

  // ── 2. Glisser-déposer des images/vidéos coupé (anti « enregistrer sous ») ──
  document.addEventListener("dragstart", function (e) {
    var t = e.target && e.target.tagName;
    if (t === "IMG" || t === "VIDEO" || t === "SOURCE") e.preventDefault();
  }, { capture: true });

  // ── 2 bis. Double-clic coupé + sélection de texte désactivée ──
  document.addEventListener("dblclick", function (e) { e.preventDefault(); }, { capture: true });
  document.addEventListener("selectstart", function (e) { e.preventDefault(); }, { capture: true });
  try {
    var st = document.createElement("style");
    st.textContent = "*{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-touch-callout:none;}" +
                     "input,textarea{-webkit-user-select:text;user-select:text;}";
    (document.head || document.documentElement).appendChild(st);
  } catch (_) {}

  // ── 3. Raccourcis d'inspection neutralisés ──
  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase();
    var meta = e.ctrlKey || e.metaKey;            // Ctrl (Win/Linux) ou Cmd (Mac)
    var blocked =
      e.key === "F12" ||                          // DevTools
      (meta && e.shiftKey && (k === "i" || k === "j" || k === "c")) || // inspecteur/console/picker
      (meta && k === "u") ||                      // afficher la source
      (meta && k === "s");                        // enregistrer la page
    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // ── 4. Avertissement dans la console (standard industrie : cf. Facebook) ──
  try {
    var t = "color:#00d9ff;font-weight:700;font-size:20px";
    var s = "color:#9fc6d6;font-size:13px;line-height:1.6";
    console.log("%cSTOP.", t);
    console.log(
      "%cCet espace est réservé aux développeurs.\n" +
      "L'ensemble du paradigme STK est protégé au titre de la propriété intellectuelle.\n" +
      "Reproduction, ingénierie inverse et réutilisation interdites sans autorisation écrite.\n" +
      "© 2026 STK Multidynamics — Tous droits réservés.",
      s
    );
  } catch (_) {}
})();
