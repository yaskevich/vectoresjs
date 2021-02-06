import json
import requests
from scrapy.selector import Selector

def do_it():
    r = requests.get("https://rusvectores.org/en/models/")
    if r.status_code == 200:
        body = r.content
        out = {}
        title  = ''
        data = Selector(text=body).css('h2, div > table')
        
        for d in data:
            tag = d.xpath('name()').get()

            if tag == "h2":
                title = d.css("::text").get()
            else:
                
                headers = d.css("tr>th::text")
                hs = [h.get() for h in headers]
                
                for row in d.css("tr"):                
                    id = row.css("::attr(id)").get(default='')
                    desc = {}
                    for i, cell in enumerate(row.css('td')):
                        # print("\t", i, hs[i], ":", cell.css("::text").get())
                        
                        link = cell.css("a::attr(href)").get(default='')
                        datum = cell.css("::text").get()
                        if link.startswith("/"): link = "https://rusvectores.org" + link
                                              
                        desc[hs[i]] = {"data": datum, "link": link} if link else datum
                            # print(i, link)
                            
                    desc["title"] = title
                    desc["language"] = 'ru'
                    if id: out[id] = desc
        

    with open('rusvectores.json', 'w') as fp: 
        fp.write(json.dumps({"rusvectores": out}, ensure_ascii=False, indent=5).replace('\\xa0', ' '))
    pass


do_it()