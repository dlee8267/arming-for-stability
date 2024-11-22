import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const StackedBarChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    // Fetch the CSV data from a relative path or public directory
    d3.csv(`${process.env.PUBLIC_URL}/data/processed/us_export.csv`).then((data) => {
      // Convert numeric columns to numbers
      data.forEach((d) => {
        d.year = +d.year;
        d.taiwan = +d.taiwan;
        d.other = +d.other;
      });
      setData(data);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    // Set up dimensions and margins
    const margin = { top: 20, right: 40, bottom: 40, left: 60 };
    const width = 800;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Select the SVG element and clear previous content
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .selectAll('*')
      .remove();

    const chartGroup = d3
      .select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Set up scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.year))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.taiwan + d.other)])
      .nice()
      .range([innerHeight, 0]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(['taiwan', 'other'])
      .range(['#44982A', '#e0e0e0']); // Custom colors

    // Draw stacked bars
    const groups = chartGroup
      .selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${xScale(d.year)}, 0)`);

    // Taiwan segment
    groups
      .append('rect')
      .attr('y', (d) => yScale(d.taiwan + d.other))
      .attr('height', (d) => innerHeight - yScale(d.taiwan))
      .attr('width', xScale.bandwidth())
      .attr('fill', colorScale('taiwan'))
      .attr('rx', 2)
      .attr('ry', 2)
      .on('mouseover', (event, d) => {
        const container = svgRef.current.getBoundingClientRect();
        const offsetX = event.clientX - container.left;
        const offsetY = event.clientY - container.top;
        setTooltip({
          visible: true,
          x: offsetX,
          y: offsetY,
          content: (
            <div>
              <strong>{d.year}</strong>
              <br />
              Taiwan: ${d.taiwan.toLocaleString()}B
            </div>
          ),
        });
      })
      .on('mousemove', (event) => {
        const container = svgRef.current.getBoundingClientRect();
        const offsetX = event.clientX - container.left;
        const offsetY = event.clientY - container.top;
        setTooltip((prev) => ({
          ...prev,
          x: offsetX,
          y: offsetY,
        }));
      })
      .on('mouseleave', () => setTooltip({ visible: false, x: 0, y: 0, content: '' }));

    // Other regions segment
    groups
      .append('rect')
      .attr('y', (d) => yScale(d.other))
      .attr('height', (d) => innerHeight - yScale(d.other))
      .attr('width', xScale.bandwidth())
      .attr('fill', colorScale('other'))
      .attr('rx', 2)
      .attr('ry', 2)
      .on('mouseover', (event, d) => {
        const container = svgRef.current.getBoundingClientRect();
        const offsetX = event.clientX - container.left;
        const offsetY = event.clientY - container.top;
        setTooltip({
          visible: true,
          x: offsetX,
          y: offsetY,
          content: (
            <div>
              <strong>{d.year}</strong>
              <br />
              Other Regions: ${d.other.toLocaleString()}B
            </div>
          ),
        });
      })
      .on('mousemove', (event) => {
        const container = svgRef.current.getBoundingClientRect();
        const offsetX = event.clientX - container.left;
        const offsetY = event.clientY - container.top;
        setTooltip((prev) => ({
          ...prev,
          x: offsetX,
          y: offsetY,
        }));
      })
      .on('mouseleave', () => setTooltip({ visible: false, x: 0, y: 0, content: '' }));

    // Add axes
    chartGroup
      .append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#e0e0e0');

    chartGroup
      .append('g')
      .call(d3.axisLeft(yScale).tickFormat((d) => `${d / 1000}B`))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#e0e0e0');
  }, [data]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <h3
        style={{
          textAlign: 'center',
          fontSize: '24px',
          color: '#e74c3c',
          paddingTop: '20px',
          paddingBottom: '20px',
        }}
      >
        US Arms Export
      </h3>
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          border: '3px solid #e74c3c',
          borderRadius: '8px',
        }}
      ></svg>
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
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;
