# sdcason.com liturgical seasons

Makes the random homepage grid on sdcason.com (The Free Catholic Gallery, Ghost 6) follow the
Church year. During Advent the homepage shows Advent posts, during Lent it shows Lent posts, and so on.

## Status and next steps

- **Status:** Live on sdcason.com. Season tags are applied and the new homepage script is saved.
- **Last worked on:** 2026-11-19. Built the season script, tagged 745 posts, saved the footer,
  and checked a preview date for every season on the live site.
- **Next steps:**
  1. On or after Sunday, Nov 29, 2026, check that the homepage shows "Advent in the Gallery".
  2. Review `seasonal-tag-review.csv` and remove any season tags that don't fit.
  3. Tag new seasonal posts as they're published (see "Adding posts" below).

## How it works

The homepage grid is filled by the `FCG-RANDOM-HOME` block in
**Ghost Admin → Settings → Code injection → Site footer**. [random-home-seasonal.html](random-home-seasonal.html)
is a copy of that block, with the API key replaced by `YOUR_CONTENT_API_KEY`.

1. It works out today's season (Eastern time) from the Roman calendar as used in the US:

   | Season | Dates |
   |---|---|
   | Advent | First Sunday of Advent → Dec 24 |
   | Christmas | Dec 25 → Baptism of the Lord |
   | Lent | Ash Wednesday → Saturday before Palm Sunday |
   | Holy Week | Palm Sunday → Holy Saturday |
   | Easter | Easter Sunday → 7 days before Pentecost |
   | Pentecost | The week before Pentecost, through Pentecost Sunday |
   | Ordinary Time | Everything else |

2. In a season, the first half of the cards (12 of 24) come from that season's tags, and the
   heading changes to "Advent in the Gallery" and so on. The rest of the cards are the usual
   daily random mix, the same for every visitor that day.
3. In Ordinary Time it behaves exactly like the old script.

The season's tags are set in the `SEASONS` list near the top of the script. Christmas also uses
the Nativity tags, and Lent also uses the Jesus Passion tags. `SEASONAL_SHARE` sets how much of
the grid is seasonal (0.5 = half).

**Preview any date:** add `?season-date=2027-04-10` to the homepage address.

## Season tags

All season tags are **internal** tags, hidden from readers. They follow the owner's existing
`#Advent` / `#Christmas` convention, and the script hides them on homepage cards.

| Tag | Slug | Posts (2026-11-19) |
|---|---|---|
| #Advent | `advent` | 115 |
| #Christmas | `christmas` | 193 |
| #Lent | `lent` | 94 |
| #Holy Week | `holy-week` | 208 |
| #Easter | `easter` | 134 |
| #Pentecost | `pentecost` | 24 |

Posts were tagged automatically by title keywords (Annunciation, Magi, Resurrection, Emmaus, and
so on), with false matches filtered out. Examples of false matches: "Eastern Catholic" photos,
churches named after a feast, the Nativity of Mary, and St. Andrew's crucifixion. Each season
tag was added last on the post, so no post's main tag changed.
[seasonal-tag-review.csv](seasonal-tag-review.csv) lists every tagged post.

## Adding posts

When you publish a seasonal post, add its internal tag (for example `#Easter`) in the post's tag
field. Nothing else is needed.

## Files

| File | What it is |
|---|---|
| `random-home-seasonal.html` | The live footer block (v5), key removed |
| `backup-random-home-v4.html` | The original block from before this change. To restore it, put the key back in and paste it over the block |
| `seasonal-tag-review.csv` | Every post given a season tag, with links |
| `liturgical-season.js` | A standalone copy of the season calculator (not deployed), handy for testing dates |

## Notes

- Claude in Chrome can't read the footer, because its safety filter blocks the Content API key.
  Use the built-in browser in the Claude app with the admin settings API instead.
