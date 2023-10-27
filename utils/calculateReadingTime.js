const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  // split words by spaces to get the number of words
  const numberOfWords = text.split(/\s/g).length;
  // divide the number of words by the average words per minute to get the reading time in minutes
  return Math.ceil(numberOfWords / wordsPerMinute);
};

module.exports = calculateReadingTime;
