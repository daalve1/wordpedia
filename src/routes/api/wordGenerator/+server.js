import { Configuration, OpenAIApi } from 'openai'
import { API_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'

let NUM_WORDS = "cinco"
let NUM_LETTERS = "seis"

// Función para interactuar con la API de ChatGPT
export async function GET() {
    const configuration = new Configuration({ 
        apiKey: API_KEY
    })
    const openai = new OpenAIApi(configuration)

    const messages = [{
        role: 'system',
        content: 'Eres una IA que genera una lista de palabras y sus definiciones. El usuario te especifica el número de palabras entre los signos `{{` y `}}` y el tamaño exacto de las palabras entre los signos `[[` y `]]`.'
    }, {
        role: 'user',
        content: '{{dos}} [[tres]]'
    }, {
        role: 'assistant',
        content: '1. Sol: Se refiere a la estrella situada en el centro del sistema solar, alrededor del cual giran los planetas. 2. Mar: Masa de agua salada que cubre la mayor parte de la superficie terrestre.'
    }, {
        role: 'user',
        content: '{{cuatro}} [[cinco]]'
    }, {
        role: 'assistant',
        content: '1. Agudo: Que tiene la punta afilada o es puntiagudo. 2. Tenaz: Que muestra una gran persistencia, firmeza o resistencia ante las dificultades. 3. Épico: Que pertenece a una época destacada o a un periodo histórico importante. 4. Fugaz: Que dura muy poco tiempo o se desvanece rápidamente.'
    }, {
        role: 'user',
        content: '{{tres}} [[seis]]'
    }, {
        role: 'assistant',
        content: '1. Tóxico: Que es venenoso o tiene propiedades nocivas para los seres vivos. 2. Lúdico: Relacionado con el juego, la diversión o la recreación. 3. Íntimo: Relacionado con la esfera privada, personal o afectiva.'
    }]

    const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            ...messages,
            {
                role: 'user',
                content: `Dame un listado de {{${NUM_WORDS}}} palabras y cada palabra tenga [[${NUM_LETTERS}]] letras cada una`
            }
        ]
    })
    
    return json(completion.data.choices[0]?.message?.content)
}