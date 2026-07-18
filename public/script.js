   let __fullstackInitialized = false;

   function fullstackInit() {
     if (__fullstackInitialized) return;
     __fullstackInitialized = true;
   
     gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
   
     /* ========================================================================
        Init all patterns (each guards on missing elements)
        ======================================================================== */
      initScrollReveal();
      initTextFade();
      initTextHighlight();
      initFadeStagger();
      initArcMarquee();
      initButtonHover();
      initFooterLinkHover();
      initArrowLinkHover();
      initTeamCardHover();
      initHeroScrollPulse();
      initWorksStack();
      initWorksScroll();
      initWorksCursor();
      initCounters();
      initMarquee();
      initAccordion();
      initMagneticButtons();
      initHeroIntro();
      initProcessLine();
      initBannerParallax();
    }
   
   /* In Webflow production, the runtime processes Webflow.push() entries.
      In local browser preview there is no Webflow runtime, so we also wire
      to DOMContentLoaded. The idempotency flag ensures one-time init either way. */
   window.Webflow ||= [];
   window.Webflow.push(fullstackInit);
   
   if (document.readyState === "loading") {
     document.addEventListener("DOMContentLoaded", fullstackInit);
   } else {
     fullstackInit();
   }
   
   /* ==========================================================================
      Scroll Reveal (data-reveal, data-reveal-stagger)
      ========================================================================== */
   
   function initScrollReveal() {
     const reveals = gsap.utils.toArray("[data-reveal]");
   
     reveals.forEach((el) => {
       const delay = parseFloat(el.getAttribute("data-reveal-delay")) || 0;
       const duration = parseFloat(el.getAttribute("data-reveal-duration")) || 0.8;
       const yOffset = parseFloat(el.getAttribute("data-reveal-y")) || 24;
   
       gsap.set(el, { opacity: 0, y: yOffset });
   
       ScrollTrigger.create({
         trigger: el,
         start: "top 85%",
         onEnter: () => {
           gsap.to(el, {
             opacity: 1,
             y: 0,
             duration: duration,
             delay: delay,
             ease: "power2.out",
           });
         },
       });
     });
   
     const staggers = gsap.utils.toArray("[data-reveal-stagger]");
   
     staggers.forEach((parent) => {
       const staggerAmount = parseFloat(parent.getAttribute("data-reveal-stagger")) || 0.1;
       const children = Array.from(parent.children);
       if (!children.length) return;
   
       gsap.set(children, { opacity: 0, y: 24 });
   
       ScrollTrigger.create({
         trigger: parent,
         start: "top 85%",
         onEnter: () => {
           gsap.to(children, {
             opacity: 1,
             y: 0,
             duration: 0.8,
             stagger: staggerAmount,
             ease: "power2.out",
           });
         },
       });
     });
   }
   
   /* ==========================================================================
      Text Fade Reveal (data-text-fade)
      ----------------------------------------------------------------------------
      Scroll-linked word-by-word fade-in — the simple version. Uses SplitText
      to split into words, then animates opacity from a dim "ghost" state
      (default 0.15) to fully visible, scrubbed by scroll. The stagger combined
      with scrub creates a left-to-right wipe: at any given scroll position,
      words near the start of the sentence are at the TO state while later
      words are still at the FROM state, so you see a clean diagonal cascade
      through the heading as the user scrolls.
      ----------------------------------------------------------------------------
      Reusable: drop `data-text-fade` on any heading/paragraph/text element.
      The text retains its existing CSS color (white on dark sections, black on
      light sections) — no theme switching needed.
      ----------------------------------------------------------------------------
      Optional attributes:
        data-text-fade-from     initial opacity (default 0.15)
        data-text-fade-stagger  stagger amount in timeline units (default 0.5)
        data-text-fade-start    ScrollTrigger start (default "top 80%")
        data-text-fade-end      ScrollTrigger end   (default "bottom 60%")
        data-text-fade-scrub    scrub value (default 1.5)
      ========================================================================== */
   
   function initTextFade() {
     if (typeof SplitText === "undefined") return;
   
     const targets = gsap.utils.toArray("[data-text-fade]");
     if (!targets.length) return;
   
     targets.forEach((el) => {
       const fromOpacity = parseFloat(el.getAttribute("data-text-fade-from")) || 0.15;
       const stagger = parseFloat(el.getAttribute("data-text-fade-stagger")) || 0.5;
       const start = el.getAttribute("data-text-fade-start") || "top 80%";
       const end = el.getAttribute("data-text-fade-end") || "bottom 60%";
       const scrub = parseFloat(el.getAttribute("data-text-fade-scrub")) || 1.5;
   
       const split = new SplitText(el, {
         type: "words",
         wordsClass: "text-fade_word",
       });
       const words = split.words;
       if (!words.length) return;
   
       gsap.set(words, {
         display: "inline-block",
         opacity: fromOpacity,
         willChange: "opacity",
       });
   
       gsap.to(words, {
         opacity: 1,
         ease: "none",
         stagger: stagger,
         scrollTrigger: {
           trigger: el,
           start: start,
           end: end,
           scrub: scrub,
         },
       });
     });
   }
   
   /* ==========================================================================
      Typewriter Reveal (data-text-highlight)
      ----------------------------------------------------------------------------
      Types the heading out character by character with a blinking caret that
      follows the last typed letter, then retires the caret shortly after the
      line finishes. Replaces the old highlighter-pen clip reveal. The text
      keeps its own CSS colour (white on dark sections, black on light) and the
      caret is `currentColor`, so no theme switching is needed.
      ----------------------------------------------------------------------------
      Every character starts at opacity 0 (but keeps its layout box, so there is
      no reflow) and is flipped to opacity 1 in sequence. SplitText also splits
      into lines; each computed line is pinned to `white-space: nowrap` so the
      caret we insert between characters can never force a mid-word re-wrap.
      The sequence plays ONCE when the element scrolls into view (no scrub) —
      same trigger model as data-reveal.
      ----------------------------------------------------------------------------
      Reusable: drop `data-text-highlight` on any heading/paragraph/text element.
      The element MUST have its final width before init (max-width / container)
      so SplitText can compute the line breaks the user actually sees.
      ----------------------------------------------------------------------------
      Optional attributes:
        data-typewriter-speed   seconds per character (default: adaptive — long
                                headings type a little faster so they don't drag)
        data-typewriter-start   ScrollTrigger start (default "top 80%")
                                (data-text-highlight-start is still honoured)
      ========================================================================== */

   function initTextHighlight() {
     if (typeof SplitText === "undefined") return;

     const targets = gsap.utils.toArray("[data-text-highlight]");
     if (!targets.length) return;

     const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

     targets.forEach((el) => {
       const start =
         el.getAttribute("data-typewriter-start") ||
         el.getAttribute("data-text-highlight-start") ||
         "top 80%";

       const split = new SplitText(el, {
         type: "lines,words,chars",
         linesClass: "typewriter_line",
         wordsClass: "typewriter_word",
         charsClass: "typewriter_char",
       });
       const chars = split.chars;
       if (!chars.length) return;

       // Keep each computed line on one row so the caret (and the reserved
       // layout of not-yet-typed characters) can't push a word onto a new line.
       split.lines.forEach((line) => {
         line.style.whiteSpace = "nowrap";
       });

       // Reduced motion: SplitText leaves the text fully visible — just stop.
       if (reduce) return;

       gsap.set(chars, { opacity: 0 });

       // A blinking caret (CSS-animated) that we re-parent after each typed
       // character so it trails the cursor, then remove once typing settles.
       const caret = document.createElement("span");
       caret.className = "typewriter_caret";
       caret.setAttribute("aria-hidden", "true");

       // Adaptive cadence: shorter headings get a deliberate typewriter pace,
       // longer ones speed up so a 60-character line doesn't crawl.
       const each =
         parseFloat(el.getAttribute("data-typewriter-speed")) ||
         (chars.length > 42 ? 0.028 : 0.045);

       const tl = gsap.timeline({ paused: true });
       tl.to(chars, {
         opacity: 1,
         duration: 0.01,
         ease: "none",
         stagger: {
           each: each,
           onStart: function () {
             const c = this.targets()[0];
             c.parentNode.insertBefore(caret, c.nextSibling);
           },
         },
       });
       // Let the caret blink for a beat after the last letter, then retire it
       // so the page isn't left with a cursor parked on every heading.
       tl.call(() => {
         setTimeout(() => caret.remove(), 1200);
       });

       // Fire once when the heading enters the viewport
       ScrollTrigger.create({
         trigger: el,
         start: start,
         once: true,
         onEnter: () => tl.play(),
       });
     });
   }
   
   /* ==========================================================================
      Fade Stagger Reveal (data-fade-stagger)
      ----------------------------------------------------------------------------
      Each direct child of the parent fades in from opacity 0 → 1, staggered
      one after another. No transform, no rotation — just a clean cascade of
      fades. Plays ONCE when the parent first enters the viewport (same
      trigger model as data-reveal / data-text-highlight / data-flip-reveal).
      ----------------------------------------------------------------------------
      Reusable: drop `data-fade-stagger="0.06"` (value is the per-child stagger
      in seconds) on any grid/list parent. The animation hits the parent's
      direct children.
      ----------------------------------------------------------------------------
      Optional attributes:
        data-fade-stagger-duration  per-child duration in seconds (default 0.7)
        data-fade-stagger-delay     wait time after trigger before the cascade
                                    begins, in seconds (default 0)
        data-fade-stagger-start     ScrollTrigger start (default "top bottom")
      ========================================================================== */
   
   function initFadeStagger() {
     const parents = gsap.utils.toArray("[data-fade-stagger]");
     if (!parents.length) return;
   
     parents.forEach((parent) => {
       const stagger = parseFloat(parent.getAttribute("data-fade-stagger")) || 0.06;
       const duration = parseFloat(parent.getAttribute("data-fade-stagger-duration")) || 0.7;
       const delay = parseFloat(parent.getAttribute("data-fade-stagger-delay")) || 0;
       const start = parent.getAttribute("data-fade-stagger-start") || "top bottom";
   
       const children = Array.from(parent.children);
       if (!children.length) return;
   
       gsap.set(children, { opacity: 0 });
   
       ScrollTrigger.create({
         trigger: parent,
         start: start,
         once: true,
         onEnter: () => {
           gsap.to(children, {
             opacity: 1,
             duration: duration,
             delay: delay,
             stagger: stagger,
             ease: "power2.out",
           });
         },
       });
     });
   }
   
   /* ==========================================================================
      Arc Marquee — Parabolic Arc Marquee
      Items slide horizontally right-to-left along a shallow parabolic curve.
      The curve is a FROWN shape in CSS (middle items at small y / top visual,
      edge items at larger y / bottom visual). Each item rotates by the tangent
      angle of the parabola at its x position, so left items tilt CCW (/) and
      right items tilt CW (\).
   
      Why parabolic instead of circular: circular math has a fundamental tradeoff
      between "many items visible" (small radius, very curved) and "gentle arc"
      (large radius, few items visible). A parabola decouples horizontal density
      from curve depth, so we can have 6 items visible AND a gentle arc.
   
      Attributes:
        data-arc-marquee          → wrap element
        data-arc-marquee-track    → track element (holds all items)
        data-arc-marquee-item     → each item
        data-arc-marquee-speed    → seconds per full loop (default 60)
      ========================================================================== */
   
   function initArcMarquee() {
     const marquees = gsap.utils.toArray("[data-arc-marquee]");
   
     marquees.forEach((marquee) => {
       const track = marquee.querySelector("[data-arc-marquee-track]");
       if (!track) return;
       const items = gsap.utils.toArray("[data-arc-marquee-item]", track);
       if (!items.length) return;
   
       const speed = parseFloat(marquee.getAttribute("data-arc-marquee-speed")) || 60;
       const count = items.length;
   
       // Layout values (recomputed on resize)
       let halfWrap = 0;
       let itemSpacing = 0;
       let totalWidth = 0;
       let arcDepth = 0;
       let baseY = 0;
       let pixelsPerMs = 0;

       function layout() {
         const wrapHeight = marquee.offsetHeight;
         halfWrap = marquee.offsetWidth / 2;
         // Read the computed font-size (= var(--size-font) via .page-wrapper)
         // so all layout values are em-based and scale with the scale system
         // consistently, instead of mixing raw vw with em item sizes.
         const fontSize = parseFloat(getComputedStyle(marquee).fontSize);
 		const itemWidth = window.innerHeight * 0.28;
         const gap = window.innerHeight * 0.075;
         itemSpacing = itemWidth + gap;
         totalWidth = itemSpacing * count;
         pixelsPerMs = totalWidth / (speed * 1000);
         // Arc depth and baseY stay proportional to wrapHeight, which is itself
         // em-based in CSS (40em), so they scale consistently.
         arcDepth = wrapHeight * 0.25;
         baseY = wrapHeight * 0.25;
       }

       var offset = 0;
       var speedMult = 1;
       var targetSpeedMult = 1;
       var lastScrollY = window.scrollY || 0;

       function update() {
         items.forEach((item, i) => {
           let xArc = ((i * itemSpacing - offset) % totalWidth + totalWidth) % totalWidth;
           if (xArc >= totalWidth / 2) xArc -= totalWidth;

           const norm = xArc / halfWrap;
           const y = baseY + arcDepth * norm * norm;
           const slope = (2 * arcDepth * norm) / halfWrap;
           const rotation = Math.atan(slope) * 180 / Math.PI;

           gsap.set(item, {
             x: halfWrap + xArc,
             y: y,
             rotation: rotation,
             xPercent: -50,
             yPercent: -50,
           });
         });
       }

       function tickerUpdate(time, delta) {
         var scrollY = window.scrollY || 0;
         var scrollDelta = scrollY - lastScrollY;
         lastScrollY = scrollY;

         if (Math.abs(scrollDelta) > 0.5) {
           var velocity = scrollDelta / delta;
           var clamped = Math.max(-8, Math.min(8, velocity));
           targetSpeedMult = 1 + clamped * 12;
         } else {
           targetSpeedMult += (1 - targetSpeedMult) * 0.02;
         }

         speedMult += (targetSpeedMult - speedMult) * 0.04;
         offset += pixelsPerMs * delta * speedMult;
         update();
       }

       layout();
       update();
       gsap.set(marquee, { opacity: 0 });
       gsap.ticker.add(tickerUpdate);

       // On load: fade in
       gsap.to(marquee, {
         opacity: 1,
         duration: 1.5,
         ease: "power1.inOut",
         delay: 0.5,
       });

       // Recalculate on viewport changes
       ScrollTrigger.addEventListener("refresh", () => {
         offset = 0;
         layout();
       });
     });
   }
   
   /* ==========================================================================
      Button Hover — Journey "Play Showreel" replica
      On mouseenter:
        - .button_bg scales 1 → 0.98 (subtle press-in)
        - Both .button_text_main and .button_text_hover are SplitText'd into chars
          and slide up by one line height (-1.3em), per-char stagger amount 0.2
      Mouseleave reverses everything.
      Parent→child animation via GSAP (not CSS — descendant selectors break the converter).
      ========================================================================== */
   
   function initButtonHover() {
     const buttons = gsap.utils.toArray(".button");
   
     buttons.forEach((btn) => {
       const bg = btn.querySelector(".button_bg");
       const textMain = btn.querySelector(".button_text_main");
       const textHover = btn.querySelector(".button_text_hover");
       if (!textMain) return;
   
       const splitMain = new SplitText(textMain, { type: "chars" });
       const splitHover = textHover ? new SplitText(textHover, { type: "chars" }) : null;
   
       const charConfig = {
         duration: 0.4,
         ease: "power2.out",
         stagger: { amount: 0.2 },
       };
   
       btn.addEventListener("mouseenter", () => {
         if (bg) {
           gsap.to(bg, { scale: 0.98, duration: 0.4, ease: "power2.out" });
         }
         gsap.to(splitMain.chars, { ...charConfig, y: "-1.3em" });
         if (splitHover) {
           gsap.to(splitHover.chars, { ...charConfig, y: "-1.3em" });
         }
       });
   
       btn.addEventListener("mouseleave", () => {
         if (bg) {
           gsap.to(bg, { scale: 1, duration: 0.4, ease: "power2.out" });
         }
         gsap.to(splitMain.chars, { ...charConfig, y: "0em" });
         if (splitHover) {
           gsap.to(splitHover.chars, { ...charConfig, y: "0em" });
         }
       });
     });
   }
   
   /* ==========================================================================
      Footer Link Hover (underline grow + text color shift)
      ========================================================================== */
   
   function initFooterLinkHover() {
     if (typeof SplitText === "undefined") return;

     var links = gsap.utils.toArray(".footer_link");
     if (!links.length) return;

     links.forEach(function (link) {
       var main = link.querySelector(".is--footer");
       var hover = link.querySelector(".is--hover");
       if (!main) return;

       var splitMain = new SplitText(main, { type: "chars" });
       var splitHover = hover ? new SplitText(hover, { type: "chars" }) : null;

       var charConfig = {
         duration: 0.4,
         ease: "power2.out",
         stagger: { amount: 0.2 },
       };

       link.addEventListener("mouseenter", function () {
         gsap.to(splitMain.chars, Object.assign({}, charConfig, { y: "-1.3em" }));
         if (splitHover) gsap.to(splitHover.chars, Object.assign({}, charConfig, { y: "-1.3em" }));
       });

       link.addEventListener("mouseleave", function () {
         gsap.to(splitMain.chars, Object.assign({}, charConfig, { y: "0em" }));
         if (splitHover) gsap.to(splitHover.chars, Object.assign({}, charConfig, { y: "0em" }));
       });
     });
   }
   
   /* ==========================================================================
      Team Card Hover (char-by-char reveal on info panel)
      ========================================================================== */

   function initTeamCardHover() {
     if (typeof SplitText === "undefined") return;
   
     const cards = gsap.utils.toArray(".team_card");
     if (!cards.length) return;
   
     cards.forEach((card) => {
       const info = card.querySelector(".team_info");
       if (!info) return;
   
       const textEls = gsap.utils.toArray(
         info.querySelectorAll(
           ".team_position .text-size-tiny, .brands_tag .text-size-tiny, .team_intro"
         )
       );
       if (!textEls.length) return;
   
       const splits = textEls.map((el) => new SplitText(el, { type: "chars" }));
       const allChars = splits.flatMap((s) => s.chars);
   
       gsap.set(allChars, { opacity: 0 });
   
       const tl = gsap.timeline({ paused: true });
       tl.to(info, { opacity: 1, duration: 0.3, ease: "power2.out" })
         .to(allChars, {
           opacity: 1,
           duration: 0.23,
           ease: "power2.out",
           stagger: { amount: 0.8 },
         }, 0);
   
       card.addEventListener("mouseenter", () => tl.timeScale(1).play());
       card.addEventListener("mouseleave", () => tl.timeScale(4).reverse());
     });
   }
   
   /* ==========================================================================
      Arrow Link Hover (text line + icon slide)
      ========================================================================== */

   function initArrowLinkHover() {
     const links = gsap.utils.toArray(".arrow-link");
   
     links.forEach((link) => {
       const line = link.querySelector(".arrow-link_line");
       const icon = link.querySelector(".arrow-link_icon");
       if (!line) return;
   
       link.addEventListener("mouseenter", () => {
         gsap.to(line, { width: "100%", duration: 0.35, ease: "power2.out" });
         if (icon) {
           gsap.to(icon, { x: 4, duration: 0.35, ease: "power2.out" });
         }
       });
   
       link.addEventListener("mouseleave", () => {
         gsap.to(line, { width: "0%", duration: 0.35, ease: "power2.out" });
         if (icon) {
           gsap.to(icon, { x: 0, duration: 0.35, ease: "power2.out" });
         }
       });
     });
   }
   
   /* ==========================================================================
      Hero Scroll Pulse — looping scaleY pulse on .hero_scroll-line
      Replaces CSS @keyframes (not convertible). GSAP timeline with yoyo.
      ========================================================================== */

   function initHeroScrollPulse() {
     var line = document.querySelector(".hero_scroll-line");
     if (!line) return;

     gsap.set(line, { scaleY: 0, transformOrigin: "top center", opacity: 0 });

     gsap.timeline({ repeat: -1 })
       .to(line, {
         scaleY: 1,
         opacity: 0.25,
         duration: 0.96,
         ease: "power1.inOut",
       })
       .to(line, {
         duration: 0.48,
         ease: "none",
       })
       .to(line, {
         scaleY: 0,
         opacity: 0,
         transformOrigin: "bottom center",
         duration: 0.96,
         ease: "power1.inOut",
       });
   }

   /* ==========================================================================
      Works Stack — Scroll-Stack Cards (data-works-stack, data-works-card)
      ---------------------------------------------------------------------------
      Scroll-driven card stacking animation. Cards are absolutely positioned.
      As the user scrolls through the pinned section, each new card slides up
      from below and covers the current card, which scales down slightly to
      create a depth/layering effect. The container clips with overflow:hidden
      and border-radius so the incoming card is masked until it enters frame.
      Desktop/tablet: pinned section with scroll-stack.
      Mobile portrait: vertical scroll with simple reveals.
      ========================================================================== */
   
   var __worksActiveIndex = 0;
   
   function initWorksStack() {
     var stackEl = document.querySelector("[data-works-stack]");
     if (!stackEl) return;
   
     var cards = gsap.utils.toArray("[data-works-card]", stackEl);
     var total = cards.length;
     if (total < 2) return;
   
     var mm = gsap.matchMedia();
   
     // Desktop & tablet: scroll-stack with pin + image parallax
     mm.add("(min-width: 480px)", function () {
       var images = cards.map(function (card) {
         return card.querySelector(".works_image");
       });
   
       // First card visible, rest positioned below (clipped by overflow:hidden)
       cards.forEach(function (card, i) {
         gsap.set(card, {
           zIndex: i + 1,
           y: i === 0 ? "0%" : "100%",
         });
       });
   
       // Scale images up for parallax headroom (clipped by card overflow:hidden)
       images.forEach(function (img) {
         if (img) gsap.set(img, { scale: 1.2 });
       });
   
       var tl = gsap.timeline({
         scrollTrigger: {
           trigger: ".section_works",
           start: "top top",
           end: function () {
             return "+=" + (total - 1) * window.innerHeight * 0.75;
           },
           pin: true,
           scrub: 0.5,
           onUpdate: function (self) {
             // Switch to the incoming card once it covers ~25% of the view
             __worksActiveIndex = Math.min(
               Math.floor(self.progress * (total - 1) + 0.75),
               total - 1
             );
           },
         },
       });
   
       for (var i = 0; i < total - 1; i++) {
         // Current card: scale down — recedes into background
         tl.to(cards[i], {
           scale: 0.92,
           duration: 1,
           ease: "none",
         }, i);
   
         // Current card's image: drifts downward as card recedes
         if (images[i]) {
           tl.to(images[i], {
             y: "8%",
             duration: 1,
             ease: "none",
           }, i);
         }
   
         // Next card: slides up from below into view
         tl.to(cards[i + 1], {
           y: "0%",
           duration: 1,
           ease: "none",
         }, i);
   
         // Next card's image: starts offset up, settles down — parallax lag
         if (images[i + 1]) {
           tl.fromTo(images[i + 1],
             { y: "-15%" },
             { y: "0%", duration: 1, ease: "none" },
             i
           );
         }
       }
     });
   
     // Mobile portrait: simple scroll, no pin
     mm.add("(max-width: 479px)", function () {
       cards.forEach(function (card) {
         gsap.set(card, { y: 24 });
         ScrollTrigger.create({
           trigger: card,
           start: "top 85%",
           onEnter: function () {
             gsap.to(card, {
               y: 0,
               duration: 0.8,
               ease: "power2.out",
             });
           },
         });
       });
     });
   }
   
   /* ==========================================================================
      Works Scroll — Sticky stacking cards without pin (data-works-scroll)
      ---------------------------------------------------------------------------
      Cards are position:sticky in normal document flow. As each new card scrolls
      up it naturally covers the previous one, which scales down via an individual
      ScrollTrigger. Image parallax runs per-card.
      ========================================================================== */
   
   function initWorksScroll() {
     var scrollEl = document.querySelector("[data-works-scroll]");
     if (!scrollEl) return;
   
     var cards = gsap.utils.toArray("[data-works-card]", scrollEl);
     var total = cards.length;
     if (total < 2) return;
   
     var images = cards.map(function (card) {
       return card.querySelector(".works_image");
     });
   
     // Scale images for parallax headroom
     images.forEach(function (img) {
       if (img) gsap.set(img, { scale: 1.2 });
     });
   
     var mm = gsap.matchMedia();
   
     // Rotation is handled by IX3 custom attributes on each card.
     // Scale images for parallax headroom (kept for cursor visual only).
   
     // Mobile: simple reveal
     mm.add("(max-width: 479px)", function () {
       cards.forEach(function (card) {
         gsap.set(card, { y: 24 });
         ScrollTrigger.create({
           trigger: card,
           start: "top 85%",
           onEnter: function () {
             gsap.to(card, { y: 0, duration: 0.8, ease: "power2.out" });
           },
         });
       });
     });
   }
   
   /* ==========================================================================
      Works Cursor — mouse-following "View Work" + project name on card hover.
      ScrambleText on both labels when entering and when the active card changes
      during scroll. data-works-name on each card maps to a CMS field in Webflow
      (bind the Collection item Name to a custom attribute).
      ========================================================================== */
   
   function initWorksCursor() {
     var wrapEl = document.querySelector("[data-works-stack]") || document.querySelector("[data-works-scroll]");
     if (!wrapEl) return;
   
     var cursor = wrapEl.querySelector("[data-works-cursor]");
     if (!cursor) return;
   
     var labelEl = cursor.querySelector("[data-works-cursor-label]");
     var cards = gsap.utils.toArray("[data-works-card]", wrapEl);
     if (!labelEl || !cards.length) return;
   
     var isStack = wrapEl.hasAttribute("data-works-stack");
   
     gsap.set(cursor, { xPercent: 15, yPercent: 15, opacity: 0, scale: 0.8 });
   
     var xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
     var yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
   
     var isHovering = false;
     var mouseX = 0;
     var mouseY = 0;
     var scrambleConfig = { chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.4 };
   
     wrapEl.addEventListener("mousemove", function (e) {
       mouseX = e.clientX;
       mouseY = e.clientY;
       var rect = wrapEl.getBoundingClientRect();
       xTo(e.clientX - rect.left);
       yTo(e.clientY - rect.top);
     });
   
     wrapEl.addEventListener("mouseenter", function (e) {
       isHovering = true;
       mouseX = e.clientX;
       mouseY = e.clientY;
       var rect = wrapEl.getBoundingClientRect();
       gsap.set(cursor, { x: e.clientX - rect.left, y: e.clientY - rect.top });
       gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
       gsap.to(labelEl, {
         duration: 0.4,
         scrambleText: { text: "View Work", chars: scrambleConfig.chars, speed: scrambleConfig.speed },
       });
     });
   
     wrapEl.addEventListener("mouseleave", function () {
       isHovering = false;
       gsap.to(cursor, { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" });
     });
   
   }

   // ==============================================
// GSAP Number Counter Animation
// ==============================================

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    if (!counters.length) return;

    const CONFIG = {
        defaultDuration: 2,
        defaultStart: 0,
        ease: "power2.out",
        triggerStart: "top 85%"
    };

    function getDecimalPlaces(numString) {
        const normalized = numString.replace(',', '.');
        const parts = normalized.split('.');
        
        if (parts.length > 1) {
            return parts[1].length;
        }
        return 0;
    }

    function parseNumber(numString) {
        const normalized = numString.replace(',', '.');
        return parseFloat(normalized);
    }

    function formatNumber(num, decimals, useComma) {
        const formatted = num.toFixed(decimals);
        
        if (useComma) {
            return formatted.replace('.', ',');
        }
        return formatted;
    }

    counters.forEach(function(element) {
        const targetString = element.getAttribute('data-count');
        
        if (!targetString) return;

        const targetNumber = parseNumber(targetString);
        const startNumber = parseNumber(element.getAttribute('data-count-start') || String(CONFIG.defaultStart));
        const duration = parseFloat(element.getAttribute('data-count-duration') || CONFIG.defaultDuration);
        const decimals = getDecimalPlaces(targetString);
        const useComma = targetString.includes(',');

        if (isNaN(targetNumber)) return;

        element.textContent = formatNumber(startNumber, decimals, useComma);

        const counter = { value: startNumber };

        gsap.to(counter, {
            value: targetNumber,
            duration: duration,
            ease: CONFIG.ease,
            scrollTrigger: {
                trigger: element,
                start: CONFIG.triggerStart,
                once: true
            },
            onUpdate: function() {
                element.textContent = formatNumber(counter.value, decimals, useComma);
            }
        });
    });
}

  // ==============================================
// Accordion — interactive service index (services.html)
// Single-open behavior, GSAP height tween, deep-link via #service-XX
// ==============================================

function initAccordion() {
  const groups = gsap.utils.toArray("[data-accordion]");
  if (!groups.length) return;

  function getParts(item) {
    return {
      panel: item.querySelector("[data-accordion-panel]"),
      trigger: item.querySelector("[data-accordion-trigger]"),
      inner: item.querySelector(".accordion_panel-inner"),
    };
  }

  function openItem(item, animate) {
    const { panel, trigger, inner } = getParts(item);
    if (!panel || !inner) return;
    item.classList.add("is--active");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    const targetHeight = inner.offsetHeight;
    if (animate) {
      gsap.fromTo(panel, { height: 0 }, { height: targetHeight, duration: 0.6, ease: "power2.inOut" });
    } else {
      gsap.set(panel, { height: targetHeight });
    }
  }

  function closeItem(item, animate) {
    const { panel, trigger } = getParts(item);
    if (!panel) return;
    item.classList.remove("is--active");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (animate) {
      gsap.to(panel, { height: 0, duration: 0.5, ease: "power2.inOut" });
    } else {
      gsap.set(panel, { height: 0 });
    }
  }

  groups.forEach((group) => {
    const items = gsap.utils.toArray("[data-accordion-item]", group);
    if (!items.length) return;

    items.forEach((item) => {
      const { panel, trigger } = getParts(item);
      if (!panel) return;

      if (item.classList.contains("is--active")) {
        openItem(item, false);
      } else {
        gsap.set(panel, { height: 0 });
      }

      if (!trigger) return;
      trigger.addEventListener("click", () => {
        const isActive = item.classList.contains("is--active");
        items.forEach((other) => {
          if (other !== item && other.classList.contains("is--active")) {
            closeItem(other, true);
          }
        });
        if (isActive) {
          closeItem(item, true);
        } else {
          openItem(item, true);
        }
      });
    });

    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target && items.indexOf(target) !== -1) {
        items.forEach((item) => {
          if (item !== target && item.classList.contains("is--active")) {
            closeItem(item, false);
          }
        });
        openItem(target, false);
        window.requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    }
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      groups.forEach((group) => {
        gsap.utils.toArray("[data-accordion-item].is--active", group).forEach((item) => {
          const { panel, inner } = getParts(item);
          if (panel && inner) gsap.set(panel, { height: inner.offsetHeight });
        });
      });
    }, 150);
  });
}

  // ==============================================
