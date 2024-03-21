
function asNumber(value, pos) {
  if (Number.isNaN(value)) return 0;
  if (pos) return Math.max(0, value);
  return value;
}

function asString(value) {
  return `${value}`
}

export class Product {

  constructor(data = {}, id) {
    if (typeof data !== 'object') throw new Error('bad seed for Product');
    this.name = asString(data.name);
    this.description = asString(data.description);
    this.cost = asNumber(data.cost, true);
    if (data.options) this.options = data.options;
    this.id = asNumber(data.id) || asNumber(id);
  }

}

