import React from 'react';
import MigrationMap from './graphs/003_MigrationMap';
import ForceDirectedGraph from './graphs/003_ForceDirectedGraph';
import WorldChord from './graphs/003_WorldChord';

const alliance = () => {
  return (
    <section id="003">
      <p className="custom-title" style={{ cssText: 'margin-top: 0' }}>
        Strength in Alliance & Partnership
      </p>

      <p className="custom-paragraph">
        The <span style={{ color: "#4682B4" }}>United States</span> uses arms exports strategically to build alliances and shape regional power dynamics, especially against major powers like 
        <span style={{ color: "#DC143C" }}> Russia</span> and <span style={{ color: "#FFDB58" }}>China</span>. 
        By equipping allies in key areas—such as <span style={{ color: "#D2B48C" }}>Eastern Europe</span>, <span style={{ color: "#D2B48C" }}>the Middle East</span>, and <span style={{ color: "#D2B48C" }}>Asia-Pacific</span>—the <span style={{ color: "#4682B4" }}>United States</span> bolsters defense, deters aggression, and strengthens long-term partnerships. 
        These alliances, supported by advanced weaponry, create a coordinated front that counters <span style={{ color: "#FFDB58" }}>China's</span> and <span style={{ color: "#DC143C" }}>Russia's</span> influence.
      </p>

      <p className="custom-paragraph">
        In contrast, <span style={{ color: "#DC143C" }}>Russia</span> and <span style={{ color: "#FFDB58" }}>China</span> use arms transfers to establish footholds in their own spheres, particularly in the <span style={{ color: "#D2B48C" }}>Middle East</span>, <span style={{ color: "#D2B48C" }}>Africa</span>, and <span style={{ color: "#D2B48C" }}>Southeast Asia</span>. 
        This distribution evidences an effort by the <span style={{ color: "#4682B4" }}>US</span>, <span style={{ color: "#FFDB58" }}> China</span>, and <span style={{ color: "#DC143C" }}>Russia</span> to expand their spheres of influence or contain each other.
      </p>

      <p className="custom-paragraph">
        A quick case study, as shown on the map, highlights a significant increase in <span style={{ color: "#FFDB58" }}>China's</span> arms trade with <span style={{ color: "#D2B48C" }}>Africa</span> prior to the initiation of the Belt and Road Initiative, which officially started in 2013. This emphasizes China's broader geopolitical strategy of leveraging arms trade to secure access to resources and establish influence in developing regions.
      </p>
      
      <div className="chart-container" style={{ width: '80%' }}>
        <WorldChord />
      </div>

      <p className="custom-title">
        An Alternative Way to Visualize International Relations: Force Directed Graph 
      </p>

      <p className="custom-paragraph">
        This Global Arms Trade Network further illustrates a complex geopolitical chessboard where the <span style={{ color: "#4682B4" }}>United States</span>, <span style={{ color: "#DC143C" }}>Russia</span>, and <span style={{ color: "#FFDB58" }}>China </span>
        use arms exports to expand influence and secure alliances across strategic regions. Each superpower’s network centers around key allies:
      </p>
      
      <ul>
        <li>
          The <span style={{ color: "#4682B4" }}>United States</span> supports countries in 
          <span style={{ color: "#D2B48C", fontStyle: "italic" }}> Europe, the Middle East, and Asia-Pacific</span>, reinforcing a defense line against rivals.
        </li><br/>
        <li>
          <span style={{ color: "#DC143C" }}>Russia</span> supplies nations in 
          <span style={{ color: "#D2B48C", fontStyle: "italic" }}> Eastern Europe and Central Asia</span> to counter NATO's reach.
        </li><br/>
        <li>
          <span style={{ color: "#FFDB58" }}>China</span> arms countries in 
          <span style={{ color: "#D2B48C", fontStyle: "italic" }}> Southeast Asia, Africa, and South Asia</span>, expanding its foothold in resource-rich areas.
        </li><br/>
        <li>
          Countries like <span style={{ color: "#FF671F" }}>India</span> illustrate a multilateral approach, balancing relationships with the <span style={{ color: "#4682B4" }}>US</span>, <span style={{ color: "#DC143C" }}>Russia</span>, and others.
        </li>
      </ul> 

      <p className="custom-paragraph">    
        Through this network, arms transfers reveal interdependent alliances, bolstered influence, and efforts to contain rivals. The map underscores how arms exports are not just about military strength but also about shaping the strategic relationships that define the global order.
      </p>

      <div className="chart-container" style={{ width: '80%' }}>
        <ForceDirectedGraph />
      </div>
    </section>
  );
};

export default alliance;
