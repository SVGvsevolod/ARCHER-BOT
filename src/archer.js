// Discord.js Discord API library
var Discord = require("discord.js");
// File system functions (to save/load data)
var fileSystem = require("fs");
// Workers-threads for background tasks (Was needed for certain non-happened features)
var workerSystem = require("worker_threads");

// Inner database for entrance verification system
// Contains object with number of phase and message object
// Stored in inner database object under user's id key
// E.g.: verifiction = { "user id" : { phase: 0, message: "djs message object" } }
var verification = {};

// Entrance verification system main function
// Accept one argument as object with phase number and user's id
var verification_ = (a)=>{
	// Checking for data in fuction argument
    if(a){
		// Determining verification phase with switch statement
        switch(a.phase){
            case 0:
				// Data for inner database
                archer.verification[a.id] = {
                    phase: 0,
                    message: undefined // The message of phase in #verification text channel
                };
				// Sending a message with first question to #verification text channel
                archer.client.channels.cache.get("806491297329709067").send({
                    content: "<@"+a.id+"> Please choose wisely.", // Message text outside embed with ping
                    embed: { // The embed object
                        color: "0x77b255",
                        description: "**Are you playing <:pso2icon:807322453843247114>` Phantasy Star Online 2`?**"
                    }
                }).then((b)=>{
					// Adding reactions for user interaction
                    b.react("✅");
                    b.react("❎");
					// Writing data to inner database under certain user's id
                    archer.verification[a.id].message = b;
                }).catch(()=>{
                    // If you don't know what went wrong
                });
                break;
            case 1:
				// If answer to first question was "no"
                if(a.option){
					// Removing previous phase message
                    archer.verification[a.id].message.delete().then(()=>{
						// Sending a message for answer "no" to #verification text channel
                        archer.client.channels.cache.get("806491297329709067").send({
                            content: "<@"+a.id+">", // Message text outside embed with ping
                            embed: { // The embed object
                                color: "0x77b255",
                                description: "**Sorry, this Discord server only for <:pso2icon:807322453843247114>` Phantasy Star Online 2` players.**"
                            }
                        }).then((b)=>{
							// Setting timeout for message removing
                            b.delete({timeout: 5000}).then(()=>{
								// Kicking the user out
                                archer.client.guilds.cache.get("806470865188945921").members.cache.get(a.id).kick();
								// Clearing the inner database
                                delete archer.verification[a.id];
                            }).catch(()=>{
                                // If you don't know what went wrong
                            });
                        }).catch(()=>{
                    		// If you don't know what went wrong
                        });
                    }).catch(()=>{
                        // If you don't know what went wrong
                    });
				// If answer to first question was "yes"
                }else{
					// Procceed to next verification phase
                    archer.verification[a.id].phase = 1;
					// Removing previous phase message
                    archer.verification[a.id].message.delete().then(()=>{
						// Sending a message with second question to #verification text channel
                        archer.client.channels.cache.get("806491297329709067").send({
                            content: "<@"+a.id+">", // Message text outside embed with ping
                            embed: { // The embed object
                                color: "0x77b255",
                                description: "**Have you joined the <:neptunia:807322984275640321>` Neptunia` alliance on `Ship 2`?**"
                            }
                        }).then((b)=>{
							// Adding reactions for user interaction
                            b.react("✅");
                            b.react("❎");
							// Writing data to inner database under certain user's id
                            archer.verification[a.id].message = b;
                        }).catch(()=>{
                    		// If you don't know what went wrong
                        });
                    }).catch(()=>{
                        // If you don't know what went wrong
                    });
                }
                break;
            case 2:
				// Determining by answer on second question which role to assign
                if(a.option){
                    archer.verification[a.id].role = 1; // Visitors and friends
                }else{
                    archer.verification[a.id].role = 0; // Provisional
                }
				// Procceed to next verification phase
                archer.verification[a.id].phase = 2;
				// Removing previous phase message
                archer.verification[a.id].message.delete().then(()=>{
					// Sending a message requesting user's player id to #verification text channel
                    archer.client.channels.cache.get("806491297329709067").send({
                        content: "<@"+a.id+">", // Message text outside embed with ping
                        embed: { // The embed object
                            color: "0x77b255",
                            description: "**Type here your player name.**\n*If you're in-game, go to Menu (Esc/Start) -> Personal Data (Person Icon) -> Titles/Arks ID -> Edit Arks ID -> Preview.*\n*If you want to change it, go to Start Menu (after Ship selection) -> Support Menu -> Change Player ID Name*"
                        }
                    }).then((b)=>{
						// Adding permission to send messages for user in #verification text channel to receive their player id
						// Gathering all text channel's permisions
                        var c = JSON.parse(JSON.stringify(b.channel.permissionOverwrites));
						// Getting rid of unnecessary
                        for(var i in c){
                            delete c[i].type;
                        }
						// Adding permissions to send message to our user
                        c[c.length] = {
                            id: a.id,
                            allow: 68608,
                            deny: 805761105
                        };
						// Setting permissions to text channel
                        b.channel.overwritePermissions(c);
						// Writing data to inner database under certain user's id
                        archer.verification[a.id].message = b;
                    }).catch(()=>{
                		// If you don't know what went wrong
                    });
                }).catch(()=>{
                    // If you don't know what went wrong
                });
                break;
            case 3:
				// Checking if user entered something something
                if(a.result){
					// Deleting mesage with entered something something
                    a.result.delete().then((b)=>{
						// Procceed to next verification phase
                        archer.verification[a.id].phase = 3;
						// Removing previous phase message
                        archer.verification[a.id].message.delete().then(()=>{
							// Removing permission to send messages in #verification text channel for user
							// Gathering all text channel's permisions
                            var c = JSON.parse(JSON.stringify(b.channel.permissionOverwrites));
                            for(var i in c){
								// Getting rid of unnecessary
                                delete c[i].type;
								// Removing permissions for our user
                                if(c[i].id === b.author.id)
                                    c.splice(i,1);
                            }
							// Setting permissions to text channel
                            b.channel.overwritePermissions(c);
							// Sending a message of finishing verification
                            archer.client.channels.cache.get("806491297329709067").send({
                                content: "<@"+a.id+">", // Message text outside embed with ping
                                embed: { // The embed object
                                    color: "0x77b255",
                                    description: "**Thank you. Welcome aboard.**"
                                }
                            }).then((d)=>{
								// Setting timeout for message removing
                                d.delete({timeout: 5000}).then(()=>{
									// If user's player id matches his Discord username then do nothing
									// Otherwise set his server's name as in-game player id
                                    if(b.content!==b.author.username){
                                        archer.client.guilds.cache.get("806470865188945921").members.cache.get(b.author.id).setNickname(b.content);
                                    }
									// Checking from inner database which role to give
                                    if(archer.verification[b.author.id].role){
										// Give Visitors and friends role to user
										archer.client.guilds.cache.get("806470865188945921").members.cache.get(b.author.id).roles.add(archer.client.guilds.cache.get("806470865188945921").roles.cache.get("807182610370527252"));
                                    }else{
										// Give Provisional role to user
                                        archer.client.guilds.cache.get("806470865188945921").members.cache.get(b.author.id).roles.add(archer.client.guilds.cache.get("806470865188945921").roles.cache.get("806476652363644928"));
                                    }
									// Clearing the inner database
                                    delete archer.verification[b.author.id];
                                }).catch(()=>{
                                    // If you don't know what went wrong
                                });
                            }).catch(()=>{
                                // If you don't know what went wrong
                            });
                        }).catch(()=>{
                            // If you don't know what went wrong
                        });
                    }).catch(()=>{
                        // If you don't know what went wrong
                    });
                }
                break;
        }
    }
};

