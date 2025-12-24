/**
 * Bibliothèque de validation centralisée pour sécuriser les inputs
 */

/**
 * Valide qu'une URL est sécurisée (http/https uniquement)
 * Bloque javascript:, data:, file:, etc.
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false

  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Valide qu'une URL d'image est sécurisée
 */
export function isValidImageUrl(url) {
  if (!isValidUrl(url)) return false

  // Optionnel: vérifier l'extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const urlLower = url.toLowerCase()

  // Si l'URL contient un query string, on vérifie avant le ?
  const pathPart = urlLower.split('?')[0]

  return validExtensions.some(ext => pathPart.endsWith(ext)) ||
         pathPart.includes('/image') || // URLs type CDN
         pathPart.includes('.supabase.co/storage') // Supabase storage
}

/**
 * Valide un email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) && email.length <= 254
}

/**
 * Valide un numéro de téléphone français
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false
  // Enlever les espaces, points, tirets
  const cleaned = phone.replace(/[\s.\-]/g, '')
  // Format: 0X XX XX XX XX ou +33X XX XX XX XX
  const regex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{2}){4}$/
  return regex.test(cleaned)
}

/**
 * Valide un nom (prénom/nom de famille)
 */
export function isValidName(name) {
  if (!name || typeof name !== 'string') return false
  return name.length >= 2 &&
         name.length <= 100 &&
         /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)
}

/**
 * Valide un prix
 */
export function isValidPrice(price) {
  const num = parseFloat(price)
  return !isNaN(num) && num >= 0 && num <= 50000
}

/**
 * Valide un message texte
 */
export function isValidMessage(message) {
  if (!message || typeof message !== 'string') return false
  return message.trim().length >= 10 && message.length <= 5000
}

/**
 * Sanitise une chaîne de texte (limite longueur, trim)
 */
export function sanitizeText(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return ''
  return text.trim().slice(0, maxLength)
}

/**
 * Valide une date (doit être dans le futur)
 */
export function isValidFutureDate(dateStr) {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Début de la journée
    return !isNaN(date.getTime()) && date >= now
  } catch {
    return false
  }
}

/**
 * Fonction helper pour valider un formulaire complet
 */
export function validateForm(data, rules) {
  const errors = {}

  for (const [field, validator] of Object.entries(rules)) {
    const value = data[field]

    if (!validator(value)) {
      errors[field] = `${field} invalide`
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export default {
  isValidUrl,
  isValidImageUrl,
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidPrice,
  isValidMessage,
  sanitizeText,
  isValidFutureDate,
  validateForm
}
