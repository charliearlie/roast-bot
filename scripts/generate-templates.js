const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, "../public/meme-templates");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Function to create a gradient background
function createGradientBackground(ctx, width, height, colors) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  return gradient;
}

// Create roast template
function createRoastTemplate() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  // Create dark, edgy gradient background
  ctx.fillStyle = createGradientBackground(ctx, 800, 600, [
    "#FF4D4D", // Bright red
    "#1A1A1A", // Almost black
  ]);
  ctx.fillRect(0, 0, 800, 600);

  // Add some geometric shapes for visual interest
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 150);
    ctx.lineTo(800, 600 - i * 100);
    ctx.stroke();
  }

  // Save the template
  const buffer = canvas.toBuffer("image/jpeg");
  fs.writeFileSync(path.join(templatesDir, "roast-template.jpg"), buffer);
}

// Create compliment template
function createComplimentTemplate() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  // Create warm, positive gradient background
  ctx.fillStyle = createGradientBackground(ctx, 800, 600, [
    "#FFD700", // Gold
    "#FF8C00", // Dark Orange
  ]);
  ctx.fillRect(0, 0, 800, 600);

  // Add some positive symbols
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    const size = 20 + Math.random() * 30;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Save the template
  const buffer = canvas.toBuffer("image/jpeg");
  fs.writeFileSync(path.join(templatesDir, "compliment-template.jpg"), buffer);
}

// Generate both templates
createRoastTemplate();
createComplimentTemplate();

console.log("Templates generated successfully!");
