import os
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Cargar la clave de API desde el archivo .env
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Configurar el SDK de Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# Inicializar la aplicación FastAPI
app = FastAPI()

# Configurar CORS (Cross-Origin Resource Sharing)
# Esto es crucial para permitir que tu frontend (página web) se comunique con este backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las origenes, puedes restringirlo a tu dominio
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras
)

# Definir el modelo de datos para la solicitud (request) usando Pydantic
# Esto asegura que los datos que llegan tienen el formato correcto
class ChatRequest(BaseModel):
    message: str
    temperature: float
    top_k: int
    top_p: float

# Crear el endpoint /chat que acepta solicitudes POST
@app.post("/chat")
async def chat_handler(request: ChatRequest):
    """
    Este endpoint recibe un mensaje y los parámetros de generación,
    y devuelve una respuesta del modelo Gemini.
    """
    try:
        # Configuración de generación basada en los parámetros recibidos
        generation_config = genai.types.GenerationConfig(
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            max_output_tokens=2048 # Puedes ajustar este valor según necesites
        )

        # Seleccionar el modelo
        # Nota: Usamos 'gemini-1.5-pro-latest' como un ejemplo robusto y actual.
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash-latest',
            generation_config=generation_config
        )

        # Generar la respuesta de forma asíncrona
        response = await model.generate_content_async(request.message)

        return {"reply": response.text}

    except Exception as e:
        # Manejo básico de errores
        return {"error": f"Ha ocurrido un error: {str(e)}"}

# Un endpoint raíz para verificar que el servidor funciona
@app.get("/")
def read_root():
    return {"status": "El servidor del chatbot está funcionando"}