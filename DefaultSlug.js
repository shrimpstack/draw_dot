/* v 2.0 */
/* 2023-8-24 1.0: 第一個版本 */
/* 2023-8-30 2.0: GridSlug重寫 */

class DefaultSlug {
  static normal_move(slughome, {
    only_x = false,
    only_y = false,
    not_overflow = false,
    not_overflow_x = false,
    not_overflow_y = false,
  } = {}) {
    slughome.classList.add('normal_move_slughome');
    slughome.onchildsquirming = ({slug, originX, originY, maxX, maxY}) => {
      let x = originX;
      let y = originY;
      if(not_overflow || not_overflow_x) x = Math.min(Math.max(x, 0), maxX);
      if(not_overflow || not_overflow_y) y = Math.min(Math.max(y, 0), maxY);
      if(!only_y) slug.style.left = x + "px";
      if(!only_x) slug.style.top = y + "px";
    };
  }
  static free_move(slughome_arr, {} = {}) {
    slughome.classList.add('free_move_slughome');
    slughome_arr.forEach(slughome => {
      slughome.onslughomeenter = ({slug, homeX, homeY}) => {
        slughome.onchildsquirming = null;
        slughome.appendChild(slug);
        slug.style.left = homeX + "px";
        slug.style.top = homeY + "px";
      };
      slughome.onslughomestay = ({slug, homeX, homeY}) => {
        slug.style.left = homeX + "px";
        slug.style.top = homeY + "px";
      };
    });
  }
}

