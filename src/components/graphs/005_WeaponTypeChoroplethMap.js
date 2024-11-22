import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const ChoroplethMap = () => {
  const svgRef = useRef();
  const pieChartRef = useRef();


  // State Variables
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [modalData, setModalData] = useState(null); // For storing data to display in the modal
  const [countryData, setCountryData] = useState({});
  const [countries, setCountries] = useState([]); // Store GeoJSON features
  const [selectedYear, setSelectedYear] = useState(null); // Initialize to null
  const [selectedWeaponType, setSelectedWeaponType] = useState(null); // Initialize to null
  const [weaponTypes, setWeaponTypes] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minYear, setMinYear] = useState(1950); // Fixed minimum year
  const [maxYear, setMaxYear] = useState(2023); // Fixed maximum year
  const [totalArmsTrade, setTotalArmsTrade] = useState(0);

  // Data URL
  const dataUrl = `${process.env.PUBLIC_URL}/data/processed/processed_arms_transfer_by_weapon_types.csv`;
  const pieChartUrl = `${process.env.PUBLIC_URL}/data/processed/processed_regional_transfers.csv`;

  /**
   * Country Name Mapping
   * Map dataset country names to GeoJSON country names if they differ.
   */
  const countryNameMapping = {
    "Cote d'Ivoire": "Ivory Coast",
    "Congo": "Republic of the Congo", // Adjust based on GeoJSON data
    // Add more mappings as necessary
  };

  /**
   * Data Loading Effect
   * Fetches and processes the world map and arms transfer data once when the component mounts.
   */
  useEffect(() => {
    setLoading(true);
    Promise.all([
      d3.json(`${process.env.PUBLIC_URL}/countries-110m.json`),
      d3.csv(dataUrl, d => {
        const year = +d['year'];
        const quantity = +d['quantity'];
        // Validate year range
        if (isNaN(year) || isNaN(quantity) || year < minYear || year > maxYear) {
          return null; // Skip invalid or out-of-range rows
        }
        return {
          recipients: d['recipients'],
          suppliers: d['suppliers'],
          year: Math.round(year), // Ensure year is an integer
          quantity: quantity,
          weaponDescription: d['weapon description'],
          status: d['status'],
        };
      })
    ])
    .then(([worldDataRaw, armsDataRaw]) => {
      // Filter out null entries
      armsDataRaw = armsDataRaw.filter(row => row !== null);

      // Convert TopoJSON to GeoJSON Features
      const countriesData = topojson.feature(worldDataRaw, worldDataRaw.objects.countries).features;
      setCountries(countriesData); // Store countries data in state

      // Process arms transfer data
      const processedData = {};
      const uniqueWeaponTypes = new Set();
      const tempMaxQuantities = {};

      armsDataRaw.forEach(row => {
        let country = row.recipients;
        country = countryNameMapping[country] || country; // Apply mapping

        const year = row.year;
        const weaponType = row.weaponDescription ? row.weaponDescription.trim() : ""; // Trim whitespace
        const quantity = row.quantity;
        const suppliers = row.suppliers;
        const status = row.status;

        // Only add non-empty weapon types
        if (weaponType !== "") {
          uniqueWeaponTypes.add(weaponType);
        }

        if (!processedData[country]) {
          processedData[country] = {};
        }
        if (!processedData[country][year]) {
          processedData[country][year] = {};
        }

        // Assuming one entry per country-year-weaponType
        processedData[country][year][weaponType] = {
          quantity,
          suppliers,
          status
        };

        // Update max quantities for scales
        if (!tempMaxQuantities[weaponType]) {
          tempMaxQuantities[weaponType] = {};
        }
        if (!tempMaxQuantities[weaponType][year] || quantity > tempMaxQuantities[weaponType][year]) {
          tempMaxQuantities[weaponType][year] = quantity;
        }
      });

      // Construct weaponTypesArray with "All" and filter out any empty entries
      const weaponTypesArray = ["All", ...Array.from(uniqueWeaponTypes).filter(wt => wt !== "" && wt !== undefined).sort()];
      setWeaponTypes(weaponTypesArray);
      setCountryData(processedData);
      setMaxQuantities(tempMaxQuantities);
      setLoading(false);

      // Set default selectedYear and selectedWeaponType based on available data
      const availableYears = Array.from(new Set(armsDataRaw.map(d => d.year))).sort((a, b) => a - b);
      if (availableYears.length > 0) {
        setSelectedYear(2019);
      }

      if (weaponTypesArray.includes('All')) {
        setSelectedWeaponType('All');
      } else if (weaponTypesArray.length > 0) {
        setSelectedWeaponType(weaponTypesArray[0]);
      }

    })
    .catch(error => {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    });
  }, []); // Empty dependency array ensures this runs once on mount

  /**
   * Rendering Effect
   * Draws the map whenever selectedYear, selectedWeaponType, or countryData changes.
   */
  useEffect(() => {
    if (
      countries.length === 0 ||
      Object.keys(countryData).length === 0 ||
      selectedYear === null ||
      isNaN(selectedYear) ||
      !selectedWeaponType
    ) return;

    drawMap(countries, countryData, selectedYear, selectedWeaponType);
  }, [selectedYear, selectedWeaponType, countryData, countries]);

  useEffect(() => {
    const width = 200; // Adjust as needed
    const height = 200; // Match the container's height
    const radius = Math.min(width, height) * 0.3;

    const svg = d3.select(pieChartRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    d3.csv(pieChartUrl).then(data => {
      data.forEach(d => {
        for (let year = 1950; year <= 2023; year++) {
          d[year] = +d[year] / 1000 || 0;
        }
      });

      const customOrder = ["Asia and Oceania", "Europe", "Middle East", "Americas", "Africa"]; // Define the custom order

      const filteredData = data.filter(d => 
        d['Imports by Regions'] !== 'World total' && d['Imports by Regions'] !== 'International organizations'
      );

      const regionArmsData = Array.from(
        d3.group(filteredData, d => d['Imports by Regions']),
        ([region, values]) => ({
          region,
          armsTrade: values[0][selectedYear] || 0
        })
      ).sort((a, b) => {
        // Sort based on the custom order
        return customOrder.indexOf(a.region) - customOrder.indexOf(b.region);
      });

      const totalArmsTrade = d3.sum(regionArmsData, d => d.armsTrade);
      setTotalArmsTrade(totalArmsTrade);

      if (totalArmsTrade === 0) {
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .text('No data available for this year');
        return;
      }

      const colorMap = {
        "Asia and Oceania": "#F44336",  // Soft red/orange
        "Europe": "#0D47A1",           // Bright red
        "Middle East": "#388E3C",      // Dark red
        "Americas": "#FF9800",         // Vibrant red
        "Africa": "#6D4C41",           // Darker red
      };
  
      // Custom color scale using the dictionary
      const colorScale = d3.scaleOrdinal()
        .domain(regionArmsData.map(d => d.region))
        .range(regionArmsData.map(d => colorMap[d.region]));


      const pie = d3.pie().sort(null) // Do not automatically sort the data
      .startAngle(0) // Start angle at 0 (APEC starts from 0 degrees)
      .endAngle(2 * Math.PI).value(d => d.armsTrade);
      const arc = d3.arc().outerRadius(radius - 10).innerRadius(0); 
      const labelArc = d3.arc().outerRadius(radius + 20).innerRadius(radius + 20);


      svg.append('g')
        .attr('transform', `translate(${width * 0.6}, ${height / 2})`)
        .selectAll('path')
        .data(pie(regionArmsData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => colorScale(d.data.region))
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', '1.5px')
        .attr('opacity', 0.8)
        .on('mouseenter', (event, d) => {
          const regionPercentage = ((d.data.armsTrade / totalArmsTrade) * 100).toFixed(2);
          const container = svgRef.current.getBoundingClientRect();
          const offsetX = event.clientX - container.left;
          const offsetY = event.clientY - container.top;
          setTooltip({
            visible: true,
            x: offsetX + 10,
            y: offsetY - 10,
            content: (<div><strong>{d.data.region}:</strong> ${d.data.armsTrade.toLocaleString()}B ({regionPercentage}%)</div>),
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
        .on('mouseleave', (event) => {
          setTooltip({ visible: false, x: 0, y: 0, content: '' });

          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('d', arc)
            .attr('opacity', 0.85);
        });

        svg.append('g')
        .attr('transform', `translate(${width * 0.6}, ${height / 2})`)
          .selectAll('text')
          .data(pie(regionArmsData))
          .enter()
          .append('text')
          .attr('transform', d => {
            const [x, y] = labelArc.centroid(d);
            const angle = (d.startAngle + d.endAngle) / 2;  // Calculate the angle of the arc midpoint
            let rotation = (angle * 180 / Math.PI) - 90;  // Rotate to make text vertical
            const arcLength = d.endAngle - d.startAngle;
            const arcLengthDeg = arcLength * 180 / Math.PI;
            // Flip text if it's between 180 and 360 degrees
            if (arcLengthDeg < 30) {
              // Flip text if it's between 180 and 360 degrees
              if (rotation > 90) {
                rotation -= 180;
              }
            } else {
              rotation = 0;  // No rotation if the arc is wide enough
            }

            return `translate(${x}, ${y}) rotate(${rotation})`;
          }) // Position labels and rotate them to be vertical to the arc
          .style('text-anchor', 'middle')
          .style('font-size', '14px') // Increase font size
          .style('font-weight', 'bold') // Optional: make the text bold
          .style('fill', '#e0e0e0') // Set text color
          .style('pointer-events', 'none')
          .text(d => {
            // Set custom labels for specific regions
            if (d.data.region === 'Asia and Oceania') {
              return 'APAC';
            } else if (d.data.region === 'Middle East') {
              return 'ME';
            } else if (d.data.region === 'Americas') {
              return 'AMS';
            } else {
              return d.data.region;  // Default label
            }
          });
    }).catch(error => {
      console.error("Error loading data:", error);
    });
  }, [dataUrl, selectedYear]);
  /**
   * Function to Draw the Map
   */
  const drawMap = (countries, armsData, year, weaponType) => {
    const width = 800;
    const height = 400;

    // Define Projection and Path
    const projection = d3.geoMercator()
      .center([0, 20])
      .scale(130)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Define Color and Size Scales
    let maxQuantity;
    let colorScale;
    let sizeScale;

    if (weaponType === "All") {
      // Calculate the sum of quantities across all weapon types for each country
      maxQuantity = d3.max(countries, d => {
        const country = d.properties.name;
        const yearData = armsData[country]?.[year];
        if (yearData) {
          return Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0);
        }
        return 0;
      }) || 0;

      colorScale = d3.scaleSequential(d3.interpolateReds)
          .domain([Math.log(1), Math.log(maxQuantity)]); // Using Math.log to handle logarithmic scaling

      sizeScale = d3.scaleSqrt()
        .domain([0, maxQuantity])
        .range([0, 50]); // Adjust circle size range as necessary
    } else {
      // Specific weapon type
      maxQuantity = d3.max(countries, d => armsData[d.properties.name]?.[year]?.[weaponType]?.quantity || 0) || 0;

      colorScale = d3.scaleSequential(d3.interpolateReds)
          .domain([Math.log(1), Math.log(maxQuantity)]); // Using Math.log to handle logarithmic scaling


      sizeScale = d3.scaleSqrt()
        .domain([0, maxQuantity])
        .range([0, 50]); // Adjust circle size range as necessary
    }

    // Select and Setup SVG
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background-color', '')
      .call(d3.zoom() // Implement Zooming and Panning
        .scaleExtent([1, 8]) // Zoom scale limits
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        })
      );

    // Create a group for map elements
    let g = svg.select('g.map-group');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'map-group');
    }

    // Clear previous drawings within the group
    g.selectAll('*').remove();

    // Function to Handle Tooltip Content
    const handleTooltipContent = (country, year, weaponType, data) => {
      if (weaponType === "All") {
        const totalQuantity = Object.values(data).reduce((acc, curr) => acc + curr.quantity, 0);
        return (
          <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
            <strong>{country}</strong><br/>
            Total Quantity: {totalQuantity} units<br/>
            <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>
              Click for Details
            </span>
          </div>
        );
      } else {
        // Handle other weapon types if necessary
        return (
          <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
            <strong>{country}</strong><br/>
            Weapon: {weaponType}<br/>
            Quantity: {data.quantity} units<br/>
            Status: {data.status}<br/>
            <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>
              Click for Details
            </span>
          </div>
        );
      }
    };

    const logColorScale = (value) => colorScale(Math.log(value));

    // Draw Country Paths with Color Based on Quantity
    g.selectAll('path')
      .data(countries)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const country = d.properties.name;
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (yearData) {
            const totalQuantity = Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0);
            return totalQuantity > 0 ? logColorScale(totalQuantity) : '#ccc';
          }
          return '#ccc';
        } else {
          const quantity = armsData[country]?.[year]?.[weaponType]?.quantity || 0;
          return quantity > 0 ? logColorScale(quantity) : '#ccc';
        }
      })
      .attr('stroke', '#333')
      .on('mouseenter', (event, d) => {
        const country = d.properties.name;

        let content = null;

        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          content = handleTooltipContent(country, year, weaponType, yearData);
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          content = handleTooltipContent(country, year, weaponType, data);
        }

        const container = svgRef.current.getBoundingClientRect();
        const offsetX = event.clientX - container.left;
        const offsetY = event.clientY - container.top;

        setTooltip({
          visible: true,
          x: offsetX + 10,
          y: offsetY - 10,
          content: content
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
      .on('mouseleave', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: null });
      })
      .on('click', (event, d) => {
        const country = d.properties.name;
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          setModalData({
            country,
            year,
            data: yearData
          });
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          setModalData({
            country,
            year,
            weaponType,
            data
          });
        }
      });

    // Draw Circles Over Each Country Based on Quantity
    g.selectAll('circle')
      .data(countries)
      .enter()
      .append('circle')
      .attr('cx', d => projection(d3.geoCentroid(d))[0])
      .attr('cy', d => projection(d3.geoCentroid(d))[1])
      .attr('r', d => {
        const country = d.properties.name;
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (yearData) {
            return sizeScale(Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0));
          }
          return 0;
        } else {
          const quantity = armsData[country]?.[year]?.[weaponType]?.quantity || 0;
          return quantity > 0 ? sizeScale(quantity) : 0;
        }
      })
      .attr('fill', 'rgba(255, 69, 0, 0.5)') // Semi-transparent orange color for the circles
      .attr('stroke', 'orange')
      .attr('stroke-width', 0.5)
      .on('mouseenter', (event, d) => {
        const country = d.properties.name;

        let content = null;

        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          content = handleTooltipContent(country, year, weaponType, yearData);
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          content = handleTooltipContent(country, year, weaponType, data);
        }

        // Use d3.pointer to get mouse position relative to the SVG

        const container = svgRef.current.getBoundingClientRect();
        const offsetX = event.clientX - container.left;
        const offsetY = event.clientY - container.top;
        setTooltip({
          visible: true,
          x: offsetX + 10,
          y: offsetY - 10,
          content: content
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
      .on('mouseleave', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: null });
      })
      .on('click', (event, d) => {
        const country = d.properties.name;
        if (weaponType === "All") {
          const yearData = armsData[country]?.[year];
          if (!yearData) return; // No data to show

          setModalData({
            country,
            year,
            data: yearData
          });
        } else {
          const data = armsData[country]?.[year]?.[weaponType];
          if (!data) return; // No data to show

          setModalData({
            country,
            year,
            weaponType,
            data
          });
        }
      });

  };

  /**
   * Function to Close Modal
   */
  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'auto'}}>
      <h3 style={{
          textAlign: 'center',
          fontSize: '24px',
          color: '#e74c3c',
          paddingTop: '20px',
        }}>
          Arms Imports by Weapon Type {selectedYear}
        </h3>

      {loading && <div className="loading">Loading data...</div>}
      {error && <div className="error" style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <>
          <input
              type="range"
              id="yearSlider"
              min={minYear} // Fixed earliest year
              max={maxYear} // Fixed latest year
              step={1} // Ensure only whole numbers
              value={selectedYear} // Use selectedYear directly
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))} // Ensure integer
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
              disabled={!selectedWeaponType} // Disable until weapon type is selected
            />
          {/* Weapon Type Selection */}

          
          <div style={{width: '100%', height: '100%', border: '3px solid #e74c3c', borderRadius: '8px'}}>
            <svg ref={svgRef}></svg>
            <div style={{
              position: 'absolute',
              height: '80px',
              width: '200px',
              top: '100px',
              left: '20px',
              background: 'rgba(0, 0, 0, 0.9)',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#e0e0e0',
              display: 'flex', flexDirection: 'column',
            }}>
              <label htmlFor="weaponTypeSelect" style={{ display: 'block', marginBottom: '10px',}}>Select Weapon Type</label>
              <select
                id="weaponTypeSelect"
                onChange={e => setSelectedWeaponType(e.target.value)}
                value={selectedWeaponType}
                aria-label="Select Weapon Type"
                style={{
                  padding: '6px 10px',
                  width: '180px',
                  color: '#e0e0e0',
                  backgroundColor: 'black',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
              >
                {weaponTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{
          position: 'absolute', // Change to absolute to position it within the map container
          bottom: '10px', // Adjust as needed to create space from the bottom border
          left: '10px',
          backgroundColor: '',
          width: '225px',
          height: '200px',
          overflow: 'hidden',
        }}>
          <svg ref={pieChartRef} style={{ width: '100%', height: '100%'}}></svg>
        </div>
          
          {/* Tooltip */}
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

          {/* Modal */}
          {modalData && (
            <div
              className="modal"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
              onClick={closeModal}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  maxWidth: '600px',
                  width: '90%',
                  maxHeight: '80%',
                  overflowY: 'auto',
                  position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal when clicking inside
              >
                <button
                  onClick={closeModal}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: 'black', // Ensure close button text is black
                  }}
                  aria-label="Close modal"
                >
                  &times;
                </button>
                
                <p style={{ color: 'black' }}><strong>Country:</strong> {modalData.country}</p>
                <p style={{ color: 'black' }}><strong>Year:</strong> {modalData.year}</p>
                {selectedWeaponType === "All" ? (
                  <>                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'black' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>Weapon Type</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>Supplier</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>Quantity</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(modalData.data).map(([wt, data]) => (
                          <tr key={wt}>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>{wt}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>{data.suppliers}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>{data.quantity}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: 'black' }}>{data.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'black' }}><strong>Weapon Type:</strong> {modalData.weaponType}</p>
                    <p style={{ color: 'black' }}><strong>Supplier:</strong> {modalData.data.suppliers}</p>
                    <p style={{ color: 'black' }}><strong>Quantity:</strong> {modalData.data.quantity} units</p>
                    <p style={{ color: 'black' }}><strong>Status:</strong> {modalData.data.status}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Error Handling: If no data for default selections */}
      {error && !loading && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ChoroplethMap;
