import datetime
import urllib.request

API_URL = "http://data.gdeltproject.org/gdeltv2/"

def dateToStr(date):
  return str(date).replace(' ', '').replace(':', '').replace('-', '')

def mentionsUrl(date):
  dateStr = dateToStr(date)
  file_name = dateStr + ".translation.mentions.CSV.zip"
  url = API_URL + file_name
  return url, file_name

def eventsUrl(date):
  dateStr = dateToStr(date)
  file_name = dateStr + ".translation.export.CSV.zip"
  url = API_URL + file_name
  return url, file_name

FIRST_DATE = datetime.datetime(2015, 2, 18, 22, 45, 00)
STEP = datetime.timedelta(minutes=15)

date = FIRST_DATE
for i in range(100):
  url, fp = mentionsUrl(date)
  try:
    urllib.request.urlretrieve(url, fp)
  except:
    pass
  url, fp = eventsUrl(date)
  try:
    urllib.request.urlretrieve(url, fp)
  except:
    pass
  date += STEP


last_file_date = date - STEP
d = dateToStr(last_file_date)

last_updated_content = """64076 b94d22ac8367a0772a833c0a1aea2d77 http://data.gdeltproject.org/gdeltv2/{}.translation.export.CSV.zip
108134 ad0e785b80ffe530f4e85ddc6e0f8a70 http://data.gdeltproject.org/gdeltv2/{}.translation.mentions.CSV.zip
11612628 1bff3e339ae7146d9afb02c56670804e http://data.gdeltproject.org/gdeltv2/{}.translation.gkg.csv.zip
""".format(d, d, d)

with open('lastupdate-translation.txt', 'w') as f:
  f.write(last_updated_content)
