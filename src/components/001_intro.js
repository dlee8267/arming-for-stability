import React, { useState } from 'react';
import DefenseExpenditureMap from './graphs/001_DefenseExpenditureMap';
import GunBarChart from './graphs/001_animatedExportBarChart';

const intro = () => {
  return (
    <section id="001">
      <p className="custom-title" style={{cssText: 'margin-top: 0'}}>
          Introduction
      </p>

      <p className="custom-paragraph">
          The <span style={{ color: '#4682B4' }}>United States</span> has strategically leveraged arms exports as a tool to strengthen alliances, deter adversaries, and advance its geopolitical goals. 
          Spanning decades, U.S. arms exports surged during key moments such as the <em style={{ color: 'orange' }}>Cold War</em>, the <em style={{ color: 'orange' }}>War on Terror</em>, and recent conflicts like the <em style={{ color: 'orange' }}>Russia-Ukraine War</em>, shaping global power dynamics. 
          The chart below, illustrating U.S. arms exports in billions, demonstrates how these trades align with major geopolitical events, reflecting their role as an integral part of broader <em style={{ color: 'orange' }}>geopolitical strategy</em>. 
          More than economic transactions, arms exports function as extensions of diplomacy within the <em style={{ color: 'orange' }}>Diplomatic, Informational, Military, and Economic (DIME)</em> framework to promote stability, counter adversaries, and serve national interests.
      </p>


      <div className="chart-container" style={{width: '80%'}}>
        <GunBarChart />
      </div>

      <p className="custom-title">
          Illustrative Case: The Indo-Pacific as a New Geopolitical Center of Gravity
      </p>
      
      <p className="custom-paragraph">
          As you slide through the year selector, it becomes clear that <span style={{ color: '#FFDB58' }}>China </span> 
          has steadily increased its defense budget since the late 1990s and early 2000s, surpassing <span style={{ color: '#DC143C' }}>Russia </span> 
          and signaling its ambitions for military modernization and expanded influence, particularly in the Indo-Pacific region. 
          In response, Indo-Pacific nations have also significantly increased their defense spending, bolstering military capabilities to address regional security concerns and counterbalance 
          <span style={{ color: '#FFDB58' }}> China's </span> growing presence.
      </p> 

      <div className="chart-container" style={{width: '80%'}}>
        <DefenseExpenditureMap />
      </div>
      
    </section>
  );
};

export default intro;
