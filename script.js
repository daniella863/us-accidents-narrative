// Set up global state object
const state = {
  data: [],
  currentScene: 1
};

// Load data and initialize
d3.csv("data/us_accidents_2018_2022_CA_TX_FL.csv", d3.autoType).then(data => {
  state.data = data;

  // Initial scene
  drawScene1();
});

// Scene 1: Accidents by Hour of Day
function drawScene1() {
  state.currentScene = 1;

  // Clear previous content
  d3.select("#vis-container").html("");

  // Create SVG
  const margin = { top: 40, right: 20, bottom: 40, left: 40 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#vis-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Extract hour from Start_Time
  const hourCounts = d3.rollup(
    state.data,
    v => v.length,
    d => new Date(d.Start_Time).getHours()
  );

  const hours = Array.from(hourCounts.keys()).sort((a, b) => a - b);
  const counts = hours.map(h => hourCounts.get(h));

  const x = d3.scaleBand()
    .domain(hours)
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(counts)])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d => `${d}:00`));

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

  svg.selectAll(".bar")
    .data(hours)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d))
    .attr("y", d => y(hourCounts.get(d)))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(hourCounts.get(d)))
    .attr("fill", "#69b3a2");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Accidents by Hour of Day");
}

// Button triggers
d3.select("#scene1-btn").on("click", drawScene1);
d3.select("#scene2-btn").on("click", () => alert("Scene 2 coming soon!"));
d3.select("#scene3-btn").on("click", () => alert("Scene 3 coming soon!"));
d3.select("#explore-btn").on("click", () => alert("Exploration mode coming soon!"));
