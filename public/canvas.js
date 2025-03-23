// Globals
/** @type {HTMLCanvasElement} */
const surface = document.getElementById("main")
const context = surface.getContext("2d")

// Config
let starsBackgroundCount = 2600
let starsBackgroundSpeed = 0.001
let starsBackgroundDepth = 0.1

let starDelta = 0 // Dynamic, keep at 0
const starSpeedVariance = 0.002

const errorsBackgroundCount = 20
const errorsBackgroundSpeed = 0.001
const errorsBackgroundDepth = 0.03
const errorsLifetimeIncrement = 0.0004

const bannerTextDashIncrement = 0.2

let dashDelta = 0 // Dynamic, keep at 0
const dashVariance = 0.2


// Stars background
const stars = []
function renderStarsBackground(options) {
    // Init step
    if (options?.init === true) {
        for (let i = 0; i < starsBackgroundCount; i++) {
            stars.push({
                x: Math.random() * surface.width - surface.width / 2,
                y: Math.random() * surface.height - surface.height / 2,
                z: Math.random() * starsBackgroundDepth
            })
        }
        return
    }

    // Render cover
    if (options?.warp !== true) context.fillRect(-surface.width / 2, -surface.height / 2, surface.width * 2, surface.height * 2)
    context.strokeStyle = "rgb("+Math.random()*255+", "+Math.random()*255+", "+Math.random()*255+")";
    context.translate(surface.width / 2, surface.height / 2);
    
    // Regular
    context.strokeStyle = "rgb(255, 255, 255)"
    context.lineWidth = 4
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        const oStar = { x: star.x, y: star.y, z: star.z }

        // Iterate on position
        const nz = star.z + (starsBackgroundSpeed + starDelta)
        const nx = star.x + star.x * (starsBackgroundSpeed + starDelta) * nz 
        const ny = star.y + star.y * (starsBackgroundSpeed + starDelta) * nz

        // Detect out of bounds
        const trs = 55
        let noLine = false
        if (
            nx > surface.width / 2 + trs ||
            nx < -surface.width / 2 - trs ||
            ny > surface.height / 2 + trs ||
            ny < -surface.height  / 2 - trs
        ) {
            noLine = true
            star.x = Math.random() * surface.width - surface.width / 2,
            star.y = Math.random() * surface.height - surface.height / 2
            star.z = Math.random() * (starsBackgroundDepth + starDelta)
        } else {
            // Or set pos
            star.x = nx
            star.y = ny
            star.z = nz
        }

        // Draw
        context.lineWidth = star.z
        context.beginPath()
        context.moveTo(star.x, star.y)
        if (!noLine) context.lineTo(oStar.x, oStar.y)
        context.stroke()
    }
}

// Errors text background
const errorTexts = []
const textSamples = [
    "TypeError: Cannot read properties of undefined",
    "IndentationError: unexpected indent",
    "error[E0382]: borrow of moved value",
    "Segmentation fault (core dumped)",
    "Exception in thread \"main\" java.lang.NullPointerException",
    "SyntaxError: Unexpected token '}'",
    "std::out_of_range: vector::_M_range_check",
    "java.lang.OutOfMemoryError: Java heap space",
    "Uncaught RangeError: Maximum call stack size exceeded",
    "free(): invalid pointer"
]
function renderErrorTextBackground(options) {
    // Init step
    if (options?.init === true) {
        for (let i = 0; i < errorsBackgroundCount; i++) {
            errorTexts.push({
                text: textSamples[Math.floor(Math.random() * textSamples.length)],
                x: Math.random() * surface.width - surface.width / 2,
                y: Math.random() * surface.height - surface.height / 2,
                z: Math.random() * errorsBackgroundDepth,
                lf: 0.001
            })
        }
        return
    }

    context.textAlign = "center"
    context.textBaseline = "middle"
    context.translate(surface.width / 2, surface.height / 2)

    for (let i = 0; i < errorTexts.length; i++) {
        const textObj = errorTexts[i]

        // Iterate on position
        const nz = textObj.z + (errorsBackgroundSpeed + starDelta)
        const nx = textObj.x * (1 + errorsBackgroundSpeed)
        const ny = textObj.y * (1 + errorsBackgroundSpeed)

        // Detect out of bounds
        const trs = 90
        if (
            nx > surface.width / 2 + trs ||
            nx < -surface.width / 2 - trs ||
            ny > surface.height / 2 + trs ||
            ny < -surface.height / 2 - trs
        ) {
            textObj.x = Math.random() * surface.width - surface.width / 2
            textObj.y = Math.random() * surface.height - surface.height / 2
            textObj.z = Math.random() * errorsBackgroundDepth
            textObj.text = textSamples[Math.floor(Math.random() * textSamples.length)]
            textObj.lf = 0.001
        } else {
            textObj.x = nx
            textObj.y = ny
            textObj.z = nz
            textObj.lf += errorsLifetimeIncrement
        }

        // Fade in
        context.fillStyle = `rgba(255, 255, 255, ${Math.min(textObj.lf, 1)})`

        // Draw text
        context.font = `${Math.max(10, textObj.z * surface.width * 0.002604)}px monospace`
        context.fillText(textObj.text, textObj.x, textObj.y)
    }
}

