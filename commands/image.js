import { Configuration, OpenAIApi } from "openai";
import {
  produceResponseObjectForText,
  produceImmediateResponse,
} from "../helpers/utils.js";

const matcher = /!image/;

function run(command, request) {
  const chatString = command.split(" ").slice(1).join(" ");

  if (chatString.length) {
    return new Promise(function (resolve, reject) {
      try {
        const configuration = new Configuration({
          apiKey: process.env.OPEN_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        openai
          .createImage({
            prompt: chatString,
            n: 1,
            size: "512x512",
          })
          .then((completion) => {
            const responseString = completion.data.data[0].url;
            return resolve(
              produceResponseObjectForText(
                responseString || "Talk to AJ something fucked up"
              )
            );
          })
          .catch((e) => {
            console.error(e);
            // reject(e);
            return resolve(
              produceResponseObjectForText("Talk to AJ something fucked up")
            );
          });
      } catch (e) {
        // reject(e);
        return resolve(
          produceResponseObjectForText("Talk to AJ something fucked up")
        );
      }
    });
  } else {
    return produceImmediateResponse("How did you get here dumb dumb");
  }
}

export default {
  run,
  matcher,
};
