function getBounds() {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (let n of nodes) {
    minX = min(minX, n.x);
    minY = min(minY, n.y);
    maxX = max(maxX, n.x);
    maxY = max(maxY, n.y);
  }

  return {
    minX, minY,
    width: maxX - minX,
    height: maxY - minY
  };
}



let nodes = [
  { label: "LILLY", x: 520, y: 120, color: "#3B6CFF" },
  { label: "IS A...", x: 300, y: 220 },
  { label: "PRODUCT DESIGNER", x: 520, y: 300 },
  { label: "ARTIST", x: 680, y: 260 },
  { label: "UI/UX ENGINEER", x: 680, y: 420 },
  { label: "CAKE BAKER", x: 320, y: 440 },
  { label: "STATIONARY ADDICT", x: 450, y: 520 },
  { label: "MITSKI HOARDER", x: 560, y: 600 }
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Geist Mono");
  textSize(14);

  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
}


function draw() {
  background(2255);

  detectHover();

  if (hoveredNode !== -1 && drawProgress < 1) {
    drawProgress += 0.003;
  }

  // 🔧 AUTO-FIT TRANSFORM
  let bounds = getBounds();
  let padding = 120;

  let scaleFactor = min(
    (width - padding) / bounds.width,
    (height - padding) / bounds.height
  );

  push();

  translate(
    width / 2 - (bounds.minX + bounds.width / 2) * scaleFactor,
    height / 2 - (bounds.minY + bounds.height / 2) * scaleFactor
  );

  scale(scaleFactor);

  drawConstellation();
  drawNodes();

  pop();
}

function detectHover() {
  hoveredNode = -1;

  let bounds = getBounds();
  let padding = 120;

  let scaleFactor = min(
    (width - padding) / bounds.width,
    (height - padding) / bounds.height
  );

  let mx = (mouseX - (width / 2 - (bounds.minX + bounds.width / 2) * scaleFactor)) / scaleFactor;
  let my = (mouseY - (height / 2 - (bounds.minY + bounds.height / 2) * scaleFactor)) / scaleFactor;

  for (let i = 0; i < nodes.length; i++) {
    let d = dist(mx, my, nodes[i].x, nodes[i].y);
    if (d < 12) {
      hoveredNode = i;
      return;
    }
  }
}


// how many FULL connections are completed?
function completedLineCount() {
  return floor(drawProgress * connections.length);
}

// which nodes have been "hit" so far?
function nodeIsHit(nodeIndex) {
  // start node is "hit" as soon as animation begins
  if (drawProgress > 0 && nodeIndex === connections[0][0]) return true;

  let count = completedLineCount();
  for (let i = 0; i < count; i++) {
    let [, b] = connections[i]; // destination node of completed line
    if (b === nodeIndex) return true;
  }
  return false;
}

function drawConstellation() {
  let totalLines = connections.length;
  let fullLines = completedLineCount();

  // glow only when fully complete (optional)
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
      // ✅ completed line turns blue
      stroke("#3B6CFF");
      line(n1.x, n1.y, n2.x, n2.y);
    } else if (i === fullLines && drawProgress < 1) {
      // current line is animating (keep gray until completed)
      stroke(40);

      let t = (drawProgress * totalLines) % 1;
      let x = lerp(n1.x, n2.x, t);
      let y = lerp(n1.y, n2.y, t);
      line(n1.x, n1.y, x, y);
    } else {
      // future lines (not drawn)
      // (do nothing)
    }
  }

  drawingContext.shadowBlur = 0;
}

function drawNodes() {
  for (let i = 0; i < nodes.length; i++) {
    let n = nodes[i];

    // ⭐ sparkly star: blue if hit, gray otherwise
    drawStar(n.x, n.y, 7, nodeIsHit(i));

    // labels: keep your name blue, others gray
    noStroke();
    if (i === 0) fill(n.color || 40);
    else fill(40);

    text(n.label, n.x + 14, n.y + 5);
  }
}

// ⭐ sparkly 4-point “twinkle” star (like the reference)
function drawStar(x, y, r, isHit) {
  push();
  translate(x, y);

  noStroke();
  if (isHit) fill("#3B6CFF");
  else fill(40);

  // tweak to taste
  let outerR = r;          // point length
  let innerR = r * 0.35;   // indent depth (smaller = sharper)

  // optional: rotate to feel more "sparkle glyph"
  rotate(PI / 4);

  // 8 vertices alternating radii => 4 major points
  beginShape();
  for (let k = 0; k < 8; k++) {
    let ang = k * (TWO_PI / 8);
    let rad = (k % 2 === 0) ? outerR : innerR;
    vertex(cos(ang) * rad, sin(ang) * rad);
  }
  endShape(CLOSE);

  // tiny center dot for that crisp printed feel
  circle(0, 0, max(1.5, r * 0.22));

  pop();
}




