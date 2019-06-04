// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/cardinal", (req,res) => res.sendStatus(200));


var Discord = require("discord.js");
const urlRegex = require('url-regex');
var vt = require("node-virustotal");
var VirusTotal = vt.MakePublicConnection();
var Embed = Discord.RichEmbed;
var Client = new Discord.Client();
var fs = require("fs");
var storage = {};

var Embeds = {
    "download":{
        "check":new Embed(),
        "safe":new Embed(),
        "bad":new Embed()
    },
    "website":{
        "check":new Embed(),
        "safe":new Embed(),
        "bad":new Embed()
    }
}

Embeds.download.check.setTitle("Checking...");
Embeds.download.check.setColor("#ffff00");
Embeds.download.check.setDescription("We are checking this file for anything dangerous. Do not click it until we say it's safe...");

Embeds.download.safe.setTitle("File Safe.");
Embeds.download.safe.setColor("#00ff00");
Embeds.download.safe.setDescription("This file seems fine. But may still contain malware. Proceed with caution.")

Embeds.download.bad.setTitle("FILE UNSAFE!");
Embeds.download.bad.setColor("#ff0000");
Embeds.download.bad.setDescription("The file that was uploaded was flagged for containing malware. If you downloaded this, Run a malware scan immediatly.");

Embeds.website.check.setTitle("Checking...");
Embeds.website.check.setColor("#ffff00");
Embeds.website.check.setDescription("We are checking this URL for anything dangerous. Do not click it until we say it's safe...");

Embeds.website.safe.setTitle("URL Safe.");
Embeds.website.safe.setColor("#00ff00");
Embeds.website.safe.setDescription("This URL seems fine. But may still contain malware. Proceed with caution.")

Embeds.website.bad.setTitle("URL DANGEROUS!");
Embeds.website.bad.setColor("#ff0000");

var SafeExtentions = fs.readFileSync("./safefiles.txt");
console.log(SafeExtentions.toString());
SafeExtentions = (SafeExtentions.toString()).split(" ");
var SafeURLs = fs.readFileSync("./safeurls.txt");
console.log(SafeURLs.toString());
SafeURLs = (SafeURLs.toString()).split(" ");

function CheckSafeFile(string) {
    let safe = false
    SafeExtentions.forEach(SafeExtention => {
        if(string.toLowerCase().endsWith(SafeExtention)) {
            safe = true;
        }
    });
    return safe;
}

function isFileSafe(MessageAttachments) {
    let safe = true;
    MessageAttachments.array().forEach(Attachment => {
        if(!CheckSafeFile(Attachment.filename)) {
            safe = false;
        }
    });
    return safe;
}
function isCDNSafe(string) {
    let safe = false
    SafeExtentions.forEach(SafeExtention => {
        if(string.toLowerCase().endsWith(SafeExtention)) {
            safe = true;
        }
    });
    return safe;
}
function isURLSafe(string) {
    let safe = false
    SafeURLs.forEach(SafeURL => {
        if(string.toLowerCase().includes(SafeURL)) {
            safe = true;
        }
    });
    return safe;
}

