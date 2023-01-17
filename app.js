// slider
class Slider {
  constructor({ element, elements, titles, numbers }) {
    // take slider element
    this.element = element;
    this.elements = [...elements];
    this.titles = [...titles];
    // create scroll object
    this.scroll = {
      ease: 0.1,
      current: 0,
      target: 0,
      last: 0,
      speed: 0,
    };
    this.touch = {
      start: 0,
      current: 0,
    };
    this.isDragging = false;

    // take slider bounds
    this.SliderHeight = this.element.clientHeight;
    this.SlideHeight = this.elements[0].clientHeight;
    this.wrapHeight = this.SliderHeight * this.elements.length;

    // add snap to scroll
    this.handleOnCheck = _.debounce(this.onCheck.bind(this), 100);

    // init all
    this.dispose(0);
    this.addEvents();
    this.render();
  }

  lerp(a, b, n) {
    return (1 - n) * a + n * b;
  }

  dispose(scroll) {
    gsap.set(this.elements, {
      y: (i) => {
        return i * this.SlideHeight + scroll;
      },
      modifiers: {
        y: (y) => {
          const s = gsap.utils.wrap(
            -this.SlideHeight,
            this.wrapHeight - this.SlideHeight,
            parseInt(y)
          );
          return `${s}px`;
        },
      },
    });
  }

  handleMouseWheel(e) {
    this.scroll.target -= e.deltaY * 2;
    this.handleOnCheck();
  }

  handleTouchStart(e) {
    this.touch.start = e.clientY || e.touches[0].clientY;
    this.isDragging = true;
    this.element.classList.add("is-dragging");
  }

  handleTouchMove(e) {
    if (this.isDragging) {
      this.touch.current = e.clientY || e.touches[0].clientY;
      this.scroll.target += this.touch.current - this.touch.start;
      this.touch.start = this.touch.current * 1.2;
    }
  }

  handleTouchEnd() {
    this.isDragging = false;
    this.element.classList.remove("is-dragging");
    this.handleOnCheck();
  }

  addEvents() {
    this.element.addEventListener("wheel", this.handleMouseWheel.bind(this), {
      passive: true,
    });
    this.element.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      {
        passive: true,
      }
    );
    this.element.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      {
        passive: true,
      }
    );
    this.element.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });
    this.element.addEventListener(
      "mousedown",
      this.handleTouchStart.bind(this),
      {
        passive: true,
      }
    );
    this.element.addEventListener(
      "mousemove",
      this.handleTouchMove.bind(this),
      {
        passive: true,
      }
    );
    this.element.addEventListener("mouseup", this.handleTouchEnd.bind(this), {
      passive: true,
    });
    this.element.addEventListener("selectstart", () => {
      return false;
    });
    window.addEventListener("resize", this.onResize.bind(this));
  }

  onCheck() {
    const itemIndex = Math.round(
      Math.abs(this.scroll.target) / this.SlideHeight
    );
    const item = this.SlideHeight * itemIndex;

    if (this.scroll.target < 0) {
      gsap.to(this.scroll, {
        target: -item,
        duration: 0.5,
        ease: "elastic.out(1, 1)",
      });
    } else {
      gsap.to(this.scroll, {
        target: item,
        duration: 0.5,
        ease: "elastic.out(1, 1)",
      });
    }
  }

  onResize() {
    this.SliderHeight = this.element.clientHeight;
    this.SlideHeight = this.elements[0].clientHeight + 100;
    this.wrapHeight = this.SliderHeight * this.elements.length;
  }

  render() {
    this.scroll.current = this.lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    // slider scroll
    this.dispose(this.scroll.current);

    this.scroll.speed = this.scroll.current - this.scroll.last;
    this.scroll.last = this.scroll.current;

    this.currentIndex =
      Math.round(Math.abs(this.scroll.current) / this.SlideHeight) %
      this.elements.length;

    // slider titles scroll
    gsap.set(this.titles, {
      y: (i) => {
        return i * this.SlideHeight + this.scroll.current;
      },
      modifiers: {
        y: (y) => {
          const s = gsap.utils.wrap(
            -this.SlideHeight,
            this.wrapHeight - this.SlideHeight,
            parseInt(y)
          );
          return `${s}px`;
        },
      },
    });

    requestAnimationFrame(this.render.bind(this));
  }
}

// custom selectors
const select = (e) => document.querySelector(e);
const selectAll = (e) => document.querySelectorAll(e);

// init sliders
const slider = select(".slider");
const slides = selectAll(".slider-slide");
const titles = selectAll(".slider-title");

new Slider({
  element: slider,
  elements: slides,
  titles: titles,
});
