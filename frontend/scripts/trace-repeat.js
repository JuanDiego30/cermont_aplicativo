const originalRepeat = String.prototype.repeat;
String.prototype.repeat = function(count) {
  if (typeof count === 'number' && count < 0) {
    console.error('String.repeat called with', count);
    console.error(new Error('Repeat stack trace').stack);
  }
  return originalRepeat.call(this, count);
};
