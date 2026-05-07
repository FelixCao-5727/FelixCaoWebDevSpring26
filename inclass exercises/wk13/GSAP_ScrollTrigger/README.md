# Intro to GSAP ScrollTrigger

### Building a scroll-animated page with an active-section nav (scrollspy) in vanilla HTML, CSS, and JS

---

## Lesson Overview

**Audience:** Students who know HTML, CSS, and JS basics but have never used GSAP.

**What you'll build:** A single-page site with five sections. A sticky nav at the top highlights the section you're currently viewing (scrollspy), and each section's content fades and slides into place as it enters the viewport.

**What you'll learn:**

1. What GSAP and ScrollTrigger are, and when to reach for them
2. How to load GSAP and register the ScrollTrigger plugin from a CDN
3. How to create scroll-triggered animations with `gsap.from()`
4. How to build a scrollspy using ScrollTrigger's `onToggle` callback
5. How to debug with `markers: true`

**Time:** ~60 minutes

**Prereqs:** A text editor (VS Code is fine), a browser, and the ability to open an HTML file locally.

---

## 1. Why GSAP? Why ScrollTrigger?

You can animate in vanilla CSS/JS using `@keyframes`, CSS transitions, `requestAnimationFrame`, or the `IntersectionObserver` API. So why learn a library?

**GSAP** (GreenSock Animation Platform) is a JavaScript animation library. It gives you one consistent, well-tested API for animating any numeric CSS property, SVG, or canvas — with better performance and cross-browser consistency than hand-rolled CSS in complex cases.

**ScrollTrigger** is a GSAP plugin. It connects an animation (or any callback) to the scroll position of the page. Instead of writing an IntersectionObserver, tracking scroll progress manually, or fighting with CSS sticky positioning, you describe _what_ should happen and _when_ relative to the scroll, and ScrollTrigger handles the rest.

