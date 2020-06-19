// Pew-Pew-Pew! (Sound-Reactive Version)
// Animated LED Pattern for Pixelblaze (https://www.bhencke.com/pixelblaze)
// Pattern Author: Scott Balay (https://www.scottbalay.com/)
// Github: https://github.com/zenblender/pixel-blaze-patterns

// *** Assumes Pixelblaze Sensor Expansion Board is connected and provides realtime sound input. ***

// Written for a 150-LED strip, adjust settings to your liking!

export var energyAverage
export var maxFrequencyMagnitude
export var maxFrequency

isForwardDirection = true // flip to run backwards
laserCount = 10  // use a multiple of numPaletteRGBs to have each available color represented equally
fadeFactor = 0.8
speedFactor = 0.01
soundLevelPowFactor = 1.2

// init RGBs that in the palette of available colors:
numPaletteRGBs = 5
paletteRGBs = array(numPaletteRGBs)
paletteRGBs[0] = packRGB(255,13,107)
paletteRGBs[1] = packRGB(232,12,208)
paletteRGBs[2] = packRGB(200,0,255)
paletteRGBs[3] = packRGB(124,12,232)
paletteRGBs[4] = packRGB(70,13,255)

// ambient color added to all LEDs to provide a base color:
ambientR = 15
ambientG = 0
ambientB = 0

export var soundLevelVal = 0

pic = makePIController(.05, .35, 30, 0, 400)

// function adapted from "sound - rays" pattern available at https://electromage.com/patterns/
function makePIController(kp, ki, start, min, max) {
  var pic = array(5)
  pic[0] = kp
  pic[1] = ki
  pic[2] = start
  pic[3] = min
  pic[4] = max
  return pic
}

// function adapted from "sound - rays" pattern available at https://electromage.com/patterns/
function calcPIController(pic, err) {
  pic[2] = clamp(pic[2] + err, pic[3], pic[4])
  return pic[0] * err + pic[1] * pic[2]
}

function getRandomVelocity() { return random(4) + 3 }

// init RGB of each laser:
laserRGBs = createArray(laserCount, function(i){ return paletteRGBs[i % numPaletteRGBs] }, true)

// init randomized starting positions of each laser:
laserPositions = createArray(laserCount, function(){ return random(pixelCount) }, true)

// init each laser's velocity
laserVelocities = createArray(laserCount, function(){ return getRandomVelocity() }, true)

// init the full pixel array:
pixelRGBs = createArray(pixelCount)

export function beforeRender(delta) {
  sensitivity = calcPIController(pic, .5 - soundLevelVal)

  soundLevelVal = pow(maxFrequencyMagnitude * sensitivity, soundLevelPowFactor)

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
    nextLaserPosition = currentLaserPosition + (delta * speedFactor * laserVelocities[laserIndex])
    for (pixelIndex = floor(nextLaserPosition); pixelIndex >= currentLaserPosition; pixelIndex--) {
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

export function render(rawIndex) {
  index = isForwardDirection ? rawIndex : (pixelCount - rawIndex - 1)
  rgb(
    clamp((getR(pixelRGBs[index]) + ambientR) / 255, 0, 1),
    clamp((getG(pixelRGBs[index]) + ambientG) / 255, 0, 1),
    clamp(((soundLevelVal * 255) + ambientB) / 255, 0, 1)
  )
}

//===== UTILS =====
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