// Magnetic Buttons — subtle cursor-pull on the primary CTAs only
// (hero button + banner CTAs), not every button sitewide
// ==============================================

function initMagneticButtons() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const targets = gsap.utils.toArray(".hero_bottom_content .button, .banner_btn .button");
  if (!targets.length) return;

  const STRENGTH = 14;

  targets.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: (relX / rect.width) * STRENGTH,
        y: (relY / rect.height) * STRENGTH,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });
}

  // ==============================================
// Hero Intro — subtle on-load stagger for the tag, subtitle, and CTA.
// The heading itself is excluded: data-text-fade already owns its opacity
// via SplitText words, scrubbed by scroll — animating it here too would
// fight that system.
// ==============================================

function initHeroIntro() {
  const hero = document.querySelector(".section_hero");
  if (!hero) return;

  const targets = [
    hero.querySelector(".hero_tag"),
    hero.querySelector(".hero_bottom_subtitle"),
    hero.querySelector(".hero_bottom_content .button"),
  ].filter(Boolean);
  if (!targets.length) return;

  gsap.set(targets, { opacity: 0, y: 18 });
  gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power2.out",
    delay: 0.3,
  });
}

  // ==============================================
// Process Progress Line — draws left-to-right as the 4 step cards scroll
// through view, scrubbed to scroll position (no easing lag).
// ==============================================

