import OpenAI from "openai";

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const DEEPSEEK_AI_API_KEY = process.env.DEEPSEEK_AI_API_KEY;

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: DEEPSEEK_AI_API_KEY,
});

// Tools

function getWheatherData(city = "") {
  if (!city) return "Please provide a city name";
  if (city === "new delhi") return "30 °C";
  if (city === "mumbai") return "32 °C";
  if (city === "kolkata") return "28 °C";
  if (city === "chennai") return "30 °C";
  if (city === "bangalore") return "25 °C";
  return "City not found";
}

const System_Promt = `
You are an A1 Assistant with START, PLAN, ACTION, Obeservation and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate toots and wait for Observation based on Action.
Once you get the observations, Return the AI response based on START propmt and observations

Available Toots:
— function getWeatherDetaits(city: string): string
getWeatherDetaits is a function that accepts city name as string and retuns the weather details

Example :
START
{"type": "user", "user": "What is the sum of weather of Patiala and Mohali?"}
{"type": "plan", "plan": "I wilt catt the getWeatherDetaits for Patiala" }
{"type": "action","function": "getWeatherDetaits", "input": "patiata" }

{"type": "observation", "observation : "30C"}
{"type": "plan", "plan": "l will call getWeatherDetaits for Mohali" }
{"type": "action", "function": "getWeatherDetails", "input": "mohali" }
{"type": "observation", "observation : "32C"}
{"type": "output", "output": "The sum of weather of Patiala and Mohali is 62C"}

`;

const content = "What is the wheather of new delhi ?";

async function main() {
  const completion = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: System_Promt,
      },
      {
        role: "user",
        content: content,
      },
    ],
    model: "deepseek/deepseek-r1:free",
  });

  console.log(completion.choices[0].message.content);
}

main();
