
/** 
  * json转对象
  */
function jsonToObj(data) {
  return JSON.parse(data);
}
/** 
*对象转json 
*/
function objToJson(data) {
  return JSON.stringify(data);
}

module.exports = {
  jsonToObj: jsonToObj,
  objToJson: objToJson,
}  