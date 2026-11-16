# Kids catechism ideas: courses, learning games, web games

**Status:** ideas only, nothing built. Written Nov 16, 2026.

Ideas for kids content drawn from two catechisms, fitted to the plans that already exist:

- **Angelio** (angelio.org): `shalone86/angelio` → `ROADMAP.md`, especially "Catechism with the game styles we already have"
- **Master roadmap**: `shalone86/picoparish` → `ROADMAP.md` (build lists P1–P7 Pico Parish, W1–W6 kids web games, A1–A8 Angelio)
- **Courses**: `shalone86/sdcourses` → `courses/ROADMAP.md` ("Catholic Kids Courses", Lesson Studio, scene types)
- **Game notes**: `shalone86/games` → `angels/IDEAS.md`, `sdcourses/game/IDEAS.md`

Most ideas below **reuse something you already have or plan**, and most of them slot into a numbered item
from the master roadmap instead of adding new ones. The master roadmap's rule still holds: one build at a time.

---

## 1. What the two catechisms give us

### Catechism of the Catholic Church (vatican.va/archive/ENG0015)

Four parts, which make a ready-made spine for a kids curriculum:

| Part | Paragraphs | Kid version |
|---|---|---|
| 1. The Profession of Faith (the Creed) | 26–1065 | "What we believe" |
| 2. The Celebration of the Christian Mystery (liturgy, 7 sacraments) | 1066–1690 | "How we worship" |
| 3. Life in Christ (virtues, sin, the 10 Commandments) | 1691–2557 | "How we live" |
| 4. Christian Prayer (the Our Father) | 2558–2865 | "How we pray" |

