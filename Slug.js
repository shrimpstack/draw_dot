/* v 1.3 */
/* 2023-8-23 1.0: 第一個版本 */
/* 2023-8-24 1.1: 新增function：child、slughome_click */
/* 2023-8-24 1.2: 配合DefaultSlug-1.0調整 */
/* 2023-8-31 1.3: magnetslug */

class Slug {
  static is_touch = false;
  static init() {
    window.addEventListener('mousedown', (e) => {
      if(Slug.is_touch) {Slug.is_touch = false; return;}
      Slug.start_get_target(e.target);
      Slug.start_get_click_slughome(e.target);
      if(!Slug.slug) return;
      Slug.is_start_mouse = true;
      Slug.squirm_start(Slug.event_to_obj(e));
    });
    window.addEventListener('mousemove', (e) => {
      if(Slug.is_touch) return;
      if(Slug.is_start_mouse) {
        e.preventDefault();
        Slug.squirming(Slug.event_to_obj(e));
      }
    });
    window.addEventListener('mouseup', (e) => {
      if(Slug.is_touch) {Slug.is_touch = false; return;}
      Slug.end_click_slughome(Slug.event_to_obj(e));
      if(Slug.is_start_mouse) { Slug.squirmed(Slug.event_to_obj(e)); }
      Slug.slug = null;
      Slug.is_start_mouse = false;
    });
    window.addEventListener('touchstart', (e) => {
      Slug.is_touch = true;
      if(e.changedTouches.length > 1) return;
      let touch = e.changedTouches[0];
      Slug.start_get_target(touch.target);
      Slug.start_get_click_slughome(touch.target);
      if(!Slug.slug) return;
      Slug.is_start_touch = true;
      Slug.squirm_start(Slug.event_to_obj(touch));
    });
    window.addEventListener('touchmove', (e) => {
      if(Slug.is_start_touch) {
        if(e.changedTouches.length > 1) return;
        e.preventDefault();
        let touch = e.changedTouches[0];
        Slug.squirming(Slug.event_to_obj(touch));
      }
    }, { passive: false });
    window.addEventListener('touchend', (e) => {
      if(e.changedTouches.length > 1) return;
      let touch = e.changedTouches[0];
      Slug.end_click_slughome(Slug.event_to_obj(touch));
      if(Slug.is_start_touch) {
        Slug.squirmed(Slug.event_to_obj(touch));
        Slug.is_start_touch = false;
        Slug.slug = null;
      }
    });
    Slug.init_func();
  }
  static init_func() {
    Object.defineProperties(HTMLElement.prototype, {
      docX: {
        get: function() { return this.getBoundingClientRect().x; }
      },
      docY: {
        get: function() { return this.getBoundingClientRect().y; }
      },
      onsquirmclick: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onsquirmclick = func;
        },
        get: function() { return this._onsquirmclick || (() => {}); }
      },
      onsquirmstart: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onsquirmstart = func;
        },
        get: function() { return this._onsquirmstart || (() => {}); }
      },
      onsquirming: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onsquirming = func;
        },
        get: function() { return this._onsquirming || (() => {}); }
      },
      onsquirmed: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onsquirmed = func;
        },
        get: function() { return this._onsquirmed || (() => {}); }
      },
      onchildsquirmstart: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onchildsquirmstart = func;
        },
        get: function() { return this._onchildsquirmstart || (() => {}); }
      },
      onchildsquirming: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onchildsquirming = func;
        },
        get: function() { return this._onchildsquirming || (() => {}); }
      },
      onchildsquirmed: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onchildsquirmed = func;
        },
        get: function() { return this._onchildsquirmed || (() => {}); }
      },
      onslughomeenter: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onslughomeenter = func;
        },
        get: function() { return this._onslughomeenter || (() => {}); }
      },
      onslughomestay: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onslughomestay = func;
        },
        get: function() { return this._onslughomestay || (() => {}); }
      },
      onslughomeleave: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onslughomeleave = func;
        },
        get: function() { return this._onslughomeleave || (() => {}); }
      },
      onslughomeclick: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onslughomeclick = func;
        },
        get: function() { return this._onslughomeclick || (() => {}); }
      },
      onsluglanded: {
        set: function(func) {
          if(func && typeof func != "function") throw new Error('must be a function');
          this._onsluglanded = func;
        },
        get: function() { return this._onsluglanded || (() => {}); }
      },
    });
  }
  static event_to_obj(event) {
    let obj = Object.assign({
      target: event.target,
      docX: Math.round(event.pageX),
      docY: Math.round(event.pageY),
      x: Math.round(event.clientX),
      y: Math.round(event.clientY),
      slug: Slug.slug,
    }, Slug.offset_save, Slug.max_save);
    if(Slug.cur_home) {
      obj.homeX = Math.round(obj.docX - Slug.cur_home.docX - (obj.offsetX || 0));
      obj.homeY = Math.round(obj.docY - Slug.cur_home.docY - (obj.offsetY || 0));
    }
    if(Slug.start_home) {
      obj.originX = Math.round(obj.docX - Slug.start_home.docX - (obj.offsetX || 0) + Slug.start_home.scrollLeft);
      obj.originY = Math.round(obj.docY - Slug.start_home.docY - (obj.offsetY || 0) + Slug.start_home.scrollTop);
    }
    return obj;
  }
  static start_get_target(target) {
    Slug.slug = null;
    let noslug_el = target.closest('[noslug]');
    if(noslug_el) return;
    let slughome = target.closest('[slughome]');
    if(slughome == target) {
      Slug.slug = [...slughome.children].find(el => el.matches('[magnetslug]'));
    }
    else Slug.slug = target.closest('[slug]');
  }
  static start_get_click_slughome(target) {
    Slug.click_slughome = null;
    if(!Slug.slug && target.getAttribute('slughome') != null) {
      Slug.click_slughome = target;
    }
  }
  static end_click_slughome(event) {
    if(Slug.click_slughome && Slug.click_slughome == event.target) {
      let homeX = event.docX - event.target.docX;
      let homeY = event.docY - event.target.docY;
      Slug.click_slughome.onslughomeclick({...event, homeX, homeY});
    }
  }
  static squirm_start({target, docX, docY}) {
    Slug.squirm_data_init();
    Slug.cur_home = Slug.start_home = target.closest('[slughome]');
    Slug.start_save = {docX, docY};
    Slug.offset_save = {
      offsetX: Slug.slug.matches('[magnetslug]') ? Slug.slug.offsetWidth / 2 : Math.round(docX - Slug.slug.docX),
      offsetY: Slug.slug.matches('[magnetslug]') ? Slug.slug.offsetHeight / 2 : Math.round(docY - Slug.slug.docY),
    };
    let temp_display = Slug.slug.style.getPropertyValue('display');
    Slug.slug.style.display = "none";
    Slug.max_save = {
      maxX: Math.round(Slug.cur_home.scrollWidth - Slug.slug.offsetWidth),
      maxY: Math.round(Slug.cur_home.scrollHeight - Slug.slug.offsetHeight),
    };
    if(!temp_display) Slug.slug.style.removeProperty('display');
    else Slug.slug.style.display = temp_display;
  }
  static squirming(event) {
    if(Slug.is_click) Slug.squirm_allow_start(event);
    if(!Slug.is_click) {
      Slug.formal_squirming(event);
      Slug.slughome_check(event);
    }
  }
  static squirmed(event) {
    if(Slug.is_click) Slug.slug.onsquirmclick({...event});
    else {
      let moveAX = event.docX - Slug.start_save.docX;
      let moveAY = event.docY - Slug.start_save.docY;
      Slug.slughome_landed_check(event);
      Slug.slug.onsquirmed({...event, moveAX, moveAY});
      if(Slug.start_home) Slug.start_home.onchildsquirmed({...event, moveAX, moveAY});
    }
    Slug.slug.style.removeProperty('pointer-events');
    Slug.squirm_data_init();
  }
  static is_click = false;
  static start_save = null;
  static prev_save = null;
  static cur_home = null;
  static squirm_data_init() {
    Slug.is_click = true;
    Slug.start_save = null;
    Slug.prev_save = null;
    Slug.cur_home = null;
    Slug.start_home = null;
    Slug.offset_save = null;
    Slug.max_save = null;
  }
  static squirm_allow_start(event) {
    let {target, docX, docY} = event;
    if(Math.abs(docX - Slug.start_save.docX) > 5 || Math.abs(docY - Slug.start_save.docY) > 5) {
      Slug.is_click = false;
      Slug.prev_save = {docX, docY};
      Slug.slug.style.setProperty('pointer-events', 'none');
      Slug.slug.onsquirmstart({...event});
      if(Slug.start_home) Slug.start_home.onchildsquirmstart({...event});
    }
  }
  static formal_squirming(event) {
    let {docX, docY} = event;
    let moveX = docX - Slug.prev_save.docX;
    let moveY = docY - Slug.prev_save.docY;
    Slug.slug.onsquirming({...event, moveX, moveY});
    if(Slug.start_home) Slug.start_home.onchildsquirming({...event, moveX, moveY});
    Slug.prev_save = {docX, docY};
  }
  static slughome_check(event) {
    let slughome_el = event.target.closest('[slughome]');
    if(Slug.cur_home != slughome_el) {
      if(Slug.cur_home) Slug.cur_home.onslughomeleave({...event});
      Slug.cur_home = slughome_el;
      if(slughome_el) slughome_el.onslughomeenter({
        ...event,
        homeX: event.docX - Slug.cur_home.docX - event.offsetX,
        homeY: event.docY - Slug.cur_home.docY - event.offsetY,
      });
    }
    else if(Slug.cur_home) {
      Slug.cur_home.onslughomestay({...event});
    }
  }
  static slughome_landed_check(event) {
    let slughome_el = event.target.closest('[slughome]');
    if(slughome_el) slughome_el.onsluglanded({...event});
  }
}
Slug.init();
