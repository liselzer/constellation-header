// ---------- helpers ----------
function getCentroid() {
  let sumX = 0;
  let sumY = 0;

  for (let n of nodes) {
    sumX += n.x;
    sumY += n.y;
  }

  return {
    x: sumX / nodes.length,
    y: sumY / nodes.length
  };
}

// ✅ bounds that INCLUDE label extents (so it looks visually centered)
function getBounds() {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  // keep in sync with your text settings
  textFont("Geist Mono");
  textSize(14);

  for (let n of nodes) {
    // star extents
    let starR = 10;

    // label extents (your text is drawn at x + 14, y + 5)
    let labelOffsetX = 14;
    let labelWidth = textWidth(n.label);
    let labelHeight = 16; // approx height for centering

    // include star
    minX = min(minX, n.x - starR);
    maxX = max(maxX, n.x + starR);
    minY = min(minY, n.y - starR);
    maxY = max(maxY, n.y + starR);

    // include label box
    minX = min(minX, n.x + labelOffsetX);
    maxX = max(maxX, n.x + labelOffsetX + labelWidth);
    minY = min(minY, n.y - labelHeight);
    maxY = max(maxY, n.y + labelHeight);
  }

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// ✅ single shared transform (draw + hover match perfectly)
function getTransform() {
  let bounds = getBounds();

  // tweak these to taste
  let padding = 120;

  let scaleFactor = min(
    (width - padding) / bounds.width,
    (height - padding) / bounds.height
  );

  // center based on VISUAL bounds center (includes labels)
  let cx = bounds.minX + bounds.width / 2;
  let cy = bounds.minY + bounds.height / 2;

  let tx = width / 2 - cx * scaleFactor;
  let ty = height / 2 - cy * scaleFactor;

  return { scaleFactor, tx, ty };
}

// ---------- data ----------
let nodes = [
  { label: "LILLY", x: 520, y: 120, color: "#3B6CFF" },
  { label: "IS A...", x: 300, y: 220 },
  { label: "PRODUCT DESIGNER", x: 520, y: 300 },
  { label: "ARTIST", x: 680, y: 260 },
  { label: "UI/UX ENGINEER", x: 680, y: 420 },
  { label: "CAKE BAKER", x: 320, y: 440 },
  { label: "STATIONARY ADDICT", x: 450, y: 520 },
  { label: "SMISKI HOARDER", x: 560, y: 600 }
];

// constellation edges (order matters for animation)
let connections = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7]
];

let hoveredNode = -1;
let drawProgress = 0;

// ---------- canvas ----------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Geist Mono");
  textSize(14);

  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.style.background = "#ffffff";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ---------- main loop ----------
function draw() {
  background(255); // ✅ white background

  detectHover();

  if (hoveredNode !== -1 && drawProgress < 1) {
    drawProgress += 0.003;
  }

  // ✅ apply ONE shared transform
  let t = getTransform();

  push();
  translate(t.tx, t.ty);
  scale(t.scaleFactor);

  drawConstellation();
  drawNodes();

  pop();
}

// ---------- interaction ----------
function detectHover() {
  hoveredNode = -1;

  let t = getTransform();

  // convert mouse -> "world" coords
  let mx = (mouseX - t.tx) / t.scaleFactor;
  let my = (mouseY - t.ty) / t.scaleFactor;

  for (let i = 0; i < nodes.length; i++) {
    let d = dist(mx, my, nodes[i].x, nodes[i].y);
    if (d < 12) {
      hoveredNode = i;
      return;
    }
  }
}

// ---------- animation state ----------
function completedLineCount() {
  return floor(drawProgress * connections.length);
}

function nodeIsHit(nodeIndex) {
  if (drawProgress > 0 && nodeIndex === connections[0][0]) return true;

  let count = completedLineCount();
  for (let i = 0; i < count; i++) {
    let [, b] = connections[i];
    if (b === nodeIndex) return true;
  }
  return false;
}

// ---------- drawing ----------
function drawConstellation() {
  let totalLines = connections.length;
  let fullLines = completedLineCount();

  if (drawProgress >= 1) {
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = "#3B6CFF";
  } else {
    drawingContext.shadowBlur = 0;
  }

  for (let i = 0; i < totalLines; i++) {
    let [a, b] = connections[i];
    let n1 = nodes[a];
    let n2 = nodes[b];

    strokeWeight(1);

    if (i < fullLines) {
      stroke("#3B6CFF");
      line(n1.x, n1.y, n2.x, n2.y);
    } else if (i === fullLines && drawProgress < 1) {
      stroke(40);

      let t = (drawProgress * totalLines) % 1;
      let x = lerp(n1.x, n2.x, t);
      let y = lerp(n1.y, n2.y, t);
      line(n1.x, n1.y, x, y);
    }
  }

  drawingContext.shadowBlur = 0;
}

function drawNodes() {
  for (let i = 0; i < nodes.length; i++) {
    let n = nodes[i];

    drawStar(n.x, n.y, 7, nodeIsHit(i));

    noStroke();
    if (i === 0) fill(n.color || 40);
    else fill(40);

    text(n.label, n.x + 14, n.y + 5);
  }
}

// ⭐ sparkly 4-point “twinkle” star
function drawStar(x, y, r, isHit) {
  push();
  translate(x, y);

  noStroke();
  if (isHit) fill("#3B6CFF");
  else fill(40);

  let outerR = r;
  let innerR = r * 0.35;

  rotate(PI / 4);

  beginShape();
  for (let k = 0; k < 8; k++) {
    let ang = k * (TWO_PI / 8);
    let rad = (k % 2 === 0) ? outerR : innerR;
    vertex(cos(ang) * rad, sin(ang) * rad);
  }
  endShape(CLOSE);

  circle(0, 0, max(1.5, r * 0.22));

  pop();
}





