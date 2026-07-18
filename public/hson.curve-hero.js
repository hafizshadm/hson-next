/*  3D curve hero — lays the hero images on a concave cylinder that scrolls
    horizontally, so the panels at the edges rotate away from the camera and
    recede into the page, the way a curved video wall reads.

    This is NOT the site's arc-marquee: that one tilts images along a 2D
    parabola inside the page plane. Here the stage owns the `perspective` and
    each panel is placed in real 3D space:

        translate3d(x, 0, z) rotateY(ry)

    x  — position along the wall (animated; wraps for an endless loop)
    z  — pushed back by the square of the distance from centre, which is what
         bends the flat row into a cylinder
    ry — turned to face the centre, so edge panels present their side

    Deliberately vanilla: it must not depend on GSAP load order, and it only
    binds to [data-curve-marquee], so it is inert on pages without one.

    Attributes:
      data-curve-marquee  -> stage (owns perspective + overflow)
      data-curve-track    -> track (transform-style: preserve-3d)
      data-curve-speed    -> px/sec along the wall (default 55)
      data-curve-angle    -> degrees of turn at the stage edge (default 46)
      data-curve-depth    -> px pushed back at the stage edge (default 420)
*/
(function () {
  "use strict";

  function build(stage) {
    var track = stage.querySelector("[data-curve-track]");
    if (!track) return;

    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

    var speed = parseFloat(stage.getAttribute("data-curve-speed")) || 55;
    var maxAngle = parseFloat(stage.getAttribute("data-curve-angle")) || 46;
    var depth = parseFloat(stage.getAttribute("data-curve-depth")) || 420;

    var items = originals.slice();
    var itemW = 0;
    var gap = 0;
    var step = 0;
    var total = 0;
    var halfStage = 1;
    var offset = 0;
    var last = 0;
    var paused = false;
    // Effective curve, softened (or flattened) on small screens. Mobile
    // browsers repaint the 3D perspective layer on every scroll frame, which
    // is what makes the hero shear/distort as you scroll — so on phones we drop
    // to a flat horizontal marquee (angle 0, depth 0) and only taper the depth
    // on tablets. Recomputed in measure() so it tracks orientation changes.
    var curAngle = maxAngle;
    var curDepth = depth;

    function responsiveCurve() {
      var w = window.innerWidth || document.documentElement.clientWidth;
      if (w <= 767) {
        curAngle = 0;
        curDepth = 0;
      } else if (w <= 991) {
        curAngle = maxAngle * 0.55;
        curDepth = depth * 0.5;
      } else {
        curAngle = maxAngle;
        curDepth = depth;
      }
    }

    function measure() {
      responsiveCurve();
      halfStage = stage.offsetWidth / 2 || 1;
      itemW = originals[0].getBoundingClientRect().width || 1;
      gap = parseFloat(stage.getAttribute("data-curve-gap")) || itemW * 0.06;
      step = itemW + gap;

      // Enough panels to cover the stage twice over, so the loop never shows a
      // seam however wide the viewport is.
      var need = Math.ceil((stage.offsetWidth * 2.4) / step) + 2;
      while (items.length < Math.max(need, originals.length)) {
        var clone = originals[items.length % originals.length].cloneNode(true);
        clone.setAttribute("data-curve-clone", "");
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
        items.push(clone);
      }
      total = step * items.length;
    }

    function render() {
      for (var i = 0; i < items.length; i++) {
        // Position along the wall, wrapped into [-total/2, total/2] so panels
        // recycle from one edge to the other.
        var x = (((i * step - offset) % total) + total) % total;
        if (x > total / 2) x -= total;

        var n = x / halfStage; // -1 .. 1 across the visible stage
        var clamped = Math.max(-1.8, Math.min(1.8, n));
        var z = -(clamped * clamped) * curDepth;
        var ry = -clamped * curAngle;

        var el = items[i];
        el.style.transform =
          "translate3d(" + (x - itemW / 2) + "px, 0, " + z + "px) rotateY(" + ry + "deg)";
        // Fade panels out before they reach the wrap point.
        el.style.opacity = Math.abs(n) > 1.45 ? "0" : "1";
      }
    }

    function frame(t) {
      if (!last) last = t;
      var dt = Math.min(64, t - last); // clamp so a backgrounded tab cannot jump
      last = t;
      if (!paused) {
        offset += (speed * dt) / 1000;
        if (offset >= total) offset -= total;
        render();
      }
      requestAnimationFrame(frame);
    }

    measure();
    render();
    // Only now are the panels off the shared centre origin and actually on the
    // wall. The stylesheet keeps the track hidden until this lands, so the
    // stacked-panel state is never painted.
    stage.classList.add("is-ready");
    requestAnimationFrame(frame);

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        measure();
        render();
      }, 150);
    });

    // Respect a reduced-motion preference: draw the wall, don't animate it.
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) paused = true;
  }

  function init() {
    var stages = document.querySelectorAll("[data-curve-marquee]");
    Array.prototype.forEach.call(stages, build);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
