import type { Chapter, ComicChapter } from "raiku-pgs/plugin"
import { normalizeChName, pathIsHome } from "raiku-pgs/plugin"

import { meta } from "../../../package.ts"
import { CURL } from "../../const"
import { getParamComicAndChap } from "../../parsers/__helpers__/getParamComicAndChap"
import Parse from "../../parsers/truyen-tranh/[slug]/[ep-id]"

export default async function <Fast extends boolean>(
  slug: string,
  fast: Fast
): Promise<
  Fast extends true
    ? ComicChapter
    : ComicChapter & {
        readonly chapters: Chapter[]
      }
> {
  const { data, url } = await get({ url: `${CURL}/truyen-tranh/${slug}` })

  if (pathIsHome(url)) throw new Error("not_found")

  const result = await Parse(data, Date.now())
  if (!fast) {
    const { data } = await get({
      url: `${CURL}/Comic/Services/ComicService.asmx/ProcessChapterList?comicId=${result.manga_id}`
    })
    return {
      ...result,
      chapters: JSON.parse(data).chapters.map(
        (item: { chapterId: number; name: string; url: string }): Chapter => {
          const route: Chapter["route"] = {
            name: "comic chap",
            params: {
              sourceId: meta.id,
              ...getParamComicAndChap(item.url)
            }
          }

          return {
            id: item.chapterId + "",
            name: normalizeChName(item.name),
            route,
            updated_at: null,
            views: null
          }
        }
      )
    } as Fast extends true
      ? ComicChapter
      : ComicChapter & {
          readonly chapters: Chapter[]
        }
  }

  return result as Fast extends true
    ? ComicChapter
    : ComicChapter & {
        readonly chapters: Chapter[]
      }
}
