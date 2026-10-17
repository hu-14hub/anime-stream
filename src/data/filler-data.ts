/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CENTRAL FILLER REGISTRY  (single source of truth for `isFiller`)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Consumed ONLY by `@/lib/anime-filler` (resolution + flag application).
 *  Keep DATA here; keep LOGIC in the lib file.
 *
 *  WHY A STATIC REGISTRY?
 *    The public APIs (AniList, Jikan/MAL) do NOT expose a per-episode filler
 *    flag (AniList's Episode type is title/thumbnail only; Jikan/MAL simply do
 *    not tag filler). The remedy — used by AniGap / MAL third-party tools — is
 *    a curated, maintainer-managed map of `{ canonicalTitle: [fillerEps…] }`.
 *
 *  HOW IT RESOLVES A LIVE TITLE:
 *    `@/lib/anime-filler` normalizes the incoming anime's title (lower-case,
 *    alphanumerics collapsed) and matches it against these keys → both the
 *    local 8-title demo seed AND any live AniList/Jikan catalog light up.
 *
 *  PRECISION CONTRACT:
 *    • Short shows  → exact episode numbers.
 *    • Long shows   → ARC-LEVEL accurate ranges. `R(a, b)` = every int a…b.
 *    • Canon-accurate adaptations (Attack on Titan, Jujutsu Kaisen,
 *      My Hero Academia, Death Note, Spy×Family …) are intentionally ABSENT —
 *      the resolver falls back to `isFiller:false` (see FILLER_POLICY below).
 *    • Only ADD an entry when confident it is genuinely filler. A wrong
 *      positive (tagging canon as filler) is worse than a miss.
 *
 *  EXTENDING: append `{ "Show Title": R(a,b) or [ …eps ] }` and the feature
 *  (badge, Hide-Filler toggle, player notice) works everywhere, for free.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Inclusive integer range → number[]. */
const R = (a: number, b: number): number[] =>
  Array.from({ length: b - a + 1 }, (_, i) => a + i);

/**
 * Filler episodes per canonical title.
 * Keys are matched by their *normalized* form (see `norm()` in anime-filler).
 */
