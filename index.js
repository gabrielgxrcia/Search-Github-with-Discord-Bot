require('dotenv').config()
const { Client, GatewayIntentBits, Partials } = require('discord.js')
const axios = require('axios')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.User,
    Partials.Channel,
  ],
})

const allowedCommands = ['!teste-repo', '!teste-info']

function codeBlockJs(macaco) {
  return '```js\n' + macaco + '\n```'
}

client.on('messageCreate', async message => {
  if (message.author.bot || message.channel.id !== '1071141346406039684') return

  const messageVerify = message.content.split(' ')[0]
  const user = message.content.split(' ')[1]

  if (!allowedCommands.includes(messageVerify)) {
    return message.reply(
      codeBlockJs(
        'A mensagem não está no formato correto. Por favor, tente alguns desses comandos: \n' +
          allowedCommands.join(', ')
      )
    )
  }

  if (!user) {
    return message.reply(
      codeBlockJs('Não consigo buscar se você não escrever o nome do usuário.')
    )
  }

  const type = messageVerify.split('-')[1]

  try {
    const response = await axios.get(`https://api.github.com/users/${user}`)

    if (response.status !== 200) {
      return message.reply(
        codeBlockJs(
          `Não foi possível encontrar informações sobre o usuário "${user}" (código de erro: ${response.status})`
        )
      )
    }

    const githubUser = response.data

    if (type === 'info') {
      const profileInformation = `'Nome de usuário': ${githubUser.login}\n'Nome completo': ${githubUser.name}\n'Localização': ${githubUser.location}\n'Repositórios': ${githubUser.public_repos}\n'Seguidores': ${githubUser.followers}\n'Seguindo': ${githubUser.following}\n'Atividade de Commits: ${githubUser.commit_activity}`
      message.channel.send(
        `<img src="${githubUser.avatar_url}" alt="Avatar de ${githubUser.login}" width="100"/>`
      )
      message.channel.send(codeBlockJs(profileInformation))
    }
  } catch (error) {
    return message.reply(
      codeBlockJs(
        `Não foi possível encontrar informações sobre o usuário "${user}": ${error.message}`
      )
    )
  }
})

client.login(process.env.TOKEN)