class GridSlug {
  static grid(slughome) {
    slughome.classList.add('slug_grid');
    slughome.onchildsquirmstart = ({slug}) => {
      GridSlug.start_set_data(slughome);
      GridSlug.create_temp_pos_el(slughome, slug);
      slughome.classList.add('squirming');
      slug.classList.add('squirming');
      GridSlug.set_slugs_pos(slughome, slug);
    };
    slughome.onchildsquirming = ({slug, originX, originY, maxX, maxY, docX, docY}) => {
      let x = Math.min(Math.max(originX, 0), maxX);
      let y = Math.min(Math.max(originY, 0), maxY);
      slug.style.left = x + "px";
      slug.style.top = y + "px";
      GridSlug.temp_pos_move(
        slughome,
        docX - slughome.docX + slughome.scrollLeft - GridSlug.data.start_x,
        docY - slughome.docY + slughome.scrollTop - GridSlug.data.start_y,
      );
      GridSlug.set_slugs_pos(slughome, slug);
    };
    slughome.onchildsquirmed = ({slug}) => {
      slughome.classList.remove('squirming');
      slug.classList.remove('squirming');
      GridSlug.clear_slugs_style(slughome);
      GridSlug.remove_temp_pos_el(slughome, slug);
      delete GridSlug.data;
      slughome.dispatchEvent(new Event('change', { 'bubbles': true }));
    };
  }
  static start_set_data(slughome) {
    let style = getComputedStyle(slughome);
    let data = {};
    GridSlug.data = data;
    data.flow = style.gridAutoFlow;
    data.start_x = parseFloat(style.paddingLeft);
    data.start_y = parseFloat(style.paddingTop);
    data.gap_x = parseFloat(style.columnGap) || 0;
    data.gap_y = parseFloat(style.rowGap) || 0;
    let contentWidth = slughome.scrollWidth - data.start_x - parseFloat(style.paddingRight);
    let contentHeight = slughome.clientHeight - data.start_y - parseFloat(style.paddingBottom);
    data.column_width = style.getPropertyValue('--column_width') || (data.flow == "row" ? contentWidth : 160);
    data.row_height = style.getPropertyValue('--row_height') || (data.flow == "column" ? contentHeight : 40);
    if(/%/.test(data.column_width)) {
      data.column_width = parseFloat(data.column_width) / 100 * contentWidth;
      slughome.style.setProperty('--column_width', Math.round(data.column_width) + "px");
    }
    if(/%/.test(data.row_height)) {
      data.row_height = parseFloat(data.row_height) / 100 * contentHeight;
      slughome.style.setProperty('--row_height', Math.round(data.row_height) + "px");
    }
    data.column_width = parseFloat(data.column_width);
    data.row_height = parseFloat(data.row_height);
    let line_gap_rule = "start", remaining_space = 0;
    if(data.flow == "row") {
      line_gap_rule = style.justifyContent;
      data.unit_count = Math.floor((contentWidth + data.gap_x) / (data.column_width + data.gap_x));
      remaining_space = contentWidth - data.unit_count * (data.column_width + data.gap_x) + data.gap_x;
    }
    else if(data.flow == "column") {
      line_gap_rule = style.alignContent;
      data.unit_count = Math.floor((contentHeight + data.gap_y) / (data.row_height + data.gap_y));
      remaining_space = contentHeight - data.unit_count * (data.row_height + data.gap_y) + data.gap_y;
    }
    GridSlug.calc_gap(line_gap_rule, remaining_space);
  }
  static calc_gap(line_gap_rule, remaining_space) {
    let data = GridSlug.data;
    let add_start_space = 0, add_gap = 0;
    switch(line_gap_rule) {
      case "space-around": {
        let gap = remaining_space / data.unit_count;
        add_gap = gap;
        add_start_space = gap / 2;
        break;
      }
      case "space-between": {
        add_gap = remaining_space / (data.unit_count - 1);
        break;
      }
      case "space-evenly": {
        let gap = remaining_space / (data.unit_count + 1);
        add_gap = gap;
        add_start_space = gap;
        break;
      }
      case "center": {
        add_start_space = remaining_space / 2;
        break;
      }
      case "end": case "flex-end": case "right": {
        add_start_space = remaining_space;
        break;
      }
    }
    if(data.flow == "row") {
      data.start_x += add_start_space;
      data.gap_x += add_gap;
    }
    else if(data.flow == "column") {
      data.start_y += add_start_space;
      data.gap_y += add_gap;
    }
  }
  static create_temp_pos_el(slughome, slug) {
    let scrollLeft = slughome.scrollLeft;
    let scrollTop = slughome.scrollTop;
    GridSlug.temp_pos = document.createElement('div');
    GridSlug.temp_pos.classList.add('temp_pos');
    slug.after(GridSlug.temp_pos);
    slughome.lastElementChild.after(slug);
    slughome.scrollLeft = scrollLeft;
    slughome.scrollTop = scrollTop;
  }
  static remove_temp_pos_el(slughome, slug) {
    let scrollLeft = slughome.scrollLeft;
    let scrollTop = slughome.scrollTop;
    GridSlug.temp_pos.after(slug);
    GridSlug.temp_pos.remove();
    delete GridSlug.temp_pos;
    slughome.scrollLeft = scrollLeft;
    slughome.scrollTop = scrollTop;
  }
  static set_slugs_pos(slughome, squirming_slug) {
    [...slughome.children].slice(0, -1).forEach((slug, index) => {
      if(squirming_slug == slug) return;
      let line = Math.floor(index / GridSlug.data.unit_count);
      let line_pos = index % GridSlug.data.unit_count;
      let r = GridSlug.data.flow == "row" ? line : line_pos;
      let c = GridSlug.data.flow == "column" ? line : line_pos;
      let x = c * (GridSlug.data.column_width + GridSlug.data.gap_x) + GridSlug.data.start_x;
      let y = r * (GridSlug.data.row_height + GridSlug.data.gap_y) + GridSlug.data.start_y;
      slug.style.left = x + "px";
      slug.style.top = y + "px";
    });
  }
  static temp_pos_move(slughome, x, y) {
    let child_list = [...slughome.children].filter(el => el != GridSlug.temp_pos);
    let u = GridSlug.data.unit_count;
    let c = Math.max(Math.floor(x / (GridSlug.data.column_width + GridSlug.data.gap_x)), 0);
    let r = Math.max(Math.floor(y / (GridSlug.data.row_height + GridSlug.data.gap_y)), 0);
    let cur_index = -1;
    if(GridSlug.data.flow == "row") {
      c = Math.min(c, u - 1);
      cur_index = Math.min(r * u + c, child_list.length) - 1;
    }
    else if(GridSlug.data.flow == "column") {
      r = Math.min(r, u - 1);
      cur_index = Math.min(c * u + r, child_list.length) - 1;
    }
    if(cur_index <= -1) child_list[0].before(GridSlug.temp_pos);
    else child_list[cur_index].after(GridSlug.temp_pos);
  }
  static clear_slugs_style(slughome) {
    [...slughome.children].forEach(slug => {
      slug.style.removeProperty('left');
      slug.style.removeProperty('top');
      if(!slug.getAttribute('style')) slug.removeAttribute('style');
    });
  }
}
