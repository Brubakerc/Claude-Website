// Full-screen image viewer for <Gallery>.
// - Opens from the tapped thumbnail and closes back into it (same path both ways).
// - Drag the image down to close: it follows the finger 1:1, and the release
//   velocity carries into the closing (or snapping back) spring.
// - Every animation can be grabbed mid-flight; it continues from where it is.
// - Esc, the Close button, or a tap outside the image also close it.
import { Spring, animateSprings, project, rubberband } from "./spring";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const SPRING = { response: 0.38, damping: 1 };
const FLICK_SPRING = { response: 0.38, damping: 0.8 };

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function initGalleries() {
  const galleries = document.querySelectorAll<HTMLElement>("[data-gallery]");
  if (!galleries.length) return;
  const viewer = new Lightbox();
  galleries.forEach((gallery) => {
    const images = [...gallery.querySelectorAll("img")];
    images.forEach((img, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery__thumb press";
      button.setAttribute("aria-label", `Open image ${i + 1} of ${images.length}${img.alt ? `: ${img.alt}` : ""}`);
      img.replaceWith(button);
      button.append(img);
      button.addEventListener("click", () => viewer.open(images, i));
    });
  });
}

class Lightbox {
  dialog = document.createElement("dialog");
  backdrop = document.createElement("div");
  img = document.createElement("img");
  bar = document.createElement("div");
  caption = document.createElement("p");
  count = document.createElement("p");
  prevButton = this.button("Previous image", "‹");
  nextButton = this.button("Next image", "›");
  closeButton = this.button("Close", "Close");

  items: HTMLImageElement[] = [];
  index = 0;
  frame: Rect = { left: 0, top: 0, width: 1, height: 1 };
  inset = { x: 0, y: 0, radius: 0 };

  x = new Spring(0, SPRING);
  y = new Spring(0, SPRING);
  scale = new Spring(1, SPRING);
  shown = new Spring(0, SPRING); // 0 = closed, 1 = fully open
  stop?: () => void;
  closing = false;

  drag?: { id: number; startX: number; startY: number; grabX: number; grabY: number; active: boolean; moved: boolean; history: { x: number; y: number; t: number }[] };

