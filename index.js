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

client.on('ready', () => {
  //Quando bot estiver funcionando efetua o console.log.
  console.log('O bot está no ar!')
})

client.on('messageCreate', message => {
  //Evento que é efetuado sempre que uma mensagem é enviada ao servidor.

  if (message.author.bot) return //Verifica se a mensagem é enviada por um bot ou usuário, caso for bot, a função é interrompida.

  if (message.content.startsWith('!github')) {
    //Verifica se a mensagem é "!github".

    const args = message.content.split(' ') //Divide a mensagem em argumentos separados por espaço.

    if (args.length < 2) {
      //Verifica se tem pelo menos dois argumentos depois do comando "!github".
      message.reply(
        'Por favor, forneça um nome de usuário do GitHub após o comando !github' // Se não houver, responde com uma mensagem solicitando o nome de usuário do GitHub.
      )
      return //Interrompendo a função.
    }
    const user = args[1] // Armazena o segundo argumento (nome de usuário do GitHub) em uma variável "user"

    axios // Faz uma requisição GET à API usando Axios do GitHub com o nome de usuário especificado.
      .get(`https://api.github.com/users/${user}`)

      .then(response => {
        // Armazena os dados retornados pela API em uma variável "githubUser"
        const githubUser = response.data

        message.reply(
          // Envia uma mensagem com informações sobre o usuário do GitHub
          `Nome de usuário: ${githubUser.login}\nNome completo: ${githubUser.name}\nLocalização: ${githubUser.location}\nRepositórios: ${githubUser.public_repos}\nSeguidores: ${githubUser.followers}\nSeguindo: ${githubUser.following}`
        )
      })
      .catch(error => {
        // Se houver um erro na requisição, imprime o erro no console.
        console.error(error)
        message.reply(
          `Não foi possível encontrar informações sobre o usuário "${user}"`
        )
      })
  }
})

client.login(process.env.TOKEN) // Faz o login do bot com o token dentro de .env
