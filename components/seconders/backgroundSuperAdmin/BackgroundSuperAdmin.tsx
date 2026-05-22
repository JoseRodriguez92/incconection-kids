import "./index.css";

export default function BackgroundSuperAdmin() {
  return (
    <div className="background-superAdmin opacity-35">
      <video
        src="../backgroundVideos/background.mp4"
        style={{ height: "auto", width: "auto", maxWidth: "none" }}
        autoPlay
        muted
        loop
      />
    </div>
  );
}
