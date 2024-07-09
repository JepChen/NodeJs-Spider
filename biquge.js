// 爬虫 https://bqg123.net/

const https = require('https');
const fs = require('fs');

function makeRequest(options) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
  
        res.setEncoding('utf8'); // 设置编码，避免乱码问题
  
        res.on('data', (chunk) => {
          data += chunk;
        });
  
        res.on('end', () => {
          resolve(data); // 成功时解析Promise
        });
      });
  
      req.on('error', (error) => {
        reject(error); // 出错时拒绝Promise
      });
  
      req.end(); // 发送请求
    });
}

function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function appendFilePromise(filename, data, options) {
    return new Promise((resolve, reject) => {
      fs.appendFile(filename, data, options, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
}

async function save_to_file(book_name, chapter_list) {
    let count = 0
    let content = ''
    for (let index = 0; index < chapter_list.length; index++) {
        const element = chapter_list[index];
        let txt = await sleep(500 * index).then(async () => {
            let data = await load_chapter_data(element.url_kv);
            eval(data)
            var chapter_data_str1 = decodeURIComponent(global.atob(chapter_data_str));
            let chapter_data = eval("(" + chapter_data_str1 + ")");
            let chapter_name = chapter_data['chapter_kv']['name']
            console.log(chapter_name);
            return chapter_name + '\n' + stripHtml(chapter_data.chapter_kv.content) + '\n\n';
        })
        content += txt
        count++
        if(count >= 20) {
            count = 0
            await appendFilePromise(`E:/${book_name}.txt`, content)
            content = ''
        }
    }
    if(count) {
        appendFilePromise(`E:/${book_name}.txt`, content)
    }
}

async function load_chapter_data(param) {
    const options = {
        hostname: 'la2.bqg123a.top',
        port: 443,
        path: `/load_chapter/${param}==.js?t=2023101723213831000&tk=0404`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Referer': 'https://bqg123.net/'
        }
    };

    return makeRequest(options)
}

function load_chapter_list(param) {
    const options = {
        hostname: 'la2.bqg123a.top',
        port: 443,
        path: `/load_chapter_list/${param}==.js?t=2023101723213831000&tk=0404`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Referer': 'https://bqg123.net/'
        }
    };

    return makeRequest(options)
}

function load_book_info(url) {
    // let ws = window.innerHeight.toString() + window.outerWidth.toString()
    let ws = 6131920
	//书本页 http://book3-www1.com/?1#/v3/123/456/
	let res = url.match(/\/v3\/([0-9]+)\/([0-9]+)\//)
	let book_uni_id=res[1];
	let book_id=res[2];
	let path_file ='/v3/load_book_info/'+book_uni_id+'/'+book_id+'.js?ws='+ws
	path_file = path_file +'&tk=0404';//913

    return makeRequest({
        hostname: 'la2.xs30238.top',
        port: 443,
        path: path_file,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Referer': 'https://bqg123.net/'
        }
    }).then((data) => {
        window = global
        eval(data)
        var book_info_str1 = decodeURIComponent(global.atob(book_info_str));
        let bk = eval("(" + book_info_str1 + ")");
        return bk
    })
}

async function load_book(url) {
    let book_param = await load_book_info(url)
    load_chapter_list(book_param.url_chapter_list_kv).then((data) => {
        eval(data)
        var chapter_list_data_str1 = decodeURIComponent(global.atob(chapter_list_data_str));
        let chapter_list_data = eval("(" + chapter_list_data_str1 + ")");
        let chapter_list = chapter_list_data.chapter_list;
        save_to_file(book_param.book_name, chapter_list)
    })
}

load_book("https://bqg123.net/v3_uni_0709125?1#/v3/181437344/3006468/")
