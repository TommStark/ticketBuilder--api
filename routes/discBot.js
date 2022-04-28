const express = require('express');
const route = express.Router();
const verifyToken = require('../middleware/auth');
const Dclient = require('../middleware/DBot');
const { MessageEmbed } = require('discord.js');
require('dotenv').config()

route.put('/', verifyToken, (req,res) => {
    const ticket = req.body.ticket;
    const user = req.author;

    try{
        sendSMS(ticket,user);
        res.json({ticket})
    }
    catch(err){
        res.status(400).json({
            err
        })
    };
})

async function sendSMS (ticket,user){
    const {pr, vpdc, project, details, checks, version, projectColor} = ticket
    
    const plural = checks > 1 ? 'Reviewers: ' : 'Reviewer: ';


    const exampleEmbed = new MessageEmbed()
	.setColor(projectColor)
	.setTitle(`Project ${project}`)
	.setAuthor({ name: user.name, iconURL: user.img})
	.setDescription(details)
	.setThumbnail(' https://cdn.discordapp.com/icons/937685188308267008/3b0034ce663b8ed109c2e7d5e8c54175.webp?size=96')
	.addFields(
		{ name: 'Pull Request: ', value: pr },
        { name: 'Jira: ', value: vpdc },
		{ name: 'checks: ', value: checks.toString(), inline: true},
	)
    .addField(plural, '*', true)
	.setTimestamp()
    .setFooter({ text: `TicketBuilder v${version}` });

    // Dclient.channels.cache.get(process.env.DCHANNELID).send('@here');
    Dclient.channels.cache.get(process.env.DCHANNELID).send({embeds: [exampleEmbed]});
}

module.exports = route;