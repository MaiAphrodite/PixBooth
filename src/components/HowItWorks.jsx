const imgVector = "https://www.figma.com/api/mcp/asset/c276aff5-d777-47ff-ba31-19413e51645a";
const imgVector1 = "https://www.figma.com/api/mcp/asset/84eef450-92a7-4db9-a745-5392a0b8f5e7";
const imgVector2 = "https://www.figma.com/api/mcp/asset/35d88bf1-26eb-40e2-b961-a476f38f59bc";

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <h2>How it Works?</h2>
      <div className="cards">
        <div className="card-item">
          <img src={imgVector} alt="Search icon" className="card-icon" />
          <h3>Search & Click PIXBOOTH Website</h3>
          <p>Tidak perlu aplikasi – cukup buka link pixbooth.io dan kamu langsung siap beraksi.</p>
        </div>
        <div className="card-item">
          <img src={imgVector1} alt="Camera icon" className="card-icon" />
          <h3>Take Photos Instantly in Your Browser</h3>
          <p>Pilih filter kece, template keren, dan mulai berpose sesukamu!</p>
        </div>
        <div className="card-item">
          <img src={imgVector2} alt="Share icon" className="card-icon" />
          <h3>Instant Results, Ready to Share</h3>
          <p>Foto langsung tersimpan di galeri digital dan bisa kamu unduh atau bagikan via QR code.</p>
        </div>
      </div>
      <p className="how-foot">Fast, Fun, and Effortless!</p>
    </section>
  );
}
