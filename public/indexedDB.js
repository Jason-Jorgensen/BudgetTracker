let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    console.log(db);
    db.createObjectStore("pending", { autoIncrement : true });
};

request.onerror = function(event) {
    // Do something with request.errorCode!
    console.log(event.target.errorCode);
  };

  request.onsuccess = function(event) {
    // Do something with request.result!
    db = request.result;
    console.log(db);

  };
  function saveRecord(record){
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                } 
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    };
}

window.addEventListener("online", checkDatabase)