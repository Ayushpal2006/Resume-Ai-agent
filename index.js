import OpenAI from "openai";
import readlineSync from "readline-sync";

// const OPEN_AI_API_KEY = process.env.OPEN_AI_KEY;
// const DEEPSEEK_AI_API_KEY = process.env.DEEPSEEK_AI_KEY;


  
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: DEEPSEEK_AI_API_KEY,
});

// Tools

function getWeatherData(city = "") {
  if (!city) return "Please provide a city name";
  if (city === "new delhi") return "30 °C";
  if (city === "mumbai") return "32 °C";
  if (city === "kolkata") return "28 °C";
  if (city === "chennai") return "30 °C";
  if (city === "bangalore") return "25 °C";
  return "City not found";
}

const tools = {
  getWeatherDetails: getWeatherData,
};

const System_Prompt = `
You are an AI Assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, Return the AI response based on START prompt and observations

Strictly follow the JSON output format as in examples

Available Tools:
- function getWeatherDetails(city: string): string
getWeatherDetails is a function that accepts city name as string and returns the weather details

Example :
START
{"type": "user", "user": "What is the sum of weather of Patiala and Mohali?"}
{"type": "plan", "plan": "I will response the getWeatherDetails for Patiala" }
{"type": "action","function": "getWeatherDetails", "input": "patiala" }

{"type": "observation", "observation" : "30C"}
{"type": "plan", "plan": "I will response getWeatherDetails for Mohali" }
{"type": "action", "function": "getWeatherDetails", "input": "mohali" }
{"type": "observation", "observation" : "32C"}
{"type": "output", "output": "The sum of weather of Patiala and Mohali is 62C"}

`;

const messages = [{ role: "system", content: System_Prompt }];

while (true) {
  const query = readlineSync.question(">>>> ");
  const q = { type: "user", user: query };
  messages.push({ role: "user", content: JSON.stringify(q) });

  while (true) {
    const completion = await client.chat.completions.create({
      messages,
      model: "deepseek/deepseek-r1:free",
    });

    const result = completion.choices[0].message.content;
    messages.push({ role: "assistant", content: result });

    try {
      const response = JSON.parse(result);

      if (response.type === "output") {
        console.log(`🤖 ${response.output}`);
        break;
        
      } else if (response.type === "action") {
        const fn = tools[response.function];
        const observation = fn(response.input);
        const obs = { type: "observation", observation };
        messages.push({ role: "assistant", content: JSON.stringify(obs) });
        console.log(observation);
      }
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      console.error('Result:', result);
      break;
    }
  }
}