// Banner text
let bannerTextDashOffset = 0
function renderBannerText(options) {
    bannerTextDashOffset += bannerTextDashIncrement + dashDelta
    if (bannerTextDashIncrement > 100) bannerTextDashIncrement = 0
    context.fillStyle = "rgb(255, 255, 255)"
    context.strokeStyle = "rgb(255, 255, 255)"
    context.lineWidth = 3
    context.font = `${surface.width * 0.09375}px Poppins-Bold`
    context.textAlign = "center"
    if (options?.dash !== false) {
        context.setLineDash([100, 40])
        context.lineDashOffset = bannerTextDashOffset
    }
    const mode = options?.outline === true ? "strokeText" : "fillText"
    context[mode]("Testitapahtuma", surface.width / 2, surface.height / 2 + 20)
}

// Slide
const slideContents = [
    [""], // Blank
    // Welcome slide
    [
        "Tervetuloa Testitapahtumaan!",
        "> Avauspuhe <"
    ],
    [
        "Näkökulma Kyberiin",
        "Elisa"
    ],
    [
        "OPSEC: Virheet eivät satu sattumalta",
        "PVJJK"
    ],
    [
        "Miten poliisi torjuu ja estää vakavaa kyberrikollisuutta?",
        "KRP"
    ],
    [
        "Flashtalks!"
    ]
]
function renderSlide(options) {
    context.fillStyle = "rgb(255, 255, 255)"
    context.strokeStyle = "rgb(255, 255, 255)"
    const fontSize = surface.width * 0.02375
    context.font = `${fontSize}px Poppins-Bold`
    context.textAlign = "center"
    context.textBaseline = "middle"
    for (let i = 0; i < slideContents[options.slide].length; i++) {
        const line = slideContents[options.slide][i]
        context.fillText(line, surface.width / 2, 180 + (surface.height / 2) + (i * fontSize * 1.6))
    }
}

// Anything that counts as setup
let fftData = []
async function init() {
    surface.width = window.innerWidth
    surface.height = window.innerHeight

    renderStarsBackground({ init: true })
    renderErrorTextBackground({ init: true })

    const { dataArray, fftSize } = await listenToLineIn(1024)

    fftData = dataArray
}

// Reset util
function resetContext() {
    context.fillStyle = "#000000"
    context.strokeStyle = "#000000"
    context.lineWidth = 1
    context.font = "10px sans-serif"
    context.textAlign = "start"
    context.textBaseline = "alphabetic"
    context.globalAlpha = 1.0
    context.globalCompositeOperation = "source-over"
    context.resetTransform()
    context.setLineDash([])
}

// Main render function executed for each frame(ish)
let prevLowFreq = 0  // Store previous value for comparison
let musicMode = true
let slide = 0
let warpSpeed = false
async function render() {
    // Audio processing
    const size = 7
    const start = 1
    const volumeFloor = 50
    const changeThreshold = 0.54 // Relative threshold
    const decay = 0.4

    const lowEndData = fftData.slice(start, start + size)
    const avgLowFreq = lowEndData.reduce((a, b) => a + b, 0) / size

    // Normalize
    const maxLowFreq = Math.max(...lowEndData, 1)
    const normalized = Math.sqrt(avgLowFreq / maxLowFreq)

    // Compute relative change in low frequency volume
    const deltaChange = Math.abs(avgLowFreq - prevLowFreq) / (prevLowFreq || 1)

    // Adaptive thresholding and momentum
    if (avgLowFreq > volumeFloor && deltaChange > changeThreshold && musicMode) {
        const intensity = Math.pow(normalized, 2) // Exponential scaling for better rhythm tracking
        starDelta = starSpeedVariance * intensity
        dashDelta = dashVariance * intensity
    } else {
        // Gradual decay instead of instant stop
        // TODO: Smooth it
        starDelta *= decay
        dashDelta *= decay
    }

    // Background
    renderStarsBackground({ warp: warpSpeed })
    resetContext()

    // Text background
    renderErrorTextBackground()
    resetContext()

    // Banner text
    renderBannerText({ outline: musicMode, dash: musicMode })
    resetContext()

    // Slides
    if (!musicMode) {
        renderSlide({ slide })
        resetContext()
    }

    requestAnimationFrame(render)
}

async function listenToLineIn(fftSize = 256) {
    const devices = await navigator.mediaDevices.enumerateDevices()

    // Resolve audio device
    const stereoMixDevice = devices.filter((device) => device.label.toLowerCase().startsWith("cable output"))[0]
    if (!stereoMixDevice) throw new Error("Unable to resolve audio device")

    // Resolve audio stream
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: {
            exact: stereoMixDevice.deviceId
          }
        }
    })

    // Create audio context
    const audioContext = new AudioContext()
    audioContext.latencyHint = "interactive"
    const source = audioContext.createMediaStreamSource(stream)
    
    // Create analyzer
    const analyser = audioContext.createAnalyser()

    // Connect analyzer and audio source
    source.connect(analyser)
    analyser.fftSize = fftSize
    analyser.smoothingTimeConstant = 0.001

    // Create buffer for storing audio frequency information
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    // Start collecting the frequency data
    let halt = false;
    const listen = async () => {
        if (halt) return
        analyser.getByteFrequencyData(dataArray)
        requestAnimationFrame(listen)
    }
    requestAnimationFrame(listen)

    return { halt, dataArray, fftSize: analyser.fftSize }
}

// Listen to mode changes
document.addEventListener("keydown", ({ key }) => {
    if (key === "ArrowDown") musicMode = false
    if (key === "ArrowUp") musicMode = true

    if (key === "ArrowRight") slide = Math.min(slide + 1, slideContents.length - 1)
    if (key === "ArrowLeft") slide = Math.max(0, slide - 1)
    if (key === "0") warpSpeed = !warpSpeed
})

// Magic
;(async () => {
    await init()
    render()
})()
