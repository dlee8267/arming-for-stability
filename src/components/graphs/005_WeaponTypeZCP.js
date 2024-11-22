import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

const ZoomableCirclePacking = () => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [data, setData] = useState(null);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);
  const [error, setError] = useState(null);

  const width = 1000;
  const height = 600;

  const dataUrl = `${process.env.PUBLIC_URL}/data/processed/processed_weapon_transfer_by_category.json`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);

        // Extract unique years and set availableYears state
        const years = Array.from(
          new Set(
            Object.values(jsonData.Exports).flatMap((countryData) =>
              countryData.flatMap((category) => Object.keys(category).filter(key => !isNaN(key)))
            )
          )
        ).sort((a, b) => a - b);
        setAvailableYears(years);
        setSelectedYearIndex(years.length - 1); // Set default to the latest year
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      }
    };
    fetchData();
  }, [dataUrl]);

  const countryColorScale = useMemo(() => {
    return data
      ? d3
          .scaleOrdinal()
          .domain(['United States', 'Russia', 'China'])
          .range(['#4682B4', '#DC143C', '#FFDB58'])
          .unknown('#CCCCCC') // Fallback color for other countries
      : null;
  }, [data]);

  const categoryColorScale = useMemo(() => {
    const allCategories = data
      ? Object.values(data.Exports).flatMap((countryData) =>
          countryData.map((category) => category['Unnamed: 1'])
        )
      : [];
    return d3.scaleOrdinal(d3.schemePaired).domain(allCategories);
  }, [data]);

  useEffect(() => {
    if (!data || availableYears.length === 0 || !countryColorScale || !categoryColorScale) return;

    const selectedYear = availableYears[selectedYearIndex];

    const yearData = {
      name: 'Weapon Transfers by Country',
      children: Object.entries(data.Exports).map(([country, categories]) => ({
        name: country,
        children: categories
          .map((category) => ({
            name: category['Unnamed: 1'],
            value: category[selectedYear] || 0,
          }))
          .filter((category) => category.value > 0),
      })).filter(country => country.children.length > 0),
    };

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'transparent')
      .style('cursor', 'pointer');

    svg.selectAll('*').remove();

    const root = d3
      .hierarchy(yearData)
      .sum((d) => d.value || 0)
      .sort((a, b) => b.value - a.value);

    const pack = d3.pack().size([width - 10, height - 10]).padding(10);
    pack(root);

    let focus = root;
    let view;

    const zoomTo = (v) => {
      const k = width / v[2];
      view = v;
      node.attr(
        'transform',
        (d) =>
          `translate(${(d.x - v[0]) * k + width / 2}, ${
            (d.y - v[1]) * k + height / 2
          })`
      );
      node.select('circle').attr('r', (d) => d.r * k);
      node.selectAll('text')
        .attr('fontSize', (d) => Math.max(10, (d.r * k) / 4));
    };

    const zoom = (event, d) => {
      if (!d) return;
      focus = d;
      const transition = svg
        .transition()
        .duration(750)
        .tween('zoom', () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2.75]);
          return (t) => zoomTo(i(t));
        });
    };

    const node = svg
      .append('g')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node
      .append('circle')
      .attr('fill', (d) => {
        if (d.depth === 1) return countryColorScale(d.data.name);
        if (d.depth === 2) return categoryColorScale(d.data.name);
        return '#ccc';
      })
      .attr('fill-opacity', (d) => (d.depth === 1 || d.depth === 2 ? 1 : 0.0))
      .attr('stroke', 'none')
      .attr('r', (d) => d.r)
      .on('mouseover', (event, d) => {
        if (!d || !d.data || d.depth === 0) return;
        const country = d.depth === 1 ? d.data.name : d.parent?.data.name || 'N/A';
        const weaponType = d.depth === 2 ? d.data.name : 'N/A';
        const quantity = d.value?.toLocaleString() || 'N/A';
        setTooltip({
          visible: true,
          x: event.clientX + 10,
          y: event.clientY - 10,
          content: (
            <div>
              <strong>{country}</strong>
              {d.depth === 2 && <br />}
              {d.depth === 2 && `Type: ${weaponType}`}
              <br />
              Quantity: {quantity}
            </div>
          ),
        });
      })
      .on('mousemove', (event) => {
        setTooltip((prev) => ({ ...prev, x: event.clientX + 10, y: event.clientY - 10 }));
      })
      .on('mouseout', () => setTooltip({ visible: false, x: 0, y: 0, content: null }))
      .on('click', (event, d) => {
        if (focus !== d) {
          zoom(event, d);
          event.stopPropagation();
        }
      });

    zoomTo([root.x, root.y, root.r * 2.75]);
    svg.on('click', () => zoom(null, root));
  }, [data, selectedYearIndex, availableYears, countryColorScale, categoryColorScale]);

  const handleSliderChange = (e) => {
    setSelectedYearIndex(Number(e.target.value));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
      <h3 style={{ textAlign: 'center', fontSize: '24px', color: '#e74c3c', paddingTop: '20px' }}>
        Weapon Transfers by Category {availableYears[selectedYearIndex]}
      </h3>
      {error && <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>}
      {!error && !data && <p style={{ textAlign: 'center', color: '#e0e0e0' }}>Loading...</p>}
      {!error && data && availableYears.length > 0 && (
        <>
          <input
            type="range"
            id="year-slider"
            min="0"
            max={availableYears.length - 1}
            value={selectedYearIndex}
            onChange={handleSliderChange}
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
          <div style={{ width: '100%', border: '3px solid #e74c3c', borderRadius: '8px' }}>
            <svg ref={svgRef}></svg>
            {tooltip.visible && (
              <div
                style={{
                  position: 'fixed',
                  top: tooltip.y,
                  left: tooltip.x,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: '#e0e0e0',
                  padding: '12px',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -100%)',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.6',
                  fontSize: '16px',
                  zIndex: 1000,
                }}
              >
                {tooltip.content}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ZoomableCirclePacking;
