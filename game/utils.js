const cart2Iso = (x, y) => {
  let isoX = x - y;
  let isoY = (x + y) / 2;

  return [isoX, isoY];
};

module.exports = {
  cart2Iso
};
