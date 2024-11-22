import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';


const MigrationMap = () => {
  const svgRef = useRef();
  const width = 800;
  const height = 400;

  const [worldGeoJSON, setWorldGeoJSON] = useState(null);
  const [countryCentroids, setCountryCentroids] = useState({});
  const [tradeData, setTradeData] = useState({
    "United States": [],
    "Russia": [],
    "China": []
  });
  const [selectedYear, setSelectedYear] = useState(2014);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [error, setError] = useState(null);

  const originColors = {
    "United States": "#4682B4",
    "Russia": "#DC143C",
    "China": "#FFDB58",
    "All": "#9467bd"
  };

  const urls = {
    "United States": `${process.env.PUBLIC_URL}/data/processed/processed_recipients_of_us_arms_hierarchical.json`,
    "Russia": `${process.env.PUBLIC_URL}/data/processed/processed_recipients_of_russia_arms_hierarchical.json`,
    "China": `${process.env.PUBLIC_URL}/data/processed/processed_recipients_of_china_arms_hierarchical.json`,
  };

  const geoJSONUrl = `${process.env.PUBLIC_URL}/countries-110m.json`;

  const normalizeCountryName = (name) => {
    const mapping = {
      "United States of America": "United States",
      "USA": "United States",
      "Russian Federation": "Russia",
      "People's Republic of China": "China",
    };
    return mapping[name] || name;
  };

  // Load world GeoJSON data
  useEffect(() => {
    d3.json(geoJSONUrl)
      .then(worldData => {
        const centroids = {};
        topojson.feature(worldData, worldData.objects.countries).features.forEach(feature => {
          const countryName = feature.properties.name;
          centroids[normalizeCountryName(countryName)] = d3.geoCentroid(feature);
        });
        setCountryCentroids(centroids);
        setWorldGeoJSON(worldData);
      })
      .catch(() => {
        setError("Error loading map data.");
      });
  }, []);

  // Load trade data for each country
  useEffect(() => {
    Object.keys(urls).forEach(country => {
      d3.json(urls[country])
        .then(data => {
          if (data && data.recipients) {
            setTradeData(prevData => ({
              ...prevData,
              [country]: data.recipients
            }));
          } else {
            setError(`Failed to load ${country} trade data.`);
          }
        })
        .catch(() => {
          setError(`Error loading ${country} trade data.`);
        });
    });
  }, []);

  useEffect(() => {
    if (!worldGeoJSON || Object.values(tradeData).every(data => data.length === 0)) return;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto');
    svg.selectAll("*").remove();

    const projection = d3.geoMercator().center([0, 20]).scale(130).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    const mapContainer = svg.append("g").attr("class", "map-container");

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        mapContainer.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "e0e0e0")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "16px")
      .style("display", "none");

    // Draw countries
    mapContainer.selectAll("path.country")
      .data(topojson.feature(worldGeoJSON, worldGeoJSON.objects.countries).features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#ccc")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);

    // Draw trade lines and circles for each country
    const countriesToShow = selectedCountry === "All" ? ["United States", "Russia", "China"] : [selectedCountry];
    countriesToShow.forEach(country => {
      const validTrades = tradeData[country]
        .map(recipient => {
          const originCoords = countryCentroids[country];
          const destCountry = normalizeCountryName(recipient.recipient);
          const destCoords = countryCentroids[destCountry];

          if (originCoords && destCoords) {
            const tradeValue = recipient.years[selectedYear] || 0;
            return {
              originCountry: country,
              destCountry,
              originX: projection(originCoords)[0],
              originY: projection(originCoords)[1],
              destX: projection(destCoords)[0],
              destY: projection(destCoords)[1],
              tradeValue
            };
          }
          return null;
        })
        .filter(d => d && d.tradeValue > 0);

      const topRecipients = validTrades
        .sort((a, b) => b.tradeValue - a.tradeValue)
        .slice(0, 5)
        .map(d => d.destCountry);

      const maxTradeValue = d3.max(validTrades, d => d.tradeValue) || 0;
      const strokeScale = d3.scaleSqrt().domain([0, maxTradeValue]).range([1, 4]);

      // Draw trade lines
      mapContainer.selectAll(`line.trade-line-${country}`)
        .data(validTrades)
        .enter()
        .append("line")
        .attr("class", `trade-line-${country}`)
        .attr("x1", d => d.originX)
        .attr("y1", d => d.originY)
        .attr("x2", d => d.destX)
        .attr("y2", d => d.destY)
        .attr("stroke", originColors[country])
        .attr("stroke-width", d => strokeScale(d.tradeValue))
        .on("mouseover", (event, d) => {
          tooltip
            .style("display", "block")
            .html(`
              <strong>Origin:</strong> ${d.originCountry}<br/>
              <strong>Destination:</strong> ${d.destCountry}<br/>
              <strong>Trade Value:</strong> ${d.tradeValue}B USD
            `);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });

      // Draw trade circles
      mapContainer.selectAll(`circle.trade-circle-${country}`)
        .data(validTrades)
        .enter()
        .append("circle")
        .attr("class", `trade-circle-${country}`)
        .attr("cx", d => d.destX)
        .attr("cy", d => d.destY)
        .attr("r", d => topRecipients.includes(d.destCountry) ? 6 : 3)
        .attr("fill", d => topRecipients.includes(d.destCountry) ? "#8A2BE2" : originColors[country])
        .on("mouseover", (event, d) => {
          tooltip
            .style("display", "block")
            .html(`
              <strong>Origin:</strong> ${d.originCountry}<br/>
              <strong>Destination:</strong> ${d.destCountry}<br/>
              <strong>Trade Value:</strong> ${d.tradeValue}B USD
            `);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });
    });

    return () => tooltip.remove();
  }, [worldGeoJSON, tradeData, countryCentroids, selectedYear, selectedCountry]);

  // Legend Component
  const Legend = () => (
    <div style={{
      position: 'absolute',
      height: '190px',
      width: '170px',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#e0e0e0',
    }}>
      <div style={{ marginBottom: '10px' }}><strong>Origin Countries</strong></div>

      {Object.entries(originColors)
        .filter(([country]) => country !== "All")
        .map(([country, color]) => (
          <div key={country} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{
              width: '12px', height: '12px', backgroundColor: color, marginRight: '8px', borderRadius: '50%'
            }}></div>
            <span>{country}</span>
          </div>
      ))}
      <div style={{ marginTop: '10px' }}><strong>Recipient Importance</strong></div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
        <svg width="20" height="20" style={{ marginRight: '6px' }}>
          <circle cx="10" cy="10" r="3" fill="#e0e0e0" />
        </svg>
        <span>Normal Recipient</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
        <svg width="20" height="20" style={{ marginRight: '6px' }}>
          <circle cx="10" cy="10" r="6" fill="#8A2BE2" />
        </svg>
        <span>Top Recipient</span>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%'}}>

      <h3 style={{textAlign: 'center', fontSize: '24px', color: '#e74c3c', paddingTop: '20px',}}>
          Global Arms Proliferation {selectedYear}
      </h3>

      {/* Display error messages if any */}
      {error && <div style={{ color: 'red', position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.8)', padding: '5px', borderRadius: '4px' }}>{error}</div>}
      
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

      {/* SVG Map */}
      <svg ref={svgRef} style={{ width: '100%', height: '80vh', border: '3px solid #e74c3c', borderRadius: '8px' }}></svg>

      {/* Legend */}
      {worldGeoJSON && Object.values(tradeData).some(data => data.length > 0) && <Legend />}

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: '220px', left: '20px', color: 'black', display: 'flex', flexDirection: 'column'}}>

        
        <label htmlFor="country" style={{ display: 'block', marginBottom: '10px', color: '#e0e0e0', fontSize: '14px', fontWeight: 'bold'}}>Select Country</label>
        <select 
          id="country" 
          value={selectedCountry} 
          onChange={(e) => setSelectedCountry(e.target.value)}
          style={{
            fontSize: '12px',
            padding: '6px 10px',
            width: '170px',
            color: '#e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'black'
          }}
        >
          <option value="All">All</option>
          <option value="United States">United States</option>
          <option value="Russia">Russia</option>
          <option value="China">China</option>
        </select>

      </div>
    </div>
  );
};

export default MigrationMap;
