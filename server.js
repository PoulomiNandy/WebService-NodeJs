const express = require("express")
const app = express();
app.use(express.json())
var session = require('express-session');
app.use(session({
    secret: 'cookie_secret', //saving the data to use for second POST
    resave: true,
    saveUninitialized: true
}));


const { Client } = require('pg')

app.post('/post_edge', (req, res) => { //1st POST
    incomingJson = req.session;


    incomingJson = req.body
    console.log(incomingJson);



    var count = Object.keys(incomingJson).length; //fetching the length
    var i;
    for (i = 0; i < count; i++) {
        console.log(incomingJson[i]['osm_id'])
    }


    const client = new Client({
        user: "internship2020",
        password: "internship passpass", //database details
        host: "territoire.emse.fr",
        port: 5433,
        database: "mobileEntrepriseInfo"
    })

    execute()

    async function execute() { //the asynchronous function

        try { // if everything is fine then the control enters in try block
            var results = []
            var variable = []
            var resul = []
            var results8 = []
            var results10 = []

            await client.connect();
            console.log("connected successfully")
            var count = Object.keys(incomingJson).length;
            var i;

            var messages = "";
            Loop1: for (i = 0; i < count; i++) { //running the loop in order to get the object from list
                results[i] = await client.query(`select osm_id,maxspeed,previous_maxspeed from osm_line_stetienne where osm_id=${incomingJson[i]['osm_id']}`)
                variable[i] = results[i].rows
                console.log(variable[i], "---------------------")



                let countOfRows = variable[i].length;
                Loop2: for (l = 0; l < countOfRows; l++) { //to access the first element of 1st object
                    if (variable[i][l].maxspeed == null || variable[i][l].maxspeed == incomingJson[i]['maxspeed']) {



                        resul[i] = await client.query(`update osm_line_stetienne set maxspeed=${incomingJson[i]['requested_maxspeed']},previous_maxspeed=${variable[i][l].maxspeed} where osm_id=${incomingJson[i]['osm_id']} returning osm_id,maxspeed,previous_maxspeed`)
                        console.log(resul[i].rows, "*")

                        messages += "Updated Successfully!";

                    } else if (variable[i][l]['maxspeed'] === `${incomingJson[i]['requested_maxspeed']}`) {
                        messages += "ReUpdated!";


                    } else {



                        if (`variable[i][l]['previous_maxspeed'] == ${incomingJson[i]['maxspeed']} && variable[i][l]['maxspeed'] !== ${incomingJson[i]['requested_maxspeed']} `) {

                            console.log(`${incomingJson[i]['requested_maxspeed']}`)
                            messages += `Oops the value has already been updated to ${variable[i][l]['maxspeed']}, but you want ${incomingJson[i]['requested_maxspeed']}, do you want to continue?`;

                            app.post('/yesORno', (req, res) => { //start of conflict handle POST
                                incomingYesNO = req.body

                                console.log(incomingYesNO);
                                console.log(incomingYesNO[0]['yes/no'], "-------")
                                const { Client } = require('pg')
                                const client = new Client({
                                    user: "internship2020",
                                    password: "internship passpass",
                                    host: "territoire.emse.fr",
                                    port: 5433,
                                    database: "mobileEntrepriseInfo"
                                })







                                var messages2 = "";
                                if (incomingJson) {
                                    console.log(incomingJson)


                                    var count = Object.keys(incomingJson).length;
                                    var i;
                                    loop3: for (i = 0; i < count; i++) {


                                        let countOfRows = variable[i].length;
                                        Loop4: for (l = 0; l < countOfRows; l++) { //acceting list of object again
                                            if (incomingYesNO[i]['yes/no'] === "yes") {
                                                client.connect()
                                                    .then(() => client.query(`update osm_line_stetienne set maxspeed=${incomingJson[i]['requested_maxspeed']},previous_maxspeed=${variable[i][l].maxspeed} where osm_id=${incomingJson[i]['osm_id']} returning osm_id,maxspeed,previous_maxspeed`))
                                                    .then(results => console.table(results.rows))
                                                    .catch(e => console.log(e))
                                                    .finally(() => client.end())
                                                messages2 += `The value has now been updated to ${incomingJson[i]['requested_maxspeed']}`
                                            } else {
                                                messages2 += `goodbye`

                                            }


                                            return res.status(200).json({ msg: messages2 });

                                        }
                                    }
                                }

                            })



                        }


                    }
                    break Loop2
                }
            }

            return res.status(200).json({ msg: messages });

        } catch (ex) {
            console.log(`Something wrong happened ${ex}`)
            return res.status(500).json({ msg: ex });
        } finally {
            await client.end()
            console.log("client disconnected successfully")
        }
    }
})


const PORT = process.env.PORT || 5004;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));