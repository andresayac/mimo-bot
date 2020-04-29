const Service = require("../Service");
const querystring = require("querystring");
const { getUrl } = require("../utils/getUrl");
const numeral = require("numeral");
const moment = require("moment");
moment.locale("es");

const {
  config: { youtubeKey },
} = require("../config/index");

class ProsorGuides extends Service {
  constructor() {
    super();
    this._command = "!prosor";
    this._api = "https://www.googleapis.com/youtube/v3";
  }

  async getMessageStatisticsVideo(videoId) {
    const query = querystring.stringify({
      key: youtubeKey,
      part: "statistics",
      id: videoId,
    });
    const responseStatistics = await getUrl(`${this._api}/videos?${query}`);

    if (responseStatistics && responseStatistics.items.length) {
      let {
        statistics: { likeCount, dislikeCount },
      } = responseStatistics.items[0];

      return { likeCount, dislikeCount };
    } else {
      return { likeCount: 0, dislikeCount: 0 };
    }
  }

  async execute({ command, params, context, client }) {
    const { from } = context;
    const searchText = params.join(" ");
    const query = querystring.stringify({
      part: "snippet",
      channelId: "UCUhzcbraLcYQTd3ldHBVnWA",
      order: "date",
      q: searchText,
      key: youtubeKey,
      maxResults: 10,
    });

    const searchResource = `${this._api}/search?${query}`;
    const response = await getUrl(searchResource);

    if (response) {
      const { items } = response;
      const regex = new RegExp(
        ".*" + searchText.replace(" ", "\\s{0,}") + ".*",
        "gmi"
      );

      const itemsFiltered = items
        .filter((item) => regex.test(item.snippet.title))
        .slice(0, 3);

      if (itemsFiltered.length) {
        let msg = "";

        for (let index = 0; index < itemsFiltered.length; index++) {
          const {
            snippet: { title, publishedAt },
            id: { videoId },
          } = itemsFiltered[index];

          const shortDate = moment(publishedAt).format("L");

          let {
            likeCount,
            dislikeCount,
            viewCount,
          } = await this.getMessageStatisticsVideo(videoId);
          likeCount = numeral(likeCount).format("0,0");
          dislikeCount = numeral(dislikeCount).format("0,0");

          msg += [
            `${title}`,
            `https://youtu.be/${videoId}`,
            `${shortDate} |👍 ${likeCount} | 👎 ${dislikeCount}`,
          ].join("\n");
          msg += "\n\n";
        }

        await client.sendText(from, msg);
      } else {
        await client.sendText(from, "No encontré resultados");
      }
    } else {
      await client.sendText(from, "Problemas con la api");
    }
  }
}

module.exports = ProsorGuides;
