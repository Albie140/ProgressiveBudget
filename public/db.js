let db;
// create a new db request for a "budget" database.

const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {

  let db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
console.log(db)
  // Checks to see if the user goes back to online status
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  
  const transaction = db.transaction(["pending"], "readwrite");
  
  const store = transaction.objectStore("pending");

  store.add(record);
}

function checkDatabase() {
  
  const transaction = db.transaction(["pending"], "readwrite");
 
  const store = transaction.objectStore("pending");
 
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
         
          const transaction = db.transaction(["pending"], "readwrite");
         
          const store = transaction.objectStore("pending");
          
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
