import type { Anime, AnimeStatus, Episode } from "@/types";

/** Flat bilingual shape (as requested): titleEn/titleAr, synopsisEn/synopsisAr, ... */
export interface AnimeDataItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  synopsisEn: string;
  synopsisAr: string;
  genres: string[];
  rating: number;
  episodesCount: number;
  releaseYear: number;
  status: AnimeStatus;
  studioEn: string;
  studioAr: string;
  coverImage: string;
  bannerImage: string;
  trailerUrl: string;
  trending?: boolean;
  episodeTitlesEn: string[];
  episodeTitlesAr: string[];
}

function toEpisodes(item: AnimeDataItem): Episode[] {
  return Array.from({ length: item.episodesCount }, (_, i) => ({
    number: i + 1,
    title: {
      en: item.episodeTitlesEn[i] ?? `Episode ${i + 1}`,
      ar: item.episodeTitlesAr[i] ?? `الحلقة ${i + 1}`,
    },
    duration: "23:40",
    thumbnail: `https://picsum.photos/seed/${item.slug}-ep-${i + 1}/640/360`,
    airedAt: new Date(Date.UTC(item.releaseYear, 0, i + 1)).toISOString(),
  }));
}

/** Adapter: flat bilingual item -> internal Anime model used by all pages. */
export function toAnime(item: AnimeDataItem): Anime {
  return {
    id: item.id,
    slug: item.slug,
    title: { en: item.titleEn, ar: item.titleAr },
    synopsis: { en: item.synopsisEn, ar: item.synopsisAr },
    cover: item.coverImage,
    banner: item.bannerImage,
    rating: item.rating,
    year: item.releaseYear,
    status: item.status,
    genres: item.genres,
    studio: { en: item.studioEn, ar: item.studioAr },
    episodeCount: item.episodesCount,
    trailerUrl: item.trailerUrl,
    trending: item.trending,
    episodes: toEpisodes(item),
  };
}

