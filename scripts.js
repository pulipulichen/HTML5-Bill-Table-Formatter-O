/* global FileHelper, VueHelper, DownloadHelper, Vue */

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
      /*
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
      */
      let items = []
      
      this.input.trim().split('\n20').forEach((part, i) => {
        if (part.startsWith('20') === false) {
          part = '20' + part
        }
        
        let lines = part.split('\n')
        
        let item = {
          date: lines[0],
          type: lines[1],
        }
        
        if (lines.length === 3) {
          item.money = lines[2]
        }
        else {
          item.account = lines[2]
          item.money = lines[3]
        }
        
        items.push(item)
      })
      
      // -------------
      // 再來把它換成表格
      
      let table = $(`<table border="1" cellpadding="0" cellspacing="0">
                        <thead>
                          <tr>
                            <th>日期</th>
                            <th>類型</th>
                            <th>帳戶</th>
                            <th>金額</th>
                          </tr>
                        </thead>
                        <tbody></tbody>
                     </table>`)
      let tbody = table.find('tbody')
      items.forEach((item) => {
        let tr = $('<tr></tr>')
        
        $(`<td valign="top" class="date">${item.date}</td>`).appendTo(tr)
        $(`<td valign="top" class="type">${item.type}</td>`).appendTo(tr)
        if (item.account) {
          $(`<td valign="top" class="account">${item.account}</td>`).appendTo(tr)
        }
        else {
          $(`<td valign="top" class="account"></td>`).appendTo(tr)
        }
        $(`<td valign="top" class="money">${item.money}</td>`).appendTo(tr)
          
        if (tr.children().length > 0) {
          tr.appendTo(tbody)
        }
      })
      
      return table.prop('outerHTML')
    },
    outputTitle: function () {
      let title = '王道銀行'
      return title
    }
  },
  created: function () {
    $(this.$refs.modal).find('.ui.dropdown').dropdown()
    
    // 載入檔案
    //$.get('./data.txt', (data) => { this.input = data })
    
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