// The part that A.R.C.H.E.R Discord does stuff with voice channels
// Bot creates voice channel with limit to 4 users (like in-game party limit) if someone joins Create party VC
// Then bot moves who joined Create party VC to recently created voice channel
var partyvc = {
	// Data of created voice channels that stored in vcdata.json file in case of bot shutdown
    channels : require("./vcdata.json"),
	// Voice channel creation function
    create : (a)=>{
		// Creating VC with name "Username's Party" and limit 4 and puts it to VC channels category
        a.guild.channels.create((a.member.nickname?a.member.nickname:a.member.user.username)+"'s Party",{
            type: "voice",
            userLimit: 4,
            parent: a.guild.channels.cache.get("806470865692131369")
        }).then((b)=>{
			// Moving requester to created voice channel
            a.setChannel(b);
			// Writing voice channel data
            archer.partyvc.channels[archer.partyvc.channels.length] = b.id;
			// Saving all voice channels data to file
            fileSystem.writeFile("archer/vcdata.json",JSON.stringify(archer.partyvc.channels),()=>{
                // If you don't know what went wrong
            });
        }).catch(()=>{
            // If you don't know what went wrong
        });
    },
	// Voice channel removing function
    remove : (a,b)=>{
		// Checking if voice channel is empty
        if(!a.channel.members.size){
			// Remove voice channel
            a.channel.delete();
			// Clear channel data
            archer.partyvc.channels.splice(b,1);
			// Saving all voice channels data to file
            fileSystem.writeFile("archer/vcdata.json",JSON.stringify(archer.partyvc.channels),()=>{
                // If you don't know what went wrong
            });
        }
    }
};

