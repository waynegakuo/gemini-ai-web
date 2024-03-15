import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// Fetch your API Key : > config
const API_KEY = "KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

// Get elements from the DOM
const open = document.getElementById("open");
const modal_container = document.getElementById("modal_container");
const close = document.getElementById("close");
const respDialog = document.querySelector("dialog");
const message = document.getElementById("message");
const filePicker = document.getElementById("file");
const afterPromptResponse = document.getElementById("gemini-response");
const images = document.getElementById("images");

// Ask gemini anything using text - text-only input
open.addEventListener("click", async () => {
  try {
    const askGemini = async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const promptText = document.getElementById("gemini-prompt").value;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      afterPromptResponse.innerText = text;
    };
    await askGemini();
    modal_container.classList.add("show");
  } catch (error) {
    const message = error?.message ?? "Something went wrong"
    console.warn(message);
    alert(message)
  }
});

close.addEventListener("click", () => {
  modal_container.classList.remove("show");
});

// Use image only to prompt gemini
filePicker.addEventListener("change", async (event) => {
  event.preventDefault();
  try {
    // Converts a File object to a GoogleGenerativeAI.Part object.
    async function fileToGenerativePart(file) {
      const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
      return {
        inlineData: {
          data: await base64EncodedDataPromise,
          mimeType: file.type,
        },
      };
    }

    const askGemini = async () => {
      // For text-and-images input (multimodal), use the gemini-pro-vision model
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      const prompt = "What's different between these pictures?";

      const fileInputEl = document.querySelector("input[type=file]");
      const imageParts = await Promise.all(
        [...fileInputEl.files].map(fileToGenerativePart)
      );

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();

      message.innerText = text;

      const fileList = [...fileInputEl.files]

      fileList.forEach(file => {
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const el = document.createElement('img')
            el.src = e.target.result
            images.appendChild(el)
          };
          reader.readAsDataURL(file);
        }
      })
    };
    await askGemini();
    respDialog.show();
  } catch (error) {
    const message = error?.message ?? "Something went wrong"
    console.warn(message);
    alert(message)
  }
});
