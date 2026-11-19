/*
 * Liturgical season detector for sdcason.com (Roman Rite, US calendar).
 * Paste this ABOVE your existing random-posts <script> in
 * Ghost Admin → Settings → Code injection → Site footer.
 *
 * It exposes:
 *   window.FCG_SEASON = {
 *     season: 'advent' | 'christmas' | 'lent' | 'holy-week' | 'easter' | 'pentecost' | 'ordinary',
 *     label:  'Advent',
 *     color:  'violet',
 *     tags:   ['advent', ...],      // seasonal tag slugs to prefer ([] in Ordinary Time)
 *     filter: 'tag:[advent,...]'    // ready-made Ghost Content API filter ('' in Ordinary Time)
 *   }
 * and adds a class like "season-advent" to <body>.
 *
 * Preview any date with ?season-date=2026-12-10 in the URL.
 */
(function () {
  // ---- EDIT THESE: which tags count as "seasonal" for each season ----
  var SEASON_TAGS = {
    'advent':    ['advent', 'nativity-paintings', 'nativity-coloring-pages'],
    'christmas': ['christmas', 'nativity-paintings', 'nativity-coloring-pages',
                  'holy-family-paintings', 'holy-family-coloring-pages'],
    'lent':      ['lent', 'jesus-passion-paintings', 'jesus-passion-coloring-pages'],
    'holy-week': ['holy-week', 'jesus-passion-paintings', 'jesus-passion-coloring-pages'],
    'easter':    ['easter'],
    'pentecost': ['pentecost', 'holy-spirit-paintings'],
    'ordinary':  []
  };

  var LABELS = {
    'advent': ['Advent', 'violet'],
    'christmas': ['Christmas', 'white'],
    'lent': ['Lent', 'violet'],
    'holy-week': ['Holy Week', 'red'],
    'easter': ['Easter', 'white'],
    'pentecost': ['Pentecost', 'red'],
    'ordinary': ['Ordinary Time', 'green']
  };

  function d(y, m, day) { return new Date(y, m - 1, day); }
  function addDays(date, n) { var r = new Date(date); r.setDate(r.getDate() + n); return r; }

  // Easter Sunday (Anonymous Gregorian algorithm)
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100,
        dd = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3), h = (19 * a + b - dd - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        month = Math.floor((h + l - 7 * m + 114) / 31),
        day = ((h + l - 7 * m + 114) % 31) + 1;
    return d(y, month, day);
  }

  // First Sunday of Advent: 4th Sunday before Christmas (Nov 27 – Dec 3)
  function adventStart(y) {
    var xmas = d(y, 12, 25);
    var dow = xmas.getDay();               // 0 = Sunday
    return addDays(xmas, -(dow === 0 ? 7 : dow) - 21);
  }

  // Baptism of the Lord (US): Epiphany is the Sunday Jan 2–8;
  // Baptism is the next Sunday, or the Monday after if Epiphany is Jan 7 or 8.
  function baptismOfTheLord(y) {
    var jan2 = d(y, 1, 2);
    var epiphany = addDays(jan2, (7 - jan2.getDay()) % 7);
    return epiphany.getDate() >= 7 ? addDays(epiphany, 1) : addDays(epiphany, 7);
  }

  function seasonFor(date) {
    var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var y = t.getFullYear();
    var e = easter(y);

    if (t >= adventStart(y) && t < d(y, 12, 25)) return 'advent';
    if (t >= d(y, 12, 25) || t <= baptismOfTheLord(y)) return 'christmas';

    var ashWed = addDays(e, -46), palmSun = addDays(e, -7), pentecost = addDays(e, 49);
    if (t >= ashWed && t < palmSun) return 'lent';
    if (t >= palmSun && t < e) return 'holy-week';
    if (t >= e && t < addDays(pentecost, -6)) return 'easter';
    if (t >= addDays(pentecost, -6) && t <= pentecost) return 'pentecost'; // week leading up to Pentecost
    return 'ordinary';
  }

  var today = new Date();
  var override = /[?&]season-date=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
  if (override) today = d(+override[1], +override[2], +override[3]);

  var season = seasonFor(today);
  var tags = SEASON_TAGS[season] || [];

  window.FCG_SEASON = {
    season: season,
    label: LABELS[season][0],
    color: LABELS[season][1],
    tags: tags,
    filter: tags.length ? 'tag:[' + tags.join(',') + ']' : '',
    seasonFor: seasonFor
  };

  if (document.body) document.body.classList.add('season-' + season);
  else document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('season-' + season);
  });
})();
