
const generateAvatar = (gender) => {
  const seed = Math.random().toString(36).substring(2, 15);

  // DiceBear v9.x avatar styles with clear gender differentiation
  // "avataaars" - has diverse options
  // "croodles" - has gender variations
  // "big-smile" - gender-aware style
  // Using distinct styles for better visual differentiation
  let style;
  
  if (gender === "female") {
    style = "croodles"; // Feminine style avatar
  } else if (gender === "male") {
    style = "avataaars"; // Masculine style avatar
  } else {
    style = "bottts"; // Fallback neutral style
  }

  return `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=200&scale=80&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

module.exports = generateAvatar;
