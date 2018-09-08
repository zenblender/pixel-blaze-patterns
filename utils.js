//===== UTILS =====
// RENDER HELPERS:
function renderFromPackedRGB(arr, index) {
  rgb(
    getR(arr[index]) / 255,
    getG(arr[index]) / 255,
    getB(arr[index]) / 255,
  )
}
// ARRAY INIT FUNCTIONS:
function createArray(size, valueOrFn, isFn) {
  arr = array(size)
  if (!valueOrFn) return arr
  for (i = 0; i < size; i++) {
    arr[i] = isFn ? valueOrFn(i) : valueOrFn
  }
  return arr
}
// RGB FUNCTIONS:
// assume each component is an 8-bit "int" (0-255)
function packRGB(r, g, b) { return _packColor(r, g, b) }
function getR(value) { return _getFirstComponent(value) }
function getG(value) { return _getSecondComponent(value) }
function getB(value) { return _getThirdComponent(value) }
// HSV FUNCTIONS:
// assume each component is an 8-bit "int" (0-255)
function packHSV(h, s, v) { return _packColor(h, s, v) }
function getH(value) { return _getFirstComponent(value) }
function getS(value) { return _getSecondComponent(value) }
function getV(value) { return _getThirdComponent(value) }
// "PRIVATE" COLOR FUNCTIONS:
// assume each component is an 8-bit "int" (0-255)
function _packColor(a, b, c) { return (a<<8) + b + (c>>8) }
function _getFirstComponent(value) { return (value>>8) & 0xff } // R or H
function _getSecondComponent(value) { return value & 0xff } // G or S
function _getThirdComponent(value) { return (value<<8) & 0xff } // B or V
