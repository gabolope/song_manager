import type { SongDTO } from "../types/song";

// Himnos de dominio público (publicados antes de 1928), usados solo para el
// modo demo: no requieren permiso ni tocan Firestore.
export const DEMO_SONGS: SongDTO[] = [
  {
    id: "demo-amazing-grace",
    title: "Amazing Grace",
    artist: "John Newton",
    key: "G",
    content: `{t:Amazing Grace}
{artist:John Newton}
{key:G}

{sop:Verse 1}
[G]Amazing grace, how [C]sweet the [G]sound,
That [G]saved a [D]wretch like [G]me.
[G]I once was [C]lost, but [G]now am found,
Was [Em]blind but [D]now I [G]see.
{eop}

{sop:Verse 2}
[G]'Twas grace that [C]taught my [G]heart to fear,
And [G]grace my [D]fears re[G]lieved.
[G]How precious [C]did that [G]grace appear
The [Em]hour I [D]first be[G]lieved.
{eop}
`,
  },
  {
    id: "demo-silent-night",
    title: "Silent Night",
    artist: "Joseph Mohr",
    key: "C",
    content: `{t:Silent Night}
{artist:Joseph Mohr}
{key:C}

{sop:Verse 1}
[C]Silent night, [G]holy night,
[C]All is calm, [F]all is [C]bright
[F]Round yon virgin [C]mother and child
[F]Holy infant so [C]tender and [G]mild
[F]Sleep in heavenly [C]peace[G]
[C]Sleep in heavenly [F]peace[C]
{eop}
`,
  },
  {
    id: "demo-joy-to-the-world",
    title: "Joy to the World",
    artist: "Isaac Watts",
    key: "D",
    content: `{t:Joy to the World}
{artist:Isaac Watts}
{key:D}

{soc}
[D]Joy to the [G]world, the [D]Lord is [A]come!
[D]Let earth re[G]ceive her [A]King[D]
{eoc}

{sop:Verse}
[D]Let every [G]heart pre[D]pare Him [A]room
And [D]heaven and [G]nature [A]sing[D]
And [G]heaven, and [D]heaven and [A]nature [D]sing
{eop}
`,
  },
  {
    id: "demo-what-a-friend",
    title: "What a Friend We Have in Jesus",
    artist: "Joseph M. Scriven",
    key: "F",
    content: `{t:What a Friend We Have in Jesus}
{artist:Joseph M. Scriven}
{key:F}

{sop:Verse 1}
[F]What a friend we [Bb]have in [F]Jesus,
[C]All our sins and [F]griefs to [C]bear!
[F]What a privilege to [Bb]carry
[C]Everything to [F]God in [C]prayer[F]
{eop}
`,
  },
  {
    id: "demo-blessed-assurance",
    title: "Blessed Assurance",
    artist: "Fanny Crosby",
    key: "D",
    content: `{t:Blessed Assurance}
{artist:Fanny Crosby}
{key:D}

{sop:Verse 1}
[D]Blessed assurance, [G]Jesus is [D]mine!
[A]Oh, what a foretaste of [D]glory di[A]vine!
[D]Heir of sal[G]vation, purchase of [D]God,
[G]Born of His [D]Spirit, [A]washed in His [D]blood.
{eop}

{soc}
[D]This is my [A]story, this is my [D]song,
Praising my [G]Savior all the [D]day [A]long;
[D]This is my [A]story, this is my [D]song,
Praising my [G]Savior [A]all the day [D]long.
{eoc}
`,
  },
  {
    id: "demo-nearer-my-god",
    title: "Nearer, My God, to Thee",
    artist: "Sarah Flower Adams",
    key: "G",
    content: `{t:Nearer, My God, to Thee}
{artist:Sarah Flower Adams}
{key:G}

{sop:Verse 1}
[G]Nearer, my [C]God, to [G]Thee,
[D]Nearer to [G]Thee!
[G]E'en though it [C]be a [G]cross
That [D]raiseth [G]me,
[C]Still all my [G]song shall [Em]be,
[C]Nearer, my [D]God, to [G]Thee.
{eop}
`,
  },
];
