import type { Chapter, ID } from "raiku-pgs/plugin"
import { normalizeChName, parsePath } from "raiku-pgs/plugin"

import { meta } from "../../package.ts"
import { CURL } from "../const"
import { getParamComicAndChap } from "../parsers/__helpers__/getParamComicAndChap"

// eslint-disable-next-line camelcase
export default async function (manga_id: ID) {
  const { data } = await get({
    // eslint-disable-next-line camelcase
    url: `${CURL}/Comic/Services/ComicService.asmx/ProcessChapterList?comicId=${manga_id}`
  })

  return JSON.parse(data).chapters.map(
    (item: { chapterId: number; name: string; url: string }): Chapter => {
      const route = {
        name: "comic chap",
        params: {
          sourceId: meta.id,
          ...getParamComicAndChap(parsePath(item.url))
        }
      } as const

      return {
        id: item.chapterId + "",
        name: normalizeChName(item.name),
        route,
        updated_at: null,
        views: null
      }
    }
  )
}
