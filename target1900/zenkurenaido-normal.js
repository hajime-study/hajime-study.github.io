(function(jsPDFAPI){
  var font = "BASE64_ENCODED_DATA_HERE";
  var add = function(){
    this.addFileToVFS('ZenKurenaido-Regular.ttf', font);
    this.addFont('ZenKurenaido-Regular.ttf', 'ZenKurenaido', 'normal');
  };
  jsPDFAPI.events.push(['addFonts', add]);
})(jsPDF.API);