Every article ends with an **"In Brief"** list: short, quotable summary lines. Those are the best anchors for
kid quiz questions and lesson quotes (they're already short enough for a lesson card).

Handy kid-sized passages: symbols of the Holy Spirit (694–701: water, anointing, fire, cloud and light, seal,
hand, finger, dove), the days of creation (337–349), guardian angels (336), where the liturgy is celebrated
(1179–1186: altar, tabernacle, chair, ambo, font), parts of the Mass (1345–1355), the Beatitudes (1716–1717),
virtues, gifts and fruits (1803–1832), capital sins (1866), precepts of the Church (2041–2043), works of mercy
(2447), care for creation (2415–2418), forms of prayer (2626–2643), the seven petitions of the Our Father
(2803–2854), the domestic church (1655–1658, 2204–2206, 2685), icons (1159–1162, 2129–2132), Eastern
liturgical traditions (1200–1209).

### Christ Our Pascha: Catechism of the Ukrainian Catholic Church (CUC, 2016 English)

Three parts: **The Faith** (¶ 1–332), **The Prayer** (¶ 333–700), **The Life** (¶ 701–end), all framed by the
Anaphora of St Basil. It's much more **concrete and visual** than the CCC, which is exactly what games need.
The parts that are almost game designs already:

| CUC ¶ | What it describes | Why it's a game |
|---|---|---|
| 351 | The **diskos at the Proskomide**: the Lamb in the center, the Theotokos particle to its right, nine particles for angels and saints to the left, a row for the living and one for the departed below | A placement puzzle with clear right answers |
| 600–609 | The **iconostasis**: Royal Doors (Annunciation + four evangelists), Deacons' Doors (archangels or deacons), Christ the Pantocrator to the right, Mother of God Hodegetria to the left, the patronal icon, St Nicholas, then the upper rows | Build-the-wall puzzle; "Build the sanctuary" in Eastern form |
| 604 | **Icon colors**: Christ's purple tunic under a blue mantle, the Theotokos's blue tunic under a purple veil (God became human so humans could share in God's life) | A coloring page with a meaning; a "read the icon" game |
| 626 | **Sign of the Cross**: three fingers joined (the Trinity), two bent to the palm (Christ's two natures), forehead → breast → right shoulder → left | A tiny, tactile PreK trainer |
| 625–631 | **Gestures**: standing, raised hands, small and great bows (metania), kneeling, kissing icons | Movement game; "Simon says" for church |
| 653 | **Church bells**: rung during "It is truly right"; during the first three days of Pascha anyone may ring | Rhythm game (ties to Choir singing, W2) |
| 538–578 | **Daily, weekly and yearly cycles**: Vespers/Matins, the 8 tones, movable and fixed feasts with both calendar dates | Church-year wheel; date math (add 13 days) |
| 654–667 | **Domestic church**: the icon corner (Christ, the Mother of God, St Nicholas), blessing children with icons before school, the house blessed every year with Jordan water, Holy Supper, the Paschal egg | Home-life games and a family course |
| 759–785 | **Eight passions and their opposite virtues** (gluttony–temperance … pride–humility) | Matching pairs; enemy/power-up pairs in an action game |
| 785–801 | **Spiritual combat**: fasting and almsgiving, evil thoughts, guarding the heart | Literally a parry game (see Angel Parry, P2) |
| Appendix p. 309–317 | **Daily Prayers, Catechetical Truths** (commandments, 6 precepts, sacraments, virtues, gifts, 9 fruits + the CCC's 3 more, works of mercy, Beatitudes, fasts, the Last Things) and **Christian greetings** ("Christ is risen! Truly, he is risen!") | A ready-made content bank for every sorting and memory game |

### The best idea that comes from reading both: an East/West switch

The two catechisms teach the same faith with different words and customs. Kids in a Byzantine parish (and your
Byzantine courses audience) almost never see their own tradition in kids' apps. Small, cheap differences:

| | West (CCC) | East (CUC) |
|---|---|---|
| Sacraments | Confirmation, Penance | Chrismation, Repentance ("Holy Mysteries") |
| Worship | Mass, altar rail, Advent, Lent | Divine Liturgy, iconostasis, Nativity Fast, Great Fast |
| Sign of the Cross | open hand, left shoulder then right | three fingers, right shoulder then left |
| Fruits of the Spirit | 12 | 9 (the CUC notes the CCC's three more) |
| Capital sins | 7 | 8 passions, each with its opposite virtue |
| Prayers | Hail Mary, Glory Be | "Rejoice, Mother of God", Trisagion, "Heavenly King", "It is truly right" |
| Precepts | 5 | 6 |

Angelio's roadmap already plans "keep each app's question banks in data files so a Catholic set can be swapped
in". Do the same with a `west` / `east` set: a toggle on the grown-ups page, not new apps. Show the switch as
"two lungs" (St John Paul II's phrase) so kids learn that both belong to the one Church.

---

## 2. Kids courses (Lesson Studio, "Catholic Kids Courses")

Built the way you already build lessons: 3–6 quote-anchored points, your voice, existing scene types
(`term`, `compare`, `quote`, `timeline`, `chain`, `recap`…), and a `choice` / `truefalse` / `blank` quiz.
New idea for the kids edition: **"watch, then play"**: each lesson ends with a link to the matching Angelio game.

**Timely (it's mid-November):**

1. **St Nicholas for Kids** (Dec 6; Dec 19 on the Julian calendar). 3 lessons: who he was; why his icon is in
   the icon corner and on the iconostasis (CUC 605, 657: "an example of compassion and hospitality"); giving in
   secret. Game: a Saints matching deck (W1).
2. **Getting Ready for Christmas, East and West**. Advent starts Nov 29; the Nativity Fast (Pylypivka) started
   Nov 15. Lessons: why we wait; the Advent wreath (you already have adult lessons to adapt); the Nativity Fast
   (CUC appendix, fasts); the Holy Supper on Christmas Eve (CUC 662). Use `compare` scenes for East/West.
   Pairs with the existing **Jesse Tree** course.
3. **Theophany and the House Blessing** (Jan 6/19). Jesus's baptism (CUC 197–; CCC 535–537), Jordan water,
   why the priest blesses our homes every year (CUC 655).

**Evergreen (in rough order of effort):**

4. **The Sign of the Cross** (3 short lessons). What the fingers mean (CUC 626), what the words mean (CCC 2157,
   234), when we make it. Smallest possible course, a good pilot for the kids edition.
5. **Inside Our Church** (6 lessons). A walk from the door to the sanctuary: the nave, the iconostasis and its
   three doors, the icons on it, the Holy Table, bells, vestments (CUC 579–653; CCC 1179–1186 for the Western
   version). Your adult "Byzantine Catholic Basics" course is the natural big sibling.
6. **The Our Father for Kids** (7 lessons, one per petition, plus an intro). CCC 2759–2865; CUC 673–. Kid
   version of your adult course #3, same quotes.
7. **The Seven Sacraments (Holy Mysteries)** (8 lessons). One per sacrament + an intro on the three groups
   (initiation, healing, service). CCC 1210–1666; CUC 403–496. Pairs with First Communion prep (grade 2),
   which the Angelio roadmap already names as an anchor.
8. **I Believe: the Creed for Kids** (12 lessons, one per article). CCC 185–1065; CUC Symbol of Faith.
   The `chain` and `timeline` scenes fit (Creation → Fall → Promise → Christ → Church).
9. **The Church Year Wheel** (6 lessons). Seasons and colors (West), the movable and fixed feasts and the
   Twelve Great Feasts (East: CUC 567–578). Pairs with the Timelines app (A5).
10. **Our Home Is a Little Church** (5 lessons). The icon corner, morning and evening prayer, meal prayers, the
    house blessing, reading the lives of the saints together (CCC 1655–1658, 2204–2206; CUC 654–667). Could be
    for parents and kids together.
11. **Saints Who Brought the Faith**: Sts Cyril and Methodius (a natural fit for Methodius Media), St Andrew,
    Sts Olha and Volodymyr, St Josaphat, and the new martyrs (CUC 316–332, Letter of Patriarch Sviatoslav).
    One saint per lesson; reuses the saint sprites planned for W1 and Pixel Patrons.
12. **The Ten Commandments for Kids** (11 lessons). The two great commandments, then each of the ten
    (CCC 2052–2557; CUC appendix). The `compare` scene works for "this helps / this hurts".
13. **The Great Fast for Kids** (Byzantine sibling of "What is Lent for Kids"). Forgiveness Sunday, the Prayer of
    St Ephrem *with the bows* (kids love doing it along with the video), almsgiving.

**Quiz ideas that suit kids** (all fit the existing quiz types): "Which hand?" (`choice`), "true or false: the
Royal Doors have the four evangelists on them" (`truefalse`), finish the greeting "Christ is risen! Truly, he is
____!" (`blank`).

---

## 3. Angelio learning games (angelio.org)

Grouped by the master-roadmap item they belong to, so nothing here jumps the queue.

### A2 Prayers app: add these sets

- **Eastern daily prayers** from the CUC appendix: the Trisagion, "Heavenly King", "It is truly right",
  "Rejoice, Mother of God", the Glorification of the Trinity ("The Father is our hope…"). Same Prayer Builder
  and Finish-the-prayer games, East/West switch decides the set.
- **Counting prayers**: "Lord, have mercy" ×3, ×12, ×40, and the prayer cord (vervytsia, usually 100 knots, one "century") with
  the Jesus Prayer (CUC 693–694). Reuses the Doubles bead bars, like the planned rosary counting. Keep the
  CUC's own warning in the game's tone: "the number of repetitions is not an aim in itself" (694), so no speed score.
- **Bow along**: the Prayer of St Ephrem: a big "bow" button at each (prostration) mark, read aloud. Lenten.
- **Greetings call-and-response**: the voice says "Glory to Jesus Christ!" and the kid taps "Glory forever!";
  seasonal ones at Christmas and Pascha (CUC appendix p. 316). Free device voice; with a family code, the kid
  can *say* the answer (Articulate's speech check).

### A3 Catechism sorting: add these sets

All of these come straight from the "Catechetical Truths" appendix and the CCC paragraphs above.

- **Passion ↔ virtue pairs** (8 pairs, CUC 759–785): a memory/matching game, not a sort. Kid wording:
  greedy ↔ generous, grumpy-sad ↔ joyful, angry ↔ patient, bragging ↔ humble.
- **Fruits of the Spirit**: 9 (Galatians), then "the CCC adds three more" as a bonus round.
- **Gifts of the Holy Spirit** (7), **works of mercy** (corporal or spiritual), **sacraments** into initiation,
  healing, service (already planned) with Eastern names in East mode.
- **Beatitudes**: match the start ("Blessed are the merciful…") to the promise ("…they shall be shown mercy").
- **Symbols of the Holy Spirit** (CCC 694–701): picture of a dove, fire, water, oil, a seal → "why?".
- **Two great commandments**: sort the ten into "love God" and "love neighbor" (already planned; add kid
  scenarios: "Mia shares her snack", "Leo says a bad word about God").

### A5 Timelines: content for the engine

- **Days of creation** in order (CCC 337–349), PreK–1, picture cards only.
- **The Divine Liturgy in order**: Proskomide → "Blessed is the Kingdom" → antiphons → Little Entrance →
  Trisagion → readings → Great Entrance → Creed → Anaphora → Our Father → Communion → dismissal (CUC 348–399).
  The West mode is the "parts of the Mass" already planned.
- **Church-year wheel with both calendars**: each fixed feast shows two dates (e.g. Dec 25 / Jan 7). Bonus math
  level: "add 13 days" (a Regroup! tie-in).
- **Salvation history** (already planned): Creation, the Fall, the promise (CUC 160, the Protoevangelium),
  Noah, Abraham, Moses, David, the prophets, the Annunciation.

### Later Angelio items (already on the "later" list, with Eastern versions)

- **Build the sanctuary → Build the iconostasis**. The CUC gives exact rules, so it can check answers: Christ to the
  right of the Royal Doors, the Mother of God to the left, the Annunciation and evangelists on the doors,
  archangels on the Deacons' Doors, the patronal icon on the south side, St Nicholas on the north, the Mystical
  Supper above the Royal Doors (CUC 602–605). Each icon explains itself when placed (read aloud).
- **Read the icon** (new, small): tap the clues in an icon. Why does Christ hold a book? Why is Mary pointing
  (Hodegetria, "the one who shows the way")? Why are the colors swapped (CUC 604)? Simple tap-and-hear game
  with your own drawings, which also become W6 coloring pages.
- **Sign of the Cross trainer** (new, tiny, PreK): step 1, join three fingers (tap the thumb, index and middle
  finger), fold two; step 2, trace forehead → breast → shoulder → shoulder (order follows the East/West switch).
  One screen, no levels. Could be built in an afternoon from the app template.
- **The diskos** (careful): place the particles around the Lamb (CUC 351). Strictly learn-and-place with no
  score or timer, and have a priest look at it first: it's a sacred action, not a puzzle to "win".
- **First Confession steps**: put the steps of the rite in order (CUC 456–; CCC 1480). Never ask kids to type
  or record their sins; the examination of conscience stays on paper or in the family.

---

## 4. Kids web games and Pico Parish games

### Web games (kids.methodiusmedia.com, W1–W6)

- **W1 Saints matching**: add an "icons and their symbols" deck: St Nicholas (Gospel book, omophorion),
  St Michael (sword), St George (dragon), St Olha, St Volodymyr (cross), Sts Cyril and Methodius (the Glagolitic
  scroll). Same saint sprites serve the courses and coloring pages.
- **W2 Choir singing** → **Bell Ringer** level: the Paschal bells (CUC 653: "anyone who desires can come and
  ring the bell") as a rhythm game, plus singing "Christ is risen from the dead…" (the troparion is in the CUC
  appendix) on Boba Beats' pentatonic engine.
- **W3 Cantor sheet music**: the Trisagion and "Lord, have mercy" are short enough to be first songs; the
  CUC's 8 tones (CUC 555–) could be a much later "which tone is it?" ear game.
- **W4 Peter's Pence**: an optional virtue deck: virtue cards cancel their opposite passion card (CUC
  759–785), which gives the "hidden synergy" design a meaning kids can discover.
- **W5 Saints cooking** → two seasonal kitchens: the **Holy Supper** on Christmas Eve (the meatless dishes,
  the prosphora and Jordan water shared at the start: CUC 662) and the **Pascha basket** (paska, eggs, butter,
  salt, and so on, carried to church to be blessed). The baskets and the dishes are folk customs rather than
  catechism, so say "many families" in the game text.
- **W6 Coloring pages**: icon pages with a "true colors" mode that explains the color meanings (CUC 604), and
  an **icon corner** page: pick three icons, a candle, the Bible, a prayerbook and a catechism (CUC 657–658) and
  download the picture. Same no-saving rule as the roadmap.
- **New, only if the kids ask: "Through the Royal Doors"**, a point-and-click walk through a Byzantine church:
  tap anything (bells, candle stand, icons, the tetrapod, the Gospel book) and it tells you what it is (CUC
  579–653). Mostly drawings and text; a good companion to the "Inside Our Church" course.

### Pico Parish games (P1–P7)

- **P1 Dominions** (angel vs demon): the CUC's "Fall of the Angels" (¶ 142–) and the CCC (391–395) give
  two short, kid-safe lines for the intro screen: angels were created good; some chose against God.
- **P2 Angel Parry**: a theme that fits the three lanes perfectly: **guarding the heart**. Thoughts fly in down
  the lanes (CUC 788–: evil thoughts; 752–: watchfulness and guarding the heart), and you parry each with the right short prayer
  or its opposite virtue. Weak parry = a short prayer, strong parry = the Jesus Prayer. Same art.
- **P3 Rosary Rescue**: the 7 corporal works of mercy as its 7 worlds (feed the hungry, give drink to the
  thirsty, shelter the traveler, visit the sick, …), each with its own item to push.
- **P4 Mass Usher**: a Divine Liturgy level, where many people stand and the usher hands out candles for the
  procession instead of finding pews. A twist with the same code.
- **P5 Garden Givers**: care for creation (CCC 2415–2418; CUC 991–: "the human person as priest of the
  universe"); the harvest goes to the food bank, which is a work of mercy.
- **P6 Relic Island**: the twelve great feasts as the island's shrines; each one gives a piece of the icon of
  that feast, and the full set makes the festal row of an iconostasis.
- **Blessed! eras**: the CUC's Letter of the Patriarch and the saints section (¶ 316–332) give a fifth era for later:
  **Kyivan Rus**: St Volodymyr's baptism of Kyiv in the Dnipro (988), with the Byzantine-era stealth game as its
  neighbor. Only if the kids ask, per the Oct 29 plan.

---

## 5. If you want one place to start

Picks that cost almost nothing and fit the current order (next up: P1 Dominions, W1 Saints matching, A1 Grammar!
proofreading):

1. **St Nicholas for Kids** (course, between builds): it's timely (Dec 6) and feeds the W1 Saints deck.
2. **East/West data sets** when A2 and A3 get built: one extra data file per app, no new code.
3. **Sign of the Cross trainer**: the smallest possible new Angelio app, if a quick win is wanted.
4. **Angel Parry as "guard the heart"**: a theme decision for P2, not extra work.

## 6. Care points

- **Rights.** The CCC (Libreria Editrice Vaticana) and the CUC (UGCC Synod; its Scripture is NRSV) are both under
  copyright. Use short quotations as anchors, which the Lesson Studio quote check already enforces, and write
  the game text in our own words (same rule as the workbook ideas). The Baltimore No. 1 questions are public
  domain if a full Q-and-A text is needed. The quote check could add the CUC as a source for Byzantine
  lessons, the way the CCC is a source now.
- **Review.** As the roadmap already says: have a priest or catechist look at catechism content before it's public.
  For Eastern content, a Byzantine priest.
- **No scores for holy things.** Points and timers are fine for sorting virtues; not for the Eucharist,
  Confession or the diskos. Those are learn-and-place with a gentle "well done".
- **Kids privacy.** Nothing here needs accounts or storing visitor data. Speech checks stay behind family codes.
