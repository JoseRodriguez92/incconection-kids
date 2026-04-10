import "./index.css";
import UnicornScene from "unicornstudio-react/next";

export default function BackgroundSuperAdmin() {
  return (
    <div className="background-superAdmin opacity-35">
      {/* <UnicornScene projectId="x7AfXFUohPvkHfWymJKl" /> */}
      <video
        src="../backgroundVideos/background.mp4"
        style={{ width: "100%" }}
        autoPlay
        muted
        loop
      ></video>
    </div>
  );
}
