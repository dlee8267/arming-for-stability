import React, { useState } from 'react';
import ParallelCoordinatesChart from './graphs/004_Top10RecipientsPCC';

const proxySupport = () => {
  const [selectedYear, setSelectedYear] = useState(2014);
  
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  return (
    <section id="004">
      <p className="custom-title" style={{ cssText: 'margin-top: 0' }}>
        Countering through Proxy Support
      </p>

      <p className="custom-paragraph">
        The <strong style={{ color: "#4682B4" }}>US</strong> maintains strategic alliances across Asia and the Middle East to counter regional threats. This includes supplying advanced weaponry to <strong style={{ color: "#D2B48C" }}>Taiwan</strong>, <strong style={{ color: "#D2B48C" }}>Japan</strong>, <strong style={{ color: "#D2B48C" }}>South Korea</strong>, <strong style={{ color: "#D2B48C" }}>Israel</strong>, and <strong style={{ color: "#D2B48C" }}>Saudi Arabia</strong>, aimed at countering China's influence and ensuring regional stability.
      </p>
      
      <p className="custom-paragraph">
        <strong style={{ color: "#FFD700" }}>China</strong> relies mainly on domestic arms production, with significant support from <strong style={{ color: "#DC143C" }}>Russia</strong> for strategic gains. Meanwhile, <strong style={{ color: "#D2B48C" }}>India</strong> diversifies its procurement with major imports from Russia, the <strong style={{ color: "#4682B4" }}>US</strong>, and Israel to enhance security.
      </p>

      <p className="custom-paragraph">
        Within NATO, countries like <strong style={{ color: "#D2B48C" }}>Turkey</strong> and <strong style={{ color: "#D2B48C" }}>Germany</strong> balance Western alliances with regional ambitions, similar to <strong style={{ color: "#D2B48C" }}>Saudi Arabia</strong>'s approach to stabilizing its region with Western support. Additionally, <strong style={{ color: "#DC143C" }}>Iran</strong> maintains limited but strategic ties with Russia to assert its influence against Western powers.
      </p>

      <p className="custom-title">
        Geopolitical Shifts
      </p>

      <p className="custom-paragraph">
        <strong>Cold War Era (1947-1991)</strong>: The <strong style={{ color: "#4682B4" }}>US</strong> and <strong style={{ color: "#DC143C" }}>Soviet Union</strong> engaged in proxy wars, driving high arms trade volumes. <button onClick={() => handleYearChange(1970)}>View</button>
      </p>

      <p className="custom-paragraph">
        <strong>Post-Cold War (1991-Present)</strong>: The <strong style={{ color: "#4682B4" }}>US</strong> dominates, exporting to strategic regions, with <strong style={{ color: "#FFD700" }}>China</strong> and <strong style={{ color: "#D2B48C" }}>India</strong> emerging as key players. <button onClick={() => handleYearChange(1993)}>View</button>
      </p>

      <p className="custom-paragraph">
        <strong>Recent Decades (2000s-2020s)</strong>: Middle Eastern and Asia-Pacific tensions drive significant arms trade with <strong style={{ color: "#D2B48C" }}>Saudi Arabia</strong>, <strong style={{ color: "#D2B48C" }}>Israel</strong>, <strong style={{ color: "#D2B48C" }}>Turkey</strong>, <strong style={{ color: "#D2B48C" }}>Japan</strong>, <strong style={{ color: "#D2B48C" }}>South Korea</strong>, and <strong style={{ color: "#D2B48C" }}>Taiwan</strong>. <button onClick={() => handleYearChange(2006)}>View</button>
      </p>
      
      <p className="custom-paragraph">
        <strong>Russia-Ukraine Conflict</strong>: The conflict reshapes trade, with Western nations backing Ukraine and <strong style={{ color: "#DC143C" }}>Russia</strong> facing sanctions. <button onClick={() => handleYearChange(2022)}>View</button>
      </p>
    
      <p className="custom-paragraph">
        <strong>Great Power Competition</strong>: <strong style={{ color: "#4682B4" }}>US</strong>-<strong style={{ color: "#FFD700" }}>China</strong> competition redefines global alliances, with the <strong style={{ color: "#4682B4" }}>US</strong> fortifying Indo-Pacific ties and <strong style={{ color: "#FFD700" }}>China</strong> expanding its influence. <button onClick={() => handleYearChange(2016)}>View</button>
      </p>  

      <div className="chart-container" style={{ width: '80%' }}>
        <ParallelCoordinatesChart selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
      </div>
    </section>
  );
};

export default proxySupport;
