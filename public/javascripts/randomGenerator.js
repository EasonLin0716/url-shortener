module.exports = (num) => {
  return Math.random().toString(16).slice(-num)
}