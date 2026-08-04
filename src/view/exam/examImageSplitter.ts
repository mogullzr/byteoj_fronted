export type NormalizedRect = {
  left: number
  top: number
  right: number
  bottom: number
}

export const MIN_CUT_GAP = 0.01

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value))

export const loadImageFile = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法读取图片：' + file.name))
    }
    image.src = url
  })

export const imageToCanvas = (
  image: CanvasImageSource,
  width: number,
  height: number,
) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('当前浏览器不支持图片处理。')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas
}

export const enhanceDocumentCanvas = (
  source: HTMLCanvasElement,
  strength = 0.72,
  sharpenStrength = strength,
) => {
  const normalizedStrength = clamp(strength, 0, 1)
  const normalizedSharpenStrength = clamp(sharpenStrength, 0, 1)
  const result = document.createElement('canvas')
  result.width = source.width
  result.height = source.height
  const context = result.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('当前浏览器不支持图片增强。')

  const contrast = 1.08 + normalizedStrength * 0.12
  const saturation = 1.2 + normalizedStrength * 0.8
  const brightness = 1.01 + normalizedStrength * 0.025
  context.filter = `contrast(${contrast}) saturate(${saturation}) brightness(${brightness})`
  context.drawImage(source, 0, 0)
  context.filter = 'none'

  if (normalizedSharpenStrength < 0.01 || result.width < 3 || result.height < 3) return result

  const image = context.getImageData(0, 0, result.width, result.height)
  const pixels = image.data
  const original = new Uint8ClampedArray(pixels)
  // 文档照片使用温和的反遮罩锐化，突出笔画边缘并限制光晕和噪点。
  const sharpenAmount = 0.06 + normalizedSharpenStrength * 0.24
  const edgeThreshold = 3 + (1 - normalizedSharpenStrength) * 8
  const rowStride = result.width * 4

  for (let y = 1; y < result.height - 1; y += 1) {
    const rowStart = y * rowStride
    for (let x = 1; x < result.width - 1; x += 1) {
      const index = rowStart + x * 4
      for (let channel = 0; channel < 3; channel += 1) {
        const center = original[index + channel]
        const neighbours = original[index - 4 + channel]
          + original[index + 4 + channel]
          + original[index - rowStride + channel]
          + original[index + rowStride + channel]
        const neighbourAverage = neighbours / 4
        if (Math.abs(center - neighbourAverage) < edgeThreshold) continue
        pixels[index + channel] = clamp(
          Math.round(center * (1 + sharpenAmount * 4) - neighbours * sharpenAmount),
          0,
          255,
        )
      }
    }
  }
  context.putImageData(image, 0, 0)
  return result
}

