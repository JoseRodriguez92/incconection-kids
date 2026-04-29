import "./index.css";
import UnicornScene from "unicornstudio-react/next";

export default function BackgroundSuperAdmin() {
  return (
    <div className="background-superAdmin opacity-35">
      {/* <UnicornScene projectId="x7AfXFUohPvkHfWymJKl" /> */}
      <video
        src="../backgroundVideos/background.mp4"
        style={{ height: "100dvh", width: "auto", maxWidth: "fit-content" }}
        autoPlay
        muted
        loop
      ></video>
    </div>
  );
}
