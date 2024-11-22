import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const ConflictDotMap = () => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [data, setData] = useState({ csvData: [], mapData: {} });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [selectedYear, setSelectedYear] = useState(2019);
  const [uniqueYears, setUniqueYears] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true); // Start in "play" mode by default
  const intervalRef = useRef(null);

  // Dynamic asset paths for conflicts data and map data
  const conflictsDataUrl = `${process.env.PUBLIC_URL}/assets/data/processed_conflicts_locations_with_coordinates.csv`;
  const mapDataUrl = `${process.env.PUBLIC_URL}/assets/data/countries-110m.json`;

  useEffect(() => {
    // Load both the conflict data and map data
    Promise.all([
      d3.csv(conflictsDataUrl),
      d3.json(mapDataUrl)
    ])
      .then(([csvData, mapData]) => {
        // Calculate intensity per location-year combination
        const intensityData = d3.rollup(
          csvData,
          v => v.length,
          d => `${d.location}_${d.year}`
        );

        // Parse and process data
        csvData.forEach(d => {
          d.year = +d.year;
          d.latitude = +d.latitude;
          d.longitude = +d.longitude;
          d.intensity = intensityData.get(`${d.location}_${d.year}`) || 1;
        });

        setData({ csvData, mapData });

        // Extract unique years and sort them
        const years = Array.from(new Set(csvData.map(d => d.year))).sort((a, b) => a - b);
        setUniqueYears(years);

        // Default selected year
        setSelectedYear(years.includes(2019) ? 2019 : years[0]);
      })
      .catch(error => console.error("Error loading data:", error));
  }, [conflictsDataUrl, mapDataUrl]);

  useEffect(() => {
    if (data.csvData.length > 0 && Object.keys(data.mapData).length > 0) {
      drawMap();
    }
  }, [selectedYear, data]);

  const drawMap = () => {
    const width = 800;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style("background-color", "");

    svg.selectAll("*").remove();

    // Define projection and path for map drawing
    const projection = d3.geoMercator()
      .center([0, 20])
      .scale(130)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const mapGroup = svg.append("g");

    // Draw countries
    const countries = topojson.feature(data.mapData, data.mapData.objects.countries).features;
    mapGroup.selectAll("path")
      .data(countries)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#ccc")
      .attr("stroke", "#333");

    // Filter conflict data for the selected year
    const yearData = data.csvData.filter(d => d.year === +selectedYear);

    // Define color scale for intensity
    const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([1, d3.max(yearData, d => d.intensity)]);

    // Plot conflict locations as circles
    mapGroup.selectAll("circle")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("cx", d => projection([d.longitude, d.latitude])[0])
      .attr("cy", d => projection([d.longitude, d.latitude])[1])
      .attr("r", d => Math.sqrt(d.intensity) * 5)
      .attr("fill", d => d.intensity > 1 ? colorScale(d.intensity) : "#BC8F8F")
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .on("mouseenter", (event, d) => {
        const containerRect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - containerRect.left + 10;
        const y = event.clientY - containerRect.top - 10;
        setTooltip({
          visible: true,
          x: x,
          y: y,
          content: 
          <div><p><strong>{d.location}</strong><br/>Party A: {d.party_a}<br/>Party B: {d.party_b}<br/>Intensity: {d.intensity}</p></div>
        });
      })
      .on("mousemove", (event) => {
        const containerRect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - containerRect.left + 10;
        const y = event.clientY - containerRect.top - 10;
        setTooltip(prev => ({
          ...prev,
          x: x,
          y: y
        }));
      })
      .on("mouseleave", () => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
      });
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSelectedYear(prevYear => {
          const currentIndex = uniqueYears.indexOf(prevYear);
          return uniqueYears[(currentIndex + 1) % uniqueYears.length]; // Loop to the first year
        });
      }, 500); // Update every second
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current); // Clean up on unmount
  }, [isPlaying, uniqueYears]);

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={containerRef}>
      <h3 style={{
        textAlign: 'center',
        fontSize: '24px',
        color: '#e74c3c',
        paddingTop: '20px',
      }}>
        Global Conflict Map {selectedYear} <button
        onClick={togglePlayPause}
        style={{
          margin: '10px 10px',
          padding: '12px',
          backgroundColor: isPlaying ? '#e74c3c' : '#4682B4',
          color: '#e0e0e0',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '24px',
          width: '120px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      </h3>

      <input
        type="range"
        id="year-slider"
        min={Math.min(...uniqueYears)}
        max={Math.max(...uniqueYears)}
        value={selectedYear}
        onChange={handleYearChange}
        step="1"
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

      <svg ref={svgRef} style={{ width: '100%', border: '3px solid #e74c3c', borderRadius: '8px' }}></svg>

      {tooltip.visible && (
        <div style={{
          position: 'absolute',
          left: tooltip.x,
          top: tooltip.y,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#e0e0e0',
          padding: '8px',
          borderRadius: '8px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          fontSize: '16px',
          lineHeight: '1.6',
          zIndex: 10,
        }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default ConflictDotMap;
