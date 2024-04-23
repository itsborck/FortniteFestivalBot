const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const axios = require('axios')

function generateDifficultyBar(difficulty) {
  const filledSquare = '▰'
  const emptySquare = '▱'
  return (
    filledSquare.repeat(difficulty + 1) + emptySquare.repeat(6 - difficulty)
  )
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
      .replace(/[^\w\s]/gi, '')
      .toLowerCase()
    await axios({
      method: 'get',
      url: 'https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/spark-tracks?lang=en',
      responseType: 'json',
    }).then(response => {
      const data = response.data
      const track = Object.values(data).find(track => track.track && track.track.tt.replace(/[^\w\s]/gi, '').toLowerCase().includes(keyword))
      if (track) {
        const embed = new EmbedBuilder()
          .setTitle(`${track.track.tt} (${track.track.ry}) | ${track.track.an}`)
          .setDescription(
            `⌛ Duration: ${String(
              `${Math.floor(track.track.dn / 60)}:${(
                '0' +
                (track.track.dn % 60)
              ).slice(-2)}`,
            )}
            🎚️ Difficulty Chart:
            Lead: ${generateDifficultyBar(track.track.in.gr)}
            Drums: ${generateDifficultyBar(track.track.in.ds)}
            Vocals: ${generateDifficultyBar(track.track.in.vl)}
            Bass: ${generateDifficultyBar(track.track.in.ba)}
            🎚️ Pro Difficulty Chart:
            Pro Lead: ${generateDifficultyBar(track.track.in.pg)}
            Pro Bass: ${generateDifficultyBar(track.track.in.pb)}`
          )
          .setImage(track.track.au)
          .setFooter({ text: 'Made with ❤️ by borck' })
        interaction.reply({ embeds: [embed] })
      } else {
        interaction.reply('Track not found')
      }
    })
  },
}
