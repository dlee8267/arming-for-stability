import React, { useState } from 'react';
import ChoroplethMap from './graphs/005_WeaponTypeChoroplethMap';
import ZoomableCirclePacking from './graphs/005_WeaponTypeZCP';

const emergingThreats = () => {
  return (
    <section id="005">
      <p className="custom-title" style={{ cssText: 'margin-top: 0' }}>
        Preparing Allies for Emerging Threats
      </p>

      <p className="custom-paragraph">
        <span style={{ color: '#4682B4', fontWeight: 'bold' }}>The United States</span> strengthens regional defense by empowering allies, reducing the need for an extensive US military presence. Equipped with advanced weaponry from the US, allies like <span style={{ color: '#D2B48C', fontWeight: 'bold' }}>Taiwan</span>, <span style={{ color: '#D2B48C', fontWeight: 'bold' }}>Japan</span>, <span style={{ color: '#D2B48C', fontWeight: 'bold' }}>South Korea</span>, and the <span style={{ color: '#D2B48C', fontWeight: 'bold' }}>Philippines</span> bolster their capabilities to counter regional threats independently. This <em style={{ color: 'orange', fontWeight: 'bold' }}>Building Partner Capacity</em> strategy has become even more significant amid rising South China Sea tensions, where US support to countries like the <span style={{ color: '#D2B48C', fontWeight: 'bold' }}>Philippines</span>, <span style={{ color: '#D2B48C', fontWeight: 'bold' }}>Malaysia</span>, <span style={{ color: '#D2B48C', fontWeight: 'bold' }}>Brunei</span>, and <span style={{ color: '#D2B48C', fontWeight: 'bold' }}>Indonesia</span> is crucial in deterring China's territorial ambitions.
      </p>

      <p className="custom-title">
        Exploring the Arms Trade Dynamic
      </p>

      <p className="custom-paragraph">
        To explore this dynamic, use the Choropleth Map and Pie Chart to examine key years when South China Sea tensions escalated. By selecting years like <em style={{ color: 'orange', fontWeight: 'bold' }}>2010-2020</em>, you can observe a noticeable rise in US arms imports by Asian allies and an increase in total arms trade in the Asia-Oceania region. This interactive view reveals the correlation between heightened regional disputes and the strategic arms support provided by the <span style={{ color: '#4682B4', fontWeight: 'bold' }}>US</span>
      </p>

      <div className="chart-container" style={{ width: '80%' }}>
        <ChoroplethMap />
      </div>

      <p className="custom-title">
        Breakdown of Weapon Transfers by Category 
      </p>

      <p className="custom-paragraph">
        Missiles, aircraft, and other advanced weaponry dominate US exports, reflecting regional priorities and threats. This breakdown shows how arms transfers align with geopolitical objectives.
      </p>
      
      <ul>
        <li>The <span style={{ color: "#4682B4" }}>United States</span> supports countries in <span style={{ fontStyle: "italic" }}>Europe, the Middle East, and Asia-Pacific</span>, reinforcing a defense line against rivals.</li><br/>
        <li><span style={{ color: "#DC143C" }}>Russia </span> supplies nations in <span style={{ fontStyle: "italic" }}>Eastern Europe and Central Asia</span> to counter NATO's reach.</li><br/>
        <li><span style={{ color: "#FFD700" }}>China</span> arms countries in <span style={{ fontStyle: "italic" }}>Southeast Asia, Africa, and South Asia</span>, expanding its foothold in resource-rich areas.</li><br/>
        <li>Countries like <span style={{ color: "#D2B48C" }}>India</span> illustrate a multilateral approach, balancing relationships with the US, Russia, and others.</li><br/>
      </ul> 

      <p className="custom-paragraph">
        Through this network, arms transfers reveal interdependent alliances, bolstered influence, and efforts to contain rivals.
      </p>

      <div className="chart-container" style={{ width: '80%' }}>
        <ZoomableCirclePacking />
      </div>

    </section>
  );
};

export default emergingThreats;
