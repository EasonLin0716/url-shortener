module.exports = (num) => {
  return Math.random().toString(32).slice(-num)
}