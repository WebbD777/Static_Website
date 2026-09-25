// Hide all elements that need to be hidden initially
const hiddenForm = document.getElementById("form");
const xName = document.getElementById("xName");
const xLabel = document.getElementById("xLabel");
const xRange = document.getElementById("xRange");
const yName = document.getElementById("yName");
const yLabel = document.getElementById("yLabel");
const yRange = document.getElementById("yRange");
const pyName = document.getElementById("pyName");
const pyLabel = document.getElementById("pyLabel");
const pyRange = document.getElementById("pyRange");
const hName = document.getElementById("hName");
const hLabel = document.getElementById("hLabel");
const hRange = document.getElementById("hRange");

const elementsToHide = [
  hiddenForm,
  xName,
  xLabel,
  xRange,
  yName,
  yLabel,
  yRange,
  pyName,
  pyLabel,
  pyRange,
  hName,
  hLabel,
  hRange,
];

elementsToHide.forEach((el) => {
  if (el) el.style.display = "none";
});

function getSelectedRadioValue() {
  const selectedRadio = document.querySelector(
    'input[name="exampleRadios"]:checked',
  );
  return selectedRadio ? selectedRadio.value : null;
}

// Equations and Physics Functions
function f(t, yState) {
  let x = yState[0];
  let y = yState[1];
  let px = yState[2];
  let py = yState[3];
  let dx = px;
  let dy = py;
  let dpx = -x - 2 * x * y;
  let dpy = -y - x ** 2 + y ** 2;
  return [dx, dy, dpx, dpy];
}

function H(x, y, px, py) {
  let hVal =
    0.5 * (px ** 2 + py ** 2) +
    0.5 * (x ** 2 + y ** 2) +
    x ** 2 * y -
    y ** 3 / 3;
  return hVal;
}

function px0(yo, po, H0) {
  let calculatedPx0 = Math.sqrt(2 * H0 - yo ** 2 + (2 / 3) * yo ** 3 - po ** 2);
  return calculatedPx0;
}

// Define initial state and time span
let y0 = [];
const t_span = [0, 10000];

function fx(t, yVal) {
  let dx = yVal;
  return dx;
}

function fy(t, yVal) {
  let dy = yVal;
  return dy;
}

function fpx(t, yVal) {
  let dpx = -t - 2 * (t * yVal);
  return dpx;
}

function fpy(t, yVal) {
  let dpy = -yVal - t ** 2 + 0.3 ** 2;
  return dpy;
}

function rk4(func, xVal, yVal) {
  let hStep = 0.09;
  let k1 = hStep * func(xVal, yVal);
  let k2 = hStep * func(xVal + 0.5 * hStep, yVal + 0.5 * k1);
  let k3 = hStep * func(xVal + 0.5 * hStep, yVal + 0.5 * k2);
  let k4 = hStep * func(xVal + hStep, yVal + k3);
  let result = (k1 + 2 * k2 + 2 * k3 + k4) / 6;
  return result;
}

let data = [];
let momentumData = [];
let animationInterval = null; // Track the active animation timer

function plotChart() {
  // Clear any ongoing animation if a new one is triggered
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  data = [];
  momentumData = [];

  let fullComputedData = [];
  let fullComputedMomentum = [];

  let xnext = y0[0];
  let ynext = y0[1];
  let pxnext = y0[2];
  let pynext = y0[3];

  for (let i = 0; i <= 1000; i++) {
    xnext = xnext + rk4(fx, xnext, pxnext);
    ynext = ynext + rk4(fy, xnext, pynext);
    pxnext = pxnext + rk4(fpx, xnext, ynext);
    pynext = pynext + rk4(fpy, xnext, ynext);

    fullComputedData.push({ x: xnext, y: ynext });
    fullComputedMomentum.push({ x: pxnext, y: pynext });
  }

  // Draw initial empty graph
  drawGraph();

  // Animate the points rendering one by one
  let currentIndex = 0;
  animationInterval = setInterval(() => {
    // Add chunks of points per frame (e.g., 5 points at a time for smooth speed)
    let chunkSize = 5;
    for (
      let j = 0;
      j < chunkSize && currentIndex < fullComputedData.length;
      j++
    ) {
      data.push(fullComputedData[currentIndex]);
      momentumData.push(fullComputedMomentum[currentIndex]);
      currentIndex++;
    }

    if (starScatterPlot) {
      starScatterPlot.update("none"); // Update without full layout re-animation stutter
    }

    // Stop timer when all points are rendered
    if (currentIndex >= fullComputedData.length) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  }, 15); // Speed of animation in milliseconds per batch
}

let starScatterPlot = null;
const ctx = document.getElementById("starChart").getContext("2d");

function drawGraph() {
  starScatterPlot = new Chart(ctx, {
    data: {
      datasets: [
        {
          type: "scatter",
          label: "Star position",
          data: data,
          borderColor: "red",
          fill: true,
        },
      ],
    },
    options: {
      animation: false, // Disables heavy default chart animations to keep the custom stream smooth
    },
  });
}

const option1 = document.getElementById("exampleRadios1");
const option2 = document.getElementById("exampleRadios2");
const submitButton = document.getElementById("submitBtn");

// Add event listeners
option1.addEventListener("change", handleRadioChange);
option2.addEventListener("change", handleRadioChange);
submitButton.addEventListener("click", submitButtonClicked);

// Slider event listeners
xRange.addEventListener("input", function () {
  xLabel.textContent = xRange.value;
});
yRange.addEventListener("input", function () {
  yLabel.textContent = yRange.value;
});
pyRange.addEventListener("input", function () {
  pyLabel.textContent = pyRange.value;
});
hRange.addEventListener("input", function () {
  hLabel.textContent = hRange.value;
});

function submitButtonClicked() {
  let existingChart = Chart.getChart("starChart");
  if (existingChart) {
    existingChart.destroy();
    starScatterPlot = null;
  }

  if (option1.checked) {
    y0 = [0, 0.30266681750031454, 0.49057789051960615, -2.7003030887706725e-13];
    plotChart();
  } else if (option2.checked) {
    const xVal = parseFloat(xRange.value);
    const yVal = parseFloat(yRange.value);
    const pxVal = parseFloat(px0(yRange.value, pyRange.value, hRange.value));
    const pyVal = parseFloat(pyRange.value);
    y0 = [xVal, yVal, pxVal, pyVal];
    plotChart();
  }
}

function handleRadioChange() {
  let displayStyle = option2.checked ? "block" : "none";

  elementsToHide.forEach((el) => {
    if (el) el.style.display = displayStyle;
  });

  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  let existingChart = Chart.getChart("starChart");
  if (existingChart) {
    existingChart.destroy();
    starScatterPlot = null;
  }
}
