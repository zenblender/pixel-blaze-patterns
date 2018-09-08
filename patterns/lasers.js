// Lasers (PixelBlaze pattern)
// by Scott Balay
// https://github.com/zenblender

laserCount = 5  // use a multiple of numAvailableRGBs to have each available color represented equally
fadeFactor = 0.8
deltaFactor = 0.01

// init RGBs that in the palette of available colors:
numAvailableRGBs = 5
availableRGBs = array(numAvailableRGBs)
availableRGBs[0] = packRGB(255,13,107)
availableRGBs[1] = packRGB(232,12,208)
availableRGBs[2] = packRGB(200,0,255)
availableRGBs[3] = packRGB(124,12,232)
availableRGBs[4] = packRGB(70,13,255)

// init RGB of each laser:
laserRGBs = createArray(laserCount, function(i){ return availableRGBs[i % numAvailableRGBs] }, true)

// init randomized starting positions of each laser:
laserPositions = createArray(laserCount, function(){ return random(pixelCount) }, true)

// init each laser's velocity
laserVelocities = createArray(laserCount, function(){ return getRandomVelocity() }, true)

// init the full pixel array:
pixelRGBs = createArray(pixelCount, 0)

function getRandomVelocity() { return random(4) + 3 }

export function beforeRender(delta) {
  // fade existing pixels:
  for (pixelIndex = 0; pixelIndex < pixelCount; pixelIndex++) {
    pixelRGBs[pixelIndex] = packRGB(
      floor(getR(pixelRGBs[pixelIndex]) * fadeFactor),
      floor(getG(pixelRGBs[pixelIndex]) * fadeFactor),
      floor(getB(pixelRGBs[pixelIndex]) * fadeFactor)
    )
  }

  // advance laser positions:
  for (laserIndex = 0; laserIndex < laserCount; laserIndex++) {
    currentLaserPosition = laserPositions[laserIndex]
    nextLaserPosition = currentLaserPosition + (delta * deltaFactor * laserVelocities[laserIndex])
    for (pixelIndex = floor(nextLaserPosition); pixelIndex > currentLaserPosition; pixelIndex--) {
      // draw new laser edge, but fill in "gaps" from last draw:
      if (pixelIndex < pixelCount) {
        pixelRGBs[pixelIndex] = packRGB(
            min(255, getR(pixelRGBs[pixelIndex]) + getR(laserRGBs[laserIndex])),
            min(255, getG(pixelRGBs[pixelIndex]) + getG(laserRGBs[laserIndex])),
            min(255, getB(pixelRGBs[pixelIndex]) + getB(laserRGBs[laserIndex]))
        )
      }
    }

    laserPositions[laserIndex] = nextLaserPosition
    if (laserPositions[laserIndex] >= pixelCount) {
      // wrap this laser back to the start
      laserPositions[laserIndex] = 0
      laserVelocities[laserIndex] = getRandomVelocity()
    }
  }
}

export function render(pixelIndex) {
  renderFromPackedRGB(pixelRGBs, pixelIndex)
}

//===== UTILS =====
// RENDER HELPERS:
function renderFromPackedRGB(arr, i) {
  rgb(
    getR(arr[i]) / 255,
    getG(arr[i]) / 255,
    getB(arr[i]) / 255,
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
