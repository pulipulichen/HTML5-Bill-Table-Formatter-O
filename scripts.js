Vue.config.productionTip = false
var app = new Vue({
  el: '#app',
  data: {
    input: '',
    fileType: 'ods'
  },
  mounted() {
    VueHelper.mount(this, 'fileType')
  },
  computed: {
    output: function () {
      let header = '本期交易明細'
      let posHeader = this.input.indexOf(header)
      let output  = this.input.slice(posHeader + header.length).trim()
      
      let footer = '您的信用卡循環信用'
      let posFooter = output.indexOf(footer)
      output = output.slice(0, posFooter).trim()
      
      if (posHeader === -1 || posFooter === -1) {
        return ''
      }
      // 先取得頭跟尾
      
      // -------------
      // 再來把它換成表格
      
      let table = $(`<table border="1" cellpadding="0" cellspacing="0">
                        <thead>
                          <tr>
                            <th>消費日</th>
                            <th>入帳日</th>
                            <th>說明</th>
                            <th>地區</th>
                            <th>兌換日</th>
                            <th>原幣金額</th>
                            <th>新台幣金額</th>
                          </tr>
                        </thead>
                        <tbody></tbody>
                     </table>`)
      let tbody = table.find('tbody')
      output.split('\n').forEach((line) => {
        line = line.trim()
        let tr = $('<tr></tr>')
        if (line.startsWith('1')) {
          // 表示這是一般支付
          
          let dateFields = line.slice(0, 19).split(' ')
          //$(`<td>${dateFields}</td>`).appendTo(tr)
          
          
          let fieldShoppingDate = dateFields[0].trim()
          //$(`<td>${fieldShoppingDate}</td>`).appendTo(tr)
          let fieldChargeDate = dateFields[1].trim()
          //$(`<td>${fieldShoppingDate}</td>`).appendTo(tr)
          
          // 再從尾巴找回來
          let tabSpaces = '   '
          let lastSpacesPos = line.lastIndexOf(tabSpaces)
          let fieldNTDPrice = line.slice(lastSpacesPos).trim()
          //$(`<td>${fieldNTDPrice}</td>`).appendTo(tr)
          
          let last2Line = line.slice(0, lastSpacesPos).trim()
          let last2SpacesPos = last2Line.lastIndexOf(tabSpaces, lastSpacesPos - 1)
          let fieldOriginalPrice = last2Line.slice(last2SpacesPos).trim()
          //console.log([last2SpacesPos, lastSpacesPos])
          //$(`<td>${fieldOriginalPrice}</td>`).appendTo(tr)
          
          let last3Line = last2Line.slice(0, last2SpacesPos).trim()
          let last3SpacesPos = last3Line.lastIndexOf(tabSpaces, last2SpacesPos - 1)
          let fieldCurrency = last3Line.slice(last3SpacesPos).trim()
          //$(`<td>${fieldCurrency}</td>`).appendTo(tr)
          
          let last4Line = last3Line.slice(0, last3SpacesPos).trim()
          //console.log(last4Line)
          let last4SpacesPos = last4Line.lastIndexOf('  ')
          //console.log(last4SpacesPos)
          if (last4SpacesPos === -1 || last4SpacesPos < 30) {
            last4SpacesPos = last4Line.lastIndexOf('　')
            
          }
          let fieldLocation = last4Line.slice(last4SpacesPos).trim()
          if (fieldLocation.endsWith('%') || fieldLocation.endsWith('扣')) {
            fieldLocation = ''
          }
          //$(`<td>${fieldLocation}</td>`).appendTo(tr)
          
          if (last4SpacesPos === -1) {
            last4SpacesPos = last3SpacesPos
          }
          let fieldTitle = line.slice(19, last4SpacesPos).trim()
          while (fieldTitle.endsWith('　')) {
            fieldTitle = fieldTitle.slice(0, fieldTitle.length - 1)
          }
          
          if (fieldTitle.indexOf(' (自動分期 ') > 0 
                  && fieldTitle.indexOf(')分') > 0) {
            fieldTitle = fieldTitle.replace(' (自動分期 ', ' <br />(自動分期 ')
            fieldTitle = fieldTitle.replace(')分', ')<br />分')
          }
          
          $(`<td valign="top" class="shopping-date">${fieldShoppingDate}</td>`).appendTo(tr)
          $(`<td valign="top" class="charge-date">${fieldChargeDate}</td>`).appendTo(tr)
          $(`<td valign="top" class="description">${fieldTitle}</td>`).appendTo(tr)
          $(`<td valign="top" class="location">${fieldLocation}</td>`).appendTo(tr)
          $(`<td valign="top" class="currency">${fieldCurrency}</td>`).appendTo(tr)
          $(`<td valign="top" class="original-price">${fieldOriginalPrice}</td>`).appendTo(tr)
          $(`<td valign="top" class="ntd-price">${fieldNTDPrice}</td>`).appendTo(tr)
        }
        else if (line.startsWith('應付')) {
          //console.log(line)
          let td = tbody.find('td.description:last')
          //console.log(td.length)
          
          td.html(td.html() + '<br />' + line.split('　').join('<br />'))
        }
        
        if (tr.children().length > 0) {
          tr.appendTo(tbody)
        }
      })
      
      return table.prop('outerHTML')
    },
    outputTitle: function () {
      let header = '\n  TWD         1'
      let pos1 = this.input.indexOf(header) + header.length - 1
      let pos2 = this.input.indexOf(' ', pos1)
      if (pos1 === -1 || pos2 === -1) {
        return ''
      }
      let title = this.input.slice(pos1, pos2).trim()
      
      let yearMingGou = parseInt(title.slice(0, 3), 10)
      let year = yearMingGou + 1911
      title = year + title.slice(3)
      
      title = title.split('/').join('')
      title = '兆豐信用卡帳單' + title
      return title
    }
  },
  created: function () {
    $(this.$refs.modal).find('.ui.dropdown').dropdown()
    
    // 載入檔案
    //$.get('./data.txt', (data) => {
    //  this.input = data
    //})
    
    FileHelper.initDropUpload((e) => {
      //console.log(e)
      this.upload(e)
    })
  },
  methods: {
    persist: function () {
      VueHelper.persist(this, 'fileType')
    },
    reset: function () {
      this.input = ''
    },
    copy: function () {
      ClipboardHelper.copyRichFormat(this.output)
    },
    triggerUpload: function (e) {
      FileHelper.triggerUpload(e)
    },
    upload: function (e) {
      FileHelper.upload(e, true, (result) => {
        this.input = result[0]
      })
    },
    download: function () {
      let filetypeExt = this.fileType
      
      let filename = this.outputTitle + '.' + filetypeExt
      let content = this.output
      
      if (filetypeExt === 'csv') {
        let lines = []
        
        lines.push('消費日,入帳日,說明,地區,兌換日,原幣金額,新台幣金額')
        
        $(content).find('tbody tr').each((i, tr) => {
          let line = []
          $(tr).children().each((i, td) => {
            let text = td.innerText
            if ($(td).hasClass('description')) {
              text = '"' + text + '"'
            }
            else {
              text = text.split(',').join('')
            }
            line.push(text)
          })
          lines.push(line.join(','))
        })
        
        DownloadHelper.downloadAsFile(filename, lines.join('\n'))
      }
      else if (filetypeExt === 'html') {
        let template = `<html>
  <head>
    <title>${this.outputTitle}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    ${content}
  </body>
</html>`
        DownloadHelper.downloadAsFile(filename, template)
      }
      else if (filetypeExt === 'ods') {
        
        let data = {}
        data[this.outputTitle] = []
        let lines = data[this.outputTitle]
        
        let fieldList = ["消費日","入帳日","說明","地區","兌換日","原幣金額","新台幣金額"]
        $(content).find('tbody tr').each((i, tr) => {
          let line = {}
          $(tr).children().each((i, td) => {
            let text = td.innerText
            let field = fieldList[i]
            line[field] = text
          })
          lines.push(line)
        })
        
        xlsx_helper_ods_download(filename, data)
      }
    }
  }
  /*
  methods: {
    
  }
  */
})
