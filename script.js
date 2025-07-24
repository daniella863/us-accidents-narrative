// script.js
const width = 900;
const height = 600;
let currentScene = 0;
let data;

const svg = d3.select("#vis")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Load CSV and initialize
d3.csv("data/accidents_filtered.csv").then(raw => {
  data = raw.map(d => ({
    ...d,
    year: new Date(d.Start_Time).getFullYear(),
    lat: +d.Start_Lat,
    lng: +d.Start_Lng,
    temp: +d["Temperature(F)"],
    state: d.State,
    city: d.City
  }));
  showScene(currentScene);
});

// Scene handler
function showScene(n) {
  svg.selectAll("*").remove(); // clear canvas

  if (n === 0) return drawStateTotals();
  if (n === 1) return drawTrend();
  if (n === 2) return drawMap();
}

function drawStateTotals() {
  svg.append("text")
    .attr("x", 100)
    .attr("y", 100)
    .text(`Loaded ${data.length} accidents`)
    .attr("font-size", "24px")
    .attr("fill", "black");
}

// Scene 1 – Totals per state
// function drawStateTotals() {
//   const counts = d3.rollup(data, v => v.length, d => d.state);
//   const states = Array.from(counts, ([state, count]) => ({ state, count }));

//   const x = d3.scaleBand()
//     .domain(states.map(d => d.state))
//     .range([50, width - 50])
//     .padding(0.1);

//   const y = d3.scaleLinear()
//     .domain([0, d3.max(states, d => d.count)])
//     .range([height - 50, 50]);

//   svg.selectAll("rect")
//     .data(states)
//     .enter()
//     .append("rect")
//     .attr("x", d => x(d.state))
//     .attr("y", d => y(d.count))
//     .attr("width", x.bandwidth())
//     .attr("height", d => height - 50 - y(d.count))
//     .attr("fill", "#007bff");

//   svg.append("g")
//     .attr("transform", `translate(0,${height - 50})`)
//     .call(d3.axisBottom(x).tickFormat(d => d));

//   svg.append("g")
//     .attr("transform", "translate(50,0)")
//     .call(d3.axisLeft(y));
// }

// Scene 2 – Yearly trend
function drawTrend() {
  const years = d3.rollup(data, v => v.length, d => d.year);
  const trend = Array.from(years, ([year, count]) => ({ year: +year, count }));

  const x = d3.scaleLinear()
    .domain(d3.extent(trend, d => d.year))
    .range([50, width - 50]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(trend, d => d.count)])
    .range([height - 50, 50]);

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.count));

  svg.append("path")
    .datum(trend)
    .attr("fill", "none")
    .attr("stroke", "#28a745")
    .attr("stroke-width", 3)
    .attr("d", line);

  svg.append("g")
    .attr("transform", `translate(0,${height - 50})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
    .attr("transform", "translate(50,0)")
    .call(d3.axisLeft(y));
}

// Scene 3 – Lat/Lng scatterplot
function drawMap() {
  const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(1000);
  const path = d3.geoPath().projection(projection);

  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(us => {
    svg.append("g")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#f2f2f2")
      .attr("stroke", "#999");

    svg.selectAll("circle")
      .data(data.slice(0, 5000))
      .enter()
      .append("circle")
      .attr("cx", d => projection([d.lng, d.lat])[0])
      .attr("cy", d => projection([d.lng, d.lat])[1])
      .attr("r", 1.5)
      .attr("fill", "red")
      .attr("opacity", 0.3);
  });
}

// Scene navigation buttons
d3.select("#next").on("click", () => {
  currentScene = (currentScene + 1) % 3;
  showScene(currentScene);
});

d3.select("#prev").on("click", () => {
  currentScene = (currentScene + 2) % 3;
  showScene(currentScene);
});