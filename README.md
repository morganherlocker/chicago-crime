Chicago Crime
---

Processing scripts for time series analysis of [Chicago Crime data from 2001-present](https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-present/ijzp-q8t2).

Running
---

Clone this repo & install dependencies

```
git clone https://github.com/morganherlocker/chicago-crime.git
cd chicago-crime
npm install
```

Download the data (note: there is a lot of data, so this will take a while)

`curl https://data.cityofchicago.org/api/views/ijzp-q8t2/rows.json?accessType=DOWNLOAD -o crime.json`

Aggregate on 1/2mi grid with monthly counts and totals

`node index.js`