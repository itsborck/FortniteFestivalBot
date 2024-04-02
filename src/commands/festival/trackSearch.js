const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const axios = require('axios')

function generateDifficultyBar(difficulty) {
  const filledSquare = '▰'
  const emptySquare = '▱'
  return filledSquare.repeat(difficulty) + emptySquare.repeat(7 - difficulty)
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a Jam Track')
    .addStringOption(option =>
      option
        .setName('track')
        .setDescription('Track to search for')
        .setRequired(true),
    ),

  async execute(interaction) {
    const keyword = interaction.options
      .getString('track')
      .replace(/\s+/g, '')
      .toLowerCase()
    await axios({
      method: 'get',
      url: 'https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/spark-tracks?lang=en',
      responseType: 'json',
    }).then(response => {
      const data = response.data
      const track = data[keyword]
      if (track) {
        const embed = new EmbedBuilder()
          .setTitle(track.track.tt)
          .addFields(
            { name: 'Artist', value: track.track.an, inline: true },
            {
              name: 'Year',
              value: String(track.track.ry),
              inline: true,
            },
            {
              name: 'Key',
              value: track.track.mk + ' ' + track.track.mm,
              inline: true,
            },
            {
              name: 'BPM',
              value: String(track.track.mt),
              inline: true,
            },
            {
              name: 'Length',
              value: String(
                `${Math.floor(track.track.dn / 60)}:${(
                  '0' +
                  (track.track.dn % 60)
                ).slice(-2)}`,
              ),
              inline: true,
            },
            {
              name: 'Lead Difficulty',
              value: generateDifficultyBar(track.track.in.gr),
            },
            {
              name: 'Drums Difficulty',
              value: generateDifficultyBar(track.track.in.ds),
              inline: true,
            },
            {
              name: 'Vocals Difficulty',
              value: generateDifficultyBar(track.track.in.vl),
            },
            {
              name: 'Bass Difficulty',
              value: generateDifficultyBar(track.track.in.ba),
              inline: true,
            },
          )
          .setThumbnail(track.track.au)
          .setFooter({ text: 'Made with ❤️ by borck' })
        interaction.reply({ embeds: [embed] })
      } else {
        interaction.reply('Track not found')
      }
    })
  },
}
