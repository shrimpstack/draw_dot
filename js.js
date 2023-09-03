class Draw {
  static width = 16;
  static height = 16;
  static grid_size = 16;
  static grid_line_color = "#808080";
  static grid_line_width = 1;
  static cur_color = "#000";
  static init() {
    Draw.canvas = find('#draw');
    Draw.ctx = Draw.canvas.getContext('2d');
    Draw.canvas.width = Draw.width * (Draw.grid_size + Draw.grid_line_width) - Draw.grid_line_width;
    Draw.canvas.height = Draw.height * (Draw.grid_size + Draw.grid_line_width) - Draw.grid_line_width;
    Draw.draw_grid_line();
    Draw.canvas.addEventListener('contextmenu', Draw.dropper, false);
    Draw.canvas.addEventListener('mousedown', Draw.draw_start);
    Draw.canvas.addEventListener('mousemove', Draw.draw_move);
    document.addEventListener('mouseup', Draw.draw_end);
    MiniView.init();
    View.init();
  }
  static set_w(el) { el.value = Draw.width = Math.round(el.value); }
  static set_h(el) { el.value = Draw.height = Math.round(el.value); }
  static draw_grid_line() {
    MyCtx.start(Draw.canvas, {
      color: Draw.grid_line_color,
      width: Draw.grid_line_width,
    });
    let max = Math.max(Draw.width, Draw.height);
    let unit = Draw.grid_size + Draw.grid_line_width;
    for(let f = 1; f < max; f++) {
      if(f < Draw.width) MyCtx.full_line("v", unit * f);
      if(f < Draw.height) MyCtx.full_line("h", unit * f);
    }
    MyCtx.end();
  }
  static draw_grid_by_mouse(x, y) {
    MyCtx.start(Draw.canvas);
    let unit = Draw.grid_size + Draw.grid_line_width;
    let sx = x - x % unit, sy = y - y % unit;
    MyCtx.rect_c(sx, sy, Draw.grid_size, Draw.grid_size, {full_color: Draw.cur_color});
    MyCtx.end();
    MiniView.draw_dot(sx / unit, sy / unit, Draw.cur_color);
    View.draw_dot(sx / unit, sy / unit, Draw.cur_color);
  }
  static draw_grid(grid_x, grid_y) {
    MyCtx.start(Draw.canvas);
    let unit = Draw.grid_size + Draw.grid_line_width;
    MyCtx.rect_c(grid_x * unit, grid_y * unit, Draw.grid_size, Draw.grid_size, {full_color: Draw.cur_color});
    MyCtx.end();
  }
  static drawing = false;
  static draw_start(event) {
    if(event.which != 1) return;
    Draw.draw_grid_by_mouse(event.offsetX, event.offsetY);
    Draw.drawing = true;
  }
  static draw_move(event) {
    if(Draw.drawing) Draw.draw_grid_by_mouse(event.offsetX, event.offsetY);
  }
  static draw_end() {
    Draw.drawing = false;
  }
  static dropper(event) {
    event.preventDefault();
    let unit = Draw.grid_size + Draw.grid_line_width;
    let x = event.offsetX - event.offsetX % unit + 1;
    let y = event.offsetY - event.offsetY % unit + 1;
    let rbga = Draw.ctx.getImageData(x, y, 1, 1).data;
    let [h, s, l, a] = rbga_to_hsla(...rbga);
    color_data.h = Math.min(Math.max(Math.round(h), 0), 360);
    color_data.s = Math.min(Math.max(Math.round(s * 1000) / 10, 0), 100);
    color_data.l = Math.min(Math.max(Math.round(l * 1000) / 10, 0), 100);
    color_data.a = Math.min(Math.max(Math.round(a * 100) / 100, 0), 1);
    set_color();
    set_color_bar();
  }
}