function initProcessLine() {
  const bar = document.querySelector(".process_progress-bar");
  const grid = document.querySelector(".process_grid");
  if (!bar || !grid) return;

  gsap.to(bar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: grid,
      start: "top 85%",
      end: "bottom 55%",
      scrub: 0.6,
    },
  });
}

  // ==============================================
// Banner Parallax — CTA background image/video settles from a slight zoom
// as its section scrolls through view. Purely decorative, scrubbed to scroll.
// ==============================================

function initBannerParallax() {
  const banners = gsap.utils.toArray(".banner_component");
  if (!banners.length) return;

  banners.forEach(function (banner) {
    const img = banner.querySelector(".banner_bg-image");
    if (!img) return;

    gsap.fromTo(
      img,
      { scale: 1.15 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: banner,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      }
    );
  });
}

  // ==============================================
// GSAP Marquee Effect
// ==============================================

function initMarquee() {
    const marquees = document.querySelectorAll('[data-marquee]');
    
    if (!marquees.length) return;

    marquees.forEach(function(wrap) {
        
        const track = wrap.querySelector('[data-marquee-list]');
        
        if (!track) return;

        let ctx = null;

        const CONFIG = {
            speed: parseFloat(wrap.getAttribute('data-marquee-speed') || '60'),
            direction: (wrap.getAttribute('data-marquee-direction') || 'left').toLowerCase(),
            gap: wrap.getAttribute('data-marquee-gap') || '0rem'
        };

        let tween = null;
        let baseWidth = 0;
        let lastWindowWidth = window.innerWidth;

        gsap.set(wrap, {
            position: 'relative',
            overflow: 'hidden',
            width: '100%'
        });

        gsap.set(track, {
            display: 'flex',
            flexWrap: 'nowrap',
            gap: CONFIG.gap
        });

        // Subtle entrance: the strip fades/slides in once, independent of
        // the continuous horizontal scroll tween set up below.
        gsap.set(wrap, { opacity: 0, y: 12 });
        ScrollTrigger.create({
            trigger: wrap,
            start: 'top 90%',
            once: true,
            onEnter: function () {
                gsap.to(wrap, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
            }
        });

        function getOriginalItems() {
            return Array.from(track.children).filter(function(child) {
                return !child.hasAttribute('data-mq-clone');
            });
        }

        function measureBaseWidth() {
            let width = 0;
            getOriginalItems().forEach(function(item) {
                const rect = item.getBoundingClientRect();
                width += rect.width;
            });
            
            const gapValue = parseFloat(window.getComputedStyle(track).gap) || 0;
            const itemCount = getOriginalItems().length;
            if (itemCount > 1) {
                width += gapValue * itemCount;
            }
            
            return width;
        }

        function removeClones() {
            Array.from(track.querySelectorAll('[data-mq-clone]')).forEach(function(clone) {
                clone.remove();
            });
        }

        function createClones() {
            const wrapWidth = wrap.offsetWidth;
            const originals = getOriginalItems();
            
            if (!originals.length || baseWidth === 0) return;

            const setsNeeded = Math.ceil(wrapWidth / baseWidth) + 2;

            for (let i = 0; i < setsNeeded; i++) {
                originals.forEach(function(item) {
                    const clone = item.cloneNode(true);
                    clone.setAttribute('data-mq-clone', '');
                    clone.setAttribute('aria-hidden', 'true');
                    track.appendChild(clone);
                });
            }
        }

        function setup() {
            if (ctx) {
                ctx.revert();
                ctx = null;
            }

            gsap.set(track, { x: 0 });
            
            removeClones();
            
            baseWidth = measureBaseWidth();
            
            if (baseWidth === 0) return;
            
            createClones();
            
            const duration = baseWidth / CONFIG.speed;
            
            ctx = gsap.context(function() {
                
                if (CONFIG.direction === 'right') {
                    gsap.set(track, { x: -baseWidth });
                }
                
                const fromX = CONFIG.direction === 'right' ? -baseWidth : 0;
                const toX = CONFIG.direction === 'right' ? 0 : -baseWidth;
                
                tween = gsap.fromTo(track, 
                    { x: fromX },
                    {
                        x: toX,
                        duration: duration,
                        ease: 'none',
                        repeat: -1
                    }
                );

            }, wrap);
        }

        let resizeTimer = null;
        
        function handleResize() {
            if (resizeTimer) {
                clearTimeout(resizeTimer);
            }
            
            resizeTimer = setTimeout(function() {
                const newWindowWidth = window.innerWidth;
                
                if (newWindowWidth !== lastWindowWidth) {
                    lastWindowWidth = newWindowWidth;
                    setup();
                }
            }, 300);
        }

        window.addEventListener('resize', handleResize);

        const visibilityObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!tween) return;
                
                if (entry.isIntersecting) {
                    tween.play();
                } else {
                    tween.pause();
                }
            });
        }, {
            threshold: 0,
            rootMargin: '50px'
        });

        visibilityObserver.observe(wrap);

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        function handleReducedMotion() {
            if (!tween) return;
            
            if (reducedMotion.matches) {
                tween.pause();
            } else {
                tween.play();
            }
        }

        reducedMotion.addEventListener('change', handleReducedMotion);

        function cleanup() {
            if (ctx) {
                ctx.revert();
            }
            if (resizeTimer) {
                clearTimeout(resizeTimer);
            }
            visibilityObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        }

        wrap._marqueeCleanup = cleanup;

        function init() {
            setup();
            handleReducedMotion();
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(init);
        } else {
            setTimeout(init, 200);
        }
    });
}