// Discord client object
var client = new Discord.Client();

// Event listener to when new member joins the server
client.on("guildMemberAdd",(a)=>{
	// The first check if member joined alliance server because A.R.C.H.E.R Discord bot exists on S.V.G's servers
	// The second check if member is not a Discord bot
	if(a.guild.id==="806470865188945921"&&!a.user.bot){
		// Starting the entrance verification process
    	archer.verification_({
        	phase: 0,
        	id: a.id // The new member id
    	});
	}
});

// Event listener to when someone left the server
client.on("guildMemberRemove",(a)=>{
	// If member left alliance server and during the verification process
	if(a.guild.id==="806470865188945921"&&archer.verification[a.id]){
		// Clear #verification text channel
		archer.verification[a.id].message.delete().then(()=>{
			// and verification inner database
			delete archer.verification[a.id];
		}).catch(()=>{ /* If you don't know what went wrong */ });
	}
});

// Event listener to when someone sent the message
client.on("message",(a)=>{
	// Checking if message sent in #verification text channel and during verification process
	// This is for the phase where user have to send their in-game player id
    if(a.channel.id==="806491297329709067"&&archer.verification[a.author.id]){
		// Calling verificaion main function
        archer.verification_({
            phase: archer.verification[a.author.id].phase+1, // Proceed to next phase
            id: a.author.id, // Who sent the message
            result: a // What they sent in the message
        });
    }
});

// Event listener to when someone reacted to the message
client.on("messageReactionAdd",(a,b)=>{
	// If user reacted to the question during verification process
    if(archer.verification[b.id]&&archer.verification[b.id].message===a.message){
		// If "yes"
        if(a._emoji.name==="✅"){
			// Calling verificaion main function
            archer.verification_({
                phase: archer.verification[b.id].phase+1, // Proceed to next phase
                option: 0, // The "yes" option
                id: b.id // Who is reacted
            });
		// If "no"
        }else if(a._emoji.name==="❎"){
			// Calling verificaion main function
            archer.verification_({
                phase: archer.verification[b.id].phase+1, // Proceed to next phase
                option: 1, // The "no" option
                id: b.id // Who is reacted
            });
        }
    }
});

// Event listener to when someone removed their reaction
client.on("messageReactionRemove",(a,b)=>{
    
});

// Event listener to when someone joins/move to voice channel or disconnects from it
client.on("voiceStateUpdate",(a,b)=>{
	// If this is "Create party VC"
    if(b.channelID==="851741912201166868")
		// Calling voice channel creation function
        partyvc.create(b);
    else
		// Checking if this was voice channel created by A.R.C.H.E.R
        for(var i in partyvc.channels)
            if(a.channelID===partyvc.channels[i]){
				// Calling voice channel removal function
                partyvc.remove(a,i);
                break;
            }
});

// Event listener to when A.R.C.H.E.R Discord bot is ready to kicking
client.on("ready",()=>{
	// Setting playing pso2 status
    archer.client.user.setActivity("PHANTASY STAR ONLINE 2",{type:"PLAYING"});
});

// Start A.R.C.H.E.R Discord bot
client.login("...");

// Make code parts available for debuging
module.exports = {Discord, verification, verification_, partyvc, client};