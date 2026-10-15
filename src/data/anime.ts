import type { Anime, Genre } from "@/types";

export const genres: Genre[] = [
  { key: "action", label: { en: "Action", ar: "أكشن" } },
  { key: "adventure", label: { en: "Adventure", ar: "مغامرات" } },
  { key: "fantasy", label: { en: "Fantasy", ar: "فانتازيا" } },
  { key: "drama", label: { en: "Drama", ar: "دراما" } },
  { key: "romance", label: { en: "Romance", ar: "رومانسي" } },
  { key: "sci-fi", label: { en: "Sci-Fi", ar: "خيال علمي" } },
  { key: "supernatural", label: { en: "Supernatural", ar: "خارق للطبيعة" } },
];

function buildEpisodes(count: number, animeIndex: number): Anime["episodes"] {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    title: {
      en: `Episode ${i + 1}`,
      ar: `الحلقة ${i + 1}`,
    },
    duration: "23:40",
    thumbnail: `https://picsum.photos/seed/anime-${animeIndex}-ep-${i + 1}/640/360`,
    airedAt: new Date(Date.UTC(2024, 0, i + 1)).toISOString(),
  }));
}

const raw: Array<Omit<Anime, "episodes"> & { total: number }> = [
  {
    id: "1",
    slug: "neon-ronin",
    title: { en: "Neon Ronin", ar: "رونين النيون" },
    synopsis: {
      en: "In a neon-drenched megacity, a disgraced swordsman takes one last job escorting a mysterious girl hunted by rival syndicates.",
      ar: "في مدينة ضخمة تغمرها أضواء النيون، يقبل سيافٌ مشين مهمة أخيرة لمرافقة فتاة غامضة تطاردها عصابات متناحرة.",
    },
    cover: "https://picsum.photos/seed/neon-ronin-cover/480/720",
    banner: "https://picsum.photos/seed/neon-ronin-banner/1600/700",
    rating: 9.1,
    year: 2024,
    status: "ongoing",
    genres: ["action", "sci-fi"],
    studio: { en: "Studio Hikari", ar: "استوديو هيكاري" },
    episodeCount: 12,
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    trending: true,
    total: 12,
  },
  {
    id: "2",
    slug: "starfall-odyssey",
    title: { en: "Starfall Odyssey", ar: "أوديسا الشهب" },
    synopsis: {
      en: "A crew of sky-sailors chases falling stars across floating islands to restore the dying light of their world.",
      ar: "يطارد طاقم من بحارة السماء الشهب المتساقطة عبر جزر عائمة لاستعادة نور عالمهم المحتضر.",
    },
    cover: "https://picsum.photos/seed/starfall-cover/480/720",
    banner: "https://picsum.photos/seed/starfall-banner/1600/700",
    rating: 8.7,
    year: 2023,
    status: "completed",
    genres: ["adventure", "fantasy"],
    studio: { en: "Aurora Works", ar: "أورورا ووركس" },
    episodeCount: 24,
    trending: true,
    total: 24,
  },
  {
    id: "3",
    slug: "whispering-blades",
    title: { en: "Whispering Blades", ar: "السيوف الهامسة" },
    synopsis: {
      en: "Two rival sword schools must unite when an ancient spirit awakens beneath the capital.",
      ar: "يجب على مدرستين متنافستين للمبارزة أن تتحدا عندما يستيقظ روح قديمة تحت العاصمة.",
    },
    cover: "https://picsum.photos/seed/whisper-cover/480/720",
    banner: "https://picsum.photos/seed/whisper-banner/1600/700",
    rating: 8.9,
    year: 2024,
    status: "ongoing",
    genres: ["action", "drama", "supernatural"],
    studio: { en: "Kage Films", ar: "كاجي فيلمز" },
    episodeCount: 12,
    trending: true,
    total: 12,
  },
  {
    id: "4",
    slug: "paper-moons",
    title: { en: "Paper Moons", ar: "أقمار ورقية" },
    synopsis: {
      en: "A shy bookbinder and a bold astronomer exchange letters that slowly rewrite both of their futures.",
      ar: "يتبادل مُجلّد كتب خجول وعالمة فلك جريئة رسائل تُعيد ببطء كتابة مستقبليهما.",
    },
    cover: "https://picsum.photos/seed/paper-moons-cover/480/720",
    banner: "https://picsum.photos/seed/paper-moons-banner/1600/700",
    rating: 8.4,
    year: 2022,
    status: "completed",
    genres: ["romance", "drama"],
    studio: { en: "Studio Tayf", ar: "استوديو طيف" },
    episodeCount: 13,
    total: 13,
  },
  {
    id: "5",
    slug: "iron-bloom",
    title: { en: "Iron Bloom", ar: "زهرة الحديد" },
    synopsis: {
      en: "A mechanic girl discovers a seed that grows machines — and a corporation that will kill to own it.",
      ar: "تكتشف فتاة ميكانيكية بذرة تُنبت الآلات — وشركة مستعدة للقتل لامتلاكها.",
    },
    cover: "https://picsum.photos/seed/iron-bloom-cover/480/720",
    banner: "https://picsum.photos/seed/iron-bloom-banner/1600/700",
    rating: 8.8,
    year: 2025,
    status: "ongoing",
    genres: ["sci-fi", "action", "drama"],
    studio: { en: "Forge Animation", ar: "فورج أنيميشن" },
    episodeCount: 12,
    trending: true,
    total: 12,
  },
  {
    id: "6",
    slug: "spirit-ramen",
    title: { en: "Spirit Ramen", ar: "رامن الأرواح" },
    synopsis: {
      en: "A late-night ramen shop serves both humans and spirits — every bowl comes with a story.",
      ar: "يقدّم مطعم رامن ليلي الطعام للبشر والأرواح معاً — وكل وعاء يحمل قصة.",
    },
    cover: "https://picsum.photos/seed/spirit-ramen-cover/480/720",
    banner: "https://picsum.photos/seed/spirit-ramen-banner/1600/700",
    rating: 8.2,
    year: 2023,
    status: "completed",
    genres: ["fantasy", "drama"],
    studio: { en: "Lantern House", ar: "بيت الفانوس" },
    episodeCount: 12,
    total: 12,
  },
];

export const animeList: Anime[] = raw.map((a, index) => ({
  ...a,
  episodes: buildEpisodes(a.total, index),
}));

export function getAnimeBySlug(slug: string): Anime | undefined {
  return animeList.find((a) => a.slug === slug);
}

export function getTrending(): Anime[] {
  return animeList.filter((a) => a.trending);
}

export function getLatest(limit = 8): Anime[] {
  return [...animeList].sort((a, b) => b.year - a.year).slice(0, limit);
}
