const { SlashCommandBuilder, REST, Routes, ContextMenuCommandBuilder } = require('discord.js');
require('dotenv').config()
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let commmandTypes = {
    slash: new SlashCommandBuilder(),
    message: new ContextMenuCommandBuilder().setType(3),
    user: new ContextMenuCommandBuilder().setType(2)
}

let command

function handleAddOption(option) {
    if (option == 'end') return rl.close()
    let optionData = option.split(',')
    let [type, name, description, required, autocomplete, min, max] = optionData
    switch (type) {
        case 'string':
            command.addStringOption(option => option.setName(name).setDescription(description).setRequired(required === 'true').setAutocomplete(autocomplete === 'true').setMinLength(parseInt(min)).setMaxLength(parseInt(max)))
            break
        case 'number':
            command.addNumberOption(option => option.setName(name).setDescription(description).setRequired(required === 'true').setAutocomplete(autocomplete === 'true').setMinValue(parseInt(min)).setMaxValue(parseInt(max)))
            break
        case 'role':
            command.addRoleOption(option => option.setName(name).setDescription(description).setRequired(required === 'true'))
            break
        case 'user':
            command.addUserOption(option => option.setName(name).setDescription(description).setRequired(required === 'true'))
            break
        case 'channel':
            command.addChannelOption(option => option.setName(name).setDescription(description).setRequired(required === 'true'))
            break
    }
    rl.question('Option (Format: <type>,<name>,<description>,<required>,<autocomplete>,[minlength],[maxlength]): ', handleAddOption)
}

rl.question('Type: ', async (type) => {
    command = commmandTypes[type]
    rl.question('Name: ', async (name) => {
        command.setName(name)
        if (type !== 'slash') return rl.close()
        rl.question('Description: ', async (description) => {
            command.setDescription(description)
            rl.question('option (Format: <type>,<name>,<description>,<required>,<autocomplete>,[minlength],[maxlength]): ', handleAddOption)
        }
        )
    })
})

rl.on('close', () => {
    console.log('Deploying command')
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
    rest.post(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: command
    })
})
