export default (number, word, plural) => {
  if (typeof number !== 'number' || (number % 100 !== 11 && number % 10 === 1)) return word;
  return plural || `${word}s`;
};
