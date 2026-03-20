class LiquidDropdownBehavior extends LiquidBehavior {
  static behaviorName = "liquidDropdown";
  static viewModelEvents = {
    "change:computedStyles": "measure",
    "change:dropdownsRects": "onDropdownsRectsAdded",
    "done:positionDropdowns": "onDonePositionDropdowns",
  };
  get ui() {
    return {
      dropdownTriggers: ".lqd-menu-dropdown-trigger",
      dropdownElements: ".lqd-menu-dropdown",
    };
  }
  get bindToThis() {
    return ["measure", "events", "getRect", "onDropdownsRectsAdded"];
  }
  initialize() {
    (this.triggersRects = []),
      (this.dropdownsRects = []),
      this.liquidApp.on("start", this.events);
  }
  events() {
    this.view.model.get("layoutRegion") === "liquidPageHeader" &&
      this.listenTo(
        this.liquidApp.layoutRegions.liquidPageHeader.model,
        "change:isSticky",
        this.measure
      );
  }
  async measure() {
    this.isDestroyed ||
      ((this.windowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      (this.windowScroll = { x: window.scrollX, y: window.scrollY }),
      await this.liquidApp.fastdom.measure(() => {
        this.isDestroyed ||
          (this.getUI("dropdownTriggers").forEach(
            (t, i) => (this.triggersRects[i] = this.getRect(t))
          ),
          this.getUI("dropdownElements").forEach(
            (t, i) => (this.dropdownsRects[i] = this.getRect(t))
          ));
      }),
      !this.isDestroyed &&
        this.view.model.set({
          triggersRects: [...this.triggersRects],
          dropdownsRects: [...this.dropdownsRects],
        }));
  }
  getRect(t) {
    if (this.isDestroyed) return;
    t.style.insetInlineStart = "";
    let { x: i, y: s } = this.windowScroll;
    const e = t.getBoundingClientRect();
    return {
      y: e.y + s,
      x: e.x + i,
      width: e.width,
      height: e.height,
      bottom: e.bottom + s,
      right: e.right + i,
      preferedHorizontalAlign: t.getAttribute("data-lqd-align-h"),
    };
  }
  onDropdownsRectsAdded(t, i) {
    i.forEach((s, e) => this.positionDropdown(e)),
      this.view.model.trigger("done:positionDropdowns");
  }
  positionDropdown(t) {
    const i = this.getUI("dropdownElements")[t],
      s = this.triggersRects[t],
      e = this.dropdownsRects[t];
    if (!i || !s || !e) return;
    const { preferedHorizontalAlign: d } = e;
    let o = 0;
    d === "center"
      ? (o = (e.width / 2) * -1)
      : d === "end" && (o = e.width * -1 + s.width),
      e.right + o > this.windowSize.width
        ? (o = (e.right - this.windowSize.width) * -1)
        : e.x + o < 0 && (o = s.x * -1),
      o !== 0 && (i.style.insetInlineStart = `${o}px`);
  }
  onDonePositionDropdowns() {
    this.view.el.setAttribute("data-lqd-menu-dropdown-position-applied", !0);
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidDropdownBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidDropdownBehavior));
