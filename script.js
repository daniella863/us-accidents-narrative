let currentScene = 0;
const scenes = [sceneMap, sceneHourly, sceneTemperature, enableExplore];

const sceneIndicator = d3.select("#scene-indicator");
const container = d3.select("#scene-container");
let accidentData;
let usGeo;
document.getElementById("loading-spinner").style.display = "flex";

const stateNameMap = {
  AZ: "Arizona",
  NM: "New Mexico",
  TX: "Texas",
  OK: "Oklahoma",
  CO: "Colorado",
  UT: "Utah",
  NV: "Nevada",
  CA: "California"
};

// Load the filtered data
Promise.all([
  //since lfs wasn't letting me access, I am using the direct raw link from github storage
  d3.csv("https://media.githubusercontent.com/media/daniella863/us-accidents-narrative/refs/heads/main/accidents_filtered.csv?raw=true"),
  d3.json("us-states.json")
]).then(([data, us]) => {
  accidentData = data;
  usGeo = us;

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
}).finally(() => {
  // Hide spinner after everything is done
  document.getElementById("loading-spinner").style.display = "none";
});

function updateScene() {
  document.getElementById("loading-spinner").style.display = "flex";
  setTimeout(() => {

  container.html("");
  sceneIndicator.text(`Scene ${currentScene + 1} of ${scenes.length}`);
  scenes[currentScene]();
  // Hide after rendering
  document.getElementById("loading-spinner").style.display = "none";
  }, 10); 
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
        dx: 70,
        dy: -5   // was -50 before — makes label appear below the bar
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

//   const filtered = accidentData.filter(d => d.State === state);
//   const hourly = Array(24).fill(0);
//   filtered.forEach(d => {
//     const hour = +d.Start_Time.split(" ")[1].split(":")[0];
//     if (!isNaN(hour)) hourly[hour]++;
//   });

  const filtered = accidentData.filter(d => d.State === state && d.City);
  const cityCounts = d3.rollup(filtered, v => v.length, d => d.City);
  const topCities = Array.from(cityCounts, ([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const margin = { top: 60, right: 40, bottom: 100, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const x = d3.scaleBand().domain(topCities.map(d => d.city)).range([0, chartWidth]).padding(0.1);
  const y = d3.scaleLinear().domain([0, d3.max(topCities, d => d.count)]).nice().range([chartHeight, 0]);


//   const x = d3.scaleBand().domain(d3.range(24)).range([100, width - 100]).padding(0.1);
//   const y = d3.scaleLinear().domain([0, d3.max(hourly)]).range([height - 100, 100]);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  g.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("x", -margin.left)
    .attr("y", -20)
    .attr("fill", "black")
    .attr("text-anchor", "start")
    .text("Accident Count");

  g.selectAll("rect")
    .data(topCities)
    .join("rect")
    .attr("x", d => x(d.city))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => chartHeight - y(d.count))
    .attr("fill", "#f97316");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text(`Top 10 Cities by Accidents in ${stateNameMap[state]}`);

  const topCity = topCities[0];
  const annotations = [
    {
      note: {
        title: "Top City",
        label: `${topCity.city} has the most accidents in ${state}`,
        align: "middle"
      },
      x: margin.left + x(topCity.city) + x.bandwidth() / 2,
      y: margin.top + y(topCity.count),
      dx: 80,
      dy: -5
    }
  ];

  const makeAnnotations = d3.annotation().type(d3.annotationLabel).annotations(annotations);
  svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
}

function getStateName(fips) {
  const stateNames = {
    "04": "Arizona", "06": "California", "35": "New Mexico",
    "40": "Oklahoma", "48": "Texas", "49": "Utah", "32": "Nevada"
  };
  const padded = fips.toString().padStart(2, "0");
  return stateNames[padded] || "Other";
}