import React, { useState } from 'react';
import JetAnimation from './graphs/007_JetAnimation';
import StackedBarChart from './graphs/007_ImportStackedBarChart';

const taiwan = () => {
  return (
    <section id="007">
      <p className="custom-title" style={{cssText: 'margin-top: 0'}}>
        Case Study: Taiwan
      </p>

      <p className="custom-paragraph">
        As illustrated in the previous chapters, the SIPRI dataset keeps a detailed record of arms transfers, which include many monumental <span style={{ color: '#4682B4' }}>US</span> arms sales to its allies.
      </p>

      <p className="custom-paragraph">
        In 1992, <span style={{ color: '#4682B4' }}>US</span> President George H.W. Bush approved the sale of 150 F-16 fighter jets to <span style={{ color: '#44982A' }}>Taiwan</span>
      </p>

      <div className="chart-container" style={{width: '80%', border: '3px solid #e74c3c', borderRadius: '8px' }}>
        <JetAnimation />
      </div>

      <p className="custom-title">
        Arms Trades and Major Historical Events
      </p>

      <p className="custom-paragraph">
        In the stacked barchart below, we can see that the <span style={{ color: '#4682B4' }}>United States'</span> weapon exports to <span style={{ color: '#44982A' }}>Taiwan</span> coincide with major historical events:
      </p>

      <div className="chart-container" style={{width: '80%'}}>
      <StackedBarChart />
      </div>
      
      <ul style={{cssText: 'margin-top: 1.5rem'}}>
        <li>First (1954 - 1955) and second (1958) Taiwan Strait Crisis</li><br />
        <li>Rise of China (early 1990s) and the third Taiwan Strait Crisis (1996)</li><br />
        <li>China's shift in foreign policy (early 2010s)</li><br />
      </ul>
      
    </section>
  );
};

export default taiwan;
