const express = require("express")
const app = express();
app.use(express.json())
const { Client } = require('pg')

app.post('/post_edge_offline', (req, res) => { //route for the POST


    incomingJson = req.body
    console.log(incomingJson);



    var count = Object.keys(incomingJson).length;
    var i;
    for (i = 0; i < count; i++) {
        console.log(incomingJson[i]['osm_id'])
    }


    const client = new Client({
        user: "internship2020",
        password: "internship passpass",
        host: "territoire.emse.fr",
        port: 5433,
        database: "mobileEntrepriseInfo"
    })

    execute()

    async function execute() {

        try {
            var results1 = []
            var variable = []
            var result2 = []


            var results3 = []
            var results4 = []

            await client.connect();
            console.log("connected successfully")
            var count = Object.keys(incomingJson).length;
            var i;

            var messages = "";
            Loop1: for (i = 0; i < count; i++) { //loop for list of object literals
                results1[i] = await client.query(`select osm_id,maxspeed,previous_maxspeed from osm_line_stetienne where osm_id=${incomingJson[i]['osm_id']}`)
                variable[i] = results1[i].rows
                console.log(variable[i], "---------------------")



                let countOfRows = variable[i].length; //1st element of 1st object from the list
                Loop2: for (l = 0; l < countOfRows; l++) {
                    if (variable[i][l]['maxspeed'] == null || variable[i][l]['maxspeed'] == incomingJson[i]['maxspeed']) {



                        result2[i] = await client.query(`update osm_line_stetienne set previous_maxspeed=${variable[i][l].maxspeed},maxspeed=${incomingJson[i]['requested_maxspeed']} where osm_id=${incomingJson[i]['osm_id']} returning osm_id,maxspeed,previous_maxspeed`)
                        console.log(result2[i].rows, "*")

                        messages += "Updated Successfully! ";

                    } else {

                        if (variable[i][l]['maxspeed'] == `${incomingJson[i]['requested_maxspeed']}`) {
                            messages += "Okay!Your maxspeed is updated!"; //when the new value is same as existing value


                        } else if (variable[i][l]['previous_maxspeed'] == `${incomingJson[i]['maxspeed']}`) {
                            results4[i] = await client.query(`INSERT INTO public."edge_conflict1"(osm_id,maxspeed,conflict)VALUES(${incomingJson[i]['osm_id']},${variable[i][l]['maxspeed']},${incomingJson[i]['requested_maxspeed']})`)
                            messages += "Your maxspeed is under review!"; //in case of conflict


                        } else if (variable[i][l]['previous_maxspeed'] !== `${incomingJson[i]['maxspeed']}` && variable[i][l]['maxspeed'] !== `${incomingJson[i]['requested_maxspeed']}`) {
                            results3[i] = await client.query(`INSERT INTO public."edge_conflict1"(osm_id,maxspeed,conflict)VALUES(${incomingJson[i]['osm_id']},${variable[i][l]['maxspeed']},${incomingJson[i]['requested_maxspeed']})`)
                            console.log(results3[i].rows)
                            messages += "Your maxspeed is under review!"; //in case of conflict
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


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));