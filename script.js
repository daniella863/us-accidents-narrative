let currentScene = 0;
const scenes = [sceneMap, sceneHourly, sceneTemperature, enableExplore];

const sceneIndicator = d3.select("#scene-indicator");
const container = d3.select("#scene-container");
let accidentData;
let usGeo;

// Load the filtered data
Promise.all([
  d3.csv("data/accidents_filtered.csv"),
  d3.json("data/us-states.json")
]).then(([data, us]) => {
  console.log("WINDOW DATA ", window)
  accidentData = data;
  usGeo = us;

  console.log("accidentData ", accidentData)
  updateScene();

  d3.select("#next-btn").on("click", () => {
    if (currentScene < scenes.length - 1) currentScene++;
    updateScene();
  });

  d3.select("#prev-btn").on("click", () => {
    if (currentScene > 0) currentScene--;
    updateScene();
  });
}).catch(error => {
  console.error("Error loading data:", error);
});

function updateScene() {
  container.html("");
  sceneIndicator.text(`Scene ${currentScene + 1} of ${scenes.length}`);
  scenes[currentScene]();
}

function sceneMap() {
  const svg = container.append("svg").attr("width", 800).attr("height", 500);
  const projection = d3.geoAlbersUsa().scale(1000).translate([400, 250]);
  const path = d3.geoPath().projection(projection);

  const states = topojson.feature(usGeo, usGeo.objects.states).features;
  svg.selectAll("path")
    .data(states)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const stateName = getStateName(d.id);
      return ["Texas", "New Mexico", "Arizona", "Nevada", "California", "Utah", "Oklahoma"].includes(stateName) ? "#ffc107" : "#eee";
    })
    .attr("stroke", "#333");

  svg.selectAll("circle")
    .data(accidentData)
    .join("circle")
    .attr("cx", d => projection([+d.Start_Lng, +d.Start_Lat])[0])
    .attr("cy", d => projection([+d.Start_Lng, +d.Start_Lat])[1])
    .attr("r", 1.5)
    .attr("fill", "rgba(255, 0, 0, 0.3)");
}

function sceneHourly() {
  const svg = container.append("svg").attr("width", 800).attr("height", 400);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourCounts = Array(24).fill(0);
  accidentData.forEach(d => {
    const hour = new Date(d.Start_Time).getHours();
    hourCounts[hour]++;
  });

  const x = d3.scaleBand().domain(hours).range([50, 750]).padding(0.1);
  const y = d3.scaleLinear().domain([0, d3.max(hourCounts)]).nice().range([350, 50]);

  svg.append("g").attr("transform", "translate(0,350)").call(d3.axisBottom(x));
  svg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(hours)
    .join("rect")
    .attr("x", d => x(d))
    .attr("y", d => y(hourCounts[d]))
    .attr("width", x.bandwidth())
    .attr("height", d => 350 - y(hourCounts[d]))
    .attr("fill", "steelblue");

  svg.append("text")
    .attr("x", 400)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Accidents by Hour of Day");

    // Add annotations to highlight peak hour
    const peakHour = hourCounts.indexOf(d3.max(hourCounts));

    const annotations = [
    {
        note: {
        title: "Rush Hour Spike",
        label: `Highest number of accidents at ${peakHour}:00`,
        align: "middle",
        padding: 10
        },
        x: x(peakHour) + x.bandwidth() / 2,
        y: y(hourCounts[peakHour]),
        dx: -30,
        dy: 40   // was -50 before — makes label appear below the bar
    }
    ];

    const makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(annotations);

    svg.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);
}

function sceneTemperature() {
  const svg = container.append("svg").attr("width", 800).attr("height", 400);
  const bins = d3.bin().thresholds(20).value(d => +d["Temperature(F)"])(accidentData);
  const x = d3.scaleLinear().domain(d3.extent(accidentData, d => +d["Temperature(F)"])).nice().range([50, 750]);
  const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).nice().range([350, 50]);

  svg.append("g").attr("transform", "translate(0,350)").call(d3.axisBottom(x));
  svg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", d => x(d.x0))
    .attr("y", d => y(d.length))
    .attr("width", d => x(d.x1) - x(d.x0) - 1)
    .attr("height", d => 350 - y(d.length))
    .attr("fill", "#28a745");

  svg.append("text")
    .attr("x", 400)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Accident Frequency by Temperature");
}

function enableExplore() {
  document.getElementById("explore-controls").style.display = "block";
  const stateSelect = d3.select("#stateSelect");
  const states = Array.from(new Set(accidentData.map(d => d.State))).sort();

  stateSelect.selectAll("option")
    .data(states)
    .join("option")
    .text(d => d);

  stateSelect.on("change", function () {
    const selected = this.value;
    drawStateExploration(selected);
  });

  drawStateExploration(states[0]);
}

function drawStateExploration(state) {
  let width = 800
  let height = 500
  d3.select("#scene-container").html("");
  const svg = d3.select("#scene-container").append("svg")
    .attr("width", width)
    .attr("height", height);

  const filtered = accidentData.filter(d => d.State === state);
  const hourly = Array(24).fill(0);
  filtered.forEach(d => {
    const hour = +d.Start_Time.split(" ")[1].split(":")[0];
    if (!isNaN(hour)) hourly[hour]++;
  });

  const x = d3.scaleBand().domain(d3.range(24)).range([100, width - 100]).padding(0.1);
  const y = d3.scaleLinear().domain([0, d3.max(hourly)]).range([height - 100, 100]);

  svg.selectAll("rect")
    .data(hourly)
    .join("rect")
    .attr("x", (d, i) => x(i))
    .attr("y", d => y(d))
    .attr("width", x.bandwidth())
    .attr("height", d => height - 100 - y(d))
    .attr("fill", "#f97316");

  svg.append("text")
    .attr("x", 50)
    .attr("y", 40)
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text(`Hourly Accidents in ${state}`);
}

function getStateName(fips) {
  const stateNames = {
    "04": "Arizona", "06": "California", "35": "New Mexico",
    "40": "Oklahoma", "48": "Texas", "49": "Utah", "32": "Nevada"
  };
  const padded = fips.toString().padStart(2, "0");
  return stateNames[padded] || "Other";
}