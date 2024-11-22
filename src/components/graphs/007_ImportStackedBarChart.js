import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const StackedBarChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    // Fetch the CSV data (you can replace this with your actual CSV URL)
    d3.csv(`${process.env.PUBLIC_URL}/data/processed/us_export.csv`).then((data) => {
      // Convert columns to numbers
      data.forEach(d => {
        d.year = +d.year;
        d.taiwan = +d.taiwan;
        d.other = +d.other;
      });

      setData(data);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const margin = { top: 20, right: 40, bottom: 40, left: 60 };
    const width = 800;
    const height = 400;

    // Add the SVG element and define its responsive behavior
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`) // Include the full width and height
      .style('width', '100%') // Responsive width
      .style('height', 'auto') // Preserve aspect ratio
      .append('g') // Group for chart contents
      .attr(
        'transform',
        `translate(${margin.left}, ${margin.top})` // Adjust for margins
      );

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

    // Set up the X scale (for years)
    const x = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([0, innerWidth])
      .padding(0.1);

    // Set up the Y scale (for export value)
    const y = d3.scaleLinear()
      .domain([0, 18000])
      .nice()
      .range([innerHeight, 0]);

    // Set up the color scale for Taiwan and Other
    const color = d3.scaleOrdinal()
      .domain(['taiwan', 'other'])
      .range(['#44982A', '#e0e0e0']); // You can customize these colors

    // Create the X and Y axis
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${x(d.year)},0)`)
      .each(function(d) {
        // Taiwan rectangle
        d3.select(this)
          .append('rect')
          .attr('x', 0)
          .attr('y', y(d.export - d.other))  // Start from the top of the stack
          .attr('width', x.bandwidth())
          .attr('height', y(d.export - d.taiwan) - y(d.export))  // Height of Taiwan
          .attr('fill', color('taiwan'))
          .attr('rx', 2)
          .attr('ry', 2)
          .on('mouseover', function (event) {
            const container = svgRef.current.getBoundingClientRect();
            const offsetX = event.clientX - container.left;
            const offsetY = event.clientY - container.top;
            setTooltip({
              visible: true,
              x: offsetX + 10,
              y: offsetY - 10,
              content: <div><strong>{d.year}</strong><br/>Taiwan<br/>${d.taiwan.toLocaleString()}B</div>
            });
          })
          .on('mousemove', (event) => {
            const container = svgRef.current.getBoundingClientRect();
            const offsetX = event.clientX - container.left;
            const offsetY = event.clientY - container.top;
            setTooltip(prev => ({
              ...prev,
              x: offsetX + 10,
              y: offsetY - 10,
            }));
          })
          .on('mouseleave', function () {

            setTooltip({ visible: false, x: 0, y: 0, content: '' });
          });

        // Other rectangle
        d3.select(this)
          .append('rect')
          .attr('x', 0)
          .attr('y', y(d.export))  // Start from the top of the Taiwan rectangle
          .attr('width', x.bandwidth())
          .attr('height', y(d.export - d.other) - y(d.export))  // Height of Other
          .attr('fill', color('other'))
          .attr('rx', 2)
          .attr('ry', 2)
          .on('mouseover', function (event) {
            const container = svgRef.current.getBoundingClientRect();
            const offsetX = event.clientX - container.left;
            const offsetY = event.clientY - container.top;
            setTooltip({
              visible: true,
              x: offsetX + 5,
              y: offsetY - 5,
              content: <div><strong>{d.year}</strong><br/>Other Regions<br/>${d.other.toLocaleString()}B</div>
            });
          })
          .on('mousemove', (event) => {
            const container = svgRef.current.getBoundingClientRect();
            const offsetX = event.clientX - container.left;
            const offsetY = event.clientY - container.top;
            setTooltip(prev => ({
              ...prev,
              x: offsetX + 5,
              y: offsetY - 5,
            }));
          })
          .on('mouseleave', function () {

            setTooltip({ visible: false, x: 0, y: 0, content: '' });
          });
      });

    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(x)
          .tickValues(data.map(d => d.year).filter(year => year % 10 === 0)) // Filter years divisible by 10
          .tickFormat(d3.format("d")) // Format the year as a number
      )
      .style("font-size", "15px")
      .style("fill", "#e0e0e0");

    // Y-axis
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d / 1000}B`))
        .style("font-size", "15px")
        .style("fill", "#e0e0e0");
  }, [data]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <h3 style={{
          textAlign: 'center',
          fontSize: '24px',
          color: '#e74c3c',
          paddingTop: '20px',
          paddingBottom: '20px',
        }}>
          US Arms Export
        </h3>
        <svg ref={svgRef} style={{ width: '100%', border: '3px solid #e74c3c', borderRadius: '8px' }}></svg>
        {tooltip.visible && (
        <div
        style={{
          position: 'absolute',
          top: tooltip.y,
          left: tooltip.x,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#e0e0e0',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          fontSize: '16px',
          lineHeight: '1.6',
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          opacity: tooltip.visible ? 1 : 0,
          zIndex: 10,
          whiteSpace: 'nowrap',
          width: 'auto',
          height: 'auto',
        }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;
