export function getSeasonalBackground(): string {
    const now = new Date();
    const month = now.getMonth() + 1; // 1–12
    const day = now.getDate();
  
    // 🎄 December 1–31
    if (month === 12) return "/seasonal/christmas.png";
  
    // 🎆 New Years — Jan 1–7
    if (month === 1 && day <= 7) return "/seasonal/newyears.png";
  
    // ❄ Winter — Jan 8 to Feb 28
    if (month === 1 || month === 2) return "/seasonal/winter.png";
  
    // 🐣 Easter — March 15 to April 15
    if ((month === 3 && day >= 15) || (month === 4 && day <= 15))
      return "/seasonal/easter.png";
  
    // 🌸 Spring — April 16 to May 31
    if (month === 4 || month === 5) return "/seasonal/spring.png";
  
    // 🌞 Summer — June 1 to Aug 31
    if (month >= 6 && month <= 8) return "/seasonal/summer.png";
  
    // 🎃 Halloween — Oct 1–31
    if (month === 10) return "/seasonal/halloween.png";
  
    // 🍂 Fall — Sept 1 to Nov 30
    if (month >= 9 && month <= 11) return "/seasonal/fall.png";
  
    // Default (should never be hit)
    return "/seasonal/default.png";
  }
  