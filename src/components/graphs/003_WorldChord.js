import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ArcLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia3dwdGhlZ3JlYXQiLCJhIjoiY20zajljd3Z2MDExZjJycHRvcGE0dm9uYyJ9.9IwsWKd3rM0aVxjXND4LUQ'; // Replace with your actual Mapbox token

// Function to extract the year from a record dynamically
function extractYearFromRecord(record) {
  if (record.date) {
    const match = record.date.match(/\b(20\d{2})\b/); // Match years like 2000-2099
    return match ? parseInt(match[0], 10) : null;
  }
  return null;
}

function WorldChord() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [year, setYear] = useState(2014); // Default year for the slider filter
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [countryCoordinates, setCountryCoordinates] = useState({}); // State to store dynamically loaded coordinates

  const countryColors = {
    "United States": [70, 130, 180], // Steel Blue (rgb format)
    "Russia": [220, 20, 60], // Crimson (rgb format)
    "China": [255, 219, 88], // Light Gold (rgb format)
  };

  // Load country coordinates dynamically
  useEffect(() => {
    const fetchCountryCoordinates = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/countryCoordinates.json`);
        if (!response.ok) throw new Error('Failed to load country coordinates');
        const coordinates = await response.json();
        setCountryCoordinates(coordinates);
      } catch (error) {
        console.error('Error loading country coordinates:', error);
      }
    };
    fetchCountryCoordinates();
  }, []);

  useEffect(() => {
    // Fetch data from converted_data.json
    fetch(`${process.env.PUBLIC_URL}/data/processed/converted_data.json`)
      .then(response => response.json())
      .then(fetchedData => {
        const updatedData = fetchedData.map(d => ({
          ...d,
          year: d.year || extractYearFromRecord(d), // Add year dynamically if needed
        }));

        setData(updatedData);

        const initialFilteredData = updatedData.filter(d => d.year === year);
        setFilteredData(initialFilteredData);
      })
      .catch(error => console.error('Error loading JSON data:', error));
  }, [year]);

  useEffect(() => {
    if (data.length > 0) {
      const updatedFilteredData = data.filter(d => d.year === year);
      setFilteredData(updatedFilteredData);
    }
  }, [year, data]);

  const filteredByCountry = filteredData.filter(d => {
    if (selectedCountry === 'all') return true;
    return d.origin.toLowerCase() === selectedCountry.toLowerCase();
  });

  const validFilteredData = filteredByCountry.filter(d => {
    const source = countryCoordinates[d.origin];
    const target = countryCoordinates[d.destination];

    if (!["China", "Russia", "United States"].includes(d.origin)) {
      return false;
    }

    return source && target;
  });

  const layers = new ArcLayer({
    id: 'arc-layer',
    data: validFilteredData,
    getSourcePosition: d => countryCoordinates[d.origin],
    getTargetPosition: d => countryCoordinates[d.destination],
    getSourceColor: d => countryColors[d.origin] || [255, 255, 255],
    getTargetColor: d => countryColors[d.origin] || [0, 128, 255],
    getWidth: d => Math.log(d.quantity + 1),
    pickable: true,
    getTooltip: ({ object }) => {
      return object
        ? `${object.origin} to ${object.destination}: ${object.quantity} ${object.weapon} (${object.year})`
        : null;
    },
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '80vh' }}>

      <h3 style={{ textAlign: 'center', fontSize: '24px', color: '#e74c3c', paddingTop: '20px' }}>
        Global Arms Proliferation {year}
      </h3>

      <input
        type="range"
        min="1950"
        max="2023"
        value={year}
        onChange={(e) => setYear(+e.target.value)}
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
      <div style={{ position: 'absolute', bottom: 0, width: '100%', height: 'calc(100% - 90px)' }}>
        <DeckGL
          style={{ width: '100%', height: '100%', border: '3px solid #e74c3c', borderRadius: '8px' }}
          initialViewState={{
            latitude: 20,
            longitude: 0,
            zoom: 1.5,
            pitch: 30,
          }}
          controller={true}
          layers={[layers]}
          onHover={(info) => {
            if (info.object) {
              setHoveredInfo(info);
            } else {
              setHoveredInfo(null);
            }
          }}
        >
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/light-v10"
            attributionControl={false}
            interactiveLayerIds={['arc-layer']}
          />
          {hoveredInfo && hoveredInfo.object && (
            <div
              style={{
                position: 'absolute',
                left: hoveredInfo.x,
                top: hoveredInfo.y,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'e0e0e0',
                padding: '8px 12px',
                borderRadius: '8px',
                pointerEvents: 'none',
                fontSize: '16px',
                whiteSpace: 'nowrap',
              }}
            >
              {`${hoveredInfo.object.origin} to ${hoveredInfo.object.destination}: ${hoveredInfo.object.quantity}`}
            </div>
          )}
        </DeckGL>

        <div style={{
          position: 'absolute',
          height: '80px',
          width: '120px',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#e0e0e0',
        }}>
          <p style={{ display: 'block', marginBottom: '10px', color: '#e0e0e0', fontSize: '14px', fontWeight: 'bold' }}>Select Country</p>

          <select
            name="countrySelector"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{
              position: 'absolute',
              padding: '6px 10px',
              width: '100px',
              color: '#e0e0e0',
              backgroundColor: 'black',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="all">All</option>
            <option value="United States">US</option>
            <option value="Russia">Russia</option>
            <option value="China">China</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default WorldChord;
