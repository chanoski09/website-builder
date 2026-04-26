const ENCOURAGEMENTS = {
  en: [
    "You're doing amazing! Keep pushing forward! 🌟",
    "Every question you answer brings you closer to your dream! 🇺🇸",
    "Fantastic effort! You're going to ace that test! 💪",
    "Believe in yourself — you've got this! ✨",
    "Great job today! Your hard work is paying off! 🎯",
    "You're on the path to becoming a citizen! Keep going! 🗽",
    "Incredible dedication! The finish line is near! 🏆",
    "Practice makes perfect — and you're proving it! 🔥",
    "You should be proud of how far you've come! 🌈",
    "One step closer to your American dream! 🎉",
  ],
  es: [
    "¡Lo estás haciendo increíble! ¡Sigue adelante! 🌟",
    "¡Cada pregunta te acerca más a tu sueño! 🇺🇸",
    "¡Esfuerzo fantástico! ¡Vas a pasar ese examen! 💪",
    "Cree en ti mismo — ¡tú puedes! ✨",
    "¡Gran trabajo hoy! ¡Tu esfuerzo está dando frutos! 🎯",
    "¡Estás en camino a ser ciudadano! ¡Sigue así! 🗽",
    "¡Dedicación increíble! ¡La meta está cerca! 🏆",
    "La práctica hace al maestro — ¡y lo estás demostrando! 🔥",
    "¡Deberías estar orgulloso de lo lejos que has llegado! 🌈",
    "¡Un paso más cerca de tu sueño americano! 🎉",
  ],
  vi: [
    "Bạn đang làm tuyệt vời! Hãy tiếp tục! 🌟",
    "Mỗi câu hỏi đưa bạn gần hơn đến giấc mơ! 🇺🇸",
    "Nỗ lực tuyệt vời! Bạn sẽ vượt qua bài kiểm tra! 💪",
    "Hãy tin vào bản thân — bạn làm được! ✨",
    "Làm tốt lắm hôm nay! Sự chăm chỉ đang được đền đáp! 🎯",
    "Bạn đang trên đường trở thành công dân! Tiếp tục nào! 🗽",
    "Sự cống hiến đáng kinh ngạc! Đích đến đã gần! 🏆",
    "Thực hành tạo nên hoàn hảo — và bạn đang chứng minh điều đó! 🔥",
    "Bạn nên tự hào về những gì đã đạt được! 🌈",
    "Thêm một bước gần hơn giấc mơ Mỹ! 🎉",
  ],
};

export function getRandomEncouragement(lang = 'en') {
  const phrases = ENCOURAGEMENTS[lang] || ENCOURAGEMENTS.en;
  return phrases[Math.floor(Math.random() * phrases.length)];
}