Client.on("ready", () => {
    console.log("FileScanner V1.0.0 is ready. Operating in "+Client.guilds.size+" guilds.");
    Client.user.setActivity("for Files & URLs", {type:"WATCHING"});
});
Client.on("message", message => {
    if(message.author.bot) return;
    // New message. We're gonna check to see if there are attachments
    if(message.attachments.size != 0) {
        // There are attachments. Scan them.
        if(!isFileSafe(message.attachments)) {
            //if(!storage.hasOwnProperty(message.guild.id)) {
                //storage[message.guild.id] = new Map([[message.author.id,1]])
                message.channel.send("**HEY!** <@"+message.author.id+"> Please dont post any unsafe files!")
                //message.channel.send("**HEY!** <@"+message.author.id+"> Please dont post any unsafe files! You are on strike: "+storage[message.guild.id].get(message.author.id)+".");
            /*}else{
                if(storage[message.guild.id].has(message.author.id)) {
                    storage[message.guild.id].set(message.author.id, storage[message.guild.id].get(message.author.id)+1)
                    if(storage[message.guild.id].get(message.author.id) == 3) {
                        // 10 minute mute.
                        message.member.addRole(message.guild.roles.find("name","Muted"),"FileScanner AutoMute: Violations reached 3.");
                        message.author.send("You have been automatically muted in "+message.guild.name+" for 10 minutes for attempting to post malware.");
                        setTimeout(() => {
                            try{
                                message.member.removeRole(message.guild.roles.find("name","Muted"),"FileScanner AutoMute: 10 minutes over.");
                                message.author.send("You have been automatically unmuted in "+message.guild.name+". Your 10 minutes is over.");
                            }catch(e) {
                                // Probably got banned lol
                            }
                        },(10*60)*1000);
                    }else if(storage[message.guild.id].get(message.author.id) == 4) {
                        // Kick.
                        message.author.send("You have been automatically kicked from "+message.guild.name+" for attempting to post malware.").then(msg => {
                            message.member.kick("FileScanner AutoKick: Violations reached 4.");
                        });
                    }else{
                        message.channel.send("**HEY!** <@"+message.author.id+"> Please dont post any unsafe files! You are on strike: "+storage[message.guild.id].get(message.author.id)+".");
                    }
                }else{
                    storage[message.guild.id].set(message.author.id, 1)
                    message.channel.send("**HEY!** <@"+message.author.id+"> Please dont post any unsafe files! You are on strike: "+storage[message.guild.id].get(message.author.id)+".");
                }
            }*/
            message.delete();            
        }
    }
    /*if(urlRegex({strict: false}).test(message.content)) {
        var urls = message.content.match(urlRegex())
        // Link Detected. Is it a 'safe' link?
        urls.forEach(url => {
            if(url.includes("cdn.") && !url.includes("?v=")) {
                // We dont trust any cdn but if it contains a ?v= we will split it and remove it.
                let rurl = url.split("?v=");
                rurl = url.splice(url.length-1);
                url = url.replace(rurl.join(""),"");
                if(!isCDNSafe(url)){
                    message.delete();
                    message.channel.send(Embeds.website.check).then(m => {
                        VirusTotal.UrlEvaluation(url,function(data){
                            console.dir(data);
                            var result = data.positives
                            if(result >= 1){
                                // Kinda OK
                                var embed = Embeds.website.bad;
                                embed.setDescription("**The URL that was posted was flagged for containing malware** on **__"+result+"__** databases. If you visited this url, Run a malware scan immediatly.");
                                embed = embed.setURL(data.permalink);
                                m.edit(embed);
                            }else{
                                var embed = Embeds.website.safe
                                embed = embed.setURL(data.permalink);
                                m.edit(message.content,{embed});
                            }
                        }, function(err){
                            console.error(err);
                        });
                    });
                }
            }else{
                if(!isURLSafe(url)) {
                    message.delete()
                    message.channel.send(Embeds.website.check).then(m => {
                        VirusTotal.UrlEvaluation(url,function(data){
                            console.dir(data);
                            var result = data.positives
                            if(result >= 1){
                                // Kinda OK
                                var embed = Embeds.website.bad;
                                embed.setDescription("**The URL that was posted was flagged for containing malware** on **__"+result+"__** databases. If you visited this url, Run a malware scan immediatly.");
                                embed = embed.setURL(data.permalink);
                                m.edit(embed);
                            }else{
                                var embed = Embeds.website.safe
                                embed = embed.setURL(data.permalink);
                                m.edit(message.content, {embed});
                            }
                        }, function(err){
                            console.error(err);
                        });
                    });
                }
            }
        });
    }*/
});
Client.on("messageUpdate", (old,message) => {
    if(message.author.bot) return;
    // Updated message. We're gonna check to see if there are attachments
    if(message.attachments.size != 0) {
        // There are attachments. Scan them.
        if(!isFileSafe(message.attachments)) {
            //if(!storage.hasOwnProperty(message.guild.id)) {
                //storage[message.guild.id] = new Map([[message.author.id,1]])
                message.channel.send("**HEY!** <@"+message.author.id+"> Please dont post any unsafe files!");
                //message.channel.send("**HEY!** <@"+message.author.id+"> Please dont post any unsafe files! You are on strike: "+storage[message.guild.id].get(message.author.id)+".");
            /*}else{
                if(storage[message.guild.id].has(message.author.id)) {
                    storage[message.guild.id].set(message.author.id, storage[message.guild.id].get(message.author.id)+1)
                    if(storage[message.guild.id].get(message.author.id) == 3) {
                        // 10 minute mute.
                        message.member.addRole(message.guild.roles.find("name","Muted"),"FileScanner AutoMute: Violations reached 3.");
                        message.author.send("You have been automatically muted in "+message.guild.name+" for 10 minutes for attempting to post malware.");
                        setTimeout(() => {
                            try{
                                message.member.removeRole(message.guild.roles.find("name","Muted"),"FileScanner AutoMute: 10 minutes over.");
                                message.author.send("You have been automatically unmuted in "+message.guild.name+". Your 10 minutes is over.");
                            }catch(e) {
                                // Probably got banned lol
                            }
                        },(10*60)*1000);
                    }else if(storage[message.guild.id].get(message.author.id) == 4) {
                        // Kick.
                        message.author.send("You have been automatically kicked from "+message.guild.name+" for attempting to post malware.").then(msg => {
                            message.member.kick("FileScanner AutoKick: Violations reached 4.");
                        });
                    }else{
                        message.channel.send("**HEY!** <@"+message.author.id+"> Please dont post any unsafe files! You are on strike: "+storage[message.guild.id].get(message.author.id)+".");
                    }
                }else{
                    storage[message.guild.id].set(message.author.id, 1)
                    message.channel.send("**HEY!** <@"+message.author.id+"> Please dont post any unsafe files! You are on strike: "+storage[message.guild.id].get(message.author.id)+".");
                }
            }*/
            message.delete();
        }
    }
    /*if(urlRegex({strict: false}).test(message.content)) {
        var urls = message.content.match(urlRegex())
        // Link Detected. Is it a 'safe' link?
        urls.forEach(url => {
            if(url.includes("cdn.") && !url.includes("?v=")) {
                // We dont trust any cdn but if it contains a ?v= we will split it and remove it.
                let rurl = url.split("?v=");
                rurl = url.splice(url.length-1);
                url = url.replace(rurl.join(""),"");
                if(!isCDNSafe(url)){
                    message.delete();
                    message.channel.send(Embeds.website.check).then(m => {
                        VirusTotal.UrlEvaluation(url,function(data){
                            console.dir(data);
                            var result = data.positives
                            if(result >= 1){
                                // Kinda OK
                                var embed = Embeds.website.bad;
                                embed.setDescription("**The URL that was posted was flagged for containing malware** on **__"+result+"__** databases. If you visited this url, Run a malware scan immediatly.");
                                embed = embed.setURL(data.permalink);
                                m.edit(embed);
                            }else{
                                var embed = Embeds.website.safe
                                embed = embed.setURL(data.permalink);
                                m.edit(message.content,{embed});
                            }
                        }, function(err){
                            console.error(err);
                        });
                    });
                }
            }else{
                if(!isURLSafe(url)) {
                    message.delete()
                    message.channel.send(Embeds.website.check).then(m => {
                        VirusTotal.UrlEvaluation(url,function(data){
                            console.dir(data);
                            var result = data.positives
                            if(result >= 1){
                                // Kinda OK
                                var embed = Embeds.website.bad;
                                embed.setDescription("**The URL that was posted was flagged for containing malware** on **__"+result+"__** databases. If you visited this url, Run a malware scan immediatly.");
                                embed = embed.setURL(data.permalink);
                                m.edit(embed);
                            }else{
                                var embed = Embeds.website.safe
                                embed = embed.setURL(data.permalink);
                                m.edit(message.content, {embed});
                            }
                        }, function(err){
                            console.error(err);
                        });
                    });
                }
            }
        });
    }*/
});

