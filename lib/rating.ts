export function getRatingLabel(rating: number | null) {
  switch (rating) {
    case 0:
      return "🚫 절대 가지 말기";
    case 1:
      return "👎 비추";
    case 2:
      return "😕 애매함";
    case 3:
      return "🙂 쏘쏘";
    case 4:
      return "👍 평타";
    case 4.5:
      return "⭐ 추천";
    case 5:
      return "🔥 개추";
    default:
      return "평점 없음";
  }
}
