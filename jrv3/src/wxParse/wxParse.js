import HtmlToJson from './html2json.js';
function wxParse(data) {
  return HtmlToJson.html2json(data);
}
module.exports = wxParse
