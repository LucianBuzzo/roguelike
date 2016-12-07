const cart2Iso = (x, y) => {
  let isoX = x - y;
  let isoY = (x + y) / 2;

  return [isoX, isoY];
};

const iso2Cart = (isoX, isoY) => {
  let cartX = (2 * isoY + isoX) / 2;
  let cartY = (2 * isoY - isoX) / 2;

  return [cartX, cartY];
};

module.exports = {
  cart2Iso,
  iso2Cart
};
