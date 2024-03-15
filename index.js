import {GoogleGenerativeAI} from 'https://esm.run/@google/generative-ai';

// Fetch your API Key
const API_KEY = 'YOUR_API_KEY';

// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(API_KEY);

const open = document.getElementById('open');
const modal_container = document.getElementById('modal_container');
const close = document.getElementById('close');

const respDialog = document.querySelector("dialog");
const message = document.getElementById('message');


const filePicker = document.getElementById('file');



open.addEventListener('click', async () => {
    async function run() {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({model: "gemini-pro"});

        const promptText = document.getElementById('gemini-prompt').value;

        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text();

        const afterPromptResponse = document.getElementById('gemini-response');
        afterPromptResponse.innerText = text;

        console.log(text);
    }

    await run();
    modal_container.classList.add('show');
});

close.addEventListener('click', () => {
    modal_container.classList.remove('show');
});

filePicker.addEventListener('change', async(event) => {
    event.preventDefault();
    // ...

    // Converts a File object to a GoogleGenerativeAI.Part object.
    async function fileToGenerativePart(file) {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    }

    async function run() {
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
        console.log(text);
    }

    await run();
    respDialog.show();
})




