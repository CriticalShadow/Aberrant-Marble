module.exports = Queue = function (native, foreign) {

  this.languages = {};
  this.languages.native = native;
  this.languages.foreign = foreign;
  this.storage = [];
};

Queue.stringify = function (native,foreign) {
  return JSON.stringify([native,foreign]);
};

Queue.prototype.stringify = function () {
  return Queue.stringify(this.languages.native,this.languages.foreign);
};

Queue.prototype.length = function () {
  return this.storage.length;
};

Queue.prototype.push = function (item){
  return this.storage.push(item);
};

Queue.prototype.shift = function () {
  return this.storage.shift();
};