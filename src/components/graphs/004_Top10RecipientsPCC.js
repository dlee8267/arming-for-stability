import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ParallelCoordinatesChart = ({ selectedYear, setSelectedYear }) => {
  const svgRef = useRef();
  const margin = { top: 80, right: 80, bottom: 40, left: 80 };
  const width = 1000 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;
  const dataUrl = `${process.env.PUBLIC_URL}/data/processed/processed_recipients_of_combined_us_china_russia_arms_hierarchical.json`;

  const [data, setData] = useState(null);

  const fixedRecipients = [
    'Japan', 'South Korea', 'Taiwan', 'Israel', 'Germany', 
    'China', 'India', 'Turkiye', 'Saudi Arabia', 'Iran'
  ];
  
  const colorScale = d3.scaleOrdinal()
    .domain(['United States', 'Russia', 'China'])
    .range(['#4682B4', '#DC143C', '#FFDB58']); // Blue, red, yellow

  useEffect(() => {
    d3.json(dataUrl).then(rawData => {
      const flattenedData = [];
      rawData.data.forEach((supplierData) => {
        const supplier = supplierData.supplier;
        supplierData.recipients.forEach((recipientData) => {
          const recipient = recipientData.recipient;
          Object.entries(recipientData.years).forEach(([year, value]) => {
            flattenedData.push({ 
              supplier: supplier === "United States of America" ? "USA" : supplier,
              recipient,
              year: +year,
              value 
            });
          });
        });
      });
      setData(flattenedData);
    });
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const filteredYearData = data.filter((d) => d.year === selectedYear);

    const destinationTotals = d3.rollups(
      filteredYearData,
      (v) => d3.sum(v, (d) => d.value),
      (d) => d.recipient
    );

    const topDestinations = destinationTotals
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((d) => d[0]);

    const filteredData = filteredYearData.filter((d) => topDestinations.includes(d.recipient));
    
    const validData = filteredData.map((d) => ({
      supplier: d.supplier || "Unknown",
      recipient: d.recipient || "Unknown",
      value: d.value !== undefined && !isNaN(d.value) ? d.value : 0,
    }));

    const dimensions = ["supplier", "recipient", "value"];

    const yScales = {};
    dimensions.forEach((dim) => {
      if (dim === "value") {
        yScales[dim] = d3.scaleSymlog()
          .constant(1000)
          .domain([1, 5000])
          .range([height, 0]);
      } else {
        yScales[dim] = d3.scalePoint()
          .domain([...new Set(filteredData.map((d) => d[dim]))])
          .range([height, 0]);
      }
    });

    const xScale = d3.scalePoint()
      .domain(dimensions)
      .range([0, width]);

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
    svg.selectAll("*").remove();

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("line-height", "1.6")
      .style("display", "none");

    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const path = (d) => d3.line()(dimensions.map((dim) => [xScale(dim), yScales[dim](d[dim])]));

    chartGroup.selectAll("path")
      .data(validData)
      .join("path")
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", (d) => colorScale(d.supplier))
      .style("opacity", 0.8)
      .style("stroke-width", 3)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .style("opacity", 1)
          .style("stroke-width", 3);
        tooltip.style("display", "block")
          .html(`
            <strong>Supplier:</strong> ${d.supplier}<br>
            <strong>Recipient:</strong> ${d.recipient}<br>
            <strong>Value:</strong> $${d.value.toLocaleString()}M
          `);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .style("opacity", 0.8)
          .style("stroke-width", 5);
        tooltip.style("display", "none");
      });

    const labelMapping = {
      supplier: "Supplier",
      recipient: "Recipient",
      value: "Million USD",
    };

    dimensions.forEach((dim) => {
      const axisGroup = chartGroup.append("g")
        .attr("transform", `translate(${xScale(dim)}, 0)`);

      axisGroup.call(
        d3.axisLeft(yScales[dim])
          .ticks(5)
          .tickSize(10)
          .tickSizeOuter(0)
      )
      .selectAll("line")
        .style("stroke", "#e0e0e0")
        .style("stroke-width", 2);

      axisGroup.select(".domain")
        .style("stroke", "#e0e0e0")
        .style("stroke-width", 3);

      axisGroup.selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#e0e0e0");

      axisGroup.append("text")
        .attr("y", -25)
        .attr("x", -5)
        .attr("text-anchor", "middle")
        .text(labelMapping[dim])
        .style("fill", "#e0e0e0")
        .style("font-size", "16px")
        .style("font-weight", "bold");
    });

  }, [data, selectedYear]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <h3 style={{
          textAlign: 'center',
          fontSize: '24px',
          color: '#e74c3c',
          paddingTop: '20px',
        }}>
          Top Arms Trades {selectedYear}
        </h3>
      <input
        type="range"
        min="1950"
        max="2023"
        value={selectedYear}
        onChange={(e) => setSelectedYear(+e.target.value)}
        style={{
          width: '80%',
          appearance: 'none',
          height: '8px',
          backgroundColor: 'gray',
          borderRadius: '5px',
          outline: 'none',
          margin: '20px auto 10px',
          display: 'block',
          accentColor: '#e74c3c',
        }}
      />

      <svg ref={svgRef} style={{ width: '100%', border: '3px solid #e74c3c', borderRadius: '8px'}} ></svg>

    </div>
  );
};

export default ParallelCoordinatesChart;
