// generate unique id 6 digit

exports.uniqueId = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
