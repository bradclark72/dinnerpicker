"use client";
import { useEffect, useState } from "react";

export default function SeasonalBackground() {
  const [image, setImage] = useState("");

  useEffect(() => {
    const month = new Date().getMonth() + 1;

    // === Seasonal buckets ===
    const winter = [
      "/seasonal/A_2D_digital_illustration_displays_a_festive_notif.png",
      "/seasonal/A_festive_2D_digital_illustration_features_a_recta.png",
      "/seasonal/7767abf1-691e-43d4-af68-6974993b13fa.png",
    ];

    const spring = [
      "/seasonal/9b9c74ee-6e79-4c11-90e5-1cd980a11aea.png",
      "/seasonal/9e48bcc3-b1ea-46db-85e1-d79031a8030b.png",
      "/seasonal/9f091611-9333-42ae-ad02-9eea0b5545f1.png",
    ];

    const summer = [
      "/seasonal/8c3ec8a2-8aae-4289-bbee-95cb6a1686d6.png",
      "/seasonal/85c20ab9-a04e-4ca3-a1f2-3c6258acb7b7.png",
      "/seasonal/896d1836-1cdc-4ddf-ae04-0d7edcd03c49.png",
    ];

    const fall = [
      "/seasonal/a9182dc1-bbcc-4398-89ba-91c3fe16222c.png",
      "/seasonal/a7183bf5-bbfc-4900-a6e6-ad67e90ae63c.png",
      "/seasonal/a2d8258e-2a7b-435d-8bbc-3ffb7b09925e.png",
    ];

    const backup = [
      "/seasonal/ebf53160-29fc-4f04-81ff-9bd125a1a449.png",
      "/seasonal/f5e00d69-9a10-4f18-85ac-7687f11c17a7.png",
      "/seasonal/f9f2334d-d048-4f40-a86a-6651cca23075.png",
      "/seasonal/233b7eee-9cd5-4d6f-88c8-829325b92872.png",
      "/seasonal/A_2D_digital_graphic_design_features_a_rectangular.png",
      "/seasonal/A_digital_graphic_design_showcases_a_rectangular_c.png",
    ];

    // === Holiday override (Dec 20–31) ===
    const today = new Date();
    if (today.getMonth() === 11 && today.getDate() >= 20) {
      setImage(winter[Math.floor(Math.random() * winter.length)]);
      return;
    }

    // === Seasonal logic ===
    let selectedSeason: string[] = backup;

    if (month === 12 || month <= 2) selectedSeason = winter;
    else if (month >= 3 && month <= 5) selectedSeason = spring;
    else if (month >= 6 && month <= 8) selectedSeason = summer;
    else if (month >= 9 && month <= 11) selectedSeason = fall;

    const chosen = selectedSeason[Math.floor(Math.random() * selectedSeason.length)];
    setImage(chosen);
  }, []);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
      style={{
        backgroundImage: `url(${image})`,
      }}
    />
  );
}
