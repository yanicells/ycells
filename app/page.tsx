import AppDirectory from "@/components/apps/AppDirectory";
import { MineralBackdrop } from "@/components/apps/MineralBackdrop";

export default function Home() {
  return (
    <div className="home-page">
      <MineralBackdrop />
      <AppDirectory />
    </div>
  );
}