Client.on("guildCreate", guild => {
    console.log("Joined: "+guild.name);
    if(guild.systemChannel == undefined){
        guild.owner.send("Hello! I am FileScanner. I am designed to automatically remove unsafe files from your server.\nI work on a 4 strike system.\nStrike 1-2 = Warning\nStrike 3 = Mute for 10 minutes\nStrike 4 = Kick.");
    }else{
        guild.systemChannel.send("Hello! I am FileScanner. I am designed to automatically remove unsafe files from your server.\nI work on a 4 strike system.\nStrike 1-2 = Warning\nStrike 3 = Mute for 10 minutes\nStrike 4 = Kick.").catch(error => {
            guild.owner.send("Hello! I am FileScanner. I am designed to automatically remove unsafe files from your server.\nI work on a 4 strike system.\nStrike 1-2 = Warning\nStrike 3 = Mute for 10 minutes\nStrike 4 = Kick.");
        });
    }
  if(!guild.roles.has("name","Muted")) {
    guild.createRole({
      name: 'Muted',
    }).then(role => {
      guild.channels.array().forEach(channel => {
        channel.overwritePermissions(role,{SEND_MESSAGES: false});
      })
      guild.systemChannel.send("I didn't detect a Muted role on this server. I have created one for you.").catch(error => {
        guild.owner.send("I didn't detect a Muted role on your server. I have created one for you.");
      })
    })
  }
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  Client.login(process.env.TOKEN);
  console.log('Your app is listening on port ' + listener.address().port);
});
