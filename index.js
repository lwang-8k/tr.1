let https = require("https")
let express = require("express")
let parse = require('node-html-parser');
parse = parse.parse
let app = express()



let thisurl = "https://d6814833-6c7f-4573-b3df-56978b763cc2-00-1txfmxn5wluhk.janeway.replit.dev"






async function fetcha(url, method, headers) {
  try{
    console.log(url)
    const parsedUrl = new URL(url)
    console.log(headers)  
    let copyheaders = {...headers}
      headers={}
      headers.host = copyheaders.host
      headers.accept = copyheaders.accept
      // headers.accept_encoding = copyheaders.accept_encoding
      headers.cookie = copyheaders.cookie
      headers['sec-ch-ua']= copyheaders['sec-ch-ua']
      headers['sec-ch-ua-arch']=copyheaders[ 'sec-ch-ua-arch']
      headers['sec-ch-ua-bitness']=copyheaders['sec-ch-ua-bitness']
    
      // let avoids = ["Transfer-Encoding",
      // "host",
      // "connection",
      // "transfer-encoding",
      // "content-length",
      // "expect",
      // "proxy-authorization",
      // "via",
      // "accept-encoding",
      // "forwarded",
      // "x-forwarded-for",
      // "x-forwarded-host",
      // "x-forwarded-proto"]
      // avoids.map(header=>{
      //   delete headers[header]
      // })
    
    headers["origin"]=thisurl
    headers['User-Agent']="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 OmniNet/537.36"
    headers["host"]=parsedUrl.host
    const options = {
      method: method,
      headers: headers,
      // rejectUnauthorized: false
    };
  
    return new Promise((resolve, reject) => {
      try{
        const req = https.request(url, options, (res) => {
          let data = [];

          // A chunk of data has been received.
          res.on('data', (chunk) => {
            // console.log("Chunk", chunk)
            data.push(chunk)
            // console.log(chunk)
          });

          // The whole response has been received.
          res.on('end', () => {
            let buffer = Buffer.concat(data);
            console.log("res succesful")
            resolve({data:buffer, headers:res.headers});
          });
        });

        req.on('error', (err) => {
          console.log(err)
          reject({data:err});
        });

        req.end();
      } catch(err) {
        console.log(err)
        reject({data:err});
      }

    });
  } catch(err){
    console.log(err)
  }

}

function base64EncodeUrl(url) {
  return Buffer.from(url).toString('base64');
}

// Function to rewrite URL to the new format
function rewriteUrl(url) {
  if(url.startsWith("https://")){
    console.log(1)
    const base64Url = base64EncodeUrl(url);
    return `${thisurl}/omni/${base64Url}`;
  } else if (url.startsWith("http://")){
    console.log(2)
    url=url.slice(7)
    url="https://"+url
    const base64Url = base64EncodeUrl(url);
    return `${thisurl}/omni/${base64Url}`;
  } else {
    console.log(3)
    return url
  }
  
}







function rewriteHTML(str, host) {
  const document = parse(str);
  
  const attributesToRewrite = ['href', 'src', 'action', 'data', 'poster'];

  for (const attr of attributesToRewrite) {
    const elements = document.querySelectorAll(`[${attr}]`);
    elements.forEach(element => {
      const link = element.getAttribute(attr);
      console.log(link)
      const url = new URL(link, host);
      if(url.hostname==thisurl){
        console.log("DING DING DING!!!", link)
        url.hostname=(new URL(host)).hostname
      }
      console.log(url.href)
      element.setAttribute(attr, rewriteUrl(url.href));
    });
  }
  
  document.innerHTML+=`<script>
    const originalFetch = fetch;

    window.fetch = async (...args) => {
      const [url, options] = args;

      // Ensure the URL includes the host
      const urlWithHost = url.startsWith('http') ? url : location.host+url;

      // Redirect to mywebsite/omni/base64
      const redirectUrl = '${thisurl}/omni/'+btoa(urlWithHost);

      console.log('Fetch intercepted. Redirecting to:', redirectUrl);

      return originalFetch(redirectUrl, options);
    };


    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
      // Ensure the URL includes the host
      this._url = url.startsWith('http') ? url : location.host+url;

      // Redirect to mywebsite/omni/base64
      this._redirectUrl = '${thisurl}/omni/'+btoa(this._url);

      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
      console.log('XMLHttpRequest intercepted. Redirecting to:', this._redirectUrl);

      this.open(this._method, this._redirectUrl, true);

      return originalSend.apply(this, arguments);
    };
function base64EncodeUrl(url) {
  return btoa(url)
}

// Function to rewrite URL to the new format
function rewriteUrl(url) {
  if(url.startsWith("https://")){
    const base64Url = base64EncodeUrl(url);
    return ${thisurl}+"/omni/"+base64Url;
  } else if (url.startsWith("http://")){
    url=url.slice(7)
    url="https://"+url
    const base64Url = base64EncodeUrl(url);
    return ${thisurl}+"/omni/"+base64Url;
  } else {
    return url
  }

}


// Callback function to handle mutations
const mutationCallback = function(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Handle added nodes
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Edit the added node before it is implemented

                    node.style.backgroundColor = 'yellow'; 
                    ['href', 'src', 'action', 'data', 'poster'].forEach(attr=>{
                      if(node.hasAttribute(attr)){
                        let url = node.getAttribute(attr);
                        url = rewriteUrl(url);
                        node.setAttribute(attr, url)
                      }
                    })
                }
            });
        } else if (mutation.type === 'attributes') {
            // Handle attribute changes
            console.log("The"+mutation.attributeName+" attribute was modified.");
        }
    }
};

// Create a MutationObserver instance
const observer = new MutationObserver(mutationCallback);

// Options for the observer (which mutations to observe)
const config = {
    childList: true,        // Observe additions and removals of child nodes
    attributes: true,       // Observe attribute changes
    subtree: true           // Observe all descendants of the target
};

// Start observing the target node (body in this case)
observer.observe(document.body, config);

  
    </script>`
  console.log("HTML rewritten")
  return document.toString();
}









app.all("/omni/*", async (req, res)=>{
  console.log("request recieved")
  let urlraw=req.path.slice(6);
  // console.log("IM THE URL1 "+urlraw)
  url= Buffer.from(urlraw, 'base64').toString('utf-8')
  try {
    new URL(url)
  } catch(e){
    if(e){
      // console.log("IM THE URL2 "+url)
      url = "https://blank.page"
    }
  }
  // console.log("LOOK AT ME IM THE URLLLLLL: "+url)
  let resp = await fetcha(url, req.method, req.headers)
  
  // console.log(resp.data)
  // console.log(resp)
  if(req.headers["content-type"]){
    if(req.headers["content-type"].toLowerCase().includes("html")){
      let encoding = 'utf8';
      if (contentType.includes('charset=')) {
          encoding = contentType.split('charset=')[1];
      }
      const str = buffer.toString(encoding);
      resp.data = rewriteHTML(str, url)
    }
  }
  
  

  // console.log(resp.headers)
  // console.log(resp)
  // console.log(req.method)
  // console.log(resp.headers["content-type"])
  // res.set(resp.headers)
  console.log("achieved")
  // console.log("SENDOUT: ", resp.data)
  res.set(resp.headers)
  res.status(200).end(resp.data)
})

app.listen(3000)

