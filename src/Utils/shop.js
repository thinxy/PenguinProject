import { EmbedBuilder } from 'discord.js'

const backgrounds = async () => {
  let backs = [
    {
      name: 'Floresta',
      value: 10000,
      description: 'Que tal se divertir em uma linda floresta?',
      image: 'https://cdn.discordapp.com/attachments/1006035026967801916/1029520334602387506/images_5.jpg'
        },
    {
      name: 'Lugar misterioso',
      value: 15000,
      description: 'Que tal desvendar um mistério nesse lugar assustador?',
      image: 'https://cdn.discordapp.com/attachments/983025788741898250/983028294800769064/unknown.png'
        },
    {
      name: 'Anime',
      value: 25000,
      description: 'Vamos viajar no mundo dos animes!',
      image: 'https://cdn.discordapp.com/attachments/983025788741898250/983028295325081632/unknown.png'
        },
    {
      name: 'Pixels',
      value: 25000,
      description: 'Gosta de joguinhos em pixels?',
      image: 'https://cdn.discordapp.com/attachments/983025788741898250/983027547082223666/unknown.png'
        },
    {
      name: 'Cidade',
      value: 37000,
      description: 'Vamos conhecer uma nova cidade!',
      image: 'https://cdn.discordapp.com/attachments/983025788741898250/983028295622885406/unknown.png'
        },
    {
      name: 'Gatinho',
      value: 40000,
      description: 'Gosta de gatos? olha que fofura!',
      image: 'https://cdn.discordapp.com/attachments/1006035026967801916/1029520581340713010/images_10.jpg'
        },
    {
      name: 'Céu estrelado & por do sol',
      value: 40000,
      description: 'Gosta de ver o céu?',
      image: 'https://cdn.discordapp.com/attachments/1006035026967801916/1029520649506541638/images_1.jpg'
        }
    ]

  return backs
}

const pages = async () => {
  let arr = await backgrounds()

  let embeds = []

  for (let i = 0; i < arr.length; i++) {
    let emb = new EmbedBuilder()
      .setTitle(arr[i].name)
      .setDescription(arr[i].description)
      .setImage(arr[i].image)
      .setFooter({ text: `Preço: ${arr[i].value} | Penguin Backgroud` })
      .setColor("1BB2E3")

    embeds.push({
      embed: emb,
      value: arr[i].value,
      image: arr[i].image,
      name: arr[i].name
    })
  }

  return embeds
}

export default {
  backgrounds,
  pages
}