export const animeData: AnimeDataItem[] = [
  {
    id: "1",
    slug: "attack-on-titan",
    titleEn: "Attack on Titan",
    titleAr: "هجوم العمالقة",
    synopsisEn: "Humanity fights for survival behind walls against giant Titans as Eren Yeager vows to exterminate them all.",
    synopsisAr: "تقاتل البشرية من أجل البقاء خلف الأسوار ضد العمالقة، بينما يقسم إيرين ييغر على إبادتهم جميعاً.",
    genres: ["action", "drama", "fantasy"],
    rating: 9.1,
    episodesCount: 12,
    releaseYear: 2013,
    status: "completed",
    studioEn: "Wit Studio / MAPPA",
    studioAr: "ويت ستوديو / مابا",
    coverImage: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    trailerUrl: "https://www.youtube.com/embed/MGRm4IzK1SQ",
    trending: true,
    episodeTitlesEn: ["To You in 2000 Years", "That Day", "A Dim Light", "Closing Ceremony", "First Battle", "The World She Saw"],
    episodeTitlesAr: ["إليك بعد 2000 عام", "ذلك اليوم", "ضوء خافت", "حفل التخرج", "المعركة الأولى", "العالم الذي رأته"],
  },
  {
    id: "2",
    slug: "demon-slayer",
    titleEn: "Demon Slayer",
    titleAr: "قاتل الشياطين",
    synopsisEn: "Tanjiro joins the Demon Slayer Corps to cure his sister Nezuko and avenge his family.",
    synopsisAr: "ينضم تانجيرو إلى فيلق قاتلي الشياطين لعلاج أخته نيزوكو والانتقام لعائلته.",
    genres: ["action", "adventure", "supernatural"],
    rating: 8.9,
    episodesCount: 12,
    releaseYear: 2019,
    status: "ongoing",
    studioEn: "ufotable",
    studioAr: "يوفوتابل",
    coverImage: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    trailerUrl: "https://www.youtube.com/embed/VQGCKIvZeEw",
    trending: true,
    episodeTitlesEn: ["Cruelty", "Trainer Urokodaki", "Sabito and Makomo", "Final Selection", "My Own Steel", "Swordsman and Demon"],
    episodeTitlesAr: ["القسوة", "المدرب أوروكوداكي", "سابيتو وماكومو", "الاختيار الأخير", "فولاذي الخاص", "السياف والشيطانة"],
  },
  {
    id: "3",
    slug: "naruto-shippuden",
    titleEn: "Naruto Shippuden",
    titleAr: "ناروتو شيبودن",
    synopsisEn: "Naruto returns stronger to protect his village, rescue Sasuke, and become Hokage.",
    synopsisAr: "يعود ناروتو أقوى لحماية قريته وإنقاذ ساسكي وأن يصبح الهوكاجي.",
    genres: ["action", "adventure", "fantasy"],
    rating: 8.7,
    episodesCount: 12,
    releaseYear: 2007,
    status: "completed",
    studioEn: "Pierrot",
    studioAr: "بيرو",
    coverImage: "https://cdn.myanimelist.net/images/anime/1295/91772.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/1295/91772.jpg",
    trailerUrl: "https://www.youtube.com/embed/22R0j8UKRzY",
    trending: false,
    episodeTitlesEn: ["Homecoming", "Akatsuki Moves", "Results of Training", "Jinchuriki of Sand", "Kazekage Stands", "Mission Cleared"],
    episodeTitlesAr: ["العودة للديار", "الأكاتسوكي تتحرك", "نتائج التدريب", "جينشوريكي الرمال", "الكازيكاجي يقف", "اكتملت المهمة"],
  },
  {
    id: "4",
    slug: "one-piece",
    titleEn: "One Piece",
    titleAr: "ون بيس",
    synopsisEn: "Luffy sails the Grand Line with the Straw Hats to find the One Piece and become Pirate King.",
    synopsisAr: "يبحر لوفي في الغراند لاين مع طاقم قبعة القش للعثور على الون بيس وأن يصبح ملك القراصنة.",
    genres: ["action", "adventure", "fantasy"],
    rating: 9.0,
    episodesCount: 12,
    releaseYear: 1999,
    status: "ongoing",
    studioEn: "Toei Animation",
    studioAr: "توي أنيميشن",
    coverImage: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    trailerUrl: "https://www.youtube.com/embed/S8_YwFLCh4U",
    trending: true,
    episodeTitlesEn: ["I Am Luffy", "Enter Zoro", "Morgan vs Luffy", "Luffy's Past", "Mysterious Power", "Desperate Situation"],
    episodeTitlesAr: ["أنا لوفي", "ظهور زورو", "مورغان ضد لوفي", "ماضي لوفي", "قوة غامضة", "وضع يائس"],
  },
  {
    id: "5",
    slug: "jujutsu-kaisen",
    titleEn: "Jujutsu Kaisen",
    titleAr: "جوجوتسو كايسن",
    synopsisEn: "Yuji Itadori swallows a cursed finger and joins Tokyo Jujutsu High to fight curses.",
    synopsisAr: "يبتلع يوجي إيتادوري إصبعاً ملعوناً وينضم إلى ثانوية جوجوتسو في طوكيو لقتال اللعنات.",
    genres: ["action", "supernatural", "drama"],
    rating: 8.8,
    episodesCount: 12,
    releaseYear: 2020,
    status: "ongoing",
    studioEn: "MAPPA",
    studioAr: "مابا",
    coverImage: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    trailerUrl: "https://www.youtube.com/embed/pkKu9hLT-t8",
    trending: true,
    episodeTitlesEn: ["Ryomen Sukuna", "For Myself", "Girl of Steel", "Curse Womb", "Curse Womb Must Die", "After Rain"],
    episodeTitlesAr: ["ريومن سوكونا", "من أجل نفسي", "فتاة فولاذية", "رحم اللعنة", "يجب أن يموت", "بعد المطر"],
  },
  {
    id: "6",
    slug: "my-hero-academia",
    titleEn: "My Hero Academia",
    titleAr: "أكاديمية بطلي",
    synopsisEn: "Quirkless Izuku Midoriya inherits One For All and trains at U.A. High to become a hero.",
    synopsisAr: "يرث إيزوكو ميدوريا عديم القدرة قوة ون فور أول ويتدرب في أكاديمية يو إي ليصبح بطلاً.",
    genres: ["action", "adventure", "sci-fi"],
    rating: 8.5,
    episodesCount: 12,
    releaseYear: 2016,
    status: "ongoing",
    studioEn: "Bones",
    studioAr: "بونز",
    coverImage: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    trailerUrl: "https://www.youtube.com/embed/D5fsh_MN9h4",
    trending: false,
    episodeTitlesEn: ["Izuku Midoriya: Origin", "What It Takes to Be a Hero", "Roaring Muscles", "Start Line", "What I Can Do", "Rage, You Damn Nerd"],
    episodeTitlesAr: ["إيزوكو ميدوريا: الأصل", "ما يلزم لتكون بطلاً", "عضلات تزأر", "خط البداية", "ما يمكنني فعله", "اغضب أيها المهووس"],
  },
  {
    id: "7",
    slug: "death-note",
    titleEn: "Death Note",
    titleAr: "مذكرة الموت",
    synopsisEn: "Light Yagami finds a notebook that kills anyone whose name is written in it, drawing detective L into a deadly game.",
    synopsisAr: "يعثر لايت ياغامي على مذكرة تقتل كل من يُكتب اسمه فيها، فيدخل في لعبة مميتة مع المحقق إل.",
    genres: ["supernatural", "drama", "sci-fi"],
    rating: 9.0,
    episodesCount: 12,
    releaseYear: 2006,
    status: "completed",
    studioEn: "Madhouse",
    studioAr: "مادهاوس",
    coverImage: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    trailerUrl: "https://www.youtube.com/embed/NlJZ-YgAt-c",
    trending: false,
    episodeTitlesEn: ["Rebirth", "Confrontation", "Dealings", "Pursuit", "Tactics", "Unraveling"],
    episodeTitlesAr: ["البعث", "المواجهة", "الصفقات", "المطاردة", "التكتيكات", "التفكك"],
  },
  {
    id: "8",
    slug: "spy-x-family",
    titleEn: "Spy x Family",
    titleAr: "سباي إكس فاميلي",
    synopsisEn: "Spy Loid Forger builds a fake family with assassin Yor and telepath Anya for a secret mission.",
    synopsisAr: "يبني الجاسوس لويد فورجر عائلة مزيفة مع القاتلة يور والقارئة للأفكار آنيا من أجل مهمة سرية.",
    genres: ["action", "adventure", "romance"],
    rating: 8.6,
    episodesCount: 12,
    releaseYear: 2022,
    status: "ongoing",
    studioEn: "Wit Studio / CloverWorks",
    studioAr: "ويت ستوديو / كلوفر ووركس",
    coverImage: "https://cdn.myanimelist.net/images/anime/1446/120927.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/1446/120927.jpg",
    trailerUrl: "https://www.youtube.com/embed/ofXigq9aIpo",
    trending: true,
    episodeTitlesEn: ["Operation Strix", "Secure a Wife", "Prepare for the Interview", "The Prestigious School Interview", "Will They Pass", "The Friendship Scheme"],
    episodeTitlesAr: ["عملية ستريكس", "تأمين زوجة", "الاستعداد للمقابلة", "مقابلة المدرسة المرموقة", "هل سينجحون", "خطة الصداقة"],
  },
];

/** Full Anime list derived from the flat bilingual data. */
export const animeListFromData: Anime[] = animeData.map(toAnime);