const rgbToHsv = (red: number, green: number, blue: number) => {
  const r = red / 255
  const g = green / 255
  const b = blue / 255
  const maximum = Math.max(r, g, b)
  const minimum = Math.min(r, g, b)
  const delta = maximum - minimum
  let hue = 0
  if (delta !== 0) {
    if (maximum === r) hue = ((g - b) / delta) % 6
    else if (maximum === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  return {
    hue,
    saturation: maximum === 0 ? 0 : delta / maximum,
    value: maximum,
  }
}

const enhancedPixel = (
  red: number,
  green: number,
  blue: number,
  saturationFactor: number,
  contrastFactor: number,
) => {
  const hsv = rgbToHsv(red, green, blue)
  const saturation = clamp(hsv.saturation * saturationFactor, 0, 1)
  const chroma = hsv.value * saturation
  const hue = hsv.hue / 60
  const x = chroma * (1 - Math.abs((hue % 2) - 1))
  let result: number[] = [0, 0, 0]
  if (hue < 1) result = [chroma, x, 0]
  else if (hue < 2) result = [x, chroma, 0]
  else if (hue < 3) result = [0, chroma, x]
  else if (hue < 4) result = [0, x, chroma]
  else if (hue < 5) result = [x, 0, chroma]
  else result = [chroma, 0, x]
  const match = hsv.value - chroma
  return result.map(channel =>
    clamp(Math.round(((channel + match) * 255 - 128) * contrastFactor + 128), 0, 255),
  )
}

const isRedPixel = (red: number, green: number, blue: number) => {
  // Camera white balance often shifts a red pen toward magenta, where blue can
  // be higher than red. Red-vs-green remains stable under that color shift.
  const sourceMargin = red - green
  const variants = [
    { saturation: 1, contrast: 1, magentaFloor: 278, saturationFloor: 0.075, allowAdvantage: true },
    { saturation: 1.8, contrast: 1.05, magentaFloor: 278, saturationFloor: 0.14, allowAdvantage: false },
    { saturation: 2.6, contrast: 1.1, magentaFloor: 276, saturationFloor: 0.17, allowAdvantage: false },
    { saturation: 3.4, contrast: 1.12, magentaFloor: 274, saturationFloor: 0.19, allowAdvantage: false },
  ]
  return variants.some(variant => {
    const enhanced = enhancedPixel(red, green, blue, variant.saturation, variant.contrast)
    const hsv = rgbToHsv(enhanced[0], enhanced[1], enhanced[2])
    const hueIsRed = hsv.hue <= 32 || hsv.hue >= variant.magentaFloor
    const variantMargin = enhanced[0] - enhanced[1]
    const strongRed = hueIsRed
      && hsv.saturation >= variant.saturationFloor
      && hsv.value >= 0.137
      && sourceMargin >= 6
      && variantMargin >= 8
    const redAdvantage = variant.allowAdvantage
      && enhanced[0] >= 65
      && sourceMargin >= 12
      && red - Math.min(green, blue) >= 16
      && (hueIsRed || sourceMargin >= 16)
    return strongRed || redAdvantage
  })
}

export const detectRedCuts = (source: HTMLImageElement | HTMLCanvasElement) => {
  const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width
  const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height
  const width = Math.min(700, sourceWidth)
  const height = Math.max(1, Math.round(sourceHeight * width / sourceWidth))
  if (width < 20 || height < 20) return []

  const canvas = imageToCanvas(source, width, height)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return []
  const pixels = context.getImageData(0, 0, width, height).data
  const mask = new Uint8Array(width * height)
  const redGreenDifference = new Int16Array(width * height)
  for (let index = 0; index < width * height; index += 1) {
    const pixel = index * 4
    redGreenDifference[index] = pixels[pixel] - pixels[pixel + 1]
  }
  const localSampleGap = Math.max(3, Math.round(height * 0.008))
  for (let y = localSampleGap * 2; y < height - localSampleGap * 2; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x
      const localBackground = (
        redGreenDifference[index - localSampleGap * width]
        + redGreenDifference[index + localSampleGap * width]
        + redGreenDifference[index - localSampleGap * 2 * width]
        + redGreenDifference[index + localSampleGap * 2 * width]
      ) / 4
      const localContrast = redGreenDifference[index] - localBackground
      if (localContrast < 4) continue
      const pixel = index * 4
      if (isRedPixel(pixels[pixel], pixels[pixel + 1], pixels[pixel + 2])) mask[index] = 1
    }
  }

  const binCount = 48
  const left = Math.round(width * 0.03)
  const right = Math.round(width * 0.97)
  const centerX = width / 2
  const redPoints: Array<[number, number, number]> = []
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width
    for (let x = left; x < right; x += 1) {
      if (!mask[rowOffset + x]) continue
      const bin = Math.min(binCount - 1, Math.floor((x - left) * binCount / (right - left)))
      redPoints.push([x, y, bin])
    }
  }

  const halfBand = Math.max(3, Math.round(height * 0.006))
  const minBinPixels = 3
  const minimumRunLength = Math.round(binCount * 0.22)
  const minimumRunHits = Math.round(binCount * 0.17)
  type LineCandidate = {
    centerY: number
    slope: number
    runLength: number
    runHits: number
    score: number
  }
  const bestByCenter = new Map<number, LineCandidate>()

  for (let slopeStep = -20; slopeStep <= 20; slopeStep += 1) {
    const slope = slopeStep / 100
    const counts = Array.from({ length: binCount }, () => new Int32Array(height))
    redPoints.forEach(([x, y, bin]) => {
      const intercept = Math.round(y - slope * (x - centerX))
      if (intercept >= 0 && intercept < height) counts[bin][intercept] += 1
    })
    const prefixes = counts.map(binCounts => {
      const prefix = new Int32Array(height + 1)
      for (let y = 0; y < height; y += 1) prefix[y + 1] = prefix[y] + binCounts[y]
      return prefix
    })

    for (let centerY = halfBand; centerY < height - halfBand; centerY += 1) {
      const top = centerY - halfBand
      const bottom = centerY + halfBand + 1
      const bandCounts = prefixes.map(prefix => prefix[bottom] - prefix[top])
      const hits = bandCounts.map(count => count >= minBinPixels)
      let bestRunLength = 0
      let bestRunHits = 0
      let bestRunPixels = 0
      let bestRunScore = 0

      for (let start = 0; start < binCount; start += 1) {
        let runHits = 0
        let runPixels = 0
        for (let end = start; end < binCount; end += 1) {
          if (hits[end]) runHits += 1
          runPixels += bandCounts[end]
          const runLength = end - start + 1
          if (runLength < minimumRunLength || runHits < minimumRunHits) continue
          const density = runHits / runLength
          if (density < 0.58) continue
          const gaps = runLength - runHits
          const score = runHits * 8 - gaps * 10 + Math.min(runPixels, 240) * 0.1
          if (score > bestRunScore) {
            bestRunScore = score
            bestRunLength = runLength
            bestRunHits = runHits
            bestRunPixels = runPixels
          }
        }
      }

      if (bestRunLength < minimumRunLength || bestRunHits < minimumRunHits) continue
      const candidate: LineCandidate = {
        centerY,
        slope,
        runLength: bestRunLength,
        runHits: bestRunHits,
        score: bestRunScore + Math.min(bestRunPixels, 240) * 0.02,
      }
      const current = bestByCenter.get(centerY)
      if (!current || candidate.score > current.score) bestByCenter.set(centerY, candidate)
    }
  }

  const candidateRows = [...bestByCenter.values()]
  const maximumScore = candidateRows.reduce((maximum, candidate) => Math.max(maximum, candidate.score), 0)
  const minimumScore = Math.max(70, maximumScore * 0.58)
  const suppressionDistance = Math.max(Math.round(height * 0.045), halfBand * 5)
  const selectedCandidates: LineCandidate[] = []
  candidateRows
    .filter(candidate => candidate.score >= minimumScore)
    .sort((a, b) => b.score - a.score)
    .forEach(candidate => {
      if (candidate.centerY / height <= 0.04 || candidate.centerY / height >= 0.96) return
      if (selectedCandidates.some(selected => Math.abs(selected.centerY - candidate.centerY) < suppressionDistance)) return
      selectedCandidates.push(candidate)
    })

  const cuts = selectedCandidates
    .sort((a, b) => a.centerY - b.centerY)
    .map(candidate => candidate.centerY / height)
  return cuts.reduce<number[]>((merged, cut) => {
    if (merged.length && cut - merged[merged.length - 1] < 0.04) {
      merged[merged.length - 1] = (merged[merged.length - 1] + cut) / 2
    } else {
      merged.push(cut)
    }
    return merged
  }, [])
}

