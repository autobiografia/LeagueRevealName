const ps = require("ps-node");
const path = require("path");
const axios = require("axios");

function findLeagueClientProcess() {
  return new Promise((resolve, reject) => {
    ps.lookup(
      {
        command: path.basename("LeagueClientUx.exe"),
        psargs: "ux", // Just to filter user processes
      },
      (err, processes) => {
        if (err) {
          reject(err);
        } else if (processes.length > 0) {
          resolve(processes[0]);
        } else {
          resolve(null);
        }
      }
    );
  });
}

async function Main() {
  try {
    const proc = await findLeagueClientProcess();

    if (proc) {
      console.log("League of Legends found:");
      // console.log("PID: " + proc.pid);
      // console.log("Name: " + proc.command);
      const extractArgValue = (argPrefix) => {
        const arg = proc.arguments.find((arg) => arg.startsWith(argPrefix));
        return arg ? arg.split("=")[1] : null;
      };
      
      // Not using
      // const appPid = extractArgValue("--app-pid=");
      // const appPort = extractArgValue("--app-port=");
      // const remotingAuthToken = extractArgValue("--remoting-auth-token=");

      // Just:
      const riotClientAuthToken = extractArgValue("--riotclient-auth-token=");
      const riotClientAppPort = extractArgValue("--riotclient-app-port=");

      // console.log("--app-pid: ", appPid);
      // console.log("--app-port: ", appPort);
      // console.log("--remoting-auth-token: ", remotingAuthToken);
      // console.log("--riotclient-auth-token: ", riotClientAuthToken);
      // console.log("--riotclient-app-port: ", riotClientAppPort);

      requestTest(riotClientAppPort, riotClientAuthToken);
    } else {
      console.log("League of Legends not found.");
    }
  } catch (e) {
    console.error(e);
  }
}

async function requestTest(port, token) {
  const baseUrl = `https://127.0.0.1:${port}`;
  const auth = {
    username: "riot",
    password: token,
  };
  const instance = await axios.create({
    baseURL: baseUrl,
    auth,
    httpsAgent: new require("https").Agent({ rejectUnauthorized: false }),
    //headers: {
    //  "Content-Type": "application/json",
    //  Accept: "application/json",
    //},
  });

  // Profile
  //instance
  //  .get("/lol-summoner/v1/current-summoner")
  //  .then((response) => {
  //    console.log(response.data);
  //  })
  //  .catch((e) => {
  //    console.log(e);
  //  });

  //

  instance
    .get("/chat/v5/participants/champ-select")
    .then((response) => {
      const participants = response.data.participants;

      participants.forEach((participant) => {
        console.log(
          `Name: ${participant.name}#${participant.game_tag} / ${participant.game_name} - Region: ${participant.region} ${participant.muted}`
        );
      });
      const names = participants.map((participant) => participant.name);

      console.log(
        `https://u.gg/multisearch?summoners=${names.join(",")}&region=br1`
      );
    })
    .catch((e) => {
      console.log(e);
    });
}
Main();










// @autobiografia