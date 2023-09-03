/* v 1.0 */
/* 2023-7-21: new_el翻新、新增版本編號 */

function find_all(param1, param2) {
  if(typeof param1 == 'string') return document.querySelectorAll(param1);
  else return param1.querySelectorAll(param2);
}
function find(param1, param2) {
  if(typeof param1 == 'string') return document.querySelector(param1);
  else return param1.querySelector(param2);
}
function new_el_to_el(target_el, tag_str, param1, param2) {
  let el = new_el(tag_str, param1, param2);
  if(typeof target_el == "string") target_el = find(target_el);
  if(target_el) target_el.appendChild(el);
  return el;
}
function new_el(tag_str, param1, param2) {
  /* tagName id class */
  let id, class_list;
  if(tag_str.search('#') != -1) id = tag_str.match(/#[^\.]*/)[0].substr(1);
  class_list = tag_str.split('.').slice(1).filter(v=>v);
  let tagName = tag_str.match(/[^#\.]*/)[0];
  /* el產生 */
  let el = document.createElement(tagName);
  if(id) el.id = id;
  class_list.forEach(className => el.classList.add(className));
  if(is_attr(param1)) { set_content(param2); set_attr(param1); }
  else if(is_attr(param2)) { set_content(param1); set_attr(param2); }
  else set_content(param1);
  return el;
  /* function */
  function is_attr(param) {
    if(!param || param.constructor !== Object) return false;
    if(typeof param != 'object' || Array.isArray(param) || param instanceof HTMLElement) return false;
    if(!Object.keys(param).length) return false;
    return true;
  }
  function set_content(param) {
    if(!param) return;
    if(param instanceof HTMLElement) return el.appendChild(param);
    if(typeof param == "string") return el.innerText = param;
    if(!Array.isArray(param)) return;
    param.forEach(sub_cnt => {
      if(sub_cnt instanceof HTMLElement) el.appendChild(sub_cnt);
    });
  }
  function set_attr(param) {
    Object.entries(param).forEach(([key, val]) => {
      if(val === true) el.setAttribute(key, '');
      else if(typeof val == 'number' || typeof val == 'string') el.setAttribute(key, val);
    });
  }
}
