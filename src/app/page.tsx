import HeatmapLayout from "~components/heatmap/HeatmapLayout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Florida New Construction — Sales Activity",
};

const HomePage: React.FC = () => {
  return <HeatmapLayout />;
};

export default HomePage;