  constructor() {
    this.dialog.className = "lightbox";
    this.dialog.setAttribute("aria-label", "Image viewer");
    this.backdrop.className = "lightbox__backdrop";
    this.img.className = "lightbox__image";
    this.img.draggable = false;
    this.bar.className = "lightbox__bar";
    this.caption.className = "lightbox__caption";
    this.count.className = "lightbox__count";
    this.closeButton.classList.add("lightbox__close");
    this.closeButton.autofocus = true;
    this.bar.append(this.caption, this.count, this.prevButton, this.nextButton, this.closeButton);
    this.dialog.append(this.backdrop, this.img, this.bar);
    document.body.append(this.dialog);

    this.closeButton.addEventListener("click", () => this.close());
    this.prevButton.addEventListener("click", () => this.show(this.index - 1));
    this.nextButton.addEventListener("click", () => this.show(this.index + 1));
    this.backdrop.addEventListener("click", () => this.close());
    this.dialog.addEventListener("cancel", (e) => {
      e.preventDefault(); // Esc: animate back into the thumbnail instead of vanishing
      this.close();
    });
    this.dialog.addEventListener("close", () => this.cleanup());
    this.dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.show(this.index - 1);
      if (e.key === "ArrowRight") this.show(this.index + 1);
    });
    this.img.addEventListener("pointerdown", (e) => this.grab(e));
    this.img.addEventListener("pointermove", (e) => this.move(e));
    this.img.addEventListener("pointerup", (e) => this.release(e));
    this.img.addEventListener("pointercancel", (e) => this.release(e));
    addEventListener("resize", () => {
      if (!this.dialog.open || this.closing) return;
      this.layout();
      [this.x, this.y].forEach((s) => s.set(0));
      this.scale.set(1);
      this.render();
    });
  }

  button(label: string, text: string) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lightbox__button press";
    b.setAttribute("aria-label", label);
    b.textContent = text;
    return b;
  }

  get thumb() {
    return this.items[this.index];
  }

  open(items: HTMLImageElement[], index: number) {
    this.items = items;
    this.index = index;
    this.closing = false;
    this.fill();
    document.documentElement.classList.add("lightbox-open");
    if (!this.dialog.open) this.dialog.showModal();
    this.layout();
    const start = this.thumbTransform();
    this.x.set(start.x);
    this.y.set(start.y);
    this.scale.set(start.scale);
    this.shown.set(0);
    this.thumb.style.visibility = "hidden";
    this.animateTo(0, 0, 1, 1);
  }

  /** Switches image instantly (keyboard and buttons don't animate). */
  show(index: number) {
    if (this.items.length < 2 || this.closing) return;
    this.thumb.style.visibility = "";
    this.index = (index + this.items.length) % this.items.length;
    this.thumb.style.visibility = "hidden";
    this.fill();
    this.layout();
    this.render();
  }

  close(velocity = { x: 0, y: 0 }) {
    if (this.closing) return;
    this.closing = true;
    const t = this.thumb.getBoundingClientRect();
    const onScreen = t.bottom > 0 && t.top < innerHeight && t.width > 0;
    if (onScreen) {
      const end = this.thumbTransform();
      this.animateTo(end.x, end.y, end.scale, 0, velocity);
    } else {
      this.animateTo(this.x.value, this.y.value, 0.92, 0, velocity);
    }
  }

  finishClose() {
    this.dialog.close(); // cleanup runs in the "close" listener
  }

  /** Runs however the dialog closed, including the browser closing it directly. */
  cleanup() {
    this.stop?.();
    this.stop = undefined;
    this.closing = false;
    this.drag = undefined;
    document.documentElement.classList.remove("lightbox-open");
    this.thumb.style.visibility = "";
    this.thumb.closest("button")?.focus({ preventScroll: true });
  }

  fill() {
    const t = this.thumb;
    this.img.src = t.currentSrc || t.src;
    this.img.alt = t.alt;
    this.caption.textContent = t.title || t.alt;
    this.count.textContent = this.items.length > 1 ? `${this.index + 1} of ${this.items.length}` : "";
    this.prevButton.hidden = this.nextButton.hidden = this.items.length < 2;
  }

  /** Fits the image inside the viewport, leaving room for the caption bar. */
  layout() {
    const t = this.thumb;
    const ratio = t.naturalWidth && t.naturalHeight ? t.naturalWidth / t.naturalHeight : t.width / t.height || 1.5;
    const pad = 16;
    const barHeight = this.bar.offsetHeight || 72;
    const maxW = innerWidth - pad * 2;
    const maxH = innerHeight - pad * 2 - barHeight;
    const width = Math.min(maxW, maxH * ratio);
    const height = width / ratio;
    this.frame = { left: (innerWidth - width) / 2, top: pad + (maxH - height) / 2, width, height };
    Object.assign(this.img.style, {
      left: `${this.frame.left}px`,
      top: `${this.frame.top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  }

  /** The transform that makes the full image sit exactly over its thumbnail. */
  thumbTransform() {
    const t = this.thumb.getBoundingClientRect();
    const f = this.frame;
    const scale = Math.max(t.width / f.width, t.height / f.height); // thumbnails are cropped to fill
    this.inset = {
      x: Math.max(0, (f.width - t.width / scale) / 2),
      y: Math.max(0, (f.height - t.height / scale) / 2),
      radius: parseFloat(getComputedStyle(this.thumb).borderRadius) / scale || 0,
    };
    return {
      x: t.left + t.width / 2 - (f.width * scale) / 2 - f.left,
      y: t.top + t.height / 2 - (f.height * scale) / 2 - f.top,
      scale,
    };
  }

  animateTo(x: number, y: number, scale: number, shown: number, velocity = { x: 0, y: 0 }, options = SPRING) {
    this.stop?.();
    [this.x, this.y, this.scale, this.shown].forEach((s) => s.configure(reducedMotion.matches ? { response: 0.25, damping: 1 } : options));
    this.x.to(x, velocity.x);
    this.y.to(y, velocity.y);
    this.scale.to(scale);
    this.shown.to(shown);
    this.stop = animateSprings([this.x, this.y, this.scale, this.shown], () => this.render(), () => {
      this.stop = undefined;
      if (this.closing) this.finishClose();
    });
  }

  render() {
    const p = Math.min(Math.max(this.shown.value, 0), 1);
    this.backdrop.style.opacity = String(p);
    this.bar.style.opacity = String(p);
    if (reducedMotion.matches && !this.drag?.active) {
      // Cross-fade only: no movement.
      this.img.style.transform = "";
      this.img.style.clipPath = "";
      this.img.style.opacity = String(p);
      return;
    }
    this.img.style.opacity = "1";
    this.img.style.transform = `translate3d(${this.x.value}px, ${this.y.value}px, 0) scale(${this.scale.value})`;
    const k = 1 - p;
    const { x, y, radius } = this.inset;
    this.img.style.clipPath = k > 0.001 ? `inset(${y * k}px ${x * k}px round ${radius * k}px)` : "";
  }

  grab(e: PointerEvent) {
    if (this.drag || !e.isPrimary) return; // ignore a second finger
    // Catch the image wherever it is, even mid-animation.
    this.stop?.();
    this.stop = undefined;
    this.closing = false;
    this.img.setPointerCapture(e.pointerId);
    const s = this.scale.value;
    this.drag = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      // The point under the finger, in image coordinates, so it stays under the finger.
      grabX: (e.clientX - this.frame.left - this.x.value) / s,
      grabY: (e.clientY - this.frame.top - this.y.value) / s,
      active: false,
      moved: false,
      history: [{ x: e.clientX, y: e.clientY, t: e.timeStamp }],
    };
  }

  move(e: PointerEvent) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.active && Math.hypot(dx, dy) < 10) return; // small threshold before a drag counts
    d.active = d.moved = true;
    d.history.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    if (d.history.length > 6) d.history.shift();

    const height = innerHeight;
    const pull = Math.max(dy, 0) / height; // 0 → 1 as the image is pulled down
    const scale = 1 - Math.min(pull, 1) * 0.35;
    const y = dy < 0 ? d.startY + rubberband(dy, height) : e.clientY; // resist pulling up
    this.scale.set(scale);
    this.x.set(e.clientX - this.frame.left - d.grabX * scale);
    this.y.set(y - this.frame.top - d.grabY * scale);
    this.shown.set(1 - Math.min(pull * 1.6, 0.85));
    this.render();
  }

  release(e: PointerEvent) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    this.drag = undefined;
    if (!d.active) {
      // A tap, or a grab that interrupted an animation: carry on to the open state.
      if (this.x.value !== 0 || this.y.value !== 0 || this.scale.value !== 1 || this.shown.value !== 1) this.animateTo(0, 0, 1, 1);
      return;
    }
    const first = d.history[0];
    const last = d.history[d.history.length - 1];
    const dt = Math.max((last.t - first.t) / 1000, 0.001);
    const velocity = { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
    const dy = e.clientY - d.startY;
    const projected = dy + project(velocity.y);
    if (projected > innerHeight * 0.2 && velocity.y > -200) {
      this.close(velocity);
    } else {
      const flicked = Math.hypot(velocity.x, velocity.y) > 300;
      this.animateTo(0, 0, 1, 1, velocity, flicked ? FLICK_SPRING : SPRING);
    }
  }
}
