const imgEmpowerYourTeam11 = "https://www.figma.com/api/mcp/asset/9dde9f20-650f-4e9f-b862-7387a27eb54f";

import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero" data-node-id="42:51">
      <div className="hero-copy">
        <p className="eyebrow">Capture Every Moment,</p>
        <h1>Anywhere.</h1>
        <p className="sub"><strong>PIX-BOOTH:</strong> A modern photo booth platform for events, parties, and everyday fun.</p>
          <Link className="start-btn" to="/layout">Start Booth</Link>
      </div>
      <div className="hero-art" aria-hidden="true">
        <img src={imgEmpowerYourTeam11} alt="Decorative camera preview" />
      </div>
    </section>
  );
}
