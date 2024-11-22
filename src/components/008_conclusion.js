import React from 'react';
import ConflictDotMap from './graphs/008_ConflictDotMap';

const conclusion = () => {
  return (
    <section id="008">
      <p className="custom-title" style={{ cssText: 'margin-top: 0' }}>
        Conclusion
      </p>

      <p className="custom-paragraph">
        The world is not getting safer. The <span style={{ color: "#FF7F50" }}>Global Conflict Map</span> below highlights conflict distribution across decades, showcasing shifts in hotspots and their correlation with geopolitical changes. These trends reflect the evolving nature of global conflicts and the strategic influence of major players like the <span style={{ color: "#4682B4" }}>United States</span>.
      </p>

      <div className="chart-container" style={{ width: '80%' }}>
        <ConflictDotMap />
      </div>

      <p className="custom-paragraph">
        <strong>Key Insights:</strong>
        <ul style={{ margin: "1em 0", paddingLeft: "1.5em" }}>
          <li><span style={{ color: "#FF7F50" }}>1950s–1960s:</span> Concentrated in <span style={{ color: "#D2B48C" }}>East and Southeast Asia</span>, driven by Cold War proxy wars (e.g., <span style={{ fontStyle: "italic" }}>Korean War</span>, <span style={{ fontStyle: "italic" }}>Vietnam War</span>).</li>
          <li><span style={{ color: "#FF7F50" }}>1970s:</span> Increased conflicts in <span style={{ color: "#D2B48C" }}>Africa</span> and the <span style={{ color: "#D2B48C" }}>Middle East</span> (e.g., <span style={{ fontStyle: "italic" }}>Yom Kippur War</span>), while Southeast Asia remained active.</li>
          <li><span style={{ color: "#FF7F50" }}>1980s:</span> Spread to <span style={{ color: "#D2B48C" }}>Central America</span>, intensified in <span style={{ color: "#D2B48C" }}>Africa</span> (post-colonial struggles), and in the <span style={{ color: "#D2B48C" }}>Middle East</span> (e.g., <span style={{ fontStyle: "italic" }}>Iran-Iraq War</span>).</li>
          <li><span style={{ color: "#FF7F50" }}>1990s:</span> Shifts to <span style={{ color: "#D2B48C" }}>Eastern Europe</span> (e.g., <span style={{ fontStyle: "italic" }}>Yugoslav Wars</span>) and the <span style={{ color: "#D2B48C" }}>Middle East</span> (e.g., <span style={{ fontStyle: "italic" }}>Gulf War</span>) after the Cold War.</li>
          <li>
            <span style={{ color: "#FF7F50" }}>2010s:</span> Predominantly in the <span style={{ color: "#D2B48C" }}>Middle East</span> (e.g., <span style={{ fontStyle: "italic" }}>Syrian Civil War</span>, <span style={{ fontStyle: "italic" }}>Yemen</span>) and <span style={{ color: "#D2B48C" }}>Africa</span> (e.g., <span style={{ fontStyle: "italic" }}>Boko Haram</span>, <span style={{ fontStyle: "italic" }}>South Sudan</span>), alongside the <span style={{ fontStyle: "italic" }}>US Wars on Global Terrorism</span> (e.g., <span style={{ color: "#D2B48C" }}>Iraq</span> and <span style={{ color: "#D2B48C" }}>Afghanistan</span>).
          </li>
          <li>
            <span style={{ color: "#FF7F50" }}>2020s:</span> Marked by the <span style={{ fontStyle: "italic" }}>Russia-Ukraine</span> conflict, which has reshaped security dynamics in <span style={{ color: "#D2B48C" }}>Eastern Europe</span> and intensified global tensions.
          </li>
        </ul>
      </p>

      <p className="custom-paragraph">
        The <span style={{ color: "#4682B4" }}>United States</span> has strategically used arms exports to build alliances, counter rivals like <span style={{ color: "#DC143C" }}>Russia</span> and <span style={{ color: "#FFDB58" }}>China</span>, and maintain global dominance. By fortifying allies in <span style={{ fontStyle: "italic" }}>Europe, the Middle East, and Asia-Pacific</span>, the <span style={{ color: "#4682B4" }}>US</span> ensures regional stability while projecting power globally. The conflict hotspots on the <span style={{ color: "#FF7F50" }}>Global Conflict Map</span> correlate with top countries supported by the <span style={{ color: "#4682B4" }}>US</span> or major importers of its weapons, as shown on the <span style={{ color: "#FF7F50" }}>Top Arms Trade chart</span> in the <span style={{ fontStyle: "italic", fontWeight: "bold" }}>Countering through Proxy Support</span> section.
      </p>

      
    </section>
  );
};

export default conclusion;