export const cropCanvas = (
  source: HTMLCanvasElement,
  topRatio: number,
  bottomRatio: number,
  removals: NormalizedRect[] = [],
) => {
  const top = Math.round(clamp(topRatio, 0, 1) * source.height)
  const bottom = Math.round(clamp(bottomRatio, 0, 1) * source.height)
  const result = imageToCanvas(source, source.width, Math.max(1, bottom - top))
  const context = result.getContext('2d')
  if (!context) throw new Error('当前浏览器不支持图片裁切。')
  context.clearRect(0, 0, result.width, result.height)
  context.drawImage(
    source,
    0, top, source.width, bottom - top,
    0, 0, result.width, result.height,
  )
  context.fillStyle = '#ffffff'
  removals.forEach(removal => {
    const removalTop = Math.max(removal.top, topRatio)
    const removalBottom = Math.min(removal.bottom, bottomRatio)
    if (removalBottom <= removalTop) return
    context.fillRect(
      removal.left * source.width,
      (removalTop - topRatio) * source.height,
      (removal.right - removal.left) * source.width,
      (removalBottom - removalTop) * source.height,
    )
  })
  return result
}

export const stitchCanvasesVertically = (sources: HTMLCanvasElement[]) => {
  if (!sources.length) throw new Error('没有可拼接的答案图片。')
  const width = Math.max(...sources.map(source => source.width))
  const scaledHeights = sources.map(source => Math.max(1, Math.round(source.height * width / source.width)))
  const result = document.createElement('canvas')
  result.width = width
  result.height = scaledHeights.reduce((sum, height) => sum + height, 0)
  const context = result.getContext('2d')
  if (!context) throw new Error('当前浏览器不支持图片拼接。')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, result.width, result.height)
  let top = 0
  sources.forEach((source, index) => {
    context.drawImage(source, 0, top, width, scaledHeights[index])
    top += scaledHeights[index]
  })
  return result
}

export const canvasToFile = (
  canvas: HTMLCanvasElement,
  filename: string,
  quality = 0.94,
): Promise<File> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('生成答案图片失败。'))
        return
      }
      resolve(new File([blob], filename, { type: 'image/jpeg' }))
    }, 'image/jpeg', quality)
  })
