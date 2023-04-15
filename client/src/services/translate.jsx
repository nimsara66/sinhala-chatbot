import translate from 'translate'

export const translateText = async (text, sourceLanguage, targetLanguage) => {
  try {
    const translation = await translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    })
    return translation
  } catch (error) {
    console.log(error)
    throw Error('Error occured while translating')
  }
}
