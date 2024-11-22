import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

// Update file paths to use `process.env.PUBLIC_URL` for compatibility
const countriesJsonPath = `${process.env.PUBLIC_URL}/countries-110m.json`;
const defenseDataPath = `${process.env.PUBLIC_URL}/data/processed/processed_defense_expenditure_by_country.csv`;

const DefenseExpenditureMap = () => {
  const svgRef = useRef();
  const lineChartRef = useRef();

  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [lineTooltip, setLineTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [countryData, setCountryData] = useState({});
  const [countries, setCountries] = useState([]);
  const [selectedYear, setSelectedYear] = useState(1960);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(undefined);

  const minYear = 1960;
  const maxYear = 2022;

  const targetCountries = ["United States", "China", "Russia"];
  const countryNameMapping = {
    "Bahamas, The": "Bahamas",
    "Congo, Dem. Rep.": "Democratic Republic of the Congo",
    "Congo, Rep.": "Republic of the Congo",
    "Côte d'Ivoire": "Ivory Coast",
    "Egypt, Arab Rep.": "Egypt",
    "Gambia, The": "Gambia",
    "Hong Kong SAR, China": "Hong Kong",
    "Iran, Islamic Rep.": "Iran",
    "Korea, Dem. People's Rep.": "North Korea",
    "Korea, Rep.": "South Korea",
    "Kyrgyz Republic": "Kyrgyzstan",
    "Lao PDR": "Laos",
    "Micronesia, Fed. Sts.": "Federated States of Micronesia",
    "Russian Federation": "Russia",
    "Sint Maarten (Dutch part)": "Sint Maarten",
    "Slovak Republic": "Slovakia",
    "Syrian Arab Republic": "Syria",
    "Venezuela, RB": "Venezuela",
    "Yemen, Rep.": "Yemen",
    "United States": "United States of America",
    "Viet Nam": "Vietnam",
    "Vietnam": "Vietnam",
    "Turkiye": "Turkey",
    "West Bank and Gaza": "Palestine",
    "Brunei Darussalam": "Brunei",
    "Bolivia": "Bolivia",
    "Cape Verde": "Cabo Verde",
    "Czechia": "Czech Republic",
    "Faroe Islands": "Faroe Islands",
    "Faeroe Islands": "Faroe Islands",
    "Macao SAR, China": "Macau",
    "North Macedonia": "North Macedonia",
    "Palestinian Territories": "Palestine",
    "Timor-Leste": "Timor-Leste",
    "East Timor": "Timor-Leste",
    "Myanmar": "Myanmar",
    "Burma": "Myanmar",
    "Ivory Coast": "Côte d'Ivoire",
    "South Sudan": "South Sudan",
    "Sao Tome and Principe": "São Tomé and Principe",
    "Eswatini": "Eswatini",
    "Taiwan": "Taiwan",
    "Republic of the Congo": "Republic of the Congo",
    "Democratic Republic of the Congo": "Democratic Republic of the Congo",
    "Cabo Verde": "Cabo Verde",
    "North Korea": "North Korea",
    "South Korea": "South Korea",
    "Russia": "Russia",
    "Laos": "Laos",
    "Macedonia": "North Macedonia"
  };
    
  const parseValue = (value) => {
    if (value === "$-") return 0;
    return parseFloat(value.replace(/[$,]/g, '')) || 0;
  };

  useEffect(() => {
    setLoading(true);

    // Update file paths for compatibility
    Promise.all([
      d3.json(countriesJsonPath),
      d3.csv(defenseDataPath, (d) => {
        const parsedData = { Country: d.Country };
        for (let year = minYear; year <= maxYear; year++) {
          parsedData[year] = parseValue(d[year]);
        }
        return parsedData;
      }),
    ])
      .then(([worldData, defenseData]) => {
        const countriesData = topojson.feature(worldData, worldData.objects.countries).features;
        setCountries(countriesData);

        const processedData = {};
        defenseData.forEach((row) => {
          const countryName = countryNameMapping[row.Country] || row.Country;
          processedData[countryName] = row;
        });

        setCountryData(processedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setError("Failed to load data.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || error || !countries.length || !Object.keys(countryData).length) return;

    const width = 800;
    const height = 400;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

    const projection = d3
      .geoMercator()
      .center([0, 20])
      .scale(130)
      .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    const thresholds = [5, 25, 55, 85];
    const colors = ["#f0d8d8", "#e3a6a6", "#b26464", "#8e2a2a", "#730f0f"];
    const colorScale = d3.scaleThreshold().domain(thresholds).range(colors);

    svg.selectAll("g.map-group").remove();
    const g = svg.append("g").attr("class", "map-group");

    svg.call(
      d3.zoom().scaleExtent([1, 8]).on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
    );

    g.selectAll("path")
      .data(countries)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const country = d.properties.name;
        const value = countryData[country]?.[selectedYear];
        return value > 0 ? colorScale(value) : "#ccc";
      })
      .attr("stroke", "#333")
      .on("mouseenter", (event, d) => {
        const country = d.properties.name;
        const value = countryData[country]?.[selectedYear] || 0;
        setTooltip({
          visible: true,
          x: event.clientX + 10,
          y: event.clientY + 10,
          content: `${country}: $${value.toFixed(2)}B`,
        });
      })
      .on("mousemove", (event) => {
        setTooltip((prev) => ({ ...prev, x: event.clientX + 10, y: event.clientY + 10 }));
      })
      .on("mouseleave", () =>
        setTooltip({ visible: false, x: 0, y: 0, content: null })
      );

    svg.selectAll("g.legend").remove();
    const legendX = width - 65;
    const legendY = height - 110;

    const legendGroup = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX},${legendY})`);

    legendGroup.append("rect")
      .attr("x", -20)
      .attr("y", -40)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("width", 80)
      .attr("height", thresholds.length * 20 + 60)
      .style("fill", "black")
      .style("opacity", 0.9)
      .lower();

    legendGroup.append("text")
      .attr("x", -15)
      .attr("y", -20)
      .text("Billion USD")
      .style("font-size", "10px")
      .style("fill", "#e0e0e0");

    thresholds
      .slice()
      .reverse()
      .forEach((threshold, i) => {
        legendGroup.append("rect")
          .attr("x", -15)
          .attr("y", i * 20 - 10)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", colors[thresholds.length - 1 - i]);

        legendGroup.append("text")
          .attr("x", 15)
          .attr("y", i * 20)
          .text(
            i === 0
              ? `> ${threshold}`
              : `${threshold} - ${thresholds[thresholds.length - i - 1]}`
          )
          .style("font-size", "10px")
          .style("fill", "#e0e0e0");
      });

    legendGroup.append("rect")
      .attr("x", -15)
      .attr("y", thresholds.length * 20 - 10)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", colors[0]);

    legendGroup.append("text")
      .attr("x", 15)
      .attr("y", thresholds.length * 20)
      .text(`< ${thresholds[0]}`)
      .style("font-size", "9px")
      .style("fill", "white");
  }, [countries, countryData, selectedYear, loading, error]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* ... (the rest of your render code remains unchanged) */}
    </div>
  );
};

export default DefenseExpenditureMap;
