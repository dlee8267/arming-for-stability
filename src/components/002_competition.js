import React, { useState } from 'react';
import ImportExportLinechart from './graphs/002_ImportExportLinechart';

const competition = () => {
  return (
    <section id="002">
      <p className="custom-title" style={{cssText: 'margin-top: 0'}}>
        Competition in Strategic Regions
      </p>

      <p className="custom-paragraph">
          The global arms trade has shifted from a US-Soviet rivalry to a multipolar competition, 
          with <span style={{ color: "#FFDB58" }}>China</span> joining the <span style={{ color: "#4682B4" }}>US</span> and <span style={{ color: "#DC143C" }}>Russia</span> as key players. 
          Each nation’s influence is shaped by historical events, alliances, and economic factors, impacting global security dynamics.<br/>
      </p>

      <ul>
        <li><span style={{ color: "#e74c3c" }}>Cold War Era (1947-1991)</span> The <span style={{ color: "#4682B4" }}>US</span> and <span style={{ color: "#DC143C" }}>Soviet Union</span> dominated arms exports, each supporting allies to extend ideological influence.</li><br />
        <li><span style={{ color: "#e74c3c" }}>Post-Cold War Shift (1991-2000)</span> With the <span style={{ color: "#DC143C" }}>Soviet Union’s</span> collapse, the <span style={{ color: "#4682B4" }}>US</span> emerged as the top arms exporter, backed by a strong economy and stable alliances.</li><br />
        <li><span style={{ color: "#e74c3c" }}>Russia’s Resurgence (Early 2000s)</span> Under Putin, <span style={{ color: "#DC143C" }}>Russia</span> rebuilt its defense industry, regaining clients with affordable options like the S-400.</li><br />
        <li><span style={{ color: "#e74c3c" }}>China’s Rise (2000s-Present)</span> <span style={{ color: "#FFDB58" }}>China</span> entered the market, offering affordable alternatives to Western and Russian arms, appealing to regions like Africa and Southeast Asia. The Belt and Road initiative and a non-interference policy further bolstered <span style={{ color: "#FFDB58" }}>China’s</span> appeal.</li><br />
        <li><span style={{ color: "#e74c3c" }}>China Surpasses Russia (2022)</span> In 2022, <span style={{ color: "#FFDB58" }}>China</span> became the second-largest arms exporter as <span style={{ color: "#DC143C" }}>Russia</span> faced challenges due to the Ukraine conflict and Western sanctions.</li><br />
      </ul> 

      <div className="chart-container" style={{width: '80%'}}>
        <ImportExportLinechart />
      </div>

      <p className="custom-title">
        Global Implications
      </p>

      <p className="custom-paragraph">
        The arms trade now includes three key exporters with distinct strategies:
      </p>

      <ul>
        <li>The <span style={{ color: "#4682B4" }}>US</span> leads in high-tech systems for wealthy allies.</li><br />
        <li><span style={{ color: "#DC143C" }}>Russia</span> faces limitations due to sanctions and internal demands.</li><br />
        <li><span style={{ color: "#FFDB58" }}>China</span> offers affordable, flexible options to budget-conscious nations. Its rapid rise signals ambitions to reshape global power dynamics economically and militarily, adding complexity to global security.</li><br />
      </ul>
    </section>
  );
};

export default competition;
