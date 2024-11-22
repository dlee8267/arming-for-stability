import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ManufacturerTreeMap = () => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [legendData, setLegendData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2022);

  const dataUrl = `${process.env.PUBLIC_URL}/data/processed/processed_top_100_arms_companies_consolidated.csv`;

  const width = 950;
  const height = 750;
  
  const colorMap = {
    "United States": "#4682B4",
    "Russia": "#DC143C",
    "China": "#FFDB58",
    "United Kingdom": "lightblue",
    "Italy": "#008C45",
    "France": "#B57EDC",
    "Trans-European": "#EDC9AF",
    "Japan": "pink"
  };

  const defaultColor = "#CCCCCC";

  useEffect(() => {
    

    const svg = d3.select(svgRef.current)
                  .attr('width', width)
                  .attr('height', height)
                  .style('position', 'relative');
    svg.selectAll('*').remove();

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#0db4de')
      .text(``);

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "e0e0e0")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("font-size", "16px")
      .style("display", "none");

    d3.csv(dataUrl).then(data => {
      const revenueColumn = `Arms Revenue ${selectedYear}`;
      if (!data.columns.includes(revenueColumn)) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .text(`No data available for the year ${selectedYear}`);
        return;
      }

      const dataWithRevenue = data.map(d => ({
        ...d,
        totalRevenue: +d[revenueColumn] || 0
      })).filter(d => d.totalRevenue > 0);

      const top20Data = dataWithRevenue
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 20);

      const totalRev = d3.sum(top20Data, d => d.totalRevenue);
      setTotalRevenue(totalRev);

      const groupedData = d3.group(top20Data, d => d.Country);

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
      const legendInfo = Array.from(groupedData, ([country, companies]) => {
        const countryRevenue = d3.sum(companies, company => company.totalRevenue);
        return {
          country,
          color: colorScale(country),
          percentage: (countryRevenue / totalRev) * 100,
        };
      });
      legendInfo.sort((a, b) => b.percentage - a.percentage);

      setLegendData(legendInfo);

      const root = d3.hierarchy({ children: top20Data })
                     .sum(d => d.totalRevenue)
                     .sort((a, b) => b.value - a.value);

      d3.treemap()
        .size([width, height - 20])
        .padding(2)
        (root);

      const treemapGroup = svg.append('g')
                              .attr('transform', `translate(0, 20)`);

      treemapGroup.selectAll('rect')
        .data(root.leaves())
        .enter()
        .append('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0 - 4)
        .attr('height', d => d.y1 - d.y0 - 4)
        .attr('fill', d => colorMap[d.data.Country] || defaultColor)
        .attr('opacity', 0.9)
        .attr('rx', 4) // Set corner radius for rounded corners
        .attr('ry', 4) // Optional, can be the same or different from rx
        .on('mouseover', (event, d) => {
          const revenuePercentage = ((d.data.totalRevenue / totalRev) * 100).toFixed(1);
          tooltip
            .style("display", "block")
            .html(`
              <strong>${d.data.Company}</strong>: $${d.data.totalRevenue.toLocaleString()}M (${revenuePercentage}%)
            `);
           /* 
          setTooltip({
            visible: true,
            x: event.pageX - 100,
            y: event.pageY - 100,
            content: `${d.data.Company}\nRevenue: $${d.data.totalRevenue.toLocaleString()} (${revenuePercentage}%)`,
          });
              */
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('x', d.x0 - 5)
            .attr('y', d.y0 - 5)
            .attr('width', (d.x1 - d.x0) + 20)
            .attr('height', (d.y1 - d.y0) + 20)
            .attr('fill', '#FF5733')
        })
        .on('mousemove', (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
        })
        .on('mouseout', (event, d) => {
          tooltip.style("display", "none");

          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('x', d.x0)
            .attr('y', d.y0)
            .attr('width', d.x1 - d.x0 - 4)
            .attr('height', d.y1 - d.y0 - 4)
            .attr('fill', d => colorMap[d.data.Country] || defaultColor)
            .attr('opacity', 0.9);
        });

        treemapGroup.selectAll('text')
          .data(root.leaves())
          .enter()
          .append('text')
          .attr('x', d => d.x0 + 10) // Padding for text
          .attr('y', d => d.y0 + 20) // Padding for text
          .attr('font-size', '16px')
          .attr('font-weight', 'bold')
          .attr('fill', '#444444')
          .style('pointer-events', 'none')
          .text(d => d.data.Company); // Append the company name as a single line
    }).catch(error => {
      console.error("Error loading data:", error);
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('Failed to load data');
    });
  }, [selectedYear]);

  return (
    <div >
    
    <h3 style={{textAlign: 'center', fontSize: '24px', color: '#e74c3c', paddingTop: '20px',}}>
          Top 20 Arms Companies by Revenue {selectedYear}
         </h3>

      <div style={{marginTop: '20px', textAlign: 'center' }}>
          <input
            type="range"
            id="yearRange"
            min={2003}
            max={2022}
            step="1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
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
        </div>
    <div style={{ display: 'flex', alignItems: 'flex-start', border: '3px solid #e74c3c', borderRadius: '8px', padding: '20px'}}>
      <div style={{ flex:'1' }}>
        <svg ref={svgRef} width={width} height={height}></svg>
        {tooltip.visible && (
          <div
            style={{
              position: 'absolute',
              top: tooltip.y + 5,
              left: tooltip.x + 5,
              whiteSpace: 'pre-line',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '8px',
              borderRadius: '5px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
              fontSize: '12px',
              color: '#333',
              pointerEvents: 'none',
              maxWidth: '200px',
            }}
          >
            {tooltip.content}
          </div>
        )}

        
      </div>

      <div style={{
        marginLeft: '20px',
        display:'flex',
        flexDirection:'column',
        marginTop: '20px',
        padding: '20px', // Increase padding for larger box size
        background: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#e0e0e0',
        width: '250px', // Increase width for larger legend box
      }}>
        <p style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold', color: '#e74c3c' }}>
          Total Revenue: ${(totalRevenue / 1000).toLocaleString()}B
        </p>
        

        {legendData.map((entry, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
            }}
          >
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                flex: 1 
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: colorMap[entry.country] || defaultColor, // Use colormap or fallback
                  marginRight: '15px',
                }}
              ></div>
              <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '5px' }}>
                {entry.country}
              </span>
            </div>
            <span style={{ fontSize: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {entry.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default ManufacturerTreeMap;
