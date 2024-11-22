import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


const iconPath = `${process.env.PUBLIC_URL}/ar15.svg`;
const iconValue = 2500;

const GunBarChart = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 1000;
    const height = 410;
    const margin = { top: 40, right: 20, bottom: 50, left: 40 };

    d3.select(svgRef.current).selectAll("*").remove();

    d3.csv(`${process.env.PUBLIC_URL}data/processed/us_export.csv`, d3.autoType).then(data => {
      // Ensure data is sorted by year
      data.sort((a, b) => a.year - b.year);

      // X and Y scales
      const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const yScale = d3.scaleLinear()
        .domain([0, 18000])
        .nice()
        .range([height - margin.bottom, margin.top]);

      // Create SVG container
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .style("background", "")
        .style("border-radius", "8px");

      // X Axis
      svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(
          d3.axisBottom(xScale)
            .tickValues(data.map(d => d.year).filter(year => year % 10 === 0)) // Filter years divisible by 10
            .tickFormat(d3.format("d")) // Format the year as a number
        )
        .style("font-size", "15px")
        .style("fill", "#e0e0e0");

      // Y Axis
      svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d / 1000}B`))
        .style("font-size", "15px")
        .style("fill", "#e0e0e0");

      // Bars with gun icons
      data.forEach((d, i) => {
        const barGroup = svg.append("g")
          .attr("transform", `translate(${xScale(d.year)}, ${height - margin.bottom})`);

        const iconsCount = Math.floor(d.export / iconValue); // Full icons
        const partialIconValue = (d.export % iconValue) / iconValue; // Fractional part for chopped gun
        const iconSpacing = 10; // Space between icons
        const iconSize = 34.5// Icon size (width and height)

        // Sequential animation delay for each year
        const yearDelay = i * 40;

        // Append full icons
        for (let j = 0; j < iconsCount; j++) {
          barGroup.append("image")
            .attr("xlink:href", iconPath)
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("x", xScale.bandwidth() / 2 - iconSize / 2) // Center icon within the bar
            .attr("y", 0) // Start icon from the top
            .style("filter", "invert(100%)")
            .style("opacity", 0)
            .transition()
            .delay(yearDelay + j * 20) // Sequentially drop each icon
            .duration(50)
            .ease(d3.easeBounce)
            .attr("y", -(j * (iconSize + iconSpacing)) - iconSize) // Adjust spacing
            .style("opacity", 1);
        }

        // Append chopped icon for partial value
        if (partialIconValue > 0.3) {
          const partialClipPathId = `clip-${i}`;
        
          // Define a clipping path for the chopped icon, crop from the bottom
          svg.append("clipPath")
            .attr("id", partialClipPathId)
            .append("rect")
            .attr("width", iconSize)
            .attr("height", iconSize * partialIconValue) // Clip height based on the fraction
            .attr("x", xScale.bandwidth() / 2 - iconSize / 2)
            .attr("y", -(iconsCount * (iconSize + iconSpacing)) - iconSize * partialIconValue); // Adjust y to crop from the bottom
          
          // Append the chopped icon with clipping
          barGroup.append("image")
            .attr("xlink:href", iconPath)
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("clip-path", `url(#${partialClipPathId})`)
            .attr("x", xScale.bandwidth() / 2 - iconSize / 2)
            .attr("y", -(iconsCount * (iconSize + iconSpacing)) - iconSize) // Adjust position to match clip path
            .style("filter", "invert(100%)")
            .style("opacity", 0)
            .transition()
            .delay(yearDelay + iconsCount * 20) // Add delay after the full icons
            .duration(50)
            .ease(d3.easeBounce)
            .style("opacity", 1);
            }

          svg.append("g")
            .attr("transform", `translate(${width - margin.right - 120}, ${margin.top})`) // Position of the legend
            .call(g => {
              g.append("image")
                .attr("xlink:href", iconPath)
                .attr("width", iconSize)
                .attr("height", iconSize * 1.5)
                .attr("x", 0)
                .attr("y", 0)
                .style("filter", "invert(100%)")
                .attr("transform", "rotate(90)"); // Rotate 90 degrees clockwise

              g.append("text")
                .attr("x", 16) // Position text next to the icon
                .attr("y", 16)
                .attr("dy", "0.35em")
                .style("font-size", "16px")
                .style("fill", "#e0e0e0")
                .text(" = $ 2.5B");
            });
        });

    
      /* / Y-axis Label
      svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 30)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#e0e0e0")
        .style("font-weight", "bold")
        .text(`Value (Billion USD)`)
        .text("Billion USD");
      */
    });
  }, []);

  return (
    <div style={{display: 'relative', alignItems: 'flex-start', padding: '40px'}}>
      <h3 style={{
          textAlign: 'center',
          fontSize: '24px',
          color: '#e74c3c',
          paddingBottom: '20px',
        }}>
          US Arms Exports By Year
        </h3>
      <svg ref={svgRef} style={{border: '3px solid #e74c3c', borderRadius: '8px'}}></svg>
    </div>
  );
};

export default GunBarChart;