Common uses: fade-in-on-scroll effects, scrollspy navigation, pinning a section while other content scrolls past, parallax, and scroll-scrubbed animations (where the animation's progress is tied to scroll position).

> **As of this lesson, GSAP is free for commercial use** — Webflow (the company that now owns GSAP) made the full GSAP library, including all plugins like ScrollTrigger, free in 2025. No more "Club GreenSock" membership required for any plugin.

---

## 2. Setting Up

Create a project folder with three files:

```
scrolltrigger-lesson/
├── index.html
├── style.css
└── script.js
```

### Load GSAP and ScrollTrigger from a CDN

In `index.html`, include these two `<script>` tags right before your closing `</body>` tag. **Order matters** — GSAP core must load before the plugin, and both must load before your own script.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="script.js"></script>
```

### Register the plugin

At the top of `script.js`, you need one line to tell GSAP that ScrollTrigger is available:

```javascript
gsap.registerPlugin(ScrollTrigger)
```

This is required once per page. Forgetting it is the #1 beginner pitfall — animations will silently not fire.

---

## 3. The HTML Structure

We'll make a page with a sticky nav and five full-height sections. Copy this into `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ScrollTrigger Lesson</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <nav class="spy-nav">
      <a href="#intro" data-spy-link="intro">Intro</a>
      <a href="#about" data-spy-link="about">About</a>
      <a href="#work" data-spy-link="work">Work</a>
      <a href="#team" data-spy-link="team">Team</a>
      <a href="#contact" data-spy-link="contact">Contact</a>
    </nav>

    <main>
      <section id="intro" class="panel">
        <h1 class="reveal">Welcome</h1>
        <p class="reveal">Scroll down to see ScrollTrigger in action.</p>
      </section>

      <section id="about" class="panel">
        <h2 class="reveal">About</h2>
        <p class="reveal">
          Each heading and paragraph fades in as you reach it.
        </p>
      </section>

      <section id="work" class="panel">
        <h2 class="reveal">Work</h2>
        <p class="reveal">
          Watch the nav above — it follows your scroll position.
        </p>
      </section>

      <section id="team" class="panel">
        <h2 class="reveal">Team</h2>
        <p class="reveal">That highlighting is called a scrollspy.</p>
      </section>

      <section id="contact" class="panel">
        <h2 class="reveal">Contact</h2>
        <p class="reveal">You're at the end. Scroll back up to re-trigger.</p>
      </section>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
    <script src="script.js"></script>
  </body>
</html>
```

**Things to notice:**

- Each `<section>` has a unique `id` — this is what the nav anchors jump to.
- Each nav link has a `data-spy-link` attribute matching its target section's id. We'll use this in JS to connect them.
- Every element we want to animate has the class `reveal`. Grouping animation targets under a shared class is a very common pattern — it lets you animate all of them with one line of JS.

---

## 4. The CSS

Paste this into `style.css`. It's nothing fancy — just enough to make the page scrollable and the nav sticky.

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  color: #222;
  background: #fafafa;
  line-height: 1.5;
}

/* Sticky nav at the top of the viewport */
.spy-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 1.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #eee;
  z-index: 100;
}

.spy-nav a {
  text-decoration: none;
  color: #888;
  font-weight: 500;
  transition: color 0.25s ease;
}

/* This class gets toggled on the active link by our JS */
.spy-nav a.is-active {
  color: #0066ff;
}

/* Full-viewport-height sections so scrolling is obvious */
.panel {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.panel h1,
.panel h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.panel p {
  font-size: 1.25rem;
  max-width: 40ch;
}

/* Alternate backgrounds so section boundaries are visible */
.panel:nth-child(even) {
  background: #f0f0f0;
}
```

Open `index.html` in a browser at this point. You should see a scrollable page with a nav that stays at the top. Nothing animates yet — that's next.

---

## 5. Part One: Scroll-Triggered Reveal Animations

In `script.js`, after registering the plugin, add this:

```javascript
gsap.registerPlugin(ScrollTrigger)

// Animate every element with the .reveal class when it enters the viewport
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 80%', // when the top of the element hits 80% down the viewport
      toggleActions: 'play none none reverse',
    },
  })
})
```

Save and refresh. Scroll down — each heading and paragraph should slide up from 40px below and fade in as you reach it. Scroll back up and it reverses.

### Unpacking that code

`gsap.utils.toArray(".reveal")` grabs every element matching the selector and returns a real array (a helper for shorter code than `document.querySelectorAll` plus `Array.from`).

`gsap.from(el, {...})` animates the element **from** the listed values **to** its current CSS. So `opacity: 0, y: 40` means "start invisible and 40px down, end at the normal state." The opposite is `gsap.to()`, which animates from the current state **to** the listed values.

The `scrollTrigger` object is what turns this from "play immediately on page load" into "play when scroll reaches this element."

- **`trigger: el`** — the element whose position drives the animation.
- **`start: "top 80%"`** — a two-word string. The first word is a point on the _trigger element_ (`top`), the second is a point on the _viewport_ (`80%` from the top). The animation starts when those two points meet. So this fires when the top of the element is 80% of the way down the screen — i.e., when it's just coming into view.
- **`toggleActions: "play none none reverse"`** — four actions for four events: onEnter, onLeave, onEnterBack, onLeaveBack. This reads as "play when entering, do nothing when leaving the bottom, do nothing when re-entering from below, reverse when leaving back off the top."

### Debugging tip: `markers: true`

Add `markers: true` inside the `scrollTrigger` object and refresh. ScrollTrigger will draw colored start/end lines on your page showing exactly where the animation fires. Remove this before shipping — it's for development only.

```javascript
scrollTrigger: {
  trigger: el,
  start: "top 80%",
  toggleActions: "play none none reverse",
  markers: true, // TEMPORARY — remove in production
},
```

---

## 6. Part Two: Building the Scrollspy

A scrollspy highlights the nav link for whichever section is currently in the viewport. The logic is: for each section, create a ScrollTrigger that fires when that section becomes "active," and use its callbacks to toggle a CSS class on the matching nav link.

Add this below the previous code in `script.js`:

```javascript
// Scrollspy: highlight the nav link of whichever section is in view
gsap.utils.toArray('section[id]').forEach((section) => {
  const link = document.querySelector(
    `.spy-nav a[data-spy-link="${section.id}"]`
  )
  if (!link) return

  ScrollTrigger.create({
    trigger: section,
    start: 'top center', // section's top hits the middle of the viewport
    end: 'bottom center', // section's bottom hits the middle of the viewport
    onToggle: (self) => {
      link.classList.toggle('is-active', self.isActive)
    },
  })
})
```

Save and refresh. Scroll slowly. You should see the nav link color change from gray to blue as each section passes the middle of the viewport.

### Unpacking that code

`gsap.utils.toArray("section[id]")` — every section that has an `id` attribute.

For each section, we find the matching nav link using its `data-spy-link` attribute. The `if (!link) return;` line is defensive: if a section has no matching link, skip it rather than throwing an error.

`ScrollTrigger.create({...})` is different from the first part. Before, we passed a `scrollTrigger` object _inside_ a `gsap.from()` call — so the trigger controlled a tween. Here, we're calling `ScrollTrigger.create()` directly with no animation attached. ScrollTrigger can absolutely be used just for callbacks, with no tween involved — this is the scrollspy pattern.

**The start/end pair `"top center"` → `"bottom center"`** defines an active window. ScrollTrigger considers the section "active" while the viewport's center line is somewhere between the section's top and its bottom. For sections that fill the viewport, this means the section is active while it occupies the center of the screen.

**`onToggle`** fires whenever the active state flips (either entering or leaving the active window). The callback receives a `self` object representing the ScrollTrigger instance. `self.isActive` is `true` when we just entered the window, `false` when we just left.

`element.classList.toggle("is-active", self.isActive)` is a handy form of `toggle` — the second argument forces the class on (true) or off (false), so we don't have to write `if/else`.

---

## 7. Putting It Together

Your final `script.js` should look like this:

```javascript
gsap.registerPlugin(ScrollTrigger)

// Part 1: Reveal animations
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  })
})

// Part 2: Scrollspy
gsap.utils.toArray('section[id]').forEach((section) => {
  const link = document.querySelector(
    `.spy-nav a[data-spy-link="${section.id}"]`
  )
  if (!link) return

  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    end: 'bottom center',
    onToggle: (self) => {
      link.classList.toggle('is-active', self.isActive)
    },
  })
})
```

Refresh the page. You now have reveal animations AND a working scrollspy, in about 25 lines of JavaScript.

---

## 8. Common Pitfalls

**The animations don't play at all.**
You probably forgot `gsap.registerPlugin(ScrollTrigger);`. Or your script tags are in the wrong order — GSAP must load before ScrollTrigger, and both before your code.

**The animation fires but at the wrong time.**
Use `markers: true` to see the start/end lines. If the "start" marker is too low, change `"top 80%"` to something like `"top 90%"` (fires earlier, higher up).

**Multiple nav links are highlighted at once.**
Your `start` and `end` windows for different sections are overlapping. Using `"top center"` / `"bottom center"` avoids this because a section's active window exactly touches the next section's active window — only one can be active at a time.

**Nothing happens after I change my CSS or add new elements dynamically.**
ScrollTrigger calculates positions once on load. If element sizes change later (images loading, new content being added), call `ScrollTrigger.refresh()` to recalculate.

---

## 9. Exercises

1. **Stagger the reveal.** Group the reveal targets per section and use GSAP's `stagger` option so items in the same section animate one-after-another instead of all at once.
2. **Add a progress bar.** Create a fixed-position `<div>` at the top of the page and use a single ScrollTrigger with `scrub: true` to scale its width from 0 to 1 as the user scrolls from top to bottom of the page.
3. **Pin a section.** Pick one section and give it `pin: true` in its ScrollTrigger config. Watch what happens.
4. **Active-section underline.** Instead of changing the link color, animate an underline under the active nav link using GSAP (so it slides between links).

---

## 10. Further Reading

- **GSAP docs:** https://gsap.com/docs/v3/
- **ScrollTrigger docs:** https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- **GSAP easing visualizer:** https://gsap.com/docs/v3/Eases (pick an ease by feel)
- **ScrollTrigger demos:** https://gsap.com/demos/ (filter by ScrollTrigger)
