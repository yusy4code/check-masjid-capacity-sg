// Global variables
var capacityInfo = [];
var capacityInfoObj = {};
var todayISO = getTodayISODate();
var tomorrowISO = getTomorrowISODate();

// init main function
async function init() {
  // Getting capacity of today
  document.getElementById("today").innerHTML = `Today - ${todayISO}`;
  getMasjidCapacityByDate(todayISO);

  // Getting capacity of tomorrow
  document.getElementById("tomorrow").innerHTML = `Tomorrow ${tomorrowISO}`;
  getMasjidCapacityByDate(tomorrowISO);
}

// function to loop through list of masjid for one particular day
async function getMasjidCapacityByDate(date) {
  masjidList.forEach((masjid) => {
    getCapacityByPrayers(masjid, date);
  });
}

// function to get capacity for 1 masjid for 1 day for all 5 prayers
async function getCapacityByPrayers(masjid, date) {
  let promises = [];
  let prayerIdList = [1, 2, 3, 4, 5];

  let masjidCapacity = {
    MosqueName: masjid.MosqueName,
    MosqueID: masjid.MosqueID,
  };

  var totalCapacity = {};

  // calling getCapacity to see the availability for 1 masjid, 1 day , 1 prayer_type
  prayerIdList.forEach((prayerId) => {
    promises.push(getCapacity(masjid, prayerId, date));
  });

  // Resolving all promise (we are expecing result of 5 prayers)
  Promise.all(promises).then((results) => {
    results.forEach((result) => {
      totalCapacity = { ...totalCapacity, ...result };
    });
    masjidCapacity.capacity = totalCapacity;

    // adding this info in the UI
    addMasjidToUI(masjidCapacity, date);
  });
}

// function to get availability for 1 masjid for 1 day for 1 prayer_type
async function getCapacity(
  { MosqueID, MosqueName, ZoneID, ZoneName },
  prayerId,
  date
) {
  let prayerName = "";

  let formdata = new FormData();
  formdata.append("app_key", "Gzzo3pNdr3S0BOX47k1wT90ih5RmO2Wy");
  formdata.append("mosque_id", MosqueID);
  formdata.append("prayer_type_id", prayerId);
  formdata.append("zone_id", ZoneID);
  formdata.append("session_id", "1");
  formdata.append("session_date", date);

  let requestOptions = {
    method: "POST",
    body: formdata,
  };

  let url =
    "https://api-ourmosques.commonspaces.sg/api_ext/remote_frontend_bookingdaily_getnumofavailablecapacity.aspx";

  const response = await fetch(url, requestOptions);
  const result = await response.json();

  const capacity =
    result.Result.length > 0 ? result.Result[0].NumOfAvailableCapacity : 0;

  // Assign prayer name as per prayer_type
  switch (prayerId) {
    case 1:
      prayerName = "fajar";
      break;
    case 2:
      prayerName = "zohar";
      break;
    case 3:
      prayerName = "asar";
      break;
    case 4:
      prayerName = "magrib";
      break;
    case 5:
      prayerName = "isha";
      break;
  }
  capacityResponse = {};
  capacityResponse[prayerName] = capacity;

  return capacityResponse;
}

// function to get todays date in YYYY-MM-DD format
function getTodayISODate() {
  let today = new Date();
  let msLocal = today.getTime() - today.getTimezoneOffset() * 60 * 1000;
  let localToday = new Date(msLocal).toISOString().substring(0, 10);
  return localToday;
}

// function to get tomorrow's date in YYYY-MM-DD format
function getTomorrowISODate() {
  let localToday = new Date(getTodayISODate());
  localToday.setDate(localToday.getDate() + 1);
  let msTomorrow =
    localToday.getTime() - localToday.getTimezoneOffset() * 60 * 1000;
  let localTomorrow = new Date(msTomorrow).toISOString().substring(0, 10);
  return localTomorrow;
}

// function to add one masjid details to UI
function addMasjidToUI(masjidCapacity, date) {
  const { MosqueName, MosqueID, capacity } = masjidCapacity;
  const { fajar, zohar, asar, magrib, isha } = capacity;

  // 40 - 58 => south, 23 - 38 = north, 5 - 22 = east, 59 - 74 = west
  let location = "";
  if (MosqueID <= 22) {
    location = "EAST";
  } else if (MosqueID > 22 && MosqueID <= 38) {
    location = "NORTH";
  } else if (MosqueID > 38 && MosqueID <= 58) {
    location = "SOUTH";
  } else {
    location = "WEST";
  }

  // based on the date passed, decide to add in which table in UI
  if (date === todayISO) {
    var table = document.getElementById("today-table");
  } else {
    var table = document.getElementById("tomorrow-table");
  }

  const row = table.insertRow(-1);

  const masjidName = row.insertCell(0);
  const loc = row.insertCell(1);
  const f = row.insertCell(2);
  const z = row.insertCell(3);
  const a = row.insertCell(4);
  const m = row.insertCell(5);
  const i = row.insertCell(6);

  masjidName.innerHTML = MosqueName;
  loc.innerHTML = location;
  f.innerHTML = fajar;
  z.innerHTML = zohar;
  a.innerHTML = asar;
  m.innerHTML = magrib;
  i.innerHTML = isha;
}

// function to filter the table for masjid search
function filterMasjid() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();

  table = document.getElementById("today-table");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }

  table = document.getElementById("tomorrow-table");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

init();
