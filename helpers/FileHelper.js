//import JSZip from 'jszip'
//import JSZipUtils from 'jszip-utils'
//import {saveAs} from 'file-saver'

let FileHelper = {
  downloadByURL: function (filename, url) {

    if (typeof(filename) !== 'string') {
      filename = url.slice(url.lastIndexOf('/') + 1)
    }
  
    let link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    //delete link;
  },
  downlaod: function (filename, content) {
    let blob = new Blob([content])
    saveAs(blob, filename)
  },
  
  // ---------------------
  
  triggerUpload: function (e) {
    $(e.target).parent().children('input:file:first').val('').click()
  },
  /**
   * 
   * @param {object} e
   * @param {Boolean} isPlainText 
   * @param {Function} callback
   * @returns {FileHelper}
   */
  upload: function (e, isPlainText, callback) {
    if (callback === undefined && typeof(isPlainText) === 'function') {
      callback = isPlainText
      isPlainText = true
    } 
    
    if (typeof(callback) !== 'function') {
      return this
    }
    
    let files
    if (typeof(e.files) === 'object') {
      files = e.files
    }
    else if (typeof(e.target) === 'object' 
            && typeof(e.target.files) === 'object') {
      files = e.target.files
    }
    else if (typeof(e.originalEvent) === 'object' 
            && typeof(e.originalEvent.dataTransfer) === 'object' 
            && typeof(e.originalEvent.dataTransfer.files) === 'object') {
      files = e.originalEvent.dataTransfer.files
    }
    //alert(e.target)
    
    if (files === undefined || files.length !== 1) {
      return this
    }
    
    let isArray = true
    if (typeof(files.name) === 'string') {
    //if (files.length > 1) {
      files = [files]
      isArray = false
    }
    
    let output = []
    let i = 0
    
    let reader = new FileReader();
    reader.onload = function (event) {
      let result = event.target.result
      output.push(result)
      i++
      loop(i)
    };
    
    let loop = (i) => {
      if (i < files.length) {
        let file = files[i]
        //console.log(file);
        //reader.readAsDataURL(file);
        if (isPlainText) {
          reader.readAsText(file)
        }
        else {
          reader.readAsDataURL(file)
        }
      }
      else {
        if (isArray === false) {
          output = output[0]
        }
        //console.log(output)
        callback(output)
      }
    }
    loop(i)
  },
  initDropUpload: function (message, dropCallback) {
    if (typeof(message) === 'function' && dropCallback === undefined) {
      dropCallback = message
      message = undefined
    }
    
    if (message === undefined) {
      message = 'Drop to Upload'
    }
    
    let dragoverClassname = 'dragover'
    
    //let doc = $('body')
    let $doc = $(document)
    let $body = $('body')
    
    $doc.on('dragenter', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $body.addClass(dragoverClassname)
    })
    
    $doc.on('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    
    $doc.on('drop', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $body.removeClass(dragoverClassname)
      return false
    })
    
    $doc.on('dragleave', (e) => {
      if (e.clientX === 0 || e.clientY === 0) {
        $body.removeClass(dragoverClassname)
      }
    })
    
    let dropLayer = $(`<div class="droplayer">${message}</div>`)
            .appendTo($body)
    if (typeof(dropCallback) === 'function') {
      dropLayer.on('drop', (e) => {
        dropCallback(e)
      })
    }
  }
}

window.FileHelper = FileHelper
//export default FileHelper