import React, { useState, useRef } from 'react';
import ManufacturerTreeMap from './graphs/006_ManufacturerTreemap';


const manufacturers = () => {
  const [selectedYear, setSelectedYear] = useState(2023);
  return (
    <section id="006">
      <p className="custom-title" style={{cssText: 'margin-top: 0'}}>
        From Tensions to Strategic Economic Engines
      </p>

      <p className="custom-paragraph">
        Since the Cold War, the arms trade has evolved into a multipolar competition. While the <span style={{ color: "#4682B4" }}>US</span> remains dominant, 
        its share has decreased from 69.45% in 2010 to 55.95% in 2022, as <span style={{ color: "#FFDB58" }}>China</span> rapidly expanded to capture 24.74% of the market. 
        European and Russian shares have declined, reflecting China’s rising influence and ambition to challenge Western defense markets.
      </p>

      <p className="custom-paragraph">
        Defense industries benefit immensely, with geopolitical conflicts boosting demand for advanced systems, driving innovation, and fueling growth. 
        Thus, the global arms trade serves both economic and strategic purposes, enabling superpowers to advance interests, stabilize allies, and counter rivals through targeted arms exports.
      </p>

      <div className="chart-container" style={{width: '80%'}}>
        <ManufacturerTreeMap selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
      </div>
    </section>
  );
};

export default manufacturers;