class Colors {
  static count = 16;
  static init() {
    Colors.el = find('#colors');
    Colors.el.innerHTML = "";
    for(let f=0; f<Colors.count; f++) {
      let color_el = new_el_to_el(Colors.el, 'div');
      color_el.addEventListener('contextmenu', Colors.take, false);
      color_el.addEventListener('click', Colors.fill);
    }
  }
  static fill(event) {
    let {h, s, l, a} = color_data;
    let hex = hsla_to_rgba(h, s, l, a);
    event.target.style.color = hex;
    event.target.hex = hex;
  }
  static take(event) {
    event.preventDefault();
    let rbga = event.target.hex.match(/[^#]{2}/g).map(v => parseInt(v, 16))
    let [h, s, l, a] = rbga_to_hsla(...rbga);
    color_data.h = Math.min(Math.max(Math.round(h), 0), 360);
    color_data.s = Math.min(Math.max(Math.round(s * 1000) / 10, 0), 100);
    color_data.l = Math.min(Math.max(Math.round(l * 1000) / 10, 0), 100);
    color_data.a = Math.min(Math.max(Math.round(a * 100) / 100, 0), 1);
    set_color();
    set_color_bar();
  }
}

class MiniView {
  static grid_size = 2;
  static init() {
    MiniView.canvas = find('#mini_view');
    MiniView.ctx = MiniView.canvas.getContext('2d');
    MiniView.canvas.width = Draw.width * MiniView.grid_size;
    MiniView.canvas.height = Draw.height * MiniView.grid_size;
  }
  static draw_dot(x, y, full_color) {
    MyCtx.start(MiniView.canvas, {dot_size: MiniView.grid_size});
    MyCtx.dot_c(x, y, {full_color});
    MyCtx.end();
  }
}

class View {
  static grid_size = 8;
  static init() {
    View.canvas = find('#view');
    View.ctx = View.canvas.getContext('2d');
    View.canvas.width = Draw.width * View.grid_size * 2;
    View.canvas.height = Draw.height * View.grid_size * 2;
  }
  static draw_dot(x, y, full_color) {
    MyCtx.start(View.canvas, {dot_size: View.grid_size});
    MyCtx.dot_c(x, y, {full_color});
    MyCtx.dot_c(x + Draw.width, y, {full_color});
    MyCtx.dot_c(x, y + Draw.height, {full_color});
    MyCtx.dot_c(x + Draw.width, y + Draw.height, {full_color});
    MyCtx.end();
  }
}

class MyCtx {
  static cur_canvas = null;
  static cur_ctx = null;
  static w = 0;
  static h = 0;
  static dot_size = 0;
  static opt = {};
  static start(target_canvas, opt = {}) {
    this.cur_canvas = target_canvas;
    this.w = this.cur_canvas.width + 0.5;
    this.h = this.cur_canvas.height + 0.5;
    this.cur_ctx = this.cur_canvas.getContext('2d');
    this.set_opt(opt);
  }
  static end() {
    this.cur_ctx.restore();
    this.cur_ctx = null;
    this.cur_canvas = null;
  }
  static line(pos_arr = [], opt = {}) {
    this.cur_ctx.save();
    this.cur_ctx.beginPath();
    this.set_opt(opt);
    pos_arr.forEach(([x, y], i) => {
      if(i) this.cur_ctx.lineTo(x - 0.5, y - 0.5);
      else this.cur_ctx.moveTo(x - 0.5, y - 0.5);
    });
    this.cur_ctx.stroke();
    this.cur_ctx.restore();
  }
  static full_line(type, pos, opt = {}) {
    let pos_arr = [];
    switch(type) {
      case "h": pos_arr = [[0, pos], [this.w + 0.5, pos]]; break;
      case "v": pos_arr = [[pos, 0], [pos, this.h + 0.5]]; break;
    }
    this.line(pos_arr, opt);
  }
  static rect_c(x, y, w, h, opt = {}) {
    this.cur_ctx.clearRect(x, y, w, h);
    this.rect(x, y, w, h, opt);
  }
  static rect(x, y, w, h, opt = {}) {
    this.cur_ctx.save();
    this.set_opt(opt);
    this.cur_ctx.fillRect(x, y, w, h);
    this.cur_ctx.restore();
  }
  static dot(x, y, opt = {}) {
    this.rect(x * this.dot_size, y * this.dot_size, this.dot_size, this.dot_size, opt);
  }
  static dot_c(x, y, opt = {}) {
    this.rect_c(x * this.dot_size, y * this.dot_size, this.dot_size, this.dot_size, opt);
  }
  static set_opt(opt) {
    if(opt.color) this.cur_ctx.strokeStyle = opt.color;
    if(opt.width) this.cur_ctx.lineWidth = opt.width;
    if(opt.full_color) this.cur_ctx.fillStyle = opt.full_color;
    if(opt.dot_size) this.dot_size = opt.dot_size;
  }
  static clear_rect(x, y, w, h) {
    this.cur_ctx.clearRect(x, y, w, h);
  }
}

window.addEventListener('load', () => {
  Draw.init();
  Colors.init();
  set_slug();
});

function set_slug() {
  DefaultSlug.normal_move(find('#palette .sl'), {not_overflow: true});
  DefaultSlug.normal_move(find('#palette .a'), {only_y: true, not_overflow: true});
  DefaultSlug.normal_move(find('#palette .h'), {only_x: true, not_overflow: true});
  find('#palette .sl').onchildsquirmed = ({originX, originY, maxX, maxY}) => {
    color_data.s = Math.min(Math.max(originX / maxX, 0), 1) * 100;
    color_data.l = 100 - Math.min(Math.max(originY / maxY, 0), 1) * 100;
    set_color();
  };
  find('#palette .a').onchildsquirmed = ({originY, maxY}) => {
    color_data.a = 1 - Math.min(Math.max(originY / maxY, 0), 1);
    set_color();
  };
  find('#palette .h').onchildsquirmed = ({originX, maxX}) => {
    color_data.h = Math.round(360 * Math.min(Math.max(originX / maxX, 0), 1));
    set_color();
  };
}

const color_data = {s: 0, l: 0, h: 0, a: 1}
function set_color_bar() {
  let {clientWidth, clientHeight} = find('#palette .sl');
  let sl_slug = find('#palette .sl [slug]');
  sl_slug.style.left = color_data.s / 100 * clientWidth + "px";
  sl_slug.style.top = (1 - color_data.l / 100) * clientHeight + "px";
  
  clientWidth = find('#palette .h').clientWidth;
  clientHeight = find('#palette .a').clientHeight;
  find('#palette .h [slug]').style.left = color_data.h / 360 * clientWidth + "px";
  find('#palette .a [slug]').style.top = (1 - color_data.a) * clientHeight + "px";
}
function set_color() {
  let {h, s, l, a} = color_data;
  let hex = hsla_to_rgba(h, s, l, a);
  Draw.cur_color = hex;
  find('#palette .sl').style.backgroundColor = `hsl(${h}deg 100% 50%)`;
  find('#palette .a').style.color = `hsl(${h}deg ${s}% ${l}%)`;
  find('#palette .cur').style.color = `hsl(${h}deg ${s}% ${l}% / ${a})`;
}
var convert_el = null;
function hsla_to_rgba(h, s, l, a) {
  if(!convert_el) convert_el = new_el('div');
  convert_el.style.backgroundColor = `hsl(${h}deg ${s}% ${l}%)`;
  let rgb = convert_el.style.backgroundColor;
  rgb = rgb.replace(/rgb\((.*)\)/, '$1').replace(/\s/, '').split(',')
  .map(v => {
    return ("0" + (+v).toString(16)).substr(-2);
  });
  rgb.push(("0" + Math.round(a * 255).toString(16)).substr(-2));
  return '#' + rgb.join('');
}
function rbga_to_hsla(r, g, b, a) {
  r /= 255;
  g /= 255;
  b /= 255;
  let h = 0, s = 0, l = 0;
  let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = Math.round((cmax + cmin) / 2 * 100) / 100;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = Math.round(s * 100) / 100;
  a = Math.round(a / 255 * 100) / 100;
  return [h, s, l, a];
}
