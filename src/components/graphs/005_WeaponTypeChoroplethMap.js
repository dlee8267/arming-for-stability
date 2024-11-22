import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const ChoroplethMap = () => {
  const svgRef = useRef();
  const pieChartRef = useRef();

  // State Variables
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [modalData, setModalData] = useState(null);
  const [countryData, setCountryData] = useState({});
  const [countries, setCountries] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedWeaponType, setSelectedWeaponType] = useState(null);
  const [weaponTypes, setWeaponTypes] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minYear, setMinYear] = useState(1950);
  const [maxYear, setMaxYear] = useState(2023);
  const [totalArmsTrade, setTotalArmsTrade] = useState(0);

  // Data URLs with deployment compatibility
  const dataUrl = `${process.env.PUBLIC_URL}/data/processed/processed_arms_transfer_by_weapon_types.csv`;
  const pieChartUrl = `${process.env.PUBLIC_URL}/data/processed/processed_regional_transfers.csv`;
  const geoJSONUrl = `${process.env.PUBLIC_URL}/countries-110m.json`;

  // Country Name Mapping
  const countryNameMapping = {
    "Cote d'Ivoire": "Ivory Coast",
    "Congo": "Republic of the Congo",
  };

  // Data Loading Effect
  useEffect(() => {
    setLoading(true);
    Promise.all([
      d3.json(geoJSONUrl),
      d3.csv(dataUrl, d => {
        const year = +d['year'];
        const quantity = +d['quantity'];
        if (isNaN(year) || isNaN(quantity) || year < minYear || year > maxYear) {
          return null;
        }
        return {
          recipients: d['recipients'],
          suppliers: d['suppliers'],
          year: Math.round(year),
          quantity: quantity,
          weaponDescription: d['weapon description'],
          status: d['status'],
        };
      })
    ])
      .then(([worldDataRaw, armsDataRaw]) => {
        armsDataRaw = armsDataRaw.filter(row => row !== null);

        const countriesData = topojson.feature(worldDataRaw, worldDataRaw.objects.countries).features;
        setCountries(countriesData);

        const processedData = {};
        const uniqueWeaponTypes = new Set();
        const tempMaxQuantities = {};

        armsDataRaw.forEach(row => {
          let country = row.recipients;
          country = countryNameMapping[country] || country;

          const year = row.year;
          const weaponType = row.weaponDescription ? row.weaponDescription.trim() : "";
          const quantity = row.quantity;

          if (weaponType !== "") {
            uniqueWeaponTypes.add(weaponType);
          }

          if (!processedData[country]) {
            processedData[country] = {};
          }
          if (!processedData[country][year]) {
            processedData[country][year] = {};
          }

          processedData[country][year][weaponType] = {
            quantity,
            suppliers: row.suppliers,
            status: row.status,
          };

          if (!tempMaxQuantities[weaponType]) {
            tempMaxQuantities[weaponType] = {};
          }
          if (!tempMaxQuantities[weaponType][year] || quantity > tempMaxQuantities[weaponType][year]) {
            tempMaxQuantities[weaponType][year] = quantity;
          }
        });

        const weaponTypesArray = ["All", ...Array.from(uniqueWeaponTypes).filter(wt => wt !== "").sort()];
        setWeaponTypes(weaponTypesArray);
        setCountryData(processedData);
        setMaxQuantities(tempMaxQuantities);
        setLoading(false);

        const availableYears = Array.from(new Set(armsDataRaw.map(d => d.year))).sort((a, b) => a - b);
        if (availableYears.length > 0) {
          setSelectedYear(2019);
        }

        if (weaponTypesArray.includes("All")) {
          setSelectedWeaponType("All");
        } else if (weaponTypesArray.length > 0) {
          setSelectedWeaponType(weaponTypesArray[0]);
        }
      })
      .catch(error => {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Rendering Effect
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

  const drawMap = (countries, armsData, year, weaponType) => {
    const width = 800;
    const height = 400;

    const projection = d3.geoMercator()
      .center([0, 20])
      .scale(130)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    let maxQuantity;
    let colorScale;

    if (weaponType === "All") {
      maxQuantity = d3.max(countries, d => {
        const country = d.properties.name;
        const yearData = armsData[country]?.[year];
        if (yearData) {
          return Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0);
        }
        return 0;
      }) || 0;

      colorScale = d3.scaleSequential(d3.interpolateReds).domain([Math.log(1), Math.log(maxQuantity)]);
    } else {
      maxQuantity = d3.max(countries, d => armsData[d.properties.name]?.[year]?.[weaponType]?.quantity || 0) || 0;
      colorScale = d3.scaleSequential(d3.interpolateReds).domain([Math.log(1), Math.log(maxQuantity)]);
    }

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'map-group');

    const logColorScale = (value) => colorScale(Math.log(value));

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
        const yearData = armsData[country]?.[year];
        if (!yearData) return;

        const content = weaponType === "All"
          ? `<strong>${country}</strong><br>Total: ${Object.values(yearData).reduce((acc, curr) => acc + curr.quantity, 0)}`
          : `<strong>${country}</strong><br>Quantity: ${yearData[weaponType]?.quantity || 0}`;

        setTooltip({ visible: true, x: event.pageX, y: event.pageY, content });
      })
      .on('mouseleave', () => {
        setTooltip({ visible: false, x: 0, y: 0, content: null });
      });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <h3 style={{ textAlign: 'center', fontSize: '24px', color: '#e74c3c', paddingTop: '20px' }}>
        Arms Imports by Weapon Type {selectedYear}
      </h3>
      {tooltip.visible && (
        <div style={{
          position: 'absolute',
          top: tooltip.y,
          left: tooltip.x,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#e0e0e0',
          padding: '12px',
          borderRadius: '8px',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          {tooltip.content}
        </div>
      )}
      <svg ref={svgRef} style={{ width: '100%', border: '3px solid #e74c3c', borderRadius: '8px' }}></svg>
    </div>
  );
};

export default ChoroplethMap;