export const FILLER_MAP: Record<string, number[]> = {
  /* ── NARUTO FRANCHISE ─────────────────────────────────────────────────── */
  "Naruto": [
    ...R(6, 10), ...R(16, 20), ...R(26, 33), ...R(38, 44), ...R(55, 61),
    ...R(66, 72), ...R(77, 83), ...R(88, 90), ...R(105, 108), ...R(113, 116),
    ...R(121, 125), ...R(129, 132), ...R(136, 138), ...R(142, 144),
    ...R(148, 152), ...R(157, 160), ...R(164, 169), ...R(173, 176),
  ],
  "Naruto Shippuden": [
    16, ...R(19, 22), ...R(70, 73), ...R(76, 84), ...R(89, 97),
    ...R(113, 118), 152, 190, 203, ...R(243, 247), ...R(305, 307),
    349, ...R(354, 355), 416, 420, 481, 487, 491, 494, ...R(500, 501),
    ...R(510, 511), 513, 516, 519, ...R(524, 526),
  ],

  /* ── BIG FILLER HEAVIES ───────────────────────────────────────────────── */
  "One Piece": [
    ...R(63, 68), ...R(93, 97), ...R(165, 168), ...R(269, 273), ...R(280, 287),
    ...R(295, 296), ...R(301, 307), ...R(314, 315), ...R(332, 333),
    ...R(352, 353), ...R(368, 369), ...R(419, 437), ...R(498, 502),
    ...R(512, 514), ...R(536, 540), ...R(648, 650), ...R(669, 671),
    ...R(679, 680), ...R(690, 692), ...R(700, 704), ...R(716, 717),
    ...R(738, 741), ...R(756, 759), ...R(768, 770), ...R(799, 801),
    827, 854, 857, 898, 914,
  ],
  "Bleach": [103, 175, ...R(178, 180), ...R(185, 186), ...R(197, 200),
    ...R(283, 285), 344, ...R(358, 359)],

  /* ── DRAGON BALL FRANCHISE ────────────────────────────────────────────── */
  "Dragon Ball Z": [
    ...R(34, 38), ...R(43, 47), ...R(55, 60), ...R(80, 83), ...R(88, 94),
    ...R(105, 107), ...R(121, 122), ...R(126, 128), ...R(158, 161),
    ...R(165, 167), ...R(173, 179), ...R(193, 194), ...R(218, 220),
    ...R(227, 230), ...R(238, 240), ...R(245, 247), ...R(250, 253),
    ...R(257, 261), ...R(265, 266), ...R(268, 270), ...R(274, 277),
    ...R(283, 286), ...R(292, 293), ...R(301, 304), ...R(312, 313),
    ...R(321, 324), ...R(329, 330), ...R(333, 336), ...R(347, 349),
    ...R(355, 356), ...R(363, 368), ...R(370, 372), ...R(376, 377),
    ...R(380, 382), ...R(388, 389), ...R(396, 397), ...R(399, 400),
    ...R(406, 407), ...R(413, 414), ...R(419, 420), 428, 430, ...R(433, 434),
    ...R(445, 447), ...R(452, 454), ...R(466, 469), ...R(474, 478),
    ...R(485, 487), ...R(493, 494), ...R(499, 501), ...R(506, 509),
    ...R(514, 516), ...R(520, 523), ...R(528, 532), ...R(537, 540),
    ...R(550, 552), ...R(565, 579), ...R(584, 585), 589, ...R(594, 596),
    ...R(602, 605), ...R(609, 610), ...R(614, 616), ...R(620, 622),
    ...R(627, 628), ...R(635, 636), ...R(643, 644),
  ],
  "Dragon Ball Super": [
    // Mostly canon (manga-accurate); only bridging/recap gaps are filler.
    ...R(2, 4), ...R(26, 27), ...R(33, 34), ...R(46, 47),
    ...R(50, 51), ...R(61, 62), ...R(64, 65), ...R(72, 73),
  ],

  /* ── LONG-RUNNING SHONEN ──────────────────────────────────────────────── */
  "Dragon Ball Kai": [
    ...R(4, 7), ...R(12, 13), ...R(19, 21), ...R(27, 31), 33, ...R(38, 40),
    ...R(44, 46), ...R(50, 52), ...R(56, 58), 62, ...R(68, 70), ...R(76, 77),
    ...R(82, 84), 88, ...R(94, 96), 100, 108, 110, ...R(116, 118),
    ...R(124, 126), 130, ...R(136, 138), ...R(144, 146), 152, ...R(158, 160),
  ],
  "Fairy Tail": [...R(161, 167)],
  "Hunter x Hunter": [
    93, 94, 95, 103, 142, 157, 171, 200, 247, 276,
  ],

  /* ── CLASSICS / SHONEN (known filler) ─────────────────────────────────── */
  "Inuyasha": [
    ...R(42, 44), ...R(47, 48), ...R(53, 54), ...R(60, 61), ...R(71, 72),
    ...R(85, 86), ...R(97, 98), ...R(100, 101), ...R(112, 113),
    ...R(115, 116), ...R(125, 126), ...R(129, 130), ...R(139, 142),
    ...R(152, 153), ...R(155, 156), ...R(166, 167), ...R(169, 170),
    ...R(179, 180), ...R(183, 184), ...R(193, 194), ...R(197, 198),
    ...R(207, 208), ...R(211, 212), ...R(220, 221), ...R(225, 226),
    ...R(234, 235), ...R(239, 240), ...R(247, 248), ...R(253, 254),
    ...R(261, 262), ...R(267, 268), ...R(274, 275), ...R(281, 282),
    ...R(288, 289), ...R(295, 296), ...R(301, 302), ...R(309, 310),
    ...R(315, 316), ...R(323, 324), ...R(329, 330), ...R(337, 338),
    ...R(343, 344), ...R(351, 352), ...R(357, 358),
  ],
  "Cardcaptor Sakura": [14, ...R(47, 48), 50, 70, 72, ...R(75, 76),
    ...R(100, 101), ...R(110, 111), ...R(127, 128)],
  "Yu Yu Hakusho": [...R(102, 104), ...R(109, 110), ...R(115, 116), ...R(121, 122)],
  "Soul Eater": [...R(44, 48), ...R(50, 53), ...R(58, 60), ...R(63, 65)],

  /* ── MODERN (accurate in-arc fillers only) ─────────────────────── */
  "Demon Slayer": [...R(28, 31)], // Swordsmith Village gap-fill spin-offs
  "Demon Slayer Entertainment District Arc": [58, 59], // in-arc breather OVAs
};

/**
 * LOCAL DEMO ILLUSTRATIVE OVERRIDES  (NOT canon — demo visibility only).
 * ────────────────────────────────────────────────────────────────────────────
 * The 8-title offline seed is capped at 12 episodes, which never reach the
 * real filler start points (Naruto Shippūden ⇢ ep 16, One Piece ⇢ ep 63), so
 * the accurate `FILLER_MAP` above would render no badges in `npm run dev`.
 *
 * These low-range overrides are DEMO-ONLY and clearly illustrative; they let
 * the amber badge / "Hide Filler" toggle / player chip be demonstrated
 * out-of-the-box on the two genuinely filler-heavy franchises in the seed
 * (Naruto Shippūden, One Piece). They are applied ONLY when one of these
 * demo slugs is present, so the live AniList/Jikan catalog never sees them.
 * Canon-accurate seed titles (AOT, JJK, MHA, Death Note, …) are intentionally
 * left here WITHOUT an override → they correctly show no filler.
 */
export const FILLER_DEMO_OVERRIDES: Record<string, number[]> = {
  "naruto-shippuden": [4, 6, 8, 11],
  "one-piece": [3, 7, 10],
};

/**
 * Resolution policy for titles ABSENT from `FILLER_MAP`.
 *  "canon-by-default"  → every episode gets `isFiller: false`. Safe & honest:
 *    unknown ≠ filler. We never guess filler for an untracked series.
 */
export const FILLER_POLICY: "canon-by-default" = "canon-by-default";