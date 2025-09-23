// translate.js
const axios = require('axios')
const fs = require('fs')
const path = require('path')

// API local Docker:
const LIBRE_API_URL = 'http://192.168.1.34:5000/translate'

// Idioma base (el de tu archivo en.json)
const SOURCE_LANG = 'en'

// Idiomas a traducir (agregamos todos los idiomas soportados)
const TARGET_LANGS = [
  'es', // Español
]

// Ruta a la carpeta i18n
const I18N_PATH = path.join(__dirname, 'src', 'assets', 'i18n')
const BASE_FILE = path.join(I18N_PATH, `${SOURCE_LANG}.json`)

async function translateText(text, targetLang) {
  try {
    const response = await axios.post(LIBRE_API_URL, {
      q: text,
      source: SOURCE_LANG,
      target: targetLang,
      format: 'text',
    })
    return response.data.translatedText
  } catch (error) {
    return text // Devuelve el original si falla
  }
}

async function translateObject(obj, lang) {
  const result = {}
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      result[key] = await translateObject(obj[key], lang)
    } else {
      result[key] = await translateText(obj[key], lang)
    }
  }
  return result
}

async function generateTranslations() {
  if (!fs.existsSync(BASE_FILE)) {
    process.exit(1)
  }

  const baseData = JSON.parse(fs.readFileSync(BASE_FILE, 'utf-8'))

  // Procesar cada idioma en paralelo para mayor velocidad
  await Promise.all(
    TARGET_LANGS.map(async (lang) => {
      try {
        const translatedData = await translateObject(baseData, lang)

        const outputFile = path.join(I18N_PATH, `${lang}.json`)
        fs.writeFileSync(
          outputFile,
          JSON.stringify(translatedData, null, 2),
          'utf-8'
        )
      } catch (error) {}
    })
  )
}

// Agregar manejo de errores general
generateTranslations()
  .then(() => {
    console.log('Todas las traducciones se han completado exitosamente.')
  })
  .catch((error) => {
    console.error('Error en el proceso de traducción:', error)
    process.exit(1)
  })
