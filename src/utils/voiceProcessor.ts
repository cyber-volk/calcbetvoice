export const processVoiceInput = (transcript: string, isNumberField: boolean = true): string => {
  if (!isNumberField) {
    return transcript.trim()
  }

  // Convert both Arabic and French number words to digits
  const numberWords: { [key: string]: string } = {
    // French numbers
    'zéro': '0', 'un': '1', 'deux': '2', 'trois': '3', 'quatre': '4',
    'cinq': '5', 'six': '6', 'sept': '7', 'huit': '8', 'neuf': '9',
    'dix': '10', 'onze': '11', 'douze': '12', 'treize': '13', 'quatorze': '14',
    'quinze': '15', 'seize': '16', 'vingt': '20', 'trente': '30',
    'quarante': '40', 'cinquante': '50', 'soixante': '60',
    'soixante-dix': '70', 'quatre-vingt': '80', 'quatre-vingt-dix': '90',
    'cent': '100', 'cents': '100', 'mille': '1000',
    
    // Modern Arabic numbers as words
    'صفر': '0', 'واحد': '1', 'اثنين': '2', 'ثلاثة': '3', 'اربعة': '4',
    'خمسة': '5', 'ستة': '6', 'سبعة': '7', 'ثمانية': '8', 'تسعة': '9',
    'عشرة': '10', 'عشرين': '20', 'ثلاثين': '30', 'اربعين': '40',
    'خمسين': '50', 'ستين': '60', 'سبعين': '70', 'ثمانين': '80',
    'تسعين': '90', 'مية': '100', 'الف': '1000'
  }

  // Clean up the transcript
  let processed = transcript.toLowerCase().trim()

  // Replace common speech recognition errors in both languages
  const corrections: { [key: string]: string } = {
    // French corrections
    'virgule': '.',
    'point': '.',
    'plus': '+',
    'et': '+',
    'euro': '',
    'euros': '',
    'zéros': 'zéro',
    'OK': 'ok',
    
    // Arabic corrections
    'فاصلة': '.',
    'نقطة': '.',
    'زائد': '+',
    'و': '+',
    'دينار': '',
    'دنانير': '',
    'موافق': 'ok',
    'نعم': 'ok'
  }

  // Handle French compound numbers (e.g., "cinq cents" = 500)
  const matches = processed.match(/(\w+)\s+cents?/g)
  if (matches) {
    matches.forEach(match => {
      const [number] = match.split(/\s+/)
      if (numberWords[number]) {
        const value = parseInt(numberWords[number]) * 100
        processed = processed.replace(match, value.toString())
      }
    })
  }

  // Apply corrections
  Object.entries(corrections).forEach(([key, value]) => {
    processed = processed.replace(new RegExp(key, 'g'), value)
  })

  // Convert number words to digits
  Object.entries(numberWords).forEach(([word, digit]) => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit)
  })

  // Handle decimal numbers (both . and ,)
  processed = processed.replace(/(\d+)[.,](\d+)/g, '$1.$2')

  // Handle additions
  processed = processed.replace(/(\d+)\s*\+\s*(\d+)/g, '$1+$2')

  // For details field, preserve existing value
  if (processed.includes('+')) {
    return processed
  }

  // Clean up any remaining non-numeric characters except . and +
  processed = processed.replace(/[^\d.+]/g, '')

  // Return empty string if no valid content
  return processed || '0'
